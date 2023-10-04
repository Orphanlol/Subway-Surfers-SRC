import { waitAFrame } from '@goodboydigital/astro';
import { CameraEntity, Entity3D, PoolSystem, Runner, Scene3D } from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';

import Data from './game/data/Data';
import { EntityProvider } from './game/data/EntityProvider';
import Character from './game/entities/Character';
import Guard from './game/entities/Guard';
import GameEntity from './game/GameEntity';
import CameraSystem from './game/systems/CameraSystem';
import ControllerSystem from './game/systems/ControllerSystem';
import { CullingSystem } from './game/systems/CullingSystem';
import DebugSystem from './game/systems/DebugSystem';
import EnvironmentSystem from './game/systems/EnvironmentSystem';
import HudSystem from './game/systems/HUDSystem';
import IntroSystem from './game/systems/IntroSystem';
import LeaderboardSystem from './game/systems/LeaderboardSystem';
import LevelSystem from './game/systems/LevelSystem';
import MissionSystem from './game/systems/MissionSystem';
import PhysicsSystem from './game/systems/PhysicsSystem';
import { PickupSystem } from './game/systems/PickupSystem';
import RouteSystem from './game/systems/RouteSystem';
import StatsSystem from './game/systems/StatsSystem';
import TutorialSystem from './game/systems/TutorialSystem';
import GameConfig from './GameConfig';
import Uniforms from './materials/Uniforms';
import { SubwaySurfersApp } from './SubwaySurfersApp';
import Poki from './utils/Poki';
import { SmoothTime } from './utils/SmoothTime';
import { Sound } from './utils/Sound';
export default class Game extends Scene3D
{
    /** Game possible states */
    public static IDLE = 0;
    public static RUNNING = 1;
    public static PAUSED = 2;
    public static GAMEOVER = 3;

    public app: SubwaySurfersApp;
    public w: number;
    public h: number;
    public s: number;
    public bendX: number;
    public bendY: number;
    public aspectRatio: number;
    public blurred: boolean;
    public sfx: Sound;
    public state: number;
    public playingTheme: boolean;
    public freeRevivals: number;
    public paidRevivals: number;

    public onReset: Runner;
    public onIdle: Runner;
    public onRun: Runner;
    public onPause: Runner;
    public onResume: Runner;
    public onGameover: Runner;
    public onRevive: Runner;
    public onEnterTunnel: Runner;
    public onExitTunnel: Runner;

    public hero: Character;
    public guard?: Guard;

    public camera!: CameraSystem;
    public pool!: PoolSystem;
    public physics!: PhysicsSystem;
    public level!: LevelSystem;
    public hud!: HudSystem;
    public stats!: StatsSystem;
    public missions!: MissionSystem;
    public controller!: ControllerSystem;
    public environment!: EnvironmentSystem;
    public route!: RouteSystem;
    public tutorial!: TutorialSystem;
    public intro!: IntroSystem;
    public leaderboard!: LeaderboardSystem;
    public culling!: CullingSystem;
    public pickup!: PickupSystem;

    private reseted = false;

    public onPickupPowerup = new Signal();

    constructor(app: SubwaySurfersApp, sfx: Sound)
    {
        super({
            stage: new PIXI.Container(),
            camera: new CameraEntity(),
            renderer: app.stage.renderer,
            culling: false,
        });

        Poki.SDK.setSkipVideo(GameConfig.debug);

        // Override scene's time with one that can smooth deltas, to prevent some frame rate fluctuation hiccups
        (this as any).time = new SmoothTime({ smooth: GameConfig.smoothDelta });

        this.freeRevivals = 0;
        this.paidRevivals = 0;
        this.timeScale = 1;

        this.playingTheme = false;

        this.app = app;
        this.w = 512;
        this.h = 512;
        this.s = 1;
        this.state = -1;

        Data.init(app.resources.cache);

        console.log('[Game] init');
        this.bendX = 0;
        this.bendY = 0;
        this.aspectRatio = 1;
        this.blurred = false;

        this.sfx = sfx;

        this.onReset = new Runner('reset');
        this.onIdle = new Runner('idle');
        this.onRun = new Runner('run');
        this.onPause = new Runner('pause');
        this.onResume = new Runner('resume');
        this.onGameover = new Runner('gameover');
        this.onRevive = new Runner('revive');
        this.onEnterTunnel = new Runner('enterTunnel');
        this.onExitTunnel = new Runner('exitTunnel');

        this.camera = this.addSystem(CameraSystem as any, {});
        this.pool = this.addSystem(PoolSystem, {});
        this.physics = this.addSystem(PhysicsSystem as any, {}) as unknown as PhysicsSystem;
        this.level = this.addSystem(LevelSystem as any, {});
        this.hud = this.addSystem(HudSystem as any, {});
        this.stats = this.addSystem(StatsSystem as any, {});
        this.missions = this.addSystem(MissionSystem as any);
        this.controller = this.addSystem(ControllerSystem as any, {});
        this.environment = this.addSystem(EnvironmentSystem as any, {});
        this.route = this.addSystem(RouteSystem as any, {});
        this.tutorial = this.addSystem(TutorialSystem as any, {});
        this.intro = this.addSystem(IntroSystem as any, {});
        this.leaderboard = this.addSystem(LeaderboardSystem as any, {});
        if (GameConfig.culling) this.culling = this.addSystem(CullingSystem as any);
        this.pickup = this.addSystem(PickupSystem as any, {}) as unknown as PickupSystem;

        if (GameConfig.debug) this.addSystem(DebugSystem as any, {});

        this.hero = new Character();
        this.addChild(this.hero);

        this.guard = new Guard();
        this.addChild(this.guard);

        app.resize.onResize.connect(this.resize);
        this.resize(app.resize.w, app.resize.h);
        app.stage.mainContainer.addChild(this.stage);

        app.resources.manager.onLoadComplete.connect(this.onLoadComplete.bind(this));
        this.app.visibility.onVisibilityChange.connect(this.onVisibilityChange.bind(this));

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore;
        if (this.culling) this.view3d['_culling'] = this.culling;
    }

