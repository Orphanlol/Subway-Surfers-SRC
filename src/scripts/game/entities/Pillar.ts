import { app } from '../../SubwaySurfersApp';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity, { GameEntityParams } from '../GameEntity';

export default class Pillar extends GameEntity
{
    constructor()
    {
        super();
        this.add(Body);
        this.body.width = 9;
        this.body.height = 80;
        this.body.depth = 9;
        this.model = app.library.getEntity('pillar');
        this.model.ry = Math.PI;
        this.model.y = -this.body.height * 0.5;
        // this.model.z = -4;
        this.addChild(this.model);
        this.removableOnCrash = true;
    }

    awake(): void
    {
        if (!this.model) return;
        this.addChild(this.model);
    }

    public static factory(chunk: Chunk, node: NodeObj, params: GameEntityParams): void
    {
        const entity: Pillar = chunk.game.pool.get(Pillar);
        const px = node.components.Transform.position.x;
        const pz = node.components.Transform.position.z;

        entity.body.z = chunk.z - pz;
        entity.body.x = px;
        entity.body.bottom = 0;
        if (params.offsetX) entity.body.x = params.offsetX;
        if (params.flip) entity.body.x *= -1;
        entity.init();
        chunk.game.addChild(entity);
    }

    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/pillar_group_place/);
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(Pillar, 8);
    }
}
