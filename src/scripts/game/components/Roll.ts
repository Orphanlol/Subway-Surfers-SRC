import { Runner, Time } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import Character from '../entities/Character';
import GameComponent from '../GameComponent';

export default class Roll extends GameComponent
{
    public onStart: Runner;
    public onEnd: Runner;
    public locked = false;
    public isRolling = false;
    public gravity = 0;
    public duration = 30;
    public time = 0;
    public rollingHeight = 5;
    public entity: Character;

    protected _isOn = false;

    constructor(entity: Character)
    {
        super(entity);
        this.entity = entity;
        this.onStart = new Runner('onRollStart');
        this.onEnd = new Runner('onRollEnd');
        this.reset();
    }

    reset(): void
    {
        this.locked = false;
        this.isRolling = false;
        this.gravity = GameConfig.gravity;
        this.duration = 30;
        this.time = 0;
        this.rollingHeight = 5;
        this.entity.body.height = this.entity.regularHeight;
    }

    turnOn(): void
    {
        if (this._isOn) return;
        this._isOn = true;
        this.entity.game.controller.onSwipeVertical.add(this as any);
    }

    turnOff(): void
    {
        if (!this._isOn) return;
        this._isOn = false;
        this.entity.game.controller.onSwipeVertical.remove(this as any);
    }

    onSwipeVertical(direction: number): void
    {
        if (direction === -1) this.perform();
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (!this.isRolling) return;
        this.time += delta;
        if (this.time > this.duration) this.time = this.duration;
        if (this.time === this.duration) this.end();
    }

    perform(): void
    {
        if (this.locked || this.isRolling) return;
        this.onStart.dispatch();
        if (this.entity.jump) this.entity.jump.cancel();
        if (this.entity.sneakers?.isOn()) this.entity.sneakers.jumpCancel();
        this.isRolling = true;
        this.time = 0;
        if (!this.entity.body.landed) this.entity.body.velocity.y = -2;
        const bottom = this.entity.body.bottom;

        this.entity.body.height = this.rollingHeight;
        this.entity.body.bottom = bottom;
        this.entity.game.sfx.play('hero-roll');
        this.entity.game.missions.addStat(1, 'mission-roll');
    }

    end(): void
    {
        this.isRolling = false;
        this.entity.body.height = this.entity.regularHeight;
        if (this.entity.body.bottom < this.entity.body.ground)
        {
            this.entity.body.bottom = this.entity.body.ground;
        }
        this.time = 0;
        this.onEnd.dispatch();
    }

    cancel(): void
    {
        this.end();
    }

    lock(): void
    {
        this.end();
        this.locked = true;
    }

    unlock(): void
    {
        this.locked = false;
    }

    isOn(): boolean
    {
        return this._isOn;
    }
}