    public get stage(): PIXI.Container
    {
        return this.view3d.stage;
    }

    private onVisibilityChange(visible: boolean): void
    {
        if (visible && this.state === Game.RUNNING)
        {
            this.pause();
        }
    }

    addChild(entity: Entity3D | GameEntity): void
    {
        this.container.root.addChild(entity);
    }

    removeChild(entity: Entity3D | GameEntity): void
    {
        this.container.root.removeChild(entity);
    }

    public get timeScale(): number
    {
        return this.time.timeScale;
    }

    public set timeScale(v: number)
    {
        this.time.timeScale = v;
    }

    public get delta(): number
    {
        return this.time.frameTime;
    }

    public get deltaSecs(): number
    {
        return this.time.deltaTime / 1000;
    }

    update(): void
    {
        if (this.state === Game.PAUSED) return;
        super.update();
    }

    /**
     * Fires when window gain focus
     */
    onFocus(): void
    {
        this.blurred = false;
    }

    /**
     * Fires when window lose focus
     */
    onBlur(): void
    {
        this.blurred = true;
        if (this.state === Game.RUNNING) this.pause();
    }

    /**
     * Reset the the whole game to its initial state
     */
    reset(): void
    {
        if (this.reseted) return;
        this.reseted = true;
        console.log('[Game] reset');
        if (!this.hero) return;
        this.timeScale = GameConfig.timeScale;
        this.bendX = 0;
        this.bendY = 0;
        this.freeRevivals = 0;
        this.paidRevivals = 0;
        this.hero.reset();
        if (this.guard) this.guard.reset();
        this.onReset.run();
    }

    updateWorldBend(): void
    {
        if (GameConfig.bend)
        {
            this.bendX = GameConfig.bendX * this.aspectRatio;
            this.bendY = GameConfig.bendY;
            Uniforms.group.uBend[0] = this.bendX;
            Uniforms.group.uBend[1] = this.bendY;
        }
    }

    /**
     * Reset game and set to its idle state
     */
    idle(): void
    {
        if (this.state === Game.IDLE) return;
        console.log('[Game] idle');
        if (this.state === Game.RUNNING) Poki.SDK.gameplayStop();
        this.tutorial.enabled = !this.app.user.tutorial || GameConfig.tutorial;
        this.reset();
        this.state = Game.IDLE;
        this.hero.player.reset(0, 1.2);
        this.guard?.reset();
        this.onIdle.run();
    }

    /**
     * Reset the game and start it
     */
    run(): void
    {
        if (this.state === Game.RUNNING) return;
        this.reseted = false;
        if (this.state === Game.GAMEOVER) this.idle();
        console.log('[Game] run');
        EntityProvider.prepopulate();
        Data.refreshCache();
        if (this.hud) this.hud.build();
        this.hero.init();
        this.state = Game.RUNNING;
        this.reset();
        this.onRun.run();
        this.playTheme();
        if (this.guard) this.guard.run();
        this.hero.run();
        Poki.SDK.gameplayStart();
        Poki.sendCustomMessage('game', 'roundStart', {});
        this.sfx.volume(GameConfig.volume);
    }

