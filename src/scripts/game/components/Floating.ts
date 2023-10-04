import { Time } from '@goodboydigital/odie';

import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

const defaultData = {
    rotationSpeed: 0.1,
};

let index = 1;

export default class Floating extends GameComponent
{
    public startingRot: number | null = null;
    public rotation = 0;
    public index: number | null = null;

    constructor(entity: GameEntity, data = {})
    {
        super(entity, { ...defaultData, ...data });
        this.startingRot = null;
        this.index = null;
    }

    reset(): void
    {
        this.startingRot = null;
        this.rotation = 0;
        this.index = index++;
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        const dist = this.entity.game.hero.body.z - this.entity.body.z;

        if (!this.entity.model) return;
        if (this.startingRot === null)
        {
            // if (!this.index) this.index = index++;
            // this.entity.model.ry = this.index * 0.1;
            // this.startingRot = this.entity.body.z * 0.01;
            this.startingRot = index++ * 0.4;
            this.rotation = this.startingRot;
        }

        this.rotation -= delta * this.data.rotationSpeed;

        if (dist < 600) this.entity.model.ry = this.rotation;
    }
}
