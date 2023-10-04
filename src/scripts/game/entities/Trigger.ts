import EntityTools from '../../utils/EntityTools';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity, { GameEntityParams } from '../GameEntity';

export default class Trigger extends GameEntity
{
    public tutorialTrigger = true;
    public type = '';

    constructor()
    {
        super();
        this.tutorialTrigger = true;
        this.add(Body);
        this.body.width = 60;
        this.body.height = 30;
        this.body.depth = 1;
        this.body.trigger = true;
        this.view = EntityTools.box(this.body.box);
    }

    awake(chunk: Chunk, node: NodeObj): void
    {
        this.type = node.name.split('_').pop() || '';
    }

    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/Trigger_/);
    }

    public static factory = (chunk: Chunk, node: NodeObj, params: GameEntityParams): void =>
    {
        const entity: Trigger = chunk.game.pool.get(Trigger);
        const px = node.components.Transform.position.x;
        const pz = node.components.Transform.position.z;

        entity.body.z = chunk.z - pz;
        entity.body.x = px;
        entity.body.bottom = 0;
        if (params.offsetX) entity.body.x = params.offsetX;
        if (params.flip) entity.body.x *= -1;
        entity.awake(chunk, node);
        chunk.game.addChild(entity);
    };
}
