import { Time } from '@goodboydigital/odie';

import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class Bouncing extends GameComponent
{
    public bounce = 0;

    constructor(entity: GameEntity)
    {
        super(entity);
        this.bounce = 0;
    }

    reset(): void
    {
        this.bounce = 0;
    }

    update(time: Time): void
    {
        if (!this.entity.model) return;
        const delta = time.frameTime;

        this.bounce += delta * 0.1;
        this.entity.model.y = Math.abs(Math.sin(this.bounce) * 3);
        this.entity.model.rz = Math.sin(this.bounce) * 0.2;
    }
}