    /**
     * Play intro animation before starting gameplay
     */
    async runWithIntro(): Promise<void>
    {
        this.reseted = false;
        this.idle();

        EntityProvider.prepopulate();
        Data.refreshCache();

        Poki.SDK.gameplayStart();
        Poki.sendCustomMessage('game', 'roundStart', {});
        this.playTheme();

        if (this.level.currentChunk)
        {
            // Ensure build of fillers in the current chunk
            for (const filler of this.level.currentChunk.fillerList) filler.build();
        }

        // Give app some time to setup before playing the intro first time
        this.guard?.scale.set(0.01);
        await waitAFrame();
        this.hero.playIntro();

        if (this.guard) this.guard.playIntro();
        this.intro.play();
        this.guard?.scale.set(1);

        if (!this.tutorial.enabled)
        {
            // Queue some chunks in advance...
            this.level.queueChunk();
            this.level.queueChunk();
            this.level.queueChunk();
        }
        else
        {
            // ... or place the tutorial
            this.level.queueTutorial();
        }
    }

    /**
     * Start gameplay after intro finishes
     */
    runFromIntro(): void
    {
        this.reseted = false;
        if (this.hud) this.hud.build();
        if (this.guard) this.guard.run();
        this.hero.run();
        this.camera.run();
        this.onRun.run();
        this.state = Game.RUNNING;
    }

    /**
     * Pause the game if running
     */
    pause(): void
    {
        if (this.state !== Game.RUNNING) return;
        console.log('[Game] pause');
        this.state = Game.PAUSED;
        this.onPause.run();
        Poki.SDK.gameplayStop();
    }

    /**
     * Resume game if paused
     */
    resume(countdown = 0): void
    {
        if (this.state !== Game.PAUSED) return;
        if (countdown)
        {
            this.hud.runCountdown(countdown, this.resume.bind(this));

            return;
        }
        console.log('[Game] resume');
        this.state = Game.RUNNING;
        this.onResume.run();
        Poki.SDK.gameplayStart();
    }

    /**
     * Interrupt current gameplay
     * That happens every time player crashes, but still can revive
     */
    async gameover(): Promise<void>
    {
        if (this.state === Game.GAMEOVER) return;

        // Save keys to be used in paid revival
        this.app.user.keys += this.stats.keys;
        this.app.user.save();
        this.stats.keys = 0;

        this.app.sound.volume(0);
        Poki.SDK.gameplayStop();
        this.app.sound.volume(GameConfig.volume);
        console.log('[Game] gameover - play time:', this.deltaSecs.toFixed(2));
        this.camera.exitTunnel();
        this.app.user.save();
        this.state = Game.GAMEOVER;
        this.hero.player.stop();
        if (this.guard) this.guard.catchHero();
        this.onGameover.run();
        Poki.sendCustomMessage('game', 'roundEnd', {});
    }

    /**
     * Number of keys required for a paid revival
     * @returns Number of keys to spend
     */
    public paidRevivalCost(): number
    {
        return Math.pow(2, this.paidRevivals);
    }

    /**
     * Continue gameplay from the gameover point
     */
    revive(countdown = 0, paid = false): void
    {
        if (this.state === Game.RUNNING) return;

        this.hero.player.reset(this.hero.body.z, this.hero.body.x, this.hero.body.lane);
        this.hero.active = false;
        if (this.guard) this.guard.reset();
        if (countdown)
        {
            this.hud.runCountdown(countdown, () => this.revive(0, paid));

            return;
        }

        if (paid)
        {
            this.app.user.keys -= this.paidRevivalCost();
            if (this.app.user.keys < 0) this.app.user.keys = 0;
            this.app.user.save();
            this.paidRevivals += 1;
        }
        else
        {
            this.freeRevivals += 1;
        }

        this.state = Game.RUNNING;
        console.log('[Game] revive');
        this.level.removeObstacles();
        this.hero.active = true;
        this.hero.revive();
        this.onRevive.run();
        this.hero.player.run(0);
        this.controller.show();
        if (this.guard) this.guard.run();
        Poki.SDK.gameplayStart();
    }

    /**
     * Resize game viewport
     * @param w - Desired canvas width
     * @param h - Desired canvas height
     */
    resize = (w = 0, h = 0, s = 1):void =>
    {
        super.resize(w, h);
        this.updateWorldBend();
        this.aspectRatio = h / w;
        this.w = w;
        this.h = h;
        this.s = s;
        if (this.hud) this.hud.resize();
        if (this.controller) this.controller.resize(w, h);
    };

    /**
     * Play game music
     */
    playTheme(): void
    {
        if (this.playingTheme) return;
        this.playingTheme = true;
        this.sfx.volume(GameConfig.volume);
        this.sfx.playMusic('theme', { loops: true });
    }

    /**
     * Run enterTunnel runner
     */
    enterTunnel(): void
    {
        this.onEnterTunnel.run();
    }

    /**
     * Run exitTunnel runner
     */
    exitTunnel(): void
    {
        this.onExitTunnel.run();
    }

    /**
     * Get some game profile data, for debugging
     */
    get profile(): Record<string, any>
    {
        return {
            deltaStep: this.delta,
            deltaSecs: this.deltaSecs,
            objects: this.allEntities.length,
            entities: this.level.entities.length,
        };
    }

    onLoadComplete(): void
    {
        Data.refreshCache();
    }
}
