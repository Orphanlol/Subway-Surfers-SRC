import { Entity3D } from '@goodboydigital/odie';
import { TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';
import type { BoardData } from 'src/scripts/data/boards/BoardData';

import { app } from '../../../SubwaySurfersApp';
import Math2 from '../../../utils/Math2';
import { ThumbScene3D } from '../ThumbScene3D';
import { BoardThumb } from './BoardThumb';

// TODO repack ThumbScene3D into a system and move BoardThumbScene3D bits into BoardThumb class

export class BoardThumbScene3D extends ThumbScene3D
{
    private boardsMap: Map<string, BoardData> = new Map();
    private rotating: Map<string, Entity3D> = new Map();

    constructor()
    {
        super();

        app.data.getAvailableBoards().forEach((board) => this.boardsMap.set(board.id, board));
    }

    public getTexture(name: string, powerupIndices: number[] = []): PIXI.RenderTexture
    {
        const char = this.entitiesMap.get(name);
        const texture = this.textures.get(name);
        const data = this.boardsMap.get(name);

        if (!texture || !char || !data) throw new Error(`Character not registered: ${name}`);

        const powerupFeats: string[] = [];

        powerupIndices.forEach((i) => powerupFeats.push(...(data.powerups[i - 1]?.features || [])));

        const features = [...data.features, ...powerupFeats];

        this.play(name);
        this.updateScene(char, data.root, data.texture, features);

        this.renderChildren();
        this.stop(name);

        return texture;
    }

    public rotateSelected(name: string):void
    {
        const entity = this.entitiesMap.get(name);

        if (!entity) return;

        this.play(name);
        this.rotating.set(name, entity);
    }

    public rotateBack(name: string, thumb: BoardThumb):void
    {
        const parent = this.entitiesMap.get(name);

        if (!parent) return;
        const entity = parent.container.children[0];

        this.rotating.delete(name);
        let rx = Math.abs((entity.rx) % (Math2.PI_DOUBLE));

        rx = 0 + rx < Math2.PI_DOUBLE - rx ? rx : -Math2.PI_DOUBLE + rx;

        this.play(name);

        TweenLite.to(entity, 0.6, { rx: entity.rx + rx, onComplete: () =>
        {
            thumb.animating = false;
        } });
    }

    protected renderChildren(): void
    {
        if (!this.playing || this.animating.length === 0) return;
        this.update(true);

        this.animating.forEach((name) =>
        {
            const entity = this.entitiesMap.get(name) as Entity3D;
            const texture = this.textures.get(name) as PIXI.RenderTexture;
            const toRotate = this.rotating.get(name)?.container.children[0];

            if (toRotate) toRotate.rx -= 0.03;
            entity.active = true;
            this.view3d.renderTexture = texture;
            this.view3d['_renderChildren'](app.stage.renderer);
            entity.active = false;
        });
    }

    public play(...names: string[]): void
    {
        this.playing = true;

        names.forEach((name) =>
        {
            const char = this.entitiesMap.get(name);

            if (!char) return;
            if (this.animating.indexOf(name) === -1)
            {
                this.animating.push(name);
            }
        });
    }

    public stop(...names: string[]): void
    {
        names.forEach((name) =>
        {
            const index = this.animating.indexOf(name);

            if (index < 0) return;
            this.animating.splice(index, 1);
        });

        if (!this.animating.length) this.playing = false;
    }
}
