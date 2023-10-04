import * as PIXI from 'pixi.js';
import { BoardData } from 'src/scripts/data/boards/BoardData';

import { app } from '../../../SubwaySurfersApp';
import EntityTools from '../../../utils/EntityTools';
import { ThumbScene3D } from '../ThumbScene3D';

// TODO repack ThumbScene3D into a system and move CharacterThumbScene3D bits into CharacterThumb class
export class CharacterThumbScene3D extends ThumbScene3D
{
    public getTexture(name: string, charId: string, outfit = 0): PIXI.RenderTexture
    {
        const char = this.entitiesMap.get(name);
        const texture = this.textures.get(name);
        const data = app.data.getCharData(charId);

        if (!texture || !char || !data) throw new Error(`Character not registered: ${name}`);

        const map = (data.outfits[outfit - 1] ? data.outfits[outfit - 1] : data).texture;

        this.updateScene(char, 'SkeletalMeshComponent0', map, data.features);

        return texture;
    }

    public attachBoard(name: string, data: BoardData, powerupIndices: number[] = []): void
    {
        const boardId = data.id;
        const board = app.library.getScene(`board-${boardId}`, { map: `board-${boardId}-tex` });

        const powerupFeats: string[] = [];

        powerupIndices.forEach((i) => powerupFeats.push(...(data.powerups[i - 1]?.features || [])));
        const features = [...data.features, ...powerupFeats];

        this.updateScene(board, data.root, data.texture, features);

        const char = this.entitiesMap.get(name);

        if (!char) throw new Error(`Character not registered: ${name}`);

        const parent = EntityTools.findEntity(char, 'attachPoint1', 5);

        if (parent)
        {
            parent.removeChild(parent.container.children[0]);
            board.scale.set(0.009);
            parent.addChild(board);
        }
    }

    public removeBoard(name: string):void
    {
        const char = this.entitiesMap.get(name);

        if (!char) throw new Error(`Character not registered: ${name}`);

        const parent = EntityTools.findEntity(char, 'attachPoint1', 5);

        if (parent)
        {
            parent.removeChild(parent.container.children[0]);
        }
    }
}
