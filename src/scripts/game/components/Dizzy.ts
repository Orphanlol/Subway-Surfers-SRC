import { Entity3D, Time } from '@goodboydigital/odie';

import { app } from '../../SubwaySurfersApp';
import EntityTools from '../../utils/EntityTools';
import Character from '../entities/Character';
import GameComponent from '../GameComponent';

export default class Dizzy extends GameComponent
{
    public view?: Entity3D;
    public trail1!: Entity3D;
    public trail2!: Entity3D;
    public star1!: Entity3D;
    public star2!: Entity3D;

    createView(): void
    {
        if (this.view || !app.library.hasGeometry('Dizzytrail')) return;
        this.view = new Entity3D();
        this.view.y = 4;
        this.view.x = 0.5;

        this.trail1 = app.library.getEntity('Dizzytrail', { map: 'effects-tex', opacity: 0.5, blendMode: 1 });
        this.view.addChild(this.trail1);

        this.trail2 = app.library.getEntity('Dizzytrail', { map: 'effects-tex', opacity: 0.5, blendMode: 1 });
        this.trail2.ry = Math.PI;
        this.view.addChild(this.trail2);

        this.star1 = app.library.getEntity('Dizzystar', { map: 'effects-tex', opacity: 0.5, blendMode: 1 });
        this.star1.z = -1.5;
        this.view.addChild(this.star1);

        this.star2 = app.library.getEntity('Dizzystar', { map: 'effects-tex', opacity: 0.5, blendMode: 1 });
        this.star2.z = 1.5;
        this.view.addChild(this.star2);

        this.view.active = false;
        this.view.rx = -0.5;
        this.view.scale.set(1.25);
    }

    reset(): void
    {
        if (this.view) this.view.active = false;
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (!this.view || !this.view.active) return;
        this.view.ry += delta * 0.05;
    }

    turnOn(): void
    {
        this.createView();
        if (!this.view) return;
        if (!this.view.parent)
        {
            const scene = (this.entity as Character).gameScene;

            if (scene)
            {
                const parent = EntityTools.findEntity(scene, 'Head_jnt', 10);

                parent?.addChild(this.view);
            }
        }
        this.view.active = true;

        this.view.scale.set(1.25 * 0.01);
        this.view.y = 4 * 0.01;
        this.view.x = 0;
    }

    turnOff(): void
    {
        if (!this.view) return;
        if (this.view.parent) this.view.parent.removeChild(this.view);
        this.view.active = false;
    }
}
