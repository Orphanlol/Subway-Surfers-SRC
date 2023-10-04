import { app } from '../../SubwaySurfersApp';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity, { GameEntityParams } from '../GameEntity';

class Side extends GameEntity
{
    constructor()
    {
        super();
        this.add(Body, { boxColor: 0x770000 });
        this.removableOnCrash = true;
    }

    reset()
    {
        this.body.deco = false;
        this.body.box.size.reset();
        this.body.box.center.reset();
    }
}
export default class Ramp extends GameEntity
{
    public ramp = true;

    constructor()
    {
        super();
        this.add(Body, { boxColor: 0x550000 });
        this.body.width = 18;
        this.body.height = 29;
        this.body.depth = 70;
        this.removableOnCrash = true;

        this.model = app.library.getEntity('train_ramp');
        this.model.position.y = -this.body.height * 0.5;
        this.model.rotation.y = Math.PI;
        this.model.z = -8;
        this.addChild(this.model);
    }

    awake(chunk: Chunk, node: NodeObj, params: GameEntityParams): void
    {
        const px = node.components.Transform.position.x;
        const pz = node.components.Transform.position.z;

        this.body.x = px;
        this.body.bottom = 0;
        this.body.z = chunk.z - pz + 6;
        if (params.offsetX) this.body.x = params.offsetX;
        if (params.flip) this.body.x *= -1;

        // Add ramp left wall
        const left: Side = chunk.game.pool.get(Side);

        left.reset();
        left.body.width = 0.2;
        left.body.height = this.body.height;
        left.body.depth = this.body.depth * 0.7;
        left.body.x = this.body.left;
        left.body.y = this.body.y;
        left.body.z = this.body.z;
        chunk.game.addChild(left);

        // Add ramp right wall
        const right: Side = chunk.game.pool.get(Side);

        right.reset();
        right.body.width = 0.2;
        right.body.height = this.body.height;
        right.body.depth = this.body.depth * 0.7;
        right.body.x = this.body.right;
        right.body.y = this.body.y;
        right.body.z = this.body.z;
        chunk.game.addChild(right);
    }

    /** Check if node object is related to this class */
    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/train_ramp/);
    }
}
