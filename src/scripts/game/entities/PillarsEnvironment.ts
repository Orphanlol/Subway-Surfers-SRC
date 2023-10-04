import { Entity3D } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import Floor, {
    FloorGroundShadowMid,
    FloorGroundShadowShortEnd,
    FloorGroundShadowShortStart,
    FloorTrackShadowMid,
    FloorTrackShadowShortEnd,
    FloorTrackShadowShortStart,
} from '../entities/Floor';
import GameEntity from '../GameEntity';

class PillarsEnvironmentStart extends GameEntity
{
    public view?: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { deco: true, noView: true });
        this.body.width = 80;
        this.body.height = 1;
        this.body.depth = GameConfig.blockSize;
        this.body.bottom = 0;

        if (!GameConfig.environment) return;
        this.view = app.library.getEntity('pillars_start');
        this.view.ry = Math.PI;
        this.view.z = this.body.depth * 0.5;
        this.view.y = -this.body.height * 0.5;
        this.addChild(this.view);
    }
}

class PillarsEnvironmentMid extends GameEntity
{
    public view?: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { deco: true, noView: true });
        this.body.width = 80;
        this.body.height = 1;
        this.body.depth = GameConfig.blockSize;
        this.body.bottom = 0;

        if (!GameConfig.environment) return;
        this.view = app.library.getEntity('pillars_mid');
        this.view.ry = Math.PI;
        this.view.z = this.body.depth * 0.5;
        this.view.y = -this.body.height * 0.5;
        this.addChild(this.view);
    }
}

class PillarsEnvironmentEnd extends GameEntity
{
    public view?: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { deco: true, noView: true });
        this.body.width = 80;
        this.body.height = 1;
        this.body.depth = GameConfig.blockSize;
        this.body.bottom = 0;

        if (!GameConfig.environment) return;
        this.view = app.library.getEntity('pillars_end');
        this.view.ry = Math.PI;
        this.view.z = this.body.depth * 0.5;
        this.view.y = -this.body.height * 0.5;
        this.addChild(this.view);
    }
}
export default class PillarsEnvironment extends GameEntity
{
    constructor()
    {
        super();
        this.add(Body);
        this.body.width = 80;
        this.body.height = 20;
        this.body.depth = GameConfig.blockSize;
        this.body.top = 90;
    }

    awake(chunk: Chunk, node: NodeObj): void
    {
        const pz = node.components.Transform.position.z;
        const blocks = node.components.Environment._blockCount;

        this.body.x = 0;
        // this.body.bottom = 80;
        this.body.depth = GameConfig.blockSize * blocks;
        this.body.back = chunk.z - pz;

        // START
        const start = chunk.game.pool.get(PillarsEnvironmentStart) as GameEntity;

        start.body.back = this.body.back;
        chunk.game.addChild(start);
        Floor.spawn(chunk, {
            z: start.body.back,
            l: FloorTrackShadowShortStart,
            m: FloorGroundShadowShortStart,
            r: FloorTrackShadowShortStart,
        });

        // MID
        for (let i = 0; i < (blocks - 2); i++)
        {
            if (i % 2 !== 0) continue;
            // mid pillars are double blocksize for atlanta
            const mid = chunk.game.pool.get(PillarsEnvironmentMid) as GameEntity;

            mid.body.back = start.body.back - (GameConfig.blockSize * 2 * ((i / 2) + 1)) + GameConfig.blockSize;
            chunk.game.addChild(mid);
            Floor.spawn(chunk, {
                z: mid.body.back,
                l: FloorTrackShadowMid,
                m: FloorGroundShadowMid,
                r: FloorTrackShadowMid,
            });
        }

        // END
        const end = chunk.game.pool.get(PillarsEnvironmentEnd) as GameEntity;

        end.body.back = start.body.back - (GameConfig.blockSize * (blocks - 1));
        chunk.game.addChild(end);
        Floor.spawn(chunk, {
            z: end.body.back,
            l: FloorTrackShadowShortEnd,
            m: FloorGroundShadowShortEnd,
            r: FloorTrackShadowShortEnd,
        });
    }

    /** Check if this entity have required resources to work */
    public static hasNecessaryResources(): boolean
    {
        return app.library.hasGeometry('pillars_start');
    }

    /** Check if node object is related to this class */
    public static match(node: NodeObj): boolean
    {
        if (!node.components.Environment) return false;
        const types = node.components.Environment._environmentKind._type.split(',');

        return types.indexOf('Pillars') >= 0;
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(PillarsEnvironmentStart, 2);
        app.game.pool.prepopulate(PillarsEnvironmentMid, 8);
        app.game.pool.prepopulate(PillarsEnvironmentEnd, 2);
        app.game.pool.prepopulate(PillarsEnvironment, 2);
    }
}
