/* eslint-disable func-names */

import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity, { GameEntityParams } from '../GameEntity';

export default class Checkpoint extends GameEntity
{
    public checkpoint = true;

    constructor()
    {
        super();
        this.checkpoint = true;
        this.add(Body);
        this.body.width = 2;
        this.body.height = 20;
        this.body.depth = 2;
        this.body.deco = true;
        // this.view = Model.box(this.body.box);
        // this.addChild(this.view);
    }

    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/checkpoint_/);
    }

    public static factory(chunk: Chunk, node: NodeObj, params: GameEntityParams): Checkpoint
    {
        const entity: Checkpoint = chunk.game.pool.get(Checkpoint);
        const px = node.components.Transform.position.x;
        const pz = node.components.Transform.position.z;

        entity.body.z = chunk.z - pz;
        entity.body.x = px;
        entity.body.bottom = 0;
        if (params.offsetX) entity.body.x = params.offsetX;
        if (params.flip) entity.body.x *= -1;
        entity.init();
        chunk.game.addChild(entity);

        return entity;
    }
}

