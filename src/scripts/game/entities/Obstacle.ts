import { Entity3D } from '@goodboydigital/odie';

import { app } from '../../../scripts/SubwaySurfersApp';
import Random from '../../utils/Random';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity, { GameEntityParams } from '../GameEntity';

const OBSTACLE_TYPES: any[] = [];

export default class Obstacle extends GameEntity
{
    public model!: Entity3D;

    constructor()
    {
        super();
        this.add(Body, { ghost: true });
        this.body.width = 18;
        this.body.height = 14;
        this.body.depth = 1;
        this.removableOnCrash = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    awake(chunk: Chunk, node: NodeObj): void
    {
        if (!this.model) return;
        this.model.ry = Math.PI;
        this.model.z = -4;
        this.addChild(this.model);
    }

    public static match = (node: NodeObj): boolean =>
        !!node.name.match(/obstacle_group/);

    public static factory = (chunk: Chunk, node: NodeObj, params: GameEntityParams): void =>
    {
        const ObstacleClass = Random.pick(...OBSTACLE_TYPES);
        const obstacle: Obstacle = chunk.game.pool.get(ObstacleClass, {});
        const px = node.components.Transform.position.x;
        const pz = node.components.Transform.position.z;

        obstacle.body.z = chunk.z - pz;
        obstacle.body.x = px;
        obstacle.body.bottom = 0;
        if (params.offsetX) obstacle.body.x = params.offsetX;
        if (params.flip) obstacle.body.x *= -1;
        obstacle.awake(chunk, node);
        chunk.game.addChild(obstacle);
    };
}

export class ObstacleDumpster extends Obstacle
{
    constructor()
    {
        super();
        this.body.soft = false;
        this.model = app.library.getEntity('dumpster');
    }

    init(): void
    {
        super.init();
        if (!this.model) return;
        this.body.height = 14;
        this.model.y = -this.body.height * 0.5;
    }
}
OBSTACLE_TYPES.push(ObstacleDumpster);
export class ObstacleBush extends Obstacle
{
    constructor()
    {
        super();
        this.body.soft = true;
        this.model = app.library.getEntity('bush_1');
    }

    init(): void
    {
        super.init();
        if (!this.model) return;
        this.body.height = 12;
        this.model.y = -this.body.height * 0.5;
    }
}
OBSTACLE_TYPES.push(ObstacleBush);
