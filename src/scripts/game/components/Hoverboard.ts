import { Entity3D, View3DComponent } from '@goodboydigital/odie';
import { TweenLite } from 'gsap';
import { Texture } from 'pixi.js';

import type { BoardBoostData } from '../../data/boards/BoardData';
import Game from '../../Game';
import GameConfig from '../../GameConfig';
import type { UnlitHighShaderMaterial } from '../../materials/UnlitHighShaderMaterial';
import { app } from '../../SubwaySurfersApp';
import EntityTools from '../../utils/EntityTools';
import { BoardAnimations, boardsAnimationMap } from '../data/anim/avatar/gameData/boards-animation-map';
import Character from '../entities/Character';
import ParticleHoverCollision from '../entities/ParticleHoverCollision';
import ParticleSpark from '../entities/ParticleSpark';
import GameComponent from '../GameComponent';
import Particles from './Particles';

export default class Hoverboard extends GameComponent
{
    public count = 0;
    public duration = 30;
    public view!: Entity3D;
    public paused = false;
    public locked = false;
    private grindingSparks!: Particles;
    private collisionSmoke!: Particles;
    private _particlesSparks?: Entity3D;
    private _particlesSmoke?: Entity3D;
    private boardId!: string;
    private powers?: (string|undefined)[];
    public animations!: BoardAnimations;
    public entity!: Character;
    private diffuseMaps: Record<number, any> = {};
    private visualEntities!: Entity3D[];

    constructor(entity: Character)
    {
        super(entity);
        this.entity = entity;
    }

    show(): void
    {
        if (!this.view)
        {
            this.entity.lane.onLaneChanged.add(this as any);
            this.createGrindingSparks();
            this.createCollisionSmoke();
        }
        this.setBoard(app.user.board);
        const itemTimer = this.entity.game.hud.addItemTimer('hoverboard');

        itemTimer.amount = app.user.boosts.consumables.hoverboard;

        // this.view.active = true;
        if (this.view.view3d) this.view.view3d.renderable = true;
        this.entity.state?.set('empty');
    }

    hide(): void
    {
        if (this.view)
        {
            EntityTools.toggleRenderable(this.view, false);
        }
    }

    setBoard(id: string): void
    {
        if (id !== this.boardId) this.view = app.library.getScene(`board-${id}`, { map: `board-${id}-tex` });

        if (this.entity.anim)
        {
            const parent = EntityTools.findEntity((this.entity as Character).gameScene, 'attachPoint1', 5);

            if (parent)
            {
                parent.scale.set(0.01);
                parent.addChild(this.view);
            }

            const data = app.data.getBoardData(id);
            const baseFeats = data?.features || [];
            const powerups: (BoardBoostData|undefined)[] = [];
            const powerupFeats:string[] = [];

            app.user.boardPowers.forEach((i) =>
            {
                const p = data?.powerups[i - 1];

                if (i === 0 || !p) return;

                powerups.push(p);
                if (p.features) powerupFeats.push(...p.features);
            });

            const features = [...baseFeats, ...powerupFeats];
            const map = EntityTools.childrenFlatMap(this.view, {}, '', 4);

            this.powers = data?.powerup ? [data?.powerup] : powerups?.map((p) => p?.id);

            const animationId = this.powers.find((id) => id === 'stay-low')
            || this.powers.find((id) => id === 'zap-sideways')
            || 'hoverboard';

            this.animations = boardsAnimationMap[id] || boardsAnimationMap[animationId];

            for (const k in map)
            {
                const sub = map[k];
                const renderable = features.includes(sub.name);

                EntityTools.toggleRenderable(sub, renderable);
            }
        }
        this.visualEntities = EntityTools.findWithComponent(this.entity, 'view3d').filter((e) => e.name !== 'shadow');
        this.boardId = id;
    }

    get ratio(): number
    {
        return this.count / this.duration;
    }

