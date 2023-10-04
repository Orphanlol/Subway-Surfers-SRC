/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-use-before-define */
import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import { LibraryOptions } from '../../utils/Library';
import Chunk from '../data/Chunk';
import GameEntity from '../GameEntity';

export default class Floor extends GameEntity
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
        if (!this.mounted && app.library.hasGeometry(this.name) && GameConfig.environment)
        {
            this.mounted = true;
            app.library.mountEntity(this, this.name, this.opts);
        }
    }

    // ===== STATIC ===============================================================================

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(FloorTrack, 8);
        app.game.pool.prepopulate(FloorTrackShadowStart, 8);
        app.game.pool.prepopulate(FloorTrackShadowMid, 8);
        app.game.pool.prepopulate(FloorTrackShadowEnd, 8);
        app.game.pool.prepopulate(FloorTrackShadowShortStart, 8);
        app.game.pool.prepopulate(FloorTrackShadowShortEnd, 8);
        app.game.pool.prepopulate(FloorGround, 8);
        app.game.pool.prepopulate(FloorGroundShadowStart, 8);
        app.game.pool.prepopulate(FloorGroundShadowMid, 8);
        app.game.pool.prepopulate(FloorGroundShadowEnd, 8);
        app.game.pool.prepopulate(FloorGroundShadowShortStart, 8);
        app.game.pool.prepopulate(FloorGroundShadowShortEnd, 8);
        app.game.pool.prepopulate(FloorGates, 8);
        app.game.pool.prepopulate(FloorGatesShadow, 8);
    }

    /** Check if assets for all floor has been loaded */
    public static hasResourcesForAllFillers(): boolean
    {
        return app.library.hasGroup('ground');
    }

    /** Spawn a trio of left, mid and right floor in a chunk */
    public static spawn(chunk: Chunk, params: any = {}): void
    {
        if (!params.z) params.z = chunk.z;
        if (!params.l) params.l = FloorTrack;
        if (!params.m) params.m = params.l;
        if (!params.r) params.r = params.m;

        // Fallback to regular track if not all assets are loaded yet
        if (!Floor.hasResourcesForAllFillers())
        {
            params.l = FloorTrack;
            params.m = FloorTrack;
            params.r = FloorTrack;
        }

        const left = chunk.game.pool.get(params.l, {}) as Floor;

        left.build();
        chunk.game.addChild(left);
        left.x = -GameConfig.laneWidth;
        left.y = 0;
        left.z = params.z;
        left.ry = Math.PI;

        if (params.m !== 'skip') {
            const mid = chunk.game.pool.get(params.m, {}) as Floor;

            mid.build();
            chunk.game.addChild(mid);
            mid.x = 0;
            mid.y = 0;
            mid.z = params.z;
            mid.ry = Math.PI;
        }

        const right = chunk.game.pool.get(params.r, {}) as Floor;

        right.build();
        chunk.game.addChild(right);
        right.x = GameConfig.laneWidth;
        right.y = 0;
        right.z = params.z;
        right.ry = Math.PI;
    }

    /** Spawn floor for gates */
    public static spawnGates(chunk: Chunk, params: any = {}): void
    {
        if (chunk.name.match('tutorial')) return;
        if (!params.z) params.z = chunk.z;
        const mid = chunk.game.pool.get(FloorGates) as Floor;

        mid.build();

        chunk.game.addChild(mid);
        mid.x = 0;
        mid.y = 0;
        mid.z = params.z;
        mid.ry = Math.PI;
        // Floor.spawn(chunk, {z: params.z - GameConfig.blockSize * 4})
        // chunk.setFloorsByPosition(params.z, params.z - GameConfig.blockSize * 2);
    }

    /** Fill the chunk with floor */
    public static mount(chunk: Chunk): void
    {
        if (chunk.name === 'intro')
        {
            const amount = 1;

            for (let i = 0; i < amount; i++)
            {
                if (chunk.floorSlots[i]) continue;
                const z = (GameConfig.blockSize * 2) - 90;
                const l = FloorTrack;
                const m = FloorTrack;
                const r = FloorTrack;

                Floor.spawn(chunk, { z, l, m, r });
            }
        }
        else if (chunk.name.match('default_short_1_track'))
        {
            const amount = chunk.blocks / 2;

            if (GameConfig.theme === '198-atlanta') {
                chunk.floorSlots[3] = false;
            }

            for (let i = 0; i < amount; i++)
            {
                if (chunk.floorSlots[i]) continue;
                const mid = i > 0;
                const z = chunk.z - (i * GameConfig.blockSize * 2);
                const l = !mid ? FloorTrack : FloorGround;
                const m = (GameConfig.theme === '198-atlanta' && i === 3) ? 'skip' : FloorTrack;
                const r = !mid ? FloorTrack : FloorGround;

                Floor.spawn(chunk, { z, l, m, r });
                chunk.floorSlots[i] = true;
            }
        }
        else if (chunk.name.match('default_1_track'))
        {
            const amount = chunk.blocks / 2;

            for (let i = 0; i < amount; i++)
            {
                if (chunk.floorSlots[i]) continue;
                const mid = chunk.name.match('_mid');
                const z = chunk.z - (i * GameConfig.blockSize * 2);
                const l = !mid ? FloorTrack : FloorGround;
                const m = FloorTrack;
                const r = !mid ? FloorTrack : FloorGround;

                Floor.spawn(chunk, { z, l, m, r });
                chunk.floorSlots[i] = true;
            }
        }
        else if (chunk.name.match('default_short_2_tracks'))
        {
            const amount = chunk.blocks / 2;

            for (let i = 0; i < amount; i++)
            {
                if (chunk.floorSlots[i]) continue;
                const mid = chunk.name.match('_mid_') || chunk.name.match('_end');
                const z = chunk.z - (i * GameConfig.blockSize * 2);
                const l = FloorTrack;
                const m = !mid ? FloorTrack : FloorGround;
                const r = FloorTrack;

                Floor.spawn(chunk, { z, l, m, r });
                chunk.floorSlots[i] = true;
            }
        }
        else if (chunk.name.match('default_2_tracks'))
        {
            const amount = chunk.blocks / 2;

            for (let i = 0; i < amount; i++)
            {
                if (chunk.floorSlots[i]) continue;
                const mid = !chunk.name.match('_end');
                const z = chunk.z - (i * GameConfig.blockSize * 2);
                const l = FloorTrack;
                const m = !mid ? FloorTrack : FloorGround;
                const r = FloorTrack;

                Floor.spawn(chunk, { z, l, m, r });
                chunk.floorSlots[i] = true;
            }
        }
        // else if (chunk.name === 'default_tutorial')
        // {

        // }
        else if (!chunk.hasGround)
        {
            const amount = chunk.blocks / 2;

            for (let i = 0; i < amount; i++)
            {
                if (chunk.floorSlots[i]) continue;
                const z = chunk.z - (i * GameConfig.blockSize * 2);
                const l = FloorTrack;
                const m = FloorTrack;
                const r = FloorTrack;

                Floor.spawn(chunk, { z, l, m, r });
                chunk.floorSlots[i] = true;
            }
        }
    }
}

