import { Entity3D, Time } from '@goodboydigital/odie';

import { app } from '../../SubwaySurfersApp';
import Curve from '../../utils/Curve';
import Math2 from '../../utils/Math2';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class Halo extends GameComponent
{
    public view: Entity3D;
    public halo: Entity3D;
    public scaleStart!: number;
    public scaleEnd!: number;
    public maxDistance!: number;
    public rotationSpeed!: number;
    public hidden = false;

    constructor(entity: GameEntity, data = {})
    {
        super(entity, data);
        this.view = new Entity3D();
        this.halo = app.library.getEntity('powBoost', { map: 'effects-tex', opacity: 0.9, blendMode: 1 });
        this.view.addChild(this.halo);
        this.view.z = -3;
        this.view.ry = Math.PI;
        entity.addChild(this.view);
        this.reset();
    }

    reset(): void
    {
        this.respawn();
    }

    respawn(): void
    {
        this.scaleStart = 0;
        this.scaleEnd = 1;
        this.maxDistance = 500;
        this.rotationSpeed = -0.03;
        this.hidden = false;
        this.view.scale.set(1);
        this.halo.scale.set(1);
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (this.hidden) return;
        this.updateHaloScale();
        this.updateViewScale();
        if (!this.rotationSpeed) return;
        this.halo.rotation.z += delta * this.rotationSpeed;
    }

    updateHaloScale(): void
    {
        const pos = this.entity.game.stats.z + 20;
        const diff = pos - this.entity.body.z;
        const scale = 1.5 + (Math.sin(diff * 0.03) * 0.5);

        this.halo.scale.set(scale);
    }

    updateViewScale(): void
    {
        const pos = this.entity.game.stats.z - 10;
        const diff = pos - this.entity.body.z;
        const r = 1 - Math2.clamp(diff / this.maxDistance);
        const c = Curve.backOut(r);
        const scale = this.scaleStart + ((this.scaleEnd - this.scaleStart) * c);

        this.view.scale.set(scale);
    }

    public hide(): void
    {
        this.hidden = true;
        this.view.scale.set(0.00001);
        this.halo.scale.set(0.00001);
    }
}
