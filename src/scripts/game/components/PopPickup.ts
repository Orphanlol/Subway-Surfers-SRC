import { Entity3D, Time } from '@goodboydigital/odie';

import { app } from '../../SubwaySurfersApp';
import Math2 from '../../utils/Math2';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class PopPickup extends GameComponent
{
    public view?: Entity3D;
    public duration = 13;
    public count = 0;

    constructor(entity: GameEntity, data = {})
    {
        super(entity, data);
        this.reset();
    }

    reset(): void
    {
        if (!this.view) return;
        if (this.view.parent) this.entity.removeChild(this.view);
        this.view.active = false;
        this.view.scale.set(0);
        this.count = 0;
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (!this.count || !this.view) return;
        this.count -= delta;
        const scale = 1 + ((1 - (this.count / this.duration)) * 20);

        this.view.scale.set(scale);
        if (this.count <= 0) this.reset();
    }

    play(): void
    {
        if (!this.view)
        {
            if (!app.library.hasGeometry('pow')) return;
            this.view = app.library.getEntity('pow', { map: 'effects-tex', opacity: 0.95, blendMode: 1 });
            this.view.rotation.y = Math.PI;
        }
        this.duration = 13;
        this.view.rotation.z = Math2.PI_DOUBLE * Math.random();
        this.count = this.duration;
        this.view.active = true;
        this.view.scale.set(0.5);
        this.entity.addChild(this.view);
    }
}
