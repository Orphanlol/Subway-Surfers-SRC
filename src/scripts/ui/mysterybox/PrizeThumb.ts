import { Entity3D } from '@goodboydigital/odie';
import {  TweenMax } from 'gsap';
import { Rectangle } from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import { Thumb3D } from '../me/Thumb3D';
import { ThumbScene3D } from '../me/ThumbScene3D';

export class PrizeThumb extends Thumb3D
{
    public static scene: ThumbScene3D;
    public animating = false;
    entity!: Entity3D;

    constructor(id: string)
    {
        super();

        this.setup(id);
    }

    tween(): void
    {
        const entity = this.entity;

        this.reset();
        PrizeThumb.scene.play(this.thumbId);

        TweenMax.to(entity, 2, { sx: 0.007, sy: 0.007, sz: 0.007 });
        TweenMax.to(entity, 4, { ry: entity.ry - (Math.PI * 4) });
        TweenMax.to(this.shadow, 2, { alpha: 0.3 });
        TweenMax.to(this.shadow, 2, { width: this.sprite.width * 0.7, height: (this.sprite.width * 0.7) / 2 });
    }

    public reset():void
    {
        this.shadow.alpha = 0;
        this.shadow.scale.set(0);
        this.entity.scale.set(0);
        TweenMax.killTweensOf(this.entity);
        PrizeThumb.scene.stopAll();
        PrizeThumb.scene.play(this.thumbId);
    }

    public setup(id: string, map?: string): void
    {
        if (!PrizeThumb.scene) PrizeThumb.scene = new ThumbScene3D();

        const scene = PrizeThumb.scene;

        if (!scene['entitiesMap'].get(id))
        {
            const entity = app.library.getEntity(id, { map });

            const handle = new Entity3D();

            if (id === 'board_default_base')
            {
                entity.rx = Math.PI / 2.35;
                entity.ry = Math.PI / 2;
            }

            handle.rx = -Math.PI / 4;
            handle.addChild(entity);
            scene.addScene(id, handle, 400);
        }

        this.entity = scene['entitiesMap'].get(id) as Entity3D;
        this.entity.scale.set(0);

        this.sprite.texture = this.getTexture(id);

        this.sprite.scale.x = 1;
        this.sprite.scale.y = -1;
        this.sprite.anchor.set(0.5);
        this.sprite.y = -110;
        this.shadow.y = 180;

        const h = this.sprite.height * 0.8;
        const w = this.sprite.width * 0.5;

        this.hitArea = new Rectangle(-w / 2, -this.sprite.height * 0.9, w, h);

        this.thumbId = id;

        this.shadow.anchor.set(0.5);
        this.shadow.width = this.sprite.width * 0.7;
        this.shadow.scale.y = this.shadow.scale.x * 0.5;
    }

    public getTexture(name: string): PIXI.RenderTexture
    {
        const entity = PrizeThumb.scene['entitiesMap'].get(name);
        const texture = PrizeThumb.scene['textures'].get(name);

        if (!texture || !entity) throw new Error(`Character not registered: ${name}`);

        PrizeThumb.scene.play(name);

        PrizeThumb.scene['renderChildren']();
        PrizeThumb.scene.stop(name);

        return texture;
    }
}
