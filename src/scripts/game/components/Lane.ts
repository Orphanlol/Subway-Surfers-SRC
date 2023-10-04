import { Runner, Time as OdieTime } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import Math2 from '../../utils/Math2';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export enum LanePosition
    {
    LEFT = -1,
    CENTRAL = 0,
    RIGHT = 1,
}
export class Lane extends GameComponent
{
    public onBumpSideways: Runner;
    public onLaneChanged: Runner;
    public lane = 0;
    public last = 0;
    public absStep = 0;
    public changing = false;
    public changeStartX = 0;
    public changeEndX = 0;
    public changeDuration = 0;
    public changeTime = 0;
    public queuedStep = 0;
    public queuedDuration = 0;
    public zapping = false;
    protected _isOn = false;
    protected _secs = 0;

    constructor(entity: GameEntity)
    {
        super(entity);
        this.entity = entity;
        this.onBumpSideways = new Runner('onBumpSideways', 1);
        this.onLaneChanged = new Runner('onLaneChanged', 1);
        this.reset();
    }

    reset(): void
    {
        this.lane = 0;
        this.last = 0;
        this.absStep = 0;
        this.changing = false;
        this.changeStartX = 0;
        this.changeEndX = 0;
        this.changeDuration = 0;
        this.changeTime = 0;
        this.queuedStep = 0;
        this.queuedDuration = 0;
    }

    turnOn(): void
    {
        if (this._isOn) return;
        this._isOn = true;
        this.entity.game.controller.onSwipeHorizontal.add(this as any);
    }

    turnOff(): void
    {
        if (!this._isOn) return;
        this._isOn = false;
        this.entity.game.controller.onSwipeHorizontal.remove(this as any);
    }

    onSwipeHorizontal(direction: number): void
    {
        this.change(direction);
    }

    change(step: number): void
    {
        if (!this.entity.jetpack?.isOn() && !this.entity.pogo?.isOn())
        {
            if (this.lane === 1 && step > 0)
            {
                if (this.entity.body.x > GameConfig.laneWidth - 1)
                {
                    this.onBumpSideways.dispatch('wall');
                }

                return;
            }
            if (this.lane === -1 && step < 0)
            {
                if (this.entity.body.x < -GameConfig.laneWidth + 1)
                {
                    this.onBumpSideways.dispatch('wall');
                }

                return;
            }
        }

        const durationRatio = 1 - this.entity.game.stats.speedRatio;
        const duration = 0.2 + (0.1 * durationRatio);
        const targetLaneRnd = Math.round(this.lane + step);
        const targetLane = Math2.clamp(targetLaneRnd, -1, 1);
        const targetX = targetLane * GameConfig.laneWidth;
        const distance = Math.abs(targetX - this.entity.body.x);

        if (distance > GameConfig.laneWidth)
        {
            this.queuedStep = step;
            this.queuedDuration = duration;

            return;
        }

        this.entity.state?.set('empty');
        this.absStep = step < 0 ? -1 : 1;
        this.last = this.lane;
        this.lane = targetLane;
        this.queuedStep = 0;
        this.queuedDuration = 0;
        this.changing = true;
        this.changeStartX = this.entity.body.x;
        this.changeEndX = targetX;
        this.changeDuration = Math.max(duration * distance / GameConfig.laneWidth, 0.1);
        if (this.entity.jetpack?.isOn()) this.changeDuration *= 0.7;
        this.changeTime = 0;
        this._secs = this.secs();
        this.entity.game.sfx.play('hero-dodge');
        this.onLaneChanged.dispatch();
    }

    secs(): number
    {
        return new Date().getTime() / 1000;
    }

    update(time: OdieTime): void
    {
        const delta = time.frameTime;

        if (!this.changing) return;
        this.changeTime += this.entity.game.deltaSecs * (this.zapping ? 2 : 1);

        if (this.changeTime > this.changeDuration) this.changeTime = this.changeDuration;
        const rt = Math2.clamp(this.changeTime / this.changeDuration);
        const x = Math2.lerp(this.changeStartX, this.changeEndX, rt);

        this.entity.body.velocity.x = delta ? (x - this.entity.body.x) / delta : 0;

        const ry = -(this.changeEndX - this.entity.body.x) * 0.05;
        const special = this.entity.jetpack?.isOn() || this.entity.pogo?.isOn() || this.entity.hoverboard?.isOn();

        this.entity.ry = special ? 0 : ry;
        if (this.changeTime >= this.changeDuration) this.changeEnd();
    }

    changeEnd(): void
    {
        this.entity.body.x = this.lane * GameConfig.laneWidth;
        this.changing = false;
        this.entity.ry = 0;
        this.entity.body.velocity.x = 0;
        if (this.queuedDuration)
        {
            this.change(this.queuedStep);
            this.queuedStep = 0;
            this.queuedDuration = 0;
        }
    }

    changeCancel(): void
    {
        this.changing = false;
        this.queuedStep = 0;
        this.queuedDuration = 0;
        this.entity.ry = 0;
        this.entity.body.velocity.x = 0;
    }

    get lanePos(): number
    {
        return this.entity.body.x / GameConfig.laneWidth;
    }

    set lanePos(v: number)
    {
        v = Math2.clamp(v, -1, 1);
        this.entity.body.x = GameConfig.laneWidth * v;
    }

    bump(obstacle: string, side: number): void
    {
        this.changeCancel();
        this.change(side);
        this.onBumpSideways.dispatch(obstacle);
        this.entity.body.velocity.x = 0;
    }
}
