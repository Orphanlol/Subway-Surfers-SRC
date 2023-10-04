/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-use-before-define */

import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import { Fillers, FillersHigh01Left, FillersHigh01Right } from '../entities/Fillers';
import Floor from '../entities/Floor';
import GameEntity from '../GameEntity';

export default class Gates extends GameEntity
{
    public lowCamera = true;
    public colL!: GameEntity;
    public colR!: GameEntity;
    public colM!: GameEntity;
    public ceiling!: GameEntity;

    constructor()
    {
        super();
        this.removableOnCrash = true;
        this.add(Body, { noView: true, trigger: true });
        this.body.width = 80;
        this.body.height = 50;
        this.body.depth = 120;
        this.lowCamera = true;
    }

    awake(chunk: Chunk, node: NodeObj): void
    {
        this.body.x = 0;
        this.body.bottom = 0;
        // this.body.z = -chunk.middle;
        // this.body.z = chunk.z - GameConfig.blockSize * 2;
        this.body.z = chunk.z - node.components.Transform.position.z - (GameConfig.blockSize * 2);

        if (this.model)
        {
            this.model.ry = Math.PI;
            this.model.y = -this.body.height * 0.5;
            this.model.z = this.body.depth * 1.45;
            this.addChild(this.model);
        }

        const ceiling = chunk.game.pool.get(GatePart) as GameEntity;

        ceiling.body.width = this.body.width;
        ceiling.body.height = 16;
        ceiling.body.depth = this.body.depth * 0.9;
        ceiling.body.x = 0;
        ceiling.body.bottom = 37;
        ceiling.body.z = this.body.z;
        chunk.game.addChild(ceiling);

        const colL = chunk.game.pool.get(GatePart) as GameEntity;

        colL.body.width = 20;
        colL.body.height = ceiling.body.bottom;
        // colL.body.depth = this.body.depth;
        colL.body.depth = this.body.depth * 0.9;
        colL.body.bottom = 0;
        colL.body.right = -GameConfig.laneWidth * 1.5;
        colL.body.z = this.body.z;
        chunk.game.addChild(colL);

        const colM = chunk.game.pool.get(GatePart) as GameEntity;

        colM.body.width = 20;
        colM.body.height = ceiling.body.bottom;
        // colM.body.depth = this.body.depth;
        colM.body.depth = this.body.depth * 0.9;
        colM.body.bottom = 0;
        colM.body.x = 0;
        colM.body.z = this.body.z;
        chunk.game.addChild(colM);

        const colR = chunk.game.pool.get(GatePart) as GameEntity;

        colR.body.width = 20;
        colR.body.height = ceiling.body.bottom;
        // colR.body.depth = this.body.depth;
        colR.body.depth = this.body.depth * 0.9;
        colR.body.bottom = 0;
        colR.body.left = GameConfig.laneWidth * 1.5;
        colR.body.z = this.body.z;
        chunk.game.addChild(colR);

        this.colL = colL;
        this.colR = colR;
        this.colM = colM;
        this.ceiling = ceiling;

        // Ground.spawn(chunk, {type: 'gates', z: this.body.z});
        // Ground.spawn(chunk, {z: this.body.back, rails: [2, 2, 2]});

        // const base = new GameEntity();

        // base.addChild(app.library.getEntity('gates_base'));

        // const base = chunk.game.pool.get(GatesBase) as GameEntity;
        const base = new GatesBase();

        base.ry = Math.PI;
        base.z = chunk.z;
        chunk.game.addChild(base);
        chunk.setFillersByPosition(chunk.z, chunk.z - (GameConfig.blockSize * 4));

        Floor.spawnGates(chunk);

        if (chunk.blocks > 4)
        {
            Floor.spawn(chunk, { z: chunk.z - (GameConfig.blockSize * 4) });
            Fillers.spawn(chunk, {
                z: chunk.z - (GameConfig.blockSize * 4),
                l: FillersHigh01Left,
                r: FillersHigh01Right,
            });
        }
    }

    /** Check if this entity have required resources to work */
    public static hasNecessaryResources(): boolean
    {
        return app.library.hasGeometry('gates_base');
    }

