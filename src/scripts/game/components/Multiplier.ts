import { app } from '../../SubwaySurfersApp';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class Multiplier extends GameComponent
{
    public count = 0;
    public duration = 10;
    public frozen = false;

    constructor(entity: GameEntity, data = {})
    {
        super(entity, data);
        this.count = 0;
        this.duration = 10;
    }

    /**
     * Calculate the total duration for this powerup, in seconds
     * @returns The total duration in seconds
     */
    public calculateDuration(): number
    {
        const boostPoints = Math.abs(app.user.boosts.permanents.multiplier);
        const boostDuration = 5 * boostPoints;

        return 10 + boostDuration;
    }

    public update(): void
    {
        if (!this.count || this.frozen) return;
        this.count -= this.entity.game.stats.delta;
        this.entity.game.hud.updateItemTimer('multiplier', this.ratio);
        if (this.count <= 0) this.turnOff(true);
    }

    public turnOn(): void
    {
        this.frozen = false;
        this.duration = this.calculateDuration();

        if (this.count)
        {
            this.count = this.duration;

            return;
        }
        this.count = this.duration;
        this.entity.game.hud.addItemTimer('multiplier');
        this.entity.game.stats.multiplier *= 2;
        this.entity.game.stats.missionMultiplier *= 2;
    }

    public turnOff(playTurnOffSound = false): void
    {
        if (!this.count) return;
        this.frozen = false;
        this.entity.game.hud.removeItemTimer('multiplier');
        Math.ceil(this.entity.game.stats.multiplier /= 2);
        Math.ceil(this.entity.game.stats.missionMultiplier /= 2);
        this.count = 0;
        if (playTurnOffSound) app.sound.play('pickup-powerdown');
    }

    public isOn(): boolean
    {
        return !!this.count;
    }

    public get ratio(): number
    {
        return this.count / this.duration;
    }

    public freeze(): void
    {
        if (!this.isOn()) return;
        this.frozen = true;
    }

    public unfreeze(): void
    {
        if (!this.isOn()) return;
        this.frozen = false;
    }
}
