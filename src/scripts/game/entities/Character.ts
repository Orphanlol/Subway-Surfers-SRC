import {  Entity3D } from '@goodboydigital/odie';

import { app } from '../../SubwaySurfersApp';
import EntityTools from '../../utils/EntityTools';
import Random from '../../utils/Random';
import Anim from '../components/Anim';
import Body from '../components/Body';
import Dizzy from '../components/Dizzy';
import Hoverboard from '../components/Hoverboard';
import Jetpack from '../components/Jetpack';
import Jump from '../components/Jump';
import { Lane } from '../components/Lane';
import Magnet from '../components/Magnet';
import Multiplier from '../components/Multiplier';
import Notifier from '../components/Notifier';
import Particles from '../components/Particles';
import Player from '../components/Player';
import Pogo from '../components/Pogo';
import Pop from '../components/Pop';
import PopPickup from '../components/PopPickup';
import ReviveHalo from '../components/ReviveHalo';
import Roll from '../components/Roll';
import Shadow from '../components/Shadow';
import Sneakers from '../components/Sneakers';
import State from '../components/State';
import animMap from '../data/anim';
import GameEntity from '../GameEntity';
import ParticleRevive from './ParticleRevive';

// STATES
class StateIdle
{
    public playing = false;
    public dead = false;
    public entity!: Character;

    begin()
    {
        this.entity.anim.play('paintIdle', { loop: true });
    }
}

class StateRunning
{
    public playing = true;
    public landed = true;
    public rolling = false;
    public dodging = false;
    public grinding = false;
    public anim: Record<string, ()=>string> = {
        normal: () => 'run3',
        hoverboard:  () => this.entity.hoverboard.animations.run,
        sneakers:  () => 'superRun',
    };

    public count = 0;
    public alt = false;
    public soundSteps = false;
    public entity!: Character;

    begin()
    {
        this.count = 0;
        const mode = this.entity.player.getMode();
        const anim = this.anim[mode]();
        const options = { loop: true, mixRatio: 0.3 };

        this.soundSteps = mode === 'sneakers';
        if (mode === 'hoverboard')
        {
            options.mixRatio = 0.1;
        }
        this.entity.anim.play(anim, options);
    }

    update(delta: number)
    {
        const mode = this.entity.player.getMode();

        this.entity.anim.speed = mode === 'hoverboard' ? 1 : this.entity.game.stats.animationSpeed;
        if (!this.soundSteps) return;
        this.count -= delta;
        if (this.count <= 0)
        {
            this.count = 25;
            this.alt = !this.alt;
            const id = this.alt ? 'hero-sneakers-foot-l' : 'hero-sneakers-foot-r';

            this.entity.game.sfx.play(id);
        }
    }
}

class StateGrinding
{
    public playing = true;
    public landed = true;
    public rolling = false;
    public dodging = false;
    public grinding = true;
    public ascending = false;
    public descending = false;
    public animName = '';
    public entity!: Character;

    begin()
    {
        const animations = this.entity.hoverboard.animations;
        const type = Random.range(0, animations.grind.length, true);

        this.animName = animations.grind[type];
        this.entity.anim.play(animations.grindLand[type], { loop: true });
        this.entity.anim.play(this.animName, { loop: true });
    }

    update()
    {
        if (this.entity.anim.currentAnimationClipName !== this.animName) return;
        this.entity.hoverboard.updateGrinding();
    }
}

class StateDodging
{
    public playing = true;
    public landed = true;
    public rolling = false;
    public dodging = true;
    public anim: Record<string, Record<string, ()=>string>> = {
        normal: {
            '-1': () => 'dodgeLeft',
            1: () => 'dodgeRight',
        },
        hoverboard: {
            '-1': () => this.entity.hoverboard.animations.dodgeLeft,
            1: () => this.entity.hoverboard.animations.dodgeRight,
        },
        sneakers: {
            '-1': () => 'dodgeLeft',
            1: () => 'dodgeRight',
        },
    };

    public entity!: Character;

