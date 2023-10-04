import Game from '../../Game';
import Curve, { CurveFunc } from '../../utils/Curve';
import Math2 from '../../utils/Math2';
import Random from '../../utils/Random';
import { State, StateMachine } from '../../utils/StateMachine';
import Guard from '../entities/Guard';
import GameComponent from '../GameComponent';

interface ChaserState
{
    distance: number;
    duration: number;
    curve: CurveFunc | null;
}

class ChaserState implements State, ChaserState
{
    public name = '';
    public distance = 0;
    public duration = 0;
    public curve: CurveFunc | null = null;
    public follower: Chaser;

    constructor(follower: Chaser)
    {
        this.follower = follower;
    }

    public get game()
    {
        return this.follower.entity.game;
    }

    public get player()
    {
        return this.follower.entity.game.hero.player;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    enter(from: string): void
    {
        this.follower.distanceStart = this.follower.distance;
        this.follower.distanceEnd = this.distance;
        this.follower.duration = this.duration;
        this.follower.curve = this.curve;
        this.follower.time = 0;
    }
}

class ChaserStateDisabled extends ChaserState
{
    public name = 'disabled';
    public distance = 9999;
    public duration = 0.1;
    public curve = null;

    public condition(sm: StateMachine)
    {
        if (!this.game) return true;

        return !this.player.dead && !this.player.running && sm.neither('intro');
    }
}

class ChaserStateIntro extends ChaserState
{
    public name = 'intro';
    public distance = 10;
    public duration = 0.01;
    public curve = null;

    public condition(sm: StateMachine)
    {
        if (this.follower.entity.game.hero.player.running) return false;

        return sm.either('disabled');
    }

    public enter(from: string)
    {
        super.enter(from);
        this.game.sfx.play('guard-start');
        this.follower.entity.anim?.play('Guard_playIntro', { sudden: true });
        this.follower.entity.dog.anim?.play('Dog_playIntro', { sudden: true });
    }
}

class ChaserStateNear extends ChaserState
{
    public name = 'near';
    public distance = 10;
    public duration = 0.6;
    public curve = Curve.sineOut;

    public enter(from: string)
    {
        super.enter(from);
        this.follower.entity.game.sfx.play('guard-proximity');
    }

    public condition(sm: StateMachine)
    {
        if (this.game.level.isTutorial()) return false;
        if (this.follower.entity.game.state !== Game.RUNNING) return false;

        return (!!this.follower.entity.game.hero.player.dizzy && sm.neither('disabled', 'catch'));
    }

    public update()
    {
        // this.follower.entity.anim?.play('Guard_run', { loop: true });
        if (this.game.hero.body.landed)
        {
            this.follower.entity.anim?.play('Guard_run', { loop: true });
            this.follower.entity.dog.anim?.play('Dog_run', { loop: true });
        }
        else
        {
            this.follower.entity.anim?.play('Guard_jump', { loop: false });
            this.follower.entity.dog.anim?.play('Dog_jump', { loop: true });
        }
    }
}

class ChaserStateFar extends ChaserState
{
    public name = 'far';
    public distance = 70;
    public duration = 3;
    public curve = Curve.sineIn;

    public condition(sm: StateMachine)
    {
        if (this.game.level.isTutorial()) return true;
        if (this.follower.entity.game.state !== Game.RUNNING) return false;
        if (this.follower.entity.game.hero.player.dizzy) return false;

        return sm.either('near');
    }

    public update()
    {
        if (this.game.hero.body.landed)
        {
            this.follower.entity.anim?.play('Guard_run', { loop: true });
            this.follower.entity.dog.anim?.play('Dog_run', { loop: true });
        }
        else
        {
            this.follower.entity.anim?.play('Guard_jump', { loop: false });
            this.follower.entity.dog.anim?.play('Dog_jump', { loop: false });
        }
    }
}

class ChaserStateGoAway extends ChaserState
{
    public name = 'goAway';
    public distance = 100;
    public duration = 0.5;
    public curve = Curve.sineIn;

