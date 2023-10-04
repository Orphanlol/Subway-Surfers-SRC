/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Entity3D, PlaneGeometry } from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';

import GameConfig from '../../GameConfig';
import { UnlitHighShaderMaterial } from '../../materials/UnlitHighShaderMaterial';
import WaterMaterial from '../../materials/WaterMaterial';
import { app } from '../../SubwaySurfersApp';
import { OdieUtils } from '../../utils/OdieUtils';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity from '../GameEntity';

export default class Epic extends GameEntity
{
    public static hasNecessaryResources(): boolean
    {
        return app.library.hasGeometry('epic_start');
    }

    public static createWater(en: Entity3D): void
    {
        const geometry = new PlaneGeometry(1500, 360, 20, 20);
        const material = new WaterMaterial({ map: app.library.getMap('ocean') });
        const entity = new Entity3D({ geometry, material });

        entity.rx = -Math.PI * 0.5;
        entity.y = -70;
        entity.z = 180;

        en.addChild(entity);
    }

    public static spawn(chunk: Chunk, node: NodeObj, params: any = {}): Epic
    {
        if (!params.z) params.z = chunk.z;
        if (!params.alt) params.alt = false;
        if (!params.part) params.part = 'Start';

        if (['189-mumbai', '198-atlanta', '1103-seoul'].includes(GameConfig.theme)) params.alt = false;

        const new000 = `Epic${params.part}${params.alt ? 'Alt' : ''}`;
        const en = chunk.game.pool.get(epicMap[new000]) as GameEntity;

        en.x = 0;
        en.y = 0;
        en.z = params.z;
        en.ry = Math.PI;
        chunk.game.addChild(en);

        return en;
    }

    public static mount(chunk: Chunk): void
    {
        const blocks = chunk.blocks;

        const alt = (chunk.blocks > 12);
        const amount = blocks * 0.25;
        let z = 0;

        for (let i = 0; i < amount; i++)
        {
            if (i === 0)
            {
                Epic.spawn(chunk, {} as any, { z: chunk.z - z, part: 'Start', alt });
                z += GameConfig.blockSize * 4;
            }
            else if (i < amount - 1)
            {
                Epic.spawn(chunk, {} as any, { z: chunk.z - z, part: 'Mid', alt });
                z += GameConfig.blockSize * 4;
            }
            else
            {
                Epic.spawn(chunk, {} as any, { z: chunk.z - z, part: 'End', alt });
                z += GameConfig.blockSize * 4;
            }
        }
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(EpicStart, 2);
        app.game.pool.prepopulate(EpicMid, 8);
        app.game.pool.prepopulate(EpicEnd, 2);
    }
}