    begin()
    {
        const mode = this.entity.player.getMode();
        const group = this.anim[mode];
        const anim = group[this.entity.lane.absStep]();

        if (anim.length)
        {
            this.entity.anim.play(anim, { speed: this.entity.game.stats.animationSpeed, sudden: false });
        }
    }
}

class StateAscending
{
    public playing = true;
    public landed = false;
    public special = false;
    public rolling = false;
    public ascending = true;
    public descending = false;
    public anim: Record<string, ()=>string[]> = {
        normal: () => ['jump', 'jump2', 'jump3', 'jump_salto'],
        sneakers: () => ['jump', 'jump2', 'jump3', 'jump_salto'],
        hoverboard: () => this.entity.hoverboard.animations.jump,
    };

    public entity!: Character;

    begin()
    {
        const mode = this.entity.player.getMode();
        const anim = this.anim[mode]();

        if (!anim) return;
        this.entity.anim.play(anim);
    }
}

class StateHangtime
{
    public playing = true;
    public landed = false;
    public special = false;
    public rolling = false;
    public ascending = false;
    public descending = false;
    public anim: any = {
        normal: ['hangtime', 'hangtime2', 'hangtime3'],
        sneakers: ['hangtime', 'hangtime2', 'hangtime3'],
    };

    public entity!: Character;

    begin()
    {
        const mode = this.entity.player.getMode();

        if (mode !== 'sneakers') return;
        const anim = this.anim[mode];

        if (!anim) return;
        this.entity.anim.play(anim, { loop: true });
    }
}

class StateDescending
{
    public playing = true;
    public landed = false;
    public special = false;
    public rolling = false;
    public ascending = false;
    public descending = true;
    public anim: any = {
        normal: ['hangtime', 'hangtime2', 'hangtime3'],
        sneakers: ['hangtime', 'hangtime2', 'hangtime3'],
    };

    public entity!: Character;

    begin()
    {
        const mode = this.entity.player.getMode();
        const anim = this.anim[mode];

        if (!anim) return;
        this.entity.anim.play(anim, { loop: true });
    }
}

class StateRolling
{
    public playing = true;
    public rolling = true;
    public anim: Record<string, ()=>string> = {
        normal: () => 'roll',
        hoverboard: () => this.entity.hoverboard.animations.roll,
        sneakers: () => 'roll',
    };

    public entity!: Character;

    begin()
    {
        const mode = this.entity.player.getMode();
        const anim = this.anim[mode]();

        const speed = mode === 'hoverboard' ? 0.5 : 1;

        this.entity.anim.play(anim, { loop: false, sudden: true, speed });
    }
}

class StateJetpack
{
    public jetpack = true;
    public dodging = false;
    public entity!: Character;

    begin()
    {
        this.entity.anim.play('Jetpack_forward', { loop: true });
    }
}

class StateJetpackDodging
{
    public jetpack = true;
    public dodging = true;
    public anim: any = {
        '-1': 'Jetpack_changeLane_left',
        1: 'Jetpack_changeLane_right',
    };

    public entity!: Character;

    begin()
    {
        const anim = this.anim[this.entity.lane.absStep];

        this.entity.anim.play(anim);
    }
}

class StateDead
{
    public dead = true;
    public catch = false;
    public anim: any = {
        upper: 'death_upper',
        lower: 'death_lower',
        train: 'death_movingTrain',
        bounce: 'death_bounce',
        out: 'death_bounce',
    };

    public entity!: Character;

    begin()
    {
        const id = this.entity.player.deathCause;
        const anim = this.anim[id] || 'death_bounce';

        this.entity.anim.play(anim, { sudden: true });
    }
}

export default class Character extends GameEntity
{
    public state!: State;
    public jetpack!: Jetpack;
    public anim!: Anim;
    public pogo!: Pogo;
    public sneakers!: Sneakers;
    public magnet!: Magnet;
    public hoverboard!: Hoverboard;
    public multiplier!: Multiplier;
    public shadow!: Shadow;
    public dizzy!: Dizzy;
    public lane!: Lane;
    public jump!: Jump;
    public roll!: Roll;
    public player!: Player;
    public notifier!: Notifier;
    public sprayCan: Entity3D;
    public model!: Entity3D;
    public pop!: Pop;
    public popPickup!: PopPickup;
    public reviveHalo?: ReviveHalo;
    public reviveSmoke?: Particles;
    private height = 11;

