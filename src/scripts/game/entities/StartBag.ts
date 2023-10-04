import { Entity3D } from '@goodboydigital/odie';

import { app } from '../../SubwaySurfersApp';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity from '../GameEntity';

export default class StartBag extends GameEntity
{
    public model!: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { deco: true } as any);
        this.body.width = 4;
        this.body.height = 4;
        this.body.depth = 4;
        this.model = app.library.getEntity('startScreen_bag_base', { map: 'props-tex' });
        this.model.ry = Math.PI;
        this.model.y = -1.3;
        this.addChild(this.model);
    }

    awake(chunk: Chunk, node: NodeObj): void
    {
        this.body.x = node.components.Transform.position.x;
        this.body.bottom = 0;
        this.body.z = chunk.z - node.components.Transform.position.z;
    }

    /** Check if node object is related to this class */
    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/bag_place/);
    }
}
