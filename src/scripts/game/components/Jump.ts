import { Time } from '@goodboydigital/odie';
import { Runner } from 'pixi.js';

import GameConfig from '../../GameConfig';
import Curve from '../../utils/Curve';
import Math2 from '../../utils/Math2';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class Jump extends GameComponent
{
    public locked!: boolean;
    public isJumping!: boolean;
    public isDoubleJumping!: boolean;
    public goingUpwards!: boolean;
    public gravity!: number;
    public boardGravity!: number;
    public time = 0;
    public duration = 0;
    public startY = 0;
    public endY = 0;
    public jumpHeight = 20;
    public onJump: Runner;

    protected _isOn = false;

    private shouldJumpAgain = false;
    private doubleJumpEnabled = false;
    private smoothDriftTick = 0;

    constructor(entity: GameEntity)
    {
        super(entity);
        this.onJump = new Runner('onJump');
        this.reset();
    }

    reset(): void
    {
        this.locked = false;
        this.isJumping = false;
        this.isDoubleJumping = false;
        this.goingUpwards = false;
        this.gravity = GameConfig.gravity;
        this.boardGravity = GameConfig.gravity;
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
        if (direction === 1)
        {
            if (!this.isJumping && !this.locked) this.onJump.run();
            this.perform();
        }
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (this.locked) return;

        if (this.shouldJumpAgain && !this.isJumping)
        {
            this.shouldJumpAgain = false;
            this.perform();
        }
        if (this.isJumping && this.goingUpwards)
        {
            this.time += this.entity.game.deltaSecs;
            if (this.time > this.duration) this.time = this.duration;
            const r = this.time / this.duration;
            const t = Curve.sineOut(r);
            const y = Math2.lerp(this.startY, this.endY, t);

            this.entity.body.velocity.y = delta ? (y - this.entity.body.y) / delta : 0;
            if (r >= 1)
            {
                this.entity.body.velocity.y = 0;
                this.goingUpwards = false;
            }
        }
        else
        {
            this.entity.body.velocity.y -= this.gravity * delta;
        }

        if (this.isJumping && !this.goingUpwards)
        {
            this.smoothDriftTick += this.entity.game.deltaSecs * 0.001;
            this.gravity = Math2.lerp(this.gravity, GameConfig.gravity, this.smoothDriftTick);
        }

        if (this.entity.body.bottom <= this.entity.body.ground + 0.01 && this.entity.body.velocity.y <= 0)
        {
            this.entity.body.velocity.y = 0;
            this.entity.body.bottom = this.entity.body.ground;
            if (this.isJumping) this.end();
        }
    }

    perform(height?: number, force = false): void
    {
        if (GameConfig.freejump) force = true;
        const canDoubleJump = this.doubleJumpEnabled && !this.isDoubleJumping;

        if (!force)
        {
            if (this.locked)
            {
                console.log('[Jump] Cant jump - jump locked');

                return;
            }
            else if (this.isJumping)
            {
                if (canDoubleJump)
                {
                    this.isDoubleJumping = true;
                }
                else
                {
                    if (this.entity.body.velocity.y < 0) this.shouldJumpAgain = true;

                    return;
                }

                console.log('[Jump] Cant jump - already jumping', this.entity.body.bottom, this.entity.body.ground);
            }
            else if (!this.entity.body.canJump)
            {
                console.log('[Jump] Cant jump - body not landed');

                return;
            }
        }

        if (this.entity.roll) this.entity.roll.cancel();
        this.entity.body.resetGroundChangeTolerance();
        this.isJumping = true;
        this.entity.body.velocity.y = 0;
        this.entity.body.y += 1;
        this.startY = this.entity.body.y;
        this.endY = Math.min(this.startY + (height || this.jumpHeight) - 1, 70);
        this.time = 0;
        this.duration = 0.41;
        this.goingUpwards = true;
        this.smoothDriftTick = 0;
        this.entity.game.sfx.play('hero-jump');
        this.entity.game.missions.addStat(1, 'mission-jump');
        this.gravity = this.boardGravity;
    }

    enableSuperJump(): void
    {
        this.jumpHeight = 30;
    }

    disableSuperJump(): void
    {
        this.jumpHeight = 20;
    }

    enableDoubleJump(): void
    {
        this.doubleJumpEnabled = true;
    }

    disableDoubleJump(): void
    {
        this.doubleJumpEnabled = false;
    }

    enableSmoothDrift(): void
    {
        this.boardGravity = 0.001;
    }

    disableSmoothDrift(): void
    {
        this.boardGravity = GameConfig.gravity;
    }

    end(): void
    {
        this.isJumping = false;
        this.isDoubleJumping = false;
        this.goingUpwards = false;
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
        this.gravity = GameConfig.gravity;
    }
}
