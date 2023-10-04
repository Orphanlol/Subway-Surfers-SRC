import { Entity3D } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import Floor, { FloorTrackShadowEnd, FloorTrackShadowMid, FloorTrackShadowStart } from '../entities/Floor';
import GameEntity from '../GameEntity';

class TubeEnvironmentBlock extends GameEntity
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

        this.view = app.library.getEntity('tube');
        this.view.ry = Math.PI;
        this.view.z = this.body.depth * 0.5;
        this.view.y = -this.body.height * 0.5;
        this.addChild(this.view);

        if ((this.view as any).parts && GameConfig.theme === '1103-seoul')
        {
            (this.view as any).parts[0].view3d.state.blend = true;
            (this.view as any).parts[0].view3d.material.opacity = 0.5;
        }
    }
}
export default class TubeEnvironment extends GameEntity
{
    constructor()
    {
        super();
        this.add(Body, { deco: false });
        this.body.width = 80;
        this.body.height = 16;
        this.body.depth = GameConfig.blockSize;
        this.body.top = 88;
    }

    awake(chunk: Chunk, node: NodeObj): void
    {
        const pz = node.components.Transform.position.z;

        chunk.game.route.hasTube = true;

        let blocks = chunk.blocks;

        if (node.components.Environment)
        {
            blocks = node.components.Environment._blockCount;
        }

        this.body.x = 0;
        this.body.depth = GameConfig.blockSize * blocks;
        this.body.back = chunk.z - pz;

        const amount = blocks * 0.5;

        for (let i = 0; i < amount; i++)
        {
            const mid: TubeEnvironmentBlock = chunk.game.pool.get(TubeEnvironmentBlock);

            mid.body.back = this.body.back - ((GameConfig.blockSize * 2) * i);
            chunk.game.addChild(mid);

            const z = mid.body.back;

            if (i === 0)
            {
                Floor.spawn(chunk, { z, l: FloorTrackShadowStart });
            }
            else if (i < amount - 1)
            {
                Floor.spawn(chunk, { z, l: FloorTrackShadowMid });
            }
            else
            {
                Floor.spawn(chunk, { z, l: FloorTrackShadowEnd });
            }
        }
    }

    public static hasNecessaryResources(): boolean
    {
        return app.library.hasGeometry('epic_start');
    }

    public static match(node: NodeObj): boolean
    {
        if (!node.components.Environment) return false;
        const types = node.components.Environment._environmentKind._type.split(',');

        return types.indexOf('Tube') >= 0;
    }

    public static factory(chunk: Chunk, node: NodeObj): TubeEnvironment
    {
        chunk.game.route.setSpawnDistance('tube', 1000);
        const entity: TubeEnvironment = chunk.game.pool.get(TubeEnvironment);

        entity.awake(chunk, node);
        chunk.game.addChild(entity);

        return entity;
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(TubeEnvironmentBlock, 16);
        app.game.pool.prepopulate(TubeEnvironment, 4);
    }
}