    public gameScene!: Entity3D;
    public idleScene!: Entity3D;

    protected _initialized = false;
    protected statesReady = false;

    private outfit!: number;

    constructor()
    {
        super();
        this.levelEntity = false;

        this.add(Body, {
            boxColor: 0x0000FF,
            sensor: true,
        });

        this.model = new Entity3D();
        this.addChild(this.model);

        this.add(Anim);
        this.add(State);
        this.add(Jetpack);
        this.add(Pogo);
        this.add(Sneakers);
        this.add(Magnet);
        this.add(Hoverboard);
        this.add(Multiplier);
        this.add(Shadow);
        this.add(Dizzy);
        this.add(Lane);
        this.add(Jump);
        this.add(Roll);
        this.add(Player);
        this.add(Notifier);

        this.body.width = 4;
        this.body.height = this.regularHeight;
        this.body.depth = 4;

        this.updateModel();

        this.sprayCan = app.library.getEntity('sprayCan');
        this.sprayCan.x = 0.2 * 0.01;
        this.sprayCan.z = -0.5 * 0.01;
        this.sprayCan.y = -0.5 * 0.01;
        this.sprayCan.rz = Math.PI * 0.5;
        this.sprayCan.ry = Math.PI * 0.15;
        this.sprayCan.scale.set(0.01);
        (this.sprayCan.view3d as any).material.map = app.library.getMap('props-tex');

        const setCharacter = () =>
        {
            const { character, outfit } = app.user;

            if (this.anim.character === character && this.outfit === outfit) return;

            for (const key in animMap.avatar)
            {
                const avatarData = (animMap.avatar as any)[key];

                avatarData.file = `${character}-${key}`;
                avatarData.texture = `${character}-tex`;
            }
            this.outfit = outfit;
            this.anim.character = character;
            this.refreshScenes();
        };

        setCharacter();
        app.user.onCharacterSettingsChange.add(setCharacter);

        this.refreshScenes();
    }

    get regularHeight(): number
    {
        return this.height;
    }

    set regularHeight(value: number)
    {
        this.height = value;
        this.body.height = value;
    }

    private refreshScenes(): void
    {
        const idleFile = (animMap.avatar.idle as any).file;

        if (!this.anim.scenes[idleFile] && app.library.hasScene(idleFile))
        {
            this.anim.addScene(animMap.avatar.idle);
        }

        const gameFile = (animMap.avatar.game as any).file;

        if (!this.anim.scenes[gameFile] && app.library.hasScene(gameFile))
        {
            this.anim.addScene(animMap.avatar.game);
        }

        const { character, outfit } = app.user;

        this.idleScene = this.anim.getSceneEntity(`${character}-idle`);
        this.gameScene = this.anim.getSceneEntity(`${character}-game`);

        if (this.idleScene)
        {
            const parent = EntityTools.findEntity(this.idleScene, 'R_Hand_jnt', 10);

            if (parent) parent.addChild(this.sprayCan);
        }

        if (this.idleScene) this.updateScene(this.idleScene, character, outfit);
        if (this.gameScene) this.updateScene(this.gameScene, character, outfit);

        this.anim.updateCurrentAnimation();
    }

    private updateScene(scene: Entity3D, character: string, outfitIndex = 0): void
    {
        const data = app.data.getCharData(character);

        if (!data) throw new Error(`[Character] Character data not found: ${character}`);

        const outfit = outfitIndex ? data.outfits[outfitIndex - 1] : data;
        const entity = EntityTools.findEntity(scene, 'SkeletalMeshComponent0', 4, outfit.features);

        if (!entity) return;

        EntityTools.setMap(entity, 'diffuseMap', app.library.getMap(outfit.texture));
    }

    resetModel(): void
    {
        this.model.ry = Math.PI;
        this.model.rx = 0;
        this.model.rz = 0;
        this.model.x = 0;
        this.model.y = (-this.body.height * 0.5) + 1;
        this.model.z = 0;
    }

