import { Entity3D, Time, Vector3 } from '@goodboydigital/odie';

import { app } from '../../SubwaySurfersApp';
import Math2 from '../../utils/Math2';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

const defaultData = {
    type: 'coin',
};

export default class Pop extends GameComponent
{
    public view?: Entity3D;
    public duration = 8;
    public count = 0;
    public viewPos = new Vector3();

    constructor(entity: GameEntity, data = {})
    {
        super(entity, { ...defaultData, ...data });
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
        const scale = 0.5 + ((1 - (this.count / this.duration)) * 0.75);

        this.view.scale.set(scale);
        if (this.count <= 0) this.reset();
    }

    play(): void
    {
        if (!this.view)
        {
            if (!app.library.hasGeometry('star7')) return;
            this.view = app.library.getEntity('star7', { map: 'effects-tex', opacity: 0.9, blendMode: 3 });
            this.view.rotation.y = Math.PI;
        }
        this.view.x = this.viewPos.x;
        this.view.y = this.viewPos.y;
        this.view.z = this.viewPos.z;
        this.view.rotation.z = Math2.PI_DOUBLE * Math.random();
        this.count = this.duration;
        this.view.active = true;
        this.view.scale.set(0.5);
        this.entity.addChild(this.view);
    }
}