    update(): void
    {
        if (!this.count || this.paused) return;
        this.view.y = 0.2;
        this.count -= this.entity.game.stats.delta;
        this.entity.game.hud.updateItemTimer('hoverboard', this.ratio);

        if (this.count <= 0)
        {
            this.turnOff(true);
            this.entity.game.missions.addStat(1, 'mission-hoverboard-nocrash');
        }
    }

    updateGrinding(): void
    {
        if (!GameConfig.grindParticles || !app.library.hasResourcesForFullGameplay()) return;
        this.grindingSparks.time = 10;
        this.grindingSparks.data.x = this.entity.x - 1;
        this.grindingSparks.data.y = this.entity.y - 4.5;
        this.grindingSparks.data.z = this.entity.z - 0.5;
    }

    enable(): void
    {
        this.entity.game.controller.onDoubleTap.add(this as any);
    }

    disable(): void
    {
        this.entity.game.controller.onDoubleTap.remove(this as any);
    }

    pause(): void
    {
        if (!this.count) return;
        this.paused = true;
        this.hide();
    }

    resume(): void
    {
        if (!this.count || !this.paused) return;
        this.paused = false;
        this.entity.state?.set('empty');
        this.show();
        this.entity.anim?.play(this.animations.resume, { loop: false });
    }

    isOn(): boolean
    {
        return !!this.count && !this.paused;
    }

    onDoubleTap(): void
    {
        this.turnOn();
    }

    turnOn(): void
    {
        if (this.isOn()) return;
        if (this.entity.game.state !== Game.RUNNING) return;
        if (this.entity.pogo?.isOn()) return;
        if (this.entity.jetpack?.isOn()) return;
        if (this.locked) return;
        if (!this.hasHoverboards())
        {
            app.game.pause();
            app.game.hud.paused.close();
            app.buyBoards.open();
            app.buyBoards.onExit = () => app.game.resume(3);

            return;
        }

        this.spendHoverboard();
        this.entity.game.missions.addStat(1, 'mission-hoverboard');

        this.show();
        this.entity.anim?.play(this.animations.start, { loop: false, sudden: true });

        this.count = this.duration;
        this.paused = false;
        this.entity.player?.dizzyEnd();
        this.entity.state?.set('empty');
        if (this.powers?.includes('super-jump')) this.entity.jump?.enableSuperJump();
        if (this.powers?.includes('double-jump')) this.entity.jump?.enableDoubleJump();
        if (this.powers?.includes('smooth-drift')) this.entity.jump?.enableSmoothDrift();
        if (this.powers?.includes('zap-sideways')) this.entity.lane.zapping = true;
        if (this.powers?.includes('stay-low')) this.entity.regularHeight = 5;
        if (this.powers?.includes('speed-up'))
        {
            // TODO add a component to handle this
            // add speedStripes and speedVignet models
            this.entity.game.stats.data.speedIncrease.min = 50;
            this.entity.game.stats.data.speedIncrease.max = 20;
        }
        if (this.entity.popPickup) this.entity.popPickup.play();
        app.sound.play('pickup-powerup');
    }

    turnOff(playTurnOffSound = false): void
    {
        this.hide();
        if (!this.count) return;
        this.entity.game.hud.removeItemTimer('hoverboard');
        this.count = 0;
        this.entity.state?.set('empty');
        if (this.powers?.includes('super-jump')) this.entity.jump?.disableSuperJump();
        if (this.powers?.includes('double-jump')) this.entity.jump?.disableDoubleJump();
        if (this.powers?.includes('smooth-drift')) this.entity.jump?.disableSmoothDrift();
        if (this.powers?.includes('zap-sideways')) this.entity.lane.zapping = false;
        if (this.powers?.includes('stay-low')) this.entity.regularHeight = 11;
        if (this.powers?.includes('speed-up'))
        {
            this.entity.game.stats.data.speedIncrease.min = 0;
            this.entity.game.stats.data.speedIncrease.max = 0;
        }

        if (playTurnOffSound) app.sound.play('pickup-powerdown');
    }

