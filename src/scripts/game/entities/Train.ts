/* eslint-disable @typescript-eslint/no-use-before-define */
import { app } from '../../SubwaySurfersApp';
import Random from '../../utils/Random';
import Body from '../components/Body';
import Movable from '../components/Movable';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity from '../GameEntity';
import Coin from './Coin';

export default class Train extends GameEntity
{
    public wagons: GameEntity[] = [];
    public chunk?: Chunk;
    public modelName = '';

    constructor()
    {
        super();
        this.add(Body, { boxColor: 0xFF0000 });
        this.add(Movable, { speed: 0 });
        this.body.width = 18;
        this.body.height = 29;
        this.body.depth = 58;
        this.body.deco = true;
        this.removableOnCrash = true;
    }

    build(): void
    {
        if (this.model || !app.library.hasGeometry(this.modelName)) return;
        this.model = app.library.getEntity(this.modelName);
        this.model.y = -this.body.height * 0.5;
        this.model.ry = Math.PI;
        this.body.deco = false;
        this.addChild(this.model);
    }

    awake(): void
    {
        this.build();
    }

    reset(): void
    {
        if (this.model) return;
        this.body.velocity.reset();
    }

    clean(chunk: Chunk): void
    {
        let i = this.wagons.length;

        while (i--)
        {
            const wagon = this.wagons[i];

            chunk.game.pool.return(wagon);
            this.removeChild(wagon);
        }
    }

    // ===== STATIC ===============================================================================

    /** Check if node object is related to this class */
    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/trains_(\d)_/) || !!node.name.match(/train_sub_(\d)_/);
    }

    /** Spawn one or more entities in a chunk, using node object and spawn params */
    public static factory(chunk: Chunk, node: NodeObj, params: Record<string, any>): void
    {
        let EntityClass = TrainSub;

        if (node.name.match('sub'))
        {
            EntityClass = TrainSub;
        }
        else if (node.name.match('cargo'))
        {
            EntityClass = app.library.hasGeometry('train_sub') ? TrainCargo : TrainSub;
        }
        else if (node.name.match('standard'))
        {
            EntityClass = app.library.hasGeometry('train_standard') ? TrainStandard : TrainSub;
        }
        else if (app.library.hasGeometry('train_standard'))
        {
            EntityClass = Random.pick(...TRAIN_TYPES);
        }

        const zProp = chunk.name.match('intro') ? 'z' : 'back';

        const matchNumTrains = node.name.match(/_(\d)_/);
        const numTrains = matchNumTrains ? parseInt(matchNumTrains[1], 10) : 0;
        const withCoins = node.name.match(/coins/);
        const spacing = 60;
        const fullDepth = spacing * numTrains;
        let i = numTrains;
        let target = 0;
        let start = Number.NEGATIVE_INFINITY;
        let speed = 0;
        let train = null;

        while (i--)
        {
            train = chunk.game.pool.get(EntityClass) as Train;
            train.chunk = chunk;
            speed = node.components?.MovingTrainPlaceholder?._speed || 0;
            const px = node.components.Transform.position.x;
            const pz = node.components.Transform.position.z;
            const mz = spacing * i;

            train.body.x = params.offsetX !== null ? params.offsetX : px;
            train.body.bottom = 0;
            const pos = chunk.z - pz - mz;

            train.body[zProp] = pos;
            if (!target) target = train.body[zProp] + (fullDepth * 0.6) + 30;
            if (params.flip) train.body.x *= -1;
            train.movable?.run(speed, target);
            chunk.game.addChild(train);
            if (train.body.back > start) start = train.body.back;
        }

        if (withCoins && train)
        {
            const numCoins = Math.ceil(numTrains * 1.1);
            const coinsSpacing = 30;
            const pos = start - 50;

            for (let i = 0; i < numCoins; i++)
            {
                const coin1 = Coin.spawn(chunk, node, params) as unknown as Coin;

                coin1.body.x = train.body.x;
                coin1.body.bottom = 29;
                coin1.body.z = pos - (i * coinsSpacing);
                coin1.movable.run(speed, target);
            }
        }
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(TrainStandard, 10);
        app.game.pool.prepopulate(TrainCargo, 10);
        app.game.pool.prepopulate(TrainSub, 10);
    }
}

class TrainStandard extends Train
{
    constructor()
    {
        super();
        this.modelName = 'train_standard';
        this.build();
    }
}

class TrainCargo extends Train
{
    constructor()
    {
        super();
        this.modelName = 'train_cargo';
        this.build();
    }
}

class TrainSub extends Train
{
    constructor()
    {
        super();
        this.modelName = 'train_sub';
        this.build();
    }
}
const TRAIN_TYPES = [TrainStandard, TrainCargo, TrainSub];