    init(): void
    {
        if (this._initialized) return;
        this._initialized = true;
        this.add(Pop);
        this.add(PopPickup);
        this.pop.viewPos.y = 0;
        this.pop.viewPos.z = -3;
        this.refreshScenes();
    }

    playIntro(): void
    {
        this.init();
        this.lane.reset();
        this.resetModel();
        this.z = 0;
        this.x = -1;
        this.body.z = 0;
        this.body.x = 0;
        this.body.bottom = 0;
        this.y = this.body.bottom + (this.body.height * 0.5);
        this.anim.play('introRun', { sudden: true });
        this.hoverboard.hide();
        this.pogo.hide();
    }

    run(): void
    {
        this.refreshScenes();
        this.body.velocity.z = -this.game.stats.speed;
        this.player.run();
        this.hoverboard.hide();
        this.pogo.hide();
    }

    reset(): void
    {
        this.model.x = 0;
        this.z = 0;
        this.x = 1;
        this.body.z = 0;
        this.body.x = 1;
        this.body.bottom = 0;
        this.pogo.turnOff();
        this.magnet.turnOff();
        this.jetpack.turnOff();
        this.sneakers.turnOff();
        this.dizzy.turnOff();
        this.multiplier.turnOff();
        this.hoverboard.turnOff();
        this.notifier.notify('reset');
        if (this.reviveHalo) this.reviveHalo.stop();
    }

    restoreSize(): void
    {
        this.body.width = 4;
        this.body.height = this.regularHeight;
        this.body.depth = 4;
        this.model.position.y = (-this.body.height * 0.5) + 1;
    }

    updateModel(): void
    {
        this.model.position.y = (-this.body.height * 0.5) + 1;
        this.model.rotation.y = Math.PI;
    }

    onStateUpdate(): void
    {
        if (!this.statesReady) setupStates(this);

        this.statesReady = true;

        const params = this.state.params;

        params.landed = this.body.landed;
        params.ascending = !this.body.hangtime && this.body.ascending;
        params.descending = !this.body.hangtime && this.body.descending;
        params.rolling = this.roll.isRolling;
        params.dead = !!this.player.deathCause;
        params.hoverboard = this.hoverboard.isOn();
        params.dodging = this.lane.changing;
        params.playing = !!this.game.state && !this.player.deathCause;
        params.jetpack = this.jetpack.isOn();
        params.special = params.jetpack || this.pogo.isOn();
        params.grinding = this.hoverboard.grinding;

        // if (!params.landed && !params.descending && params.ascending) console.log('test -- ASCENDING');
        // if (!params.landed && params.descending && !params.ascending) console.log('test -- DESCENDING');
        // if (!params.landed && !params.descending && !params.ascending) console.log('test -- HANGTIME');
    }

    revive(): void
    {
        if (!this.reviveSmoke)
        {
            this.reviveSmoke = this.addComponent(Particles as any, {
                EntityClass: ParticleRevive,
                container: this.game,
                rate: 1,
                life: 90,
                xMod: [-10, 10],
                yMod: [-2, 20],
                velocityXMod: [-1, 1],
                velocityYMod: [1, 3],
                velocityZMod: [-1, -0.5],
                scaleXMod: [0.8, 1.3],
                scaleYMod: [0.8, 1.3],
                scaleZMod: [0.8, 1.3],
                growXMod: [0.01, 0.03],
                growYMod: [0.01, 0.03],
                growZMod: [0.01, 0.03],
            } as any, 'reviveSmoke') as unknown as Particles;
        }

        if (!this.reviveHalo)
        {
            this.add(ReviveHalo);
        }

        if (this.reviveHalo)
        {
            this.reviveHalo.play();
        }

        if (this.reviveSmoke)
        {
            this.reviveSmoke.data.x = this.x;
            this.reviveSmoke.data.y = 0;
            this.reviveSmoke.data.z = this.z;
            this.reviveSmoke.spawn(20);
        }

        this.game.sfx.play('hero-revive');
        this.unfreezePowerUps();
    }

    public freezePowerUps(): void
    {
        this.magnet.freeze();
        this.multiplier.freeze();
        this.sneakers.freeze();
    }