    cancel(): void
    {
        if (!this.count) return;
        this.turnOff();
        this.returnHoverboard();
        this.entity.game.missions.addStat(-1, 'mission-hoverboard');
    }

    explode(): void
    {
        this.collisionSmoke.data.x = this.entity.x;
        this.collisionSmoke.data.y = this.entity.y;
        this.collisionSmoke.data.z = this.entity.z;
        this.collisionSmoke.spawn(10);
        this.entity.jump?.perform(15, true);
    }

    lock(): void
    {
        this.locked = true;
    }

    unlock(): void
    {
        this.locked = false;
    }

    get grinding(): boolean
    {
        return (
            !!this.count
            && !this.paused
            && this.entity.body.landed
            && this.entity.body.ground > 29
            && this.entity.body.ground < 29.2
        );
    }

    private createGrindingSparks(): void
    {
        this._particlesSparks = new Entity3D();
        this.entity.addChild(this._particlesSparks);
        this.grindingSparks = this._particlesSparks.addComponent(Particles, {
            EntityClass: ParticleSpark,
            container: this.entity.scene,
            rate: 0.5,
            spawns: 1,
            life: 20,
            xMod: [-0.4, 0.4],
            velocityXMod: [-0.2, 0.2],
            velocityYMod: [0.03, 0.08],
            velocityZMod: [-0.1, -0.2],
            growXMod: [0.1, 0.3],
            growZMod: [0.3, 0.6],
        } as any, 'grindingSparks') as Particles;
    }

    private createCollisionSmoke(): void
    {
        this._particlesSmoke = new Entity3D();
        this.entity.addChild(this._particlesSmoke);
        this.collisionSmoke = this._particlesSmoke.addComponent(Particles, {
            EntityClass: ParticleHoverCollision,
            container: this.entity.scene,
            rate: 1,
            life: 60,
            velocityXMod: [-1.5, 1.5],
            velocityYMod: [1, 3],
            velocityZMod: [-1, -2],
            scaleXMod: [0.8, 1.5],
            scaleYMod: [0.8, 1.5],
            scaleZMod: [0.8, 1.5],
            growXMod: [0.01, 0.03],
            growYMod: [0.01, 0.03],
            growZMod: [0.01, 0.03],
            // color: [0xb6b601, 0xa1ec04, 0xd07601]
        } as any, 'collisionSmoke') as Particles;
    }

    private hasHoverboards(): boolean
    {
        return app.user.boosts.consumables.hoverboard >= 1;
    }

    private spendHoverboard(): boolean
    {
        if (app.user.boosts.consumables.hoverboard < 1) return false;
        app.user.boosts.consumables.hoverboard -= 1;
        app.user.shopSettings.save();

        return true;
    }

    private returnHoverboard(): void
    {
        app.user.boosts.consumables.hoverboard += 1;
        app.user.gameSettings.save();
    }

    onLaneChanged():void
    {
        if (!this.isOn() || !this.powers?.includes('zap-sideways')) return;

        // TODO add a component to handle this
        // add teleboardWarp model
        this.visualEntities.forEach((e) =>
        {
            const m = (e.view3d as View3DComponent).material as UnlitHighShaderMaterial;

            if (!this.diffuseMaps[e.UID])
            {
                this.diffuseMaps[e.UID] = m.diffuseMap;
                m.diffuseMap = Texture.WHITE;
            }
        });

        TweenLite.to(this.entity.scale, 0.2, { x: 0, z: 0, overwrite: true, onComplete: () =>
        {
            TweenLite.to(this.entity.scale, 0.1, { overwrite: true, onComplete: () =>
            {
                this.entity.scale.set(1);
                this.visualEntities.forEach((e) =>
                {
                    const m = (e.view3d as View3DComponent).material as UnlitHighShaderMaterial;

                    m.diffuseMap = this.diffuseMaps[e.UID];
                    this.diffuseMaps[e.UID] = null;
                });
            } });
        } });
    }
}
