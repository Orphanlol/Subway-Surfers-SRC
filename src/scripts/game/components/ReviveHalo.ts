import { Entity3D, Time, View3DComponent } from '@goodboydigital/odie';

import { app } from '../../SubwaySurfersApp';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class ReviveHalo extends GameComponent
{
    public view!: Entity3D;
    public duration = 13;
    public time = 0;
    public scale = 2;
    private view3d!: View3DComponent;

    constructor(entity: GameEntity, data = {})
    {
        super(entity, data);
        this.entity = entity;
    }

    private build(): void
    {
        if (this.view) return;
        if (!app.library.hasGeometry('powRevive')) return;

        this.view = app.library.getEntity('powRevive', { map: 'effects-tex', opacity: 0.7, blendMode: 3 });
        this.view3d = this.view.getComponent(View3DComponent as any) as View3DComponent;
        this.view3d.state.depthTest = false;
        this.view.rotation.y = Math.PI;
        this.view.rotation.x = -0.3;
        this.entity.addChild(this.view);
        this.scale = 2;
        this.view.scale.set(this.scale);
        this.view.y = 2;
        this.view.active = false;
        this.time = 0;
        this.duration = 120;
    }

    update(time: Time): void
    {
        if (!this.view) return;
        const delta = time.frameTime;

        if (!this.time) return;
        this.time -= delta;
        this.scale = (Math.sin(this.time * 0.1) * 0.2) + 2;
        this.view.scale.set(this.scale);

        const alphaChange = this.duration * 0.1;
        const alphaIn = 1 - ((this.time - alphaChange) / (this.duration - alphaChange));
        const alphaOut = this.time / alphaChange;
        const alpha = this.time > alphaChange ? alphaIn : alphaOut;

        (this.view3d.material as any).opacity = alpha * 0.6;

        this.view.rotation.z += delta * 0.01;
        if (this.time < 0) this.stop();
    }

    play(): void
    {
        this.build();
        if (!this.view) return;
        this.view.active = true;
        this.time = this.duration;
    }

    stop(): void
    {
        if (!this.view) return;
        this.time = 0;
        this.view.active = false;
    }
}
