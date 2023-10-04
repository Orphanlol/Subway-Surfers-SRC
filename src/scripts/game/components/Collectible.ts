import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class Collectible extends GameComponent
{
    public collected = false;

    constructor(entity: GameEntity, data = {})
    {
        super(entity, data);
        this.collected = false;
    }

    respawn(): void
    {
        // this.entity.active = true;
        this.collected = false;
        this.entity.scale.set(1);
    }

    collect(collector: GameEntity): void
    {
        if (this.collected) return;
        this.collected = true;
        this.entity.scale.set(0.0001);
        this.entity.active = false;
        // this.entity.model.active = false;
        // this.entity.x = 99999;
        if (this.entity.body)
        {
            this.entity.body.movable = false;
            this.entity.body.velocity.reset();
        }
        if (this.entity.attractable) this.entity.attractable.attracted = false;
        if (this.entity.onCollect) this.entity.onCollect(collector);
    }
}
