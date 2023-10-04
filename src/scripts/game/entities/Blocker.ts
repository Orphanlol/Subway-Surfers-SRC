/* eslint-disable @typescript-eslint/no-use-before-define */
import { app } from '../../../scripts/SubwaySurfersApp';
import Random from '../../utils/Random';
import Body from '../components/Body';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity, { GameEntityParams } from '../GameEntity';
import BlockerDodgeDetector from './BlockerDodgeDetector';
import Coin from './Coin';

export default class Blocker extends GameEntity
{
    public modelName = '';
    public dodgeDetector?: BlockerDodgeDetector;

    constructor()
    {
        super();
        this.add(Body, { ghost: true });
        this.body.width = 16;
        this.body.height = 26;
        this.body.depth = 1;
        this.removableOnCrash = true;
    }

    build(): void
    {
        if (this.model || !app.library.hasGeometry(this.modelName)) return;
        this.model = app.library.getEntity(this.modelName);
        this.addChild(this.model);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    awake(chunk: Chunk, node: NodeObj): void
    {
        this.build();
        if (!this.model) return;
        this.model.ry = Math.PI;
        this.model.z = -5;
    }

    // ===== STATIC ===============================================================================

    /** Check if this entity have required resources to work */
    public hasNecessaryResources(): boolean
    {
        return app.library.hasGeometry('blocker_jump');
    }

    /** Check if node object is related to this class */
    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/blocker/);
    }

    /** Spawn one or more entities in a chunk, using node object and spawn params */
    public static factory(chunk: Chunk, node: NodeObj, params: GameEntityParams): void
    {
        let type = Random.pick(...Object.keys(BLOCKER_TYPES));

        if (node.name.match('jump')) type = 'jump';
        if (node.name.match('roll')) type = 'roll';
        const BlockerClass = BLOCKER_TYPES[type];
        const blocker: Blocker = chunk.game.pool.get(BlockerClass);
        const dodgeDetector: BlockerDodgeDetector = chunk.game.pool.get(BlockerDodgeDetector);
        const px = node.components.Transform.position.x;
        const pz = node.components.Transform.position.z;

        blocker.body.front = chunk.z - pz;
        blocker.body.x = px;
        if (params.offsetX) blocker.body.x = params.offsetX;
        if (params.flip) blocker.body.x *= -1;
        blocker.awake(chunk, node);
        chunk.game.addChild(blocker);
        chunk.game.addChild(dodgeDetector);

        dodgeDetector.body.x = blocker.body.x || 0;
        dodgeDetector.body.y = blocker.body.y || 0;
        dodgeDetector.body.z = blocker.body.z || 0;

        blocker.dodgeDetector = dodgeDetector;

        if (node.name.match('w_coins'))
        {
            if (BlockerClass === BLOCKER_TYPES.jump)
            {
                Coin.spawnCurve(chunk, blocker.body.x, 0, blocker.body.z);
            }
            else
            {
                Coin.spawnLine(chunk, blocker.body.x, 0, blocker.body.z);
            }
        }
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(BlockerJump, 8);
        app.game.pool.prepopulate(BlockerRoll, 8);
        app.game.pool.prepopulate(BlockerStandard, 8);
    }
}

class BlockerJump extends Blocker
{
    constructor()
    {
        super();
        this.modelName = 'blocker_jump';
    }

    awake(chunk: Chunk, node: NodeObj): void
    {
        super.awake(chunk, node);
        this.body.height = 26;
    }
}

class BlockerRoll extends Blocker
{
    constructor()
    {
        super();
        this.modelName = 'blocker_roll';
    }

    awake(chunk: Chunk, node: NodeObj): void
    {
        super.awake(chunk, node);
        this.body.height = 19;
        this.body.bottom = 10;
        if (this.model) this.model.y = (-this.body.height / 2) - this.body.bottom;
    }
}

class BlockerStandard extends Blocker
{
    constructor()
    {
        super();
        this.modelName = 'blocker_standard';
    }

    awake(chunk: Chunk, node: NodeObj): void
    {
        super.awake(chunk, node);
        this.body.height = 4;
        this.body.bottom = 10;
        if (this.model) this.model.y = (-this.body.height / 2) - this.body.bottom;
    }
}

const BLOCKER_TYPES: Record<string, new () => Blocker> = {
    jump: BlockerJump,
    roll: BlockerRoll,
    standar: BlockerStandard,
    standard: BlockerStandard,
};