class EpicStart extends Epic
{
    constructor()
    {
        super();
        if (!GameConfig.environment) return;

        if (GameConfig.theme === '1103-seoul')
        {
            const en = app.library.getEntity('epic_start');

            this.addChild(en);
            OdieUtils.applyMaterial((en as any).parts[0], new WaterMaterial({ map: app.library.getMap('ocean') }));
            OdieUtils.applyMaterial((en as any).parts[1], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
            OdieUtils.applyMaterial((en as any).parts[2], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
        }

        if (['189-mumbai', '191-newyork'].includes(GameConfig.theme))
        {
            const en = app.library.getEntity('epic_start');

            this.addChild(en);
            Epic.createWater(en);
        }

        if (GameConfig.theme === '198-atlanta')
        {
            const en = app.library.getEntity('epic_start');

            setAtlantaScrollMaterial((en as any).parts[2]);

            this.addChild(en);
            Epic.createWater(en);
        }
    }
}

class EpicMid extends Epic
{
    constructor()
    {
        super();
        if (!GameConfig.environment) return;

        if (GameConfig.theme === '1103-seoul')
        {
            const en = app.library.getEntity('epic_mid');

            this.addChild(en);
            OdieUtils.applyMaterial((en as any).parts[0], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
            OdieUtils.applyMaterial((en as any).parts[1], new WaterMaterial({ map: app.library.getMap('ocean') }));
            OdieUtils.applyMaterial((en as any).parts[2], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
        }

        if (['189-mumbai', '191-newyork'].includes(GameConfig.theme))
        {
            const en = app.library.getEntity('epic_mid');

            this.addChild(en);
            Epic.createWater(en);
        }

        if (GameConfig.theme === '198-atlanta')
        {
            const en = app.library.getEntity('epic_mid');

            setAtlantaScrollMaterial((en as any).parts[2]);

            this.addChild(en);
            Epic.createWater(en);
        }
    }
}

class EpicEnd extends Epic
{
    constructor()
    {
        super();
        if (!GameConfig.environment) return;

        if (GameConfig.theme === '1103-seoul')
        {
            const en = app.library.getEntity('epic_end');

            this.addChild(en);
            OdieUtils.applyMaterial((en as any).parts[0], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
            OdieUtils.applyMaterial((en as any).parts[1], new WaterMaterial({ map: app.library.getMap('ocean') }));
            OdieUtils.applyMaterial((en as any).parts[2], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
        }

        if (['189-mumbai', '191-newyork'].includes(GameConfig.theme))
        {
            const en = app.library.getEntity('epic_end');

            this.addChild(en);
            Epic.createWater(en);
        }

        if (GameConfig.theme === '198-atlanta')
        {
            const en = app.library.getEntity('epic_end');

            this.addChild(en);

            const sideBarFixEntity:any = app.library.getEntity('epic_start');
            const sideBarFixEntityOffsetZ = -720;

            sideBarFixEntity.position.z = sideBarFixEntityOffsetZ;

            Object.values(sideBarFixEntity.parts).forEach((part:any, i:number) =>
            {
                part.active = i === 2;
            });
            setAtlantaScrollMaterial(sideBarFixEntity.parts[2]);

            this.addChild(sideBarFixEntity);

            Epic.createWater(en);
        }
    }
}

class EpicStartAlt extends Epic
{
    constructor()
    {
        super();
        if (!GameConfig.environment) return;

        if (GameConfig.theme === '1103-seoul')
        {
            const en = app.library.getEntity('epic_start');

            this.addChild(en);
            OdieUtils.applyMaterial((en as any).parts[0], new WaterMaterial({ map: app.library.getMap('ocean') }));
            OdieUtils.applyMaterial((en as any).parts[1], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
            OdieUtils.applyMaterial((en as any).parts[2], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
        }

        if (GameConfig.theme === '191-newyork')
        {
            const en = app.library.getEntity('epic_1_start');

            this.addChild(en);
        }
    }
}

class EpicMidAlt extends Epic
{
    constructor()
    {
        super();
        if (!GameConfig.environment) return;

        if (GameConfig.theme === '1103-seoul')
        {
            const en = app.library.getEntity('epic_mid');

            this.addChild(en);
            OdieUtils.applyMaterial((en as any).parts[0], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
            OdieUtils.applyMaterial((en as any).parts[1], new WaterMaterial({ map: app.library.getMap('ocean') }));
            OdieUtils.applyMaterial((en as any).parts[2], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
        }

        if (GameConfig.theme === '191-newyork')
        {
            const en = app.library.getEntity('epic_1_mid');

            this.addChild(en);
        }
    }
}

class EpicEndAlt extends Epic
{
    constructor()
    {
        super();
        if (!GameConfig.environment) return;

        if (GameConfig.theme === '1103-seoul')
        {
            const en = app.library.getEntity('epic_end');

            this.addChild(en);
            OdieUtils.applyMaterial((en as any).parts[0], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
            OdieUtils.applyMaterial((en as any).parts[1], new WaterMaterial({ map: app.library.getMap('ocean') }));
            OdieUtils.applyMaterial((en as any).parts[2], new UnlitHighShaderMaterial({ customFog: true, rails: true, diffuseMap: app.library.getMap('environment-tex') }));
        }

        if (GameConfig.theme === '191-newyork')
        {
            const en = app.library.getEntity('epic_1_end');

            this.addChild(en);
        }
    }
}

const setAtlantaScrollMaterial = (entity: any) =>
{
    const diffuseMap = app.library.getMap('atlanta-scroll');

    diffuseMap.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    OdieUtils.applyMaterial(entity, new UnlitHighShaderMaterial({ customFog: true, rails: false, diffuseMap }));

    entity.materialUpdateInterval = setInterval(() =>
    {
        diffuseMap.frame.y += 0.6;
        diffuseMap.update();
    }, 1000 / 60);
};

const epicMap: Record<string, any> = {
    EpicStart,
    EpicMid,
    EpicEnd,
    EpicStartAlt,
    EpicMidAlt,
    EpicEndAlt,
};
