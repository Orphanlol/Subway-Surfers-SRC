/* eslint-disable @typescript-eslint/no-use-before-define */

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import { LibraryOptions } from '../../utils/Library';
import Random from '../../utils/Random';
import Chunk from '../data/Chunk';
import GameEntity from '../GameEntity';

export type FillersConstructor = new() => Fillers;

/**
 * Fillers spawn parameters
 */
export interface FillersSpawnParams
{
    /** Z position */
    z?: number;

    /** Left fillers */
    l?: FillersConstructor;

    /** Left fillers */
    r?: FillersConstructor;
}

/**
 * Fillers are the buildings around the tracks
 * They are pure decorative, without collision or gameplay influence
 */
export class Fillers extends GameEntity
{
    protected mounted = false;
    protected opts: LibraryOptions = {};

    constructor(name: string, opts: LibraryOptions = {})
    {
        super();
        this.name = name;
        this.opts = opts;
        this.levelEntity = true;
        this.build();
    }

    public build(): void
    {
        if (this.mounted || !GameConfig.environment) return;
        if (!app.library.hasGeometry(this.name)) return;
        this.mounted = true;
        app.library.mountEntity(this, this.name, this.opts);
    }

    // ===== STATIC ===============================================================================

    /** Check if assets for all illers has been loaded */
    public static hasResourcesForAllFillers(): boolean
    {
        return app.library.hasGroup('low_01_left');
    }

    /**
     * Spawn a pair of fillers
     * @param chunk - Chunk that fillesr should spawned into
     * @param params - Spawn params
     */
    public static spawn(chunk: Chunk, params: FillersSpawnParams = {}): void
    {
        if (!params.z) params.z = chunk.z;
        if (!params.l) params.l = FillersLow01Left;
        if (!params.r) params.r = FillersLow01Right;

        // If not all assets are loaded, fallback to Med02 fillers that should be already loaded from start
        if (!Fillers.hasResourcesForAllFillers())
        {
            params.l = FillersMed02Left;
            params.r = FillersMed02Right;
        }

        const left = chunk.game.pool.get(params.l) as Fillers;

        chunk.fillerList.push(left);
        chunk.game.addChild(left);
        left.x = 0;
        left.y = 0;
        left.z = params.z;
        left.ry = Math.PI;
        left.build();

        const right = chunk.game.pool.get(params.r) as Fillers;

        chunk.fillerList.push(right);
        chunk.game.addChild(right);
        right.x = 0;
        right.y = 0;
        right.z = params.z;
        right.ry = Math.PI;
        right.build();
    }

