import { Entity3D } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity from '../GameEntity';

class StationPart extends GameEntity
{
    constructor()
    {
        super();
        this.add(Body);
        this.removableOnCrash = true;
    }

    reset()
    {
        this.body.box.size.reset();
        this.body.box.center.reset();
    }
}
export default class StationPlatform extends GameEntity
{
    public view?: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { deco: true, noView: true });
        this.body.width = 80;
        this.body.height = 2;
        this.body.depth = GameConfig.blockSize * 2;
        this.removableOnCrash = true;

        if (!GameConfig.environment) return;
        this.view = app.library.getEntity('station_platforms');
        this.view.ry = Math.PI;
        this.view.z = GameConfig.blockSize;
        this.addChild(this.view);
    }

    awake(chunk: Chunk, node: NodeObj, z: number): void
    {
        this.body.back = z;
        this.body.x = 0;

        const platL: StationPart = chunk.game.pool.get(StationPart);

        platL.reset();
        platL.body.width = 20;
        platL.body.height = 9;
        platL.body.depth = this.body.depth;
        platL.body.x = -GameConfig.laneWidth;
        platL.body.bottom = 0;
        platL.body.z = this.body.z;
        chunk.game.addChild(platL);

        const platR: StationPart = chunk.game.pool.get(StationPart);

        platR.reset();
        platR.body.width = 20;
        platR.body.height = 9;
        platR.body.depth = this.body.depth;
        platR.body.x = GameConfig.laneWidth;
        platR.body.bottom = 0;
        platR.body.z = this.body.z;
        chunk.game.addChild(platR);
    }

    public factory = (chunk: Chunk): void =>
    {
        const platA: StationPlatform = chunk.game.pool.get(StationPlatform);

        platA.init();
        chunk.game.addChild(platA);

        const platB: StationPlatform = chunk.game.pool.get(StationPlatform);

        platB.init();
        chunk.game.addChild(platB);
    };
}
