import Game from '../../Game';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

const defaultData = {
    speed: 0,
};

export default class Movable extends GameComponent
{
    public speed = 0;
    public target = 0;
    public origin = 0;
    public lastDest: number | null = null;

    constructor(entity: GameEntity, data: any = {})
    {
        super(entity, { ...defaultData, ...data });
        this.speed = this.data.speed;
        this.lastDest = null;
    }

    reset(): void
    {
        this.speed = 0;
        this.entity.body.movable = false;
        this.entity.body.velocity.reset();
    }

    update(): void
    {
        if (this.entity.game.state !== Game.RUNNING)
        {
            this.entity.body.velocity.z = 0;

            return;
        }
        if (!this.speed || !this.entity.active) return;
        if (this.lastDest !== null)
        {
            this.entity.body.back = this.lastDest;
            this.entity.body.origin.back = this.lastDest;
        }
        const diff = this.target - this.entity.game.stats.z;
        const dest = this.origin + (diff * this.speed);
        // this.entity.body.back = dest;
        const velz = dest - this.entity.body.back;

        this.entity.body.velocity.z = velz;
        // this.lastVel = this.entity.body.z - this.entity.body.origin.z;
        this.lastDest = dest;
    }

    run(speed: number, target: number): void
    {
        this.speed = speed;
        this.origin = this.entity.body.back;
        this.target = target;
        this.lastDest = this.origin;
        this.entity.body.movable = this.speed > 0;
    }
}
