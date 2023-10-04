import { Entity3D } from '@goodboydigital/odie';
import { Rectangle } from 'pixi.js';

import { BoardData } from '../../../data/boards/BoardData';
import { app } from '../../../SubwaySurfersApp';
import { Thumb3D } from '../Thumb3D';
import { BoardThumbScene3D } from './BoardThumbScene3D';

export class BoardThumb extends Thumb3D
{
    public static scene: BoardThumbScene3D;

    public shopData!: BoardData;
    public animating = false;
    public powers = [0];

    constructor(data: BoardData)
    {
        super();
        this._onSelect = null;

        this.shopData = data;
        this.setBoard();
    }

    public play(): void
    {
        BoardThumb.scene.play(this.thumbId);
    }

    public stop(): void
    {
        BoardThumb.scene.stop(this.thumbId);
    }

    public animateIn(): void
    {
        BoardThumb.scene.rotateSelected(this.thumbId);
        this.animating = true;
    }

    public animateOut(): void
    {
        BoardThumb.scene.rotateBack(this.thumbId, this);
    }

    public setBoard(): void
    {
        if (!BoardThumb.scene) BoardThumb.scene = new BoardThumbScene3D();

        const scene = BoardThumb.scene;
        const id = this.shopData.id;
        const sceneName = `board-${id}`;

        if (!scene['entitiesMap'].get(id) && app.library.hasScene(sceneName))
        {
            const map = `board-${id}-tex`;
            const sceneEntity = app.library.getScene(sceneName, { map });
            const entity = new Entity3D();

            entity.addChild(sceneEntity);

            entity.scale.set(0.01);
            entity.rotation.set(-0.3, 1.15, 0.35);
            entity.z = -0.05;

            scene.addScene(id, entity, 400);
        }

        this.sprite.texture = BoardThumb.scene.getTexture(this.shopData.id, this.powers);

        this.sprite.scale.x = 1;
        this.sprite.scale.y = -1;
        this.sprite.anchor.set(0.5, 0);
        this.shadow.anchor.set(0.5, 1);
        this.shadow.y = -10;

        const h = this.sprite.height * 0.8;
        const w = this.sprite.width * 0.5;

        this.hitArea = new Rectangle(-w / 2, -this.sprite.height * 0.9, w, h);

        this.thumbId = id;

        this.shadow.width = this.sprite.width * 0.7;
        this.shadow.scale.y = this.shadow.scale.x * 0.5;
    }
}