    /** Check if node object is related to this class */
    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/gates_(.*?)_group_place/);
    }

    /** Spawn one or more entities in a chunk, using node object and spawn params */
    public static factory(chunk: Chunk, node: NodeObj): void
    {
        const EntityClass = CLASS_MAP[node.name];
        const entity = chunk.game.pool.get(EntityClass) as GameEntity;

        entity.awake(chunk, node);
        chunk.game.addChild(entity);

        const trigger = chunk.game.pool.get(GatesCameraTrigger) as GameEntity;

        trigger.body.x = entity.body.x;
        trigger.body.y = entity.body.y;
        trigger.body.z = entity.body.z + 30;
        chunk.game.addChild(trigger);
    }
}

class GatesCameraTrigger extends GameEntity
{
    constructor()
    {
        super();

        this.removableOnCrash = true;
        this.add(Body, { trigger: true });
        this.body.width = 80;
        this.body.height = 50;
        this.body.depth = 160;
        this.lowCamera = true;
    }
}

class GatesBase extends GameEntity
{
    constructor()
    {
        super();
        if (GameConfig.environment)
        {
            this.model = app.library.getEntity('gates_base');
            this.addChild(this.model);
        }
    }
}

class GatePart extends GameEntity
{
    constructor()
    {
        super();
        this.add(Body);
        this.removableOnCrash = true;
    }

    reset()
    {
        // this.body.deco = false;
        // this.body.box.size.reset();
        // this.body.box.center.reset();
    }
}

class GatesSides extends Gates
{
    constructor()
    {
        super();
        if (GameConfig.environment)
        {
            this.model = app.library.getEntity('gates_sides');
            this.model.ry = Math.PI;
            this.model.y = -this.body.height * 0.5;
            this.model.sx = 0.9;
            this.model.x = -1;
        }
    }

    awake(chunk: Chunk, node: NodeObj)
    {
        super.awake(chunk, node);
        this.colM.body.width = 20;
        this.colM.body.x = 0;
        this.colL.body.width = 20;
        this.colL.body.right = -GameConfig.laneWidth * 1.5;
        this.colR.body.width = 20;
        this.colR.body.left = GameConfig.laneWidth * 1.5;
        this.scale.set(0.9);
        this.scale.set(1.0);
    }
}

class GatesMid extends Gates
{
    constructor()
    {
        super();
        if (GameConfig.environment)
        {
            this.model = app.library.getEntity('gates_mid');
            this.model.ry = Math.PI;
            this.model.y = -this.body.height * 0.5;
            this.addChild(this.model);
        }
    }

    awake(chunk: Chunk, node: NodeObj)
    {
        super.awake(chunk, node);
        this.colM.body.width = 0;
        this.colM.body.x = 999;
        this.colL.body.width = 60;
        this.colL.body.right = -GameConfig.laneWidth * 0.5;
        this.colR.body.width = 60;
        this.colR.body.left = GameConfig.laneWidth * 0.5;
        this.scale.set(0.9);
        this.scale.set(1.0);
    }
}

class GatesLeft extends Gates
{
    constructor()
    {
        super();
        if (GameConfig.environment)
        {
            this.model = app.library.getEntity('gates_left');
            this.model.ry = Math.PI;
            this.model.y = -this.body.height * 0.5;
            this.addChild(this.model);
        }
    }

    awake(chunk: Chunk, node: NodeObj)
    {
        super.awake(chunk, node);
        this.colM.body.width = 0;
        this.colM.body.x = 999;

        this.colL.body.width = 60;
        this.colL.body.right = -GameConfig.laneWidth * 1.5;
        this.colR.body.width = 60;
        this.colR.body.left = -GameConfig.laneWidth * 0.5;
        this.scale.set(0.9);
        this.scale.set(1.0);
    }
}

class GatesRight extends Gates
{
    constructor()
    {
        super();
        if (GameConfig.environment)
        {
            this.model = app.library.getEntity('gates_right');
            this.model.ry = Math.PI;
            this.model.y = -this.body.height * 0.5;
            this.addChild(this.model);
        }
    }

    awake(chunk: Chunk, node: NodeObj)
    {
        super.awake(chunk, node);
        this.colM.body.width = 0;
        this.colM.body.x = 999;

        this.colL.body.width = 60;
        this.colL.body.right = GameConfig.laneWidth * 0.5;
        this.colR.body.width = 60;
        this.colR.body.left = GameConfig.laneWidth * 1.5;
        this.scale.set(0.9);
        this.scale.set(1.0);
    }
}

const CLASS_MAP: any = {
    gates_mid_group_place: GatesMid,
    gates_left_group_place: GatesLeft,
    gates_right_group_place: GatesRight,
    gates_sides_group_place: GatesSides,
};
