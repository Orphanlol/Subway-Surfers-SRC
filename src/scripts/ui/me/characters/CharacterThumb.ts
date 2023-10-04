import * as PIXI from 'pixi.js';
import { BoardData } from 'src/scripts/data/boards/BoardData';

import { ShopCharacter } from '../../../shop/Shop';
import { app } from '../../../SubwaySurfersApp';
import { Thumb3D, Thumb3DOptions } from '../Thumb3D';
import { CharacterThumbScene3D } from './CharacterThumbScene3D';

export interface CharacterThumbOptions extends Thumb3DOptions
{
    charId?: string;
}
export class CharacterThumb extends Thumb3D
{
    public static scene: CharacterThumbScene3D;
    public shopData!: ShopCharacter;
    private charId: string;
    private outfit = 0;

    constructor(opts: CharacterThumbOptions)
    {
        super();

        this.charId = opts.charId || opts.thumbId;
        this.thumbId = opts.thumbId;
        this.setScene(opts);
        this.setChar();
    }

    public play(animation: string): void
    {
        CharacterThumb.scene.play(this.thumbId, animation);
    }

    public stop(): void
    {
        CharacterThumb.scene.stop(this.thumbId);
    }

    public setChar(thumbId = this.thumbId, charId = this.charId, outfit = this.outfit): void
    {
        this.sprite.texture = CharacterThumb.scene.getTexture(thumbId, charId, outfit);
        this.sprite.scale.x = 1;
        this.sprite.scale.y = -1;
        this.sprite.anchor.set(0.5, 0);
        this.shadow.anchor.set(0.5, 1);
        this.shadow.y = -10;

        const h = this.sprite.height * 0.8;
        const w = this.sprite.width * 0.5;

        this.hitArea = new PIXI.Rectangle(-w / 2, -this.sprite.height * 0.9, w, h);

        this.shadow.width = this.sprite.width * 0.7;
        this.shadow.scale.y = this.shadow.scale.x * 0.5;
        this.charId = charId;
        this.thumbId = thumbId;
        this.outfit = outfit;
    }

    setScene({ charId, thumbId, sceneName, animData }: CharacterThumbOptions): void
    {
        if (!CharacterThumb.scene) CharacterThumb.scene = new CharacterThumbScene3D();
        const scene = CharacterThumb.scene;

        if (!scene['entitiesMap'].get(thumbId) && app.library.hasScene(sceneName))
        {
            const map = `${charId || thumbId}-tex`;

            const entity = app.library.getScene(sceneName, { map });

            if (thumbId.includes('board'))
            {
                entity.scale.set(0.9);
            }
            entity.rx = -0.2;

            scene.addAnimatedScene({ id: thumbId, size: 400, entity, animData });
        }
    }

    public setBoard(data: BoardData, powerupIndices:number[] = []): void
    {
        CharacterThumb.scene.attachBoard(this.thumbId, data, powerupIndices);
    }
}
