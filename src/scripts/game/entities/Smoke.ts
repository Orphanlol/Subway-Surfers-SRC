import { Entity3D } from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';

import SmokeMaterial from '../../materials/SmokeMaterial';
import { app } from '../../SubwaySurfersApp';

export default class Smoke extends Entity3D
{
    public speed: number;
    public view: Entity3D;
    public view2: Entity3D;
    private accumulatedDelta = 0;

    constructor(speed = 5, depthTest = true)
    {
        super();
        this.speed = speed;
        // this.view = Model.getEntityCloneBlend('jetpackCloud', 'jetpackSmoke', 0.9);
        this.view = this.getView(depthTest);
        this.view2 = this.getView(depthTest);
        this.view2.y = -73;
        this.view2.scale.x = 1;
        this.view2.scale.y = 2;
        this.view2.scale.z = 2;
    }

    getView(depthTest = false): Entity3D
    {
        // const view = Model.getEntityClone('jetpackCloud', 'jetpackSmoke', false, ParticleMaterial);
        const view = app.library.getEntity('jetpackCloud', {
            map: 'jetpack-smoke',
            material: SmokeMaterial,
        });

        if (!view.view3d) throw new Error('View3DComponent not found in Smoke entity');

        view.view3d.state.blend = true;
        view.view3d.state.culling = false;
        (view.view3d.material as any).map.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        this.addChild(view);
        view.ry = -Math.PI * 0.5;
        view.rx = Math.PI * 0.5;
        view.scale.set(0.25);
        view.y = -12;
        view.active = false;
        view.view3d.state.depthTest = depthTest;

        return view;
    }

    animationStep(delta = 1): void
    {
        if (!this.view.active) return;

        // Skip frames
        this.accumulatedDelta += delta;
        if (this.accumulatedDelta < 2) return;

        const movement = this.accumulatedDelta * this.speed * 0.015;

        (this.view.view3d?.material as any).offset -= movement;
        (this.view2.view3d?.material as any).offset -= movement;
        this.accumulatedDelta = 0;
    }

    turnOn(): void
    {
        this.view.active = true;
        this.view2.active = true;
        // this.view.view3d.material.map.orig.x = ;
    }

    turnOff(): void
    {
        this.view.active = false;
        this.view2.active = false;
        if (this.parent) this.parent.removeChild(this);
        // TODO - investigate better a weird bug where smoke turns on after revive
        setTimeout(() =>
        {
            this.view.active = false;
            this.view2.active = false;
            if (this.parent) this.parent.removeChild(this);
        }, 100);
    }
}
