import { Entity3D } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import Floor, {
    FloorGroundShadowEnd,
    FloorGroundShadowMid,
    FloorGroundShadowStart,
    FloorTrackShadowEnd,
    FloorTrackShadowMid,
    FloorTrackShadowStart,
} from '../entities/Floor';
import GameEntity from '../GameEntity';
import StationPlatform from './StationPlatform';

class StationStart extends GameEntity
{
    public view?: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { deco: true, noView: true });
        this.body.width = 80;
        this.body.height = 0;
        this.body.depth = GameConfig.blockSize;
        this.body.bottom = 0;

        if (!GameConfig.environment) return;
        this.view = app.library.getEntity('station_start');
        this.view.ry = Math.PI;
        this.view.y = -this.body.height * 0.5;
        this.addChild(this.view);
    }
}

class StationMid extends GameEntity
{
    public view?: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { deco: true, noView: true });
        this.body.width = 80;
        this.body.height = 0;
        this.body.depth = GameConfig.blockSize * 2;
        this.body.bottom = 0;

        if (!GameConfig.environment) return;
        this.view = app.library.getEntity('station_mid');
        this.view.ry = Math.PI;
        this.view.y = -this.body.height * 0.5;
        this.addChild(this.view);
    }
}

class StationEnd extends GameEntity
{
    public view?: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { deco: true, noView: true });
        this.body.width = 80;
        this.body.height = 0;
        this.body.depth = GameConfig.blockSize;
        this.body.bottom = 0;

        if (!GameConfig.environment) return;
        this.view = app.library.getEntity('station_end');
        this.view.ry = Math.PI;
        this.view.y = -this.body.height * 0.5;
        this.addChild(this.view);
    }
}

export default class StationEnvironment extends GameEntity
{
    constructor()
    {
        super();
        this.add(Body, { deco: false });
        this.body.width = 80;
        this.body.height = 4;
        this.body.depth = GameConfig.blockSize * 4;
    }

    awake(chunk: Chunk, node: NodeObj, platforms = true): void
    {
        const envComp = node.components.Environment;
        const blocks = envComp ? envComp._blockCount : 4;
        const pz = node.components.Transform.position.z;

        let baseZ = chunk.z - pz;

        if (!chunk.name.match('short')) baseZ += GameConfig.blockSize * 4;

        this.body.depth = GameConfig.blockSize * blocks;
        this.body.x = 0;
        this.body.top = 86;
        this.body.back = baseZ;

        const start = chunk.game.pool.get(StationStart) as GameEntity;

        start.body.z = baseZ;
        chunk.game.addChild(start);

        const midBlocks = (blocks - 2) * 0.5;

        for (let i = 0; i < midBlocks; i++)
        {
            const mid = chunk.game.pool.get(StationMid) as GameEntity;

            mid.body.z = baseZ - GameConfig.blockSize - (mid.body.depth * i);
            chunk.game.addChild(mid);
        }

        const end = chunk.game.pool.get(StationEnd) as GameEntity;

        end.body.z = baseZ - ((blocks - 1) * GameConfig.blockSize);
        chunk.game.addChild(end);

        chunk.setFillersByPosition(this.body.back, this.body.front);

        if (platforms)
        {
            const platBlocks = blocks * 0.5;

            for (let i = 0; i < platBlocks; i++)
            {
                const plat = chunk.game.pool.get(StationPlatform) as GameEntity;

                plat.awake(chunk, node, baseZ - (plat.body.depth * i));
                chunk.game.addChild(plat);
            }
        }

        const amount = blocks * 0.5;

        for (let i = 0; i < amount; i++)
        {
            const z = baseZ - (i * (GameConfig.blockSize * 2));

            if (i === 0)
            {
                Floor.spawn(chunk, { z,
                    l: FloorGroundShadowStart,
                    m: FloorTrackShadowStart,
                    r: FloorGroundShadowStart,
                });
            }
            else if (i < amount - 1)
            {
                Floor.spawn(chunk, { z,
                    l: FloorGroundShadowMid,
                    m: FloorTrackShadowMid,
                    r: FloorGroundShadowMid,
                });
            }
            else
            {
                Floor.spawn(chunk, { z,
                    l: FloorGroundShadowEnd,
                    m: FloorTrackShadowEnd,
                    r: FloorGroundShadowEnd,
                });
            }
        }

        chunk.setFillersByPosition(this.body.back, this.body.front);
        chunk.setFloorsByPosition(this.body.back, this.body.front);
    }

    public static hasNecessaryResources(): boolean
    {
        return app.library.hasGeometry('station_start');
    }

    public static match(node: NodeObj): boolean
    {
        if (!node.components.Environment) return false;
        const types = node.components.Environment._environmentKind._type.split(',');

        return types.indexOf('Station') >= 0;
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(StationStart, 1);
        app.game.pool.prepopulate(StationMid, 4);
        app.game.pool.prepopulate(StationEnd, 1);
        app.game.pool.prepopulate(StationEnvironment, 1);
    }
}