    public condition()
    {
        if (this.player.deathCause === 'train') return true;
        if (this.follower.entity.game.state !== Game.RUNNING) return false;

        // return sm.either('far', 'near');
        return this.follower.distance > 60;
    }
}

class ChaserStateCatch extends ChaserState
{
    public name = 'catch';
    public distance = 0;
    public duration = 0.3;
    public curve = Curve.sineOut;
    private anim = [
        // '_Caught_Left_Leg', // Not looking good, character is flickering a lot
        // '_Caught_Right_Leg', // Not looking good, character is flickering a little bit
        '_Caught_Shoulder',
    ];

    public enter(from: string)
    {
        super.enter(from);
        this.follower.entity.game.sfx.play('guard-catch');

        const anim = Random.pick(...this.anim);

        this.follower.entity.anim?.play(`Guard${anim}`, { sudden: true });
        this.follower.entity.dog.anim?.play(`Dog${anim}`, { sudden: true });
        this.game.hero.anim.play(`Avatar${anim}`, { sudden: true });

        this.game.missions.addStat(1, 'mission-get-caught');
    }

    public condition()
    {
        if (this.player.deathCause === 'train') return false;

        return this.follower.entity.game.hero.player.dead;
    }
}

export default class Chaser extends GameComponent
{
    public offsetX: number;
    public near = false;
    public enabled = false;
    public lastGround = 0;
    public lastPos = 0;
    public time = 0;

    public distanceStart = 0;
    public distanceEnd = 0;
    public duration = 0;
    public curve?: CurveFunc | null;

    public sound?: any;
    public entity: Guard;
    public sm: StateMachine;

    private _distance = 0;

    constructor(entity: Guard, data: any = {})
    {
        super(entity, data);
        this.entity = entity;
        this.offsetX = data.offsetX || 0;
        this.sm = new StateMachine();
        this.sm.add(new ChaserStateDisabled(this));
        this.sm.add(new ChaserStateIntro(this));
        this.sm.add(new ChaserStateNear(this));
        this.sm.add(new ChaserStateFar(this));
        this.sm.add(new ChaserStateGoAway(this));
        this.sm.add(new ChaserStateCatch(this));
        this.sm.set('disabled');

        this.reset();
    }

    reset(): void
    {
        if (!this.entity.body) return;
        this.entity.body.lane = 0;
        this.entity.body.x = 0;
        this.entity.body.z = 999;
        this.entity.body.bottom = 0;
        this.entity.active = false;
        this.near = false;
        this.enabled = false;
        this.lastGround = 0;
        this.lastPos = 0;
        if (this.entity.game) this.sm.set('disabled');
    }

    update(): void
    {
        const delta = this.entity.game.delta;

        if (!this.enabled || !this.entity.game) return;

        this.sm.update(delta);

        if (this.time <= this.duration)
        {
            this.time += this.entity.game.deltaSecs;
            if (this.time > this.duration) this.time = this.duration;
        }

        const px = this.entity.game.stats.x + this.offsetX;

        this.entity.body.x = Math2.lerp(this.entity.body.x, px, 0.5 * delta);

        const hero = this.entity.game.hero;

        if (hero.body.landed) this.lastGround = hero.body.ground;
        const py = this.lastGround + ((hero.body.bottom - this.lastGround) * 0.5);

        this.entity.body.bottom = py;
        if (this.entity.body.bottom > hero.body.bottom) this.entity.body.bottom = hero.body.bottom;

        const r = !this.curve ? this.time / this.duration : this.curve(this.time / this.duration);
        const d = Math2.lerp(this.distanceStart, this.distanceEnd, r);

        this.distance = d;
        if (this.sound) this.sound.volume(1 - Math2.clamp(this.distance / 70, 0, 1));
    }

    set distance(v: number)
    {
        const z = this.entity.game.stats.z + v;

        this._distance = v;
        this.entity.body.z = z;

        this.entity.model.active = this._distance < 30;
        this.entity.anim.active = this.entity.model.active;
    }

    get distance(): number
    {
        return this._distance;
    }

    enable(): void
    {
        this.enabled = true;
        // this.sm.set('near');
    }

    disable(): void
    {
        this.entity.active = true;
        this.entity.body.z = 9999;
        this.enabled = false;
    }

    playIntro(): void
    {
        this.distance = 50;
        this.time = this.duration = 0.01;
        this.enable();
        this.sm.set('intro');
    }

    dismiss(): void
    {
        this.sm.set('disabled');
    }
}

