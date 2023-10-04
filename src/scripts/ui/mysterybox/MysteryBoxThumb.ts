import { Entity3D } from '@goodboydigital/odie';
import { Linear, TweenMax } from 'gsap';
import { Rectangle } from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import { Thumb3D } from '../me/Thumb3D';
import { ThumbScene3D } from '../me/ThumbScene3D';

export class MysteryBoxThumb extends Thumb3D
{
    public static scene: ThumbScene3D;
    entity!: Entity3D;

    constructor(id: string)
    {
        super();

        this.setup(id);
    }

    tween(id = 0): void
    {
        const entity = this.entity;

        TweenMax.killTweensOf(entity);
        MysteryBoxThumb.scene.stopAll();
        MysteryBoxThumb.scene.play(this.thumbId);
        this.shadow.width = this.sprite.width * 0.7;
        this.shadow.scale.y = this.shadow.scale.x * 0.5;
        this.shadow.alpha = 0.3;
        this.sprite.y = 190;
        this.shadow.y = 200;

        if (id === 0)
        {
            this.sprite.y = 0;
            this.shadow.y = 10;
            entity.rx = -Math.PI / 5.5;
            entity.ry = Math.PI / 4;
            entity.rz = 0;
            entity.scale.set(0.0042);
            entity.y = 0;
            TweenMax.to(entity, 7, { ry: -Math.PI / 4, ease: Linear.easeInOut }).yoyo(true).repeat(-1);
        }
        else if (id === 1)
        {
            entity.ry = 0.25;
            entity.rx = -0.56;
            entity.rz = -0.125;
            entity.scale.set(0.008);
            entity.y = 0.02;
            TweenMax.to(entity, 1.5, { y: 0.045 }).yoyo(true).repeat(-1);
            TweenMax.to(this.shadow.scale, 1.5, { y: this.shadow.scale.y / 2, x: this.shadow.scale.x / 2 })
                .yoyo(true).repeat(-1);
        }
        else if (id === 2)
        {
            entity.ry = 0.25;
            entity.scale.set(0.008);
            TweenMax.to(entity, 0.3, { y: 0.04 });
            TweenMax.to(entity, 0.5, { ry: entity.ry + (Math.PI * 5) });
            TweenMax.to(entity, 0.5, { sx: 0, sy: 0, sz: 0 });
            TweenMax.to(this.shadow.scale, 0.5, { x: 0, y: 0 });
            TweenMax.to(this.shadow, 0.5, { alpha: 0 });
        }
    }

    public setup(id = 'mysteryBox_default'): void
    {
        if (!MysteryBoxThumb.scene) MysteryBoxThumb.scene = new ThumbScene3D();

        const scene = MysteryBoxThumb.scene;

        if (!scene['entitiesMap'].get(id))
        {
            const entity = app.library.getEntity(id);

            scene.addScene(id, entity, 400);
        }

        this.entity = scene['entitiesMap'].get(id) as Entity3D;

        this.sprite.texture = this.getTexture(id);

        MysteryBoxThumb.scene.play(id);
        this.sprite.scale.x = 1;
        this.sprite.scale.y = -1;
        this.sprite.anchor.set(0.5, 0);

        const h = this.sprite.height * 0.8;
        const w = this.sprite.width * 0.5;

        this.hitArea = new Rectangle(-w / 2, -this.sprite.height * 0.9, w, h);

        this.thumbId = id;

        this.shadow.anchor.set(0.5, 0);
        this.shadow.width = this.sprite.width * 0.7;
        this.shadow.scale.y = this.shadow.scale.x * 0.5;
    }

    public getTexture(name: string): PIXI.RenderTexture
    {
        const entity = MysteryBoxThumb.scene['entitiesMap'].get(name);
        const texture = MysteryBoxThumb.scene['textures'].get(name);

        if (!texture || !entity) throw new Error(`Character not registered: ${name}`);

        MysteryBoxThumb.scene.play(name);

        MysteryBoxThumb.scene['renderChildren']();
        MysteryBoxThumb.scene.stop(name);

        return texture;
    }
}