    /**
     * Mount fillers along given chunk
     * @param chunk - The chunk that fillers should be mounted into
     */
    public static mount(chunk: Chunk): void
    {
        if (chunk.name.match('default_short_1_track'))
        {
            const amount = chunk.blocks / 2;

            for (let i = 0; i < amount; i++)
            {
                if (chunk.fillerSlots[i]) continue;
                const z = chunk.z - (i * GameConfig.blockSize * 2);
                const l = FillersMed02Left;
                const r = FillersMed02Right;

                Fillers.spawn(chunk, { z, l, r });
            }
        }
        else if (chunk.name.match('default_short_2_tracks'))
        {
            const amount = chunk.blocks / 2;

            for (let i = 0; i < amount; i++)
            {
                if (chunk.fillerSlots[i]) continue;
                const z = chunk.z - (i * GameConfig.blockSize * 2);
                const l = FillersLow02Left;
                const r = FillersHigh02Right;

                Fillers.spawn(chunk, { z, l, r });
            }
        }
        else if (chunk.name.match('default_2_tracks'))
        {
            const amount = chunk.blocks / 2;

            for (let i = 0; i < amount; i++)
            {
                if (chunk.fillerSlots[i]) continue;
                const z = chunk.z - (i * GameConfig.blockSize * 2);
                const l = FillersLow01Left;
                const r = FillersHigh01Right;

                Fillers.spawn(chunk, { z, l, r });
            }
        }
        else if (chunk.name.match('intro'))
        {
            const amount = chunk.blocks / 2;

            for (let i = 0; i < amount; i++)
            {
                if (chunk.fillerSlots[i]) continue;
                const z = chunk.z - (i * GameConfig.blockSize * 2) + 90;
                const l = FillersMed02Left;
                const r = FillersMed02Right;

                Fillers.spawn(chunk, { z, l, r });
            }
        }
        else
        {
            const amount = chunk.blocks / 2;
            const types = ['Low', 'Med', 'High'];
            const type = Random.item(types);
            const kinds = type === 'Low' ? ['01', '02'] : ['01', '02', '03'];

            for (let i = 0; i < amount; i++)
            {
                if (chunk.fillerSlots[i]) continue;
                const kind = Random.item(kinds);
                const l = fillersMap[`Fillers${type}${kind}Left`];
                const r = fillersMap[`Fillers${type}${kind}Right`];
                const z = chunk.z - (i * GameConfig.blockSize * 2);

                Fillers.spawn(chunk, { z, l, r });
                if (type === 'Low' && GameConfig.theme === '1103-seoul' && Fillers.hasResourcesForAllFillers())
                {
                    chunk.floorSlots[i] = true;
                }
            }
        }
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(FillersLow01Left, 8);
        app.game.pool.prepopulate(FillersLow02Left, 8);
        app.game.pool.prepopulate(FillersMed01Left, 8);
        app.game.pool.prepopulate(FillersMed02Left, 8);
        app.game.pool.prepopulate(FillersMed03Left, 8);
        app.game.pool.prepopulate(FillersHigh01Left, 8);
        app.game.pool.prepopulate(FillersHigh02Left, 8);
        app.game.pool.prepopulate(FillersHigh03Left, 8);
        app.game.pool.prepopulate(FillersLow01Right, 8);
        app.game.pool.prepopulate(FillersLow02Right, 8);
        app.game.pool.prepopulate(FillersMed01Right, 8);
        app.game.pool.prepopulate(FillersMed02Right, 8);
        app.game.pool.prepopulate(FillersMed03Right, 8);
        app.game.pool.prepopulate(FillersHigh01Right, 8);
        app.game.pool.prepopulate(FillersHigh02Right, 8);
        app.game.pool.prepopulate(FillersHigh03Right, 8);
    }
}

/**
 * Actual fillers, to be used in the scenario
 */
export class FillersLow01Left extends Fillers { constructor() { super('low_01_left'); }}
export class FillersLow02Left extends Fillers { constructor() { super('low_02_left'); }}
export class FillersMed01Left extends Fillers { constructor() { super('med_01_left'); }}
export class FillersMed02Left extends Fillers { constructor() { super('med_02_left'); }}
export class FillersMed03Left extends Fillers { constructor() { super('med_03_left'); }}
export class FillersHigh01Left extends Fillers { constructor() { super('high_01_left'); }}
export class FillersHigh02Left extends Fillers { constructor() { super('high_02_left'); }}
export class FillersHigh03Left extends Fillers { constructor() { super('high_03_left'); }}
export class FillersLow01Right extends Fillers { constructor() { super('low_01_right', { rails: true }); } }
export class FillersLow02Right extends Fillers { constructor() { super('low_02_right', { rails: true }); } }
export class FillersMed01Right extends Fillers { constructor() { super('med_01_right'); }}
export class FillersMed02Right extends Fillers { constructor() { super('med_02_right'); }}
export class FillersMed03Right extends Fillers { constructor() { super('med_03_right'); }}
export class FillersHigh01Right extends Fillers { constructor() { super('high_01_right'); }}
export class FillersHigh02Right extends Fillers { constructor() { super('high_02_right'); }}
export class FillersHigh03Right extends Fillers { constructor() { super('high_03_right'); }}

/**
 * Map fillers by name, for dynamic or random constructors
 */
const fillersMap: Record<string, any> = {
    FillersLow01Left,
    FillersLow02Left,
    FillersMed01Left,
    FillersMed02Left,
    FillersMed03Left,
    FillersHigh01Left,
    FillersHigh02Left,
    FillersHigh03Left,
    FillersLow01Right,
    FillersLow02Right,
    FillersMed01Right,
    FillersMed02Right,
    FillersMed03Right,
    FillersHigh01Right,
    FillersHigh02Right,
    FillersHigh03Right,
};