    public unfreezePowerUps(): void
    {
        this.magnet.unfreeze();
        this.multiplier.unfreeze();
        this.sneakers.unfreeze();
    }
}

function setupStates(entity: any)
{
    // Parameters
    entity.state.params = {
        playing: false,
        landed: false,
        ascending: false,
        descending: false,
        dodging: false,
        rolling: false,
        hoverboard: false,
        dizzy: false,
        special: false,
        dead: false,
    };

    // States
    entity.state.add('idle', new StateIdle());
    entity.state.add('dead', new StateDead());

    entity.state.add('running', new StateRunning());
    entity.state.add('grinding', new StateGrinding());
    entity.state.add('dodging', new StateDodging());
    entity.state.add('ascending', new StateAscending());
    entity.state.add('hangtime', new StateHangtime());
    entity.state.add('descending', new StateDescending());
    entity.state.add('rolling', new StateRolling());

    entity.state.add('jetpack', new StateJetpack());
    entity.state.add('jetpackDodging', new StateJetpackDodging());

    // Transitions
    entity.state.addTransition('all', 'idle');
    entity.state.addTransition('idle', 'running');

    entity.state.addTransition('running', 'dodging');
    entity.state.addTransition('running', 'rolling');
    entity.state.addTransition('running', 'airborne');
    entity.state.addTransition('running', 'jetpack');
    entity.state.addTransition('running', 'grinding', true);

    entity.state.addTransition('dodging', 'rolling');
    entity.state.addTransition('dodging', 'running');
    entity.state.addTransition('dodging', 'hangtime');
    entity.state.addTransition('dodging', 'jetpack');

    entity.state.addTransition('airborne', 'rolling');
    entity.state.addTransition('airborne', 'running');
    entity.state.addTransition('airborne', 'dodging');
    entity.state.addTransition('airborne', 'jetpack');

    entity.state.addTransition('ascending', 'rolling', true);
    entity.state.addTransition('ascending', 'running', true);
    entity.state.addTransition('ascending', 'dodging', true);
    entity.state.addTransition('ascending', 'jetpack', true);

    entity.state.addTransition('hangtime', 'ascending', true);
    entity.state.addTransition('hangtime', 'rolling', true);
    entity.state.addTransition('hangtime', 'running', true);
    entity.state.addTransition('hangtime', 'dodging', true);
    entity.state.addTransition('hangtime', 'jetpack', true);

    entity.state.addTransition('descending', 'ascending', true);
    entity.state.addTransition('descending', 'hangtime', true);
    entity.state.addTransition('descending', 'rolling', true);
    entity.state.addTransition('descending', 'running', true);
    entity.state.addTransition('descending', 'dodging', true);
    entity.state.addTransition('descending', 'jetpack', true);

    entity.state.addTransition('rolling', 'running');
    entity.state.addTransition('rolling', 'airborne');
    entity.state.addTransition('rolling', 'dodging');
    entity.state.addTransition('rolling', 'jetpack');

    entity.state.addTransition('jetpack', 'ascending');
    entity.state.addTransition('jetpack', 'hangtime');
    entity.state.addTransition('jetpack', 'descending');
    entity.state.addTransition('jetpack', 'airborne');
    entity.state.addTransition('jetpack', 'jetpackDodging');
    entity.state.addTransition('jetpackDodging', 'jetpack');
    entity.state.addTransition('jetpackDodging', 'airborne');
    entity.state.addTransition('jetpackDodging', 'ascending');
    entity.state.addTransition('jetpackDodging', 'hangtime');
    entity.state.addTransition('jetpackDodging', 'descending');

    entity.state.addTransition('all', 'dead');
    entity.state.addTransition('dead', 'idle');
    entity.state.addTransition('dead', 'running');

    entity.state.addTransition('grinding', 'dodging', true);
    entity.state.addTransition('grinding', 'rolling', true);
    entity.state.addTransition('grinding', 'airborne', true);
    entity.state.addTransition('grinding', 'jetpack', true);
    entity.state.addTransition('grinding', 'ascending', true);
    entity.state.addTransition('grinding', 'descending', true);
}