export class FloorTrack extends Floor { constructor() { super('track', { rails: true }); }}
export class FloorTrackShadowStart extends Floor { constructor() { super('track_shadow_start', { rails: true }); }}
export class FloorTrackShadowMid extends Floor { constructor() { super('track_shadow_mid', { rails: true }); }}
export class FloorTrackShadowEnd extends Floor { constructor() { super('track_shadow_end', { rails: true }); }}
export class FloorTrackShadowShortStart extends Floor { constructor() { super('track_shadow_short_start', { rails: true }); }}
export class FloorTrackShadowShortEnd extends Floor { constructor() { super('track_shadow_short_end', { rails: true }); }}
export class FloorGround extends Floor { constructor() { super('ground'); }}
export class FloorGroundShadowStart extends Floor { constructor() { super('ground_shadow_start'); }}
export class FloorGroundShadowMid extends Floor { constructor() { super('ground_shadow_mid'); }}
// export class FloorGroundShadowEnd extends Floor { constructor() { super('ground_shadow_end'); }}
export class FloorGroundShadowEnd extends Floor { constructor() { super('ground_shadow_mid'); }}
export class FloorGroundShadowShortStart extends Floor { constructor() { super('ground_shadow_short_start'); }}
export class FloorGroundShadowShortEnd extends Floor { constructor() { super('ground_shadow_short_end'); }}
export class FloorGates extends Floor { constructor() { super('track_gates'); }}
export class FloorGatesShadow extends Floor { constructor() { super('track_gates_shadows'); }}

