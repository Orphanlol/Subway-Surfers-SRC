import { Entity3D } from '@goodboydigital/odie';

import { app } from '../../SubwaySurfersApp';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity, { GameEntityParams } from '../GameEntity';

export default class LightSignal extends GameEntity
{
    public model?: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { ghost: true, soft: true });
        this.body.width = 4;
        this.body.height = 42;
        this.body.depth = 4;
        this.removableOnCrash = true;
    }

    awake(chunk: Chunk, node: NodeObj, params: GameEntityParams): void
    {
        this.createModel();
        this.body.x = node.components.Transform.position.x;
        if (params.flip) this.body.x *= -1;
        this.body.bottom = 0;
        this.body.z = chunk.z - node.components.Transform.position.z;
    }

    createModel(): void
    {
        if (this.model) return;
        if (!app.library.hasGeometry('lightSignal')) return;
        this.model = app.library.getEntity('lightSignal');
        this.model.ry = Math.PI;
        this.model.y = -this.body.height * 0.5;
        this.addChild(this.model);
    }

    /** Check if node object is related to this class */
    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/lightSignal/);
    }
}
