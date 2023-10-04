import { app } from '../../SubwaySurfersApp';
import Attractable from '../components/Attractable';
import Body from '../components/Body';
import Collectible from '../components/Collectible';
import Floating from '../components/Floating';
import Movable from '../components/Movable';
import Shine from '../components/Shine';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity from '../GameEntity';

export default class Coin extends GameEntity
{
    public trigger = 0;
    public speed = 0;
    public attractable!: Attractable;
    public movable!: Movable;
    public collectible!: Collectible;
    public floating!: Floating;
    public arc = 0;

    constructor()
    {
        super();
        this.add(Body, { ghost: true, boxColor: 0xFFFF00 });
        this.add(Attractable);
        this.add(Movable);
        this.add(Collectible);
        this.add(Floating, { rotationSpeed: 0.06 });
        this.add(Shine);

        this.body.width = 10;
        this.body.height = 10;
        this.body.depth = 10;
        this.trigger = 0;
        this.speed = 0;

        this.build();
    }

    build(): void
    {
        if (this.model || !Coin.hasNecessaryResources()) return;
        this.model = app.library.getEntity('currency_coin');
        this.addChild(this.model);
    }

    reset(): void
    {
        if (!this.model) return;
        this.movable.reset();
        this.body.velocity.reset();
        this.attractable.reset();
        this.body.movable = false;
        this.active = true;
    }

    awake(): void
    {
        this.build();
        if (!this.model) return;
        this.movable.reset();
        this.attractable.reset();
        this.body.velocity.reset();
        this.body.movable = false;
        this.active = true;
    }

    onCollect(): void
    {
        if (!this.model) return;
        this.game.stats.coins += 1;
        this.game.missions.addStat(1, 'mission-pickup-coins');
        this.game.sfx.play('pickup-coin', { volume: 0.5, rate: 1 + (this.arc * 0.05) });
        this.game.hero.pop.play();
    }

    // ===== STATIC ===============================================================================

    /** Check if this entity have required resources to work */
    public static hasNecessaryResources(): boolean
    {
        return app.library.hasGeometry('currency_coin') && app.library.hasMap('halo');
    }

    /** Check if node object is related to this class */
    public static match(node: NodeObj): boolean
    {
        const result = !!node.name.match(/Coin \(/) || !!node.name.match(/Coins \(/);

        return result;
    }

    /** Spawn one or more entities in a chunk, using node object and spawn params */
    public static factory(chunk: Chunk, node: NodeObj, params: Record<string, any>): void
    {
        if (!Coin.hasNecessaryResources()) return;

        if (node.name.match(/Line/))
        {
            const numCoins = 5;
            const py = node.components.Transform.position.y;
            // remove weirdly placed lines for now

            if (py > 50) return;
            const curveO = node.components.CoinCurve._curveOffset;
            const distance = node.components.CoinCurve._curveParent._cachedCurve.MaxCoords.z;
            const curveOffset = distance * curveO;
            const spacing = distance / numCoins;

            for (let i = 0; i < numCoins; i++)
            {
                const coin = Coin.spawn(chunk, node, params) as Coin;
                const offz = (i * spacing) - curveOffset;

                coin.body.z -= offz;
                coin.arc = 0;
                coin.removableOnCrash = py > 1;
            }
        }
        else if (node.name.match(/Jump Curve/))
        {
            Coin.spawnJumpCurve(chunk, node, params);
        }
        else
        {
            Coin.spawn(chunk, node, params);
        }
    }

    /** Spawn a single coin in a chunk, using node object and spawn params */
    public static spawn(chunk: Chunk, node: NodeObj, params: Record<string, any>): Coin|null
    {
        if (!Coin.hasNecessaryResources()) return null;

        const coin = chunk.game.pool.get(Coin) as Coin;
        const px = node.components.Transform.position.x;
        const py = node.components.Transform.position.y;
        const pz = node.components.Transform.position.z;

        coin.body.x = px;
        coin.body.bottom = py;
        coin.body.z = chunk.z - pz;
        coin.removableOnCrash = py > 1;
        if (params.px) coin.body.x = params.px;
        if (params.offsetX) coin.body.x = params.offsetX;
        if (params.flip) coin.body.x *= -1;
        // fix weirdly lost coins in the sky from chunk data like 'routeChunk_default_train_tops_moving_combined'
        if (coin.body.bottom > 150) coin.body.bottom = 29;
        coin.awake();
        if (params.py) coin.body.bottom = params.py;
        if (params.bottom) coin.body.bottom = params.bottom;
        coin.arc = 0;
        chunk.game.addChild(coin);

        return coin;
    }

    /** Spawn a line of coins */
    public static spawnLine(chunk: Chunk, x: number, y: number, z: number, numCoins = 5): void
    {
        if (!Coin.hasNecessaryResources()) return;

        const spacing = 30;
        const offset = ((spacing - 1) * numCoins * 0.5) - (spacing * 0.5);

        for (let i = 0; i < numCoins; i++)
        {
            const coin = chunk.game.pool.get(Coin) as Coin;

            coin.body.z = z - (i * spacing) + offset;
            coin.body.bottom = y;
            coin.body.x = x;
            coin.awake();
            coin.arc = 0;
            coin.removableOnCrash = y > 1;
            chunk.game.addChild(coin);
        }
    }

    /** Spawn a curve of coins */
    public static spawnCurve(chunk: Chunk, x: number, y: number, z: number): void
    {
        if (!Coin.hasNecessaryResources()) return;

        const distance = chunk.game.stats.speed * 50;
        const numCoins = Math.floor(distance / 13);
        const spacing = distance / numCoins;
        const offset = ((spacing - 1) * numCoins * 0.5) - (spacing * 0.5);
        const curve = Math.PI / (numCoins - 1);

        for (let i = 0; i < numCoins; i++)
        {
            const coin = chunk.game.pool.get(Coin) as Coin;

            coin.body.z = z - (i * spacing) + offset;
            coin.body.bottom = y + (Math.sin(curve * i) * 22);
            coin.body.x = x;
            coin.awake();
            coin.arc = i + 1;
            coin.removableOnCrash = true;
            chunk.game.addChild(coin);
        }
    }

    /** Spawn a curve with height and length that will match player's current speed */
    public static spawnJumpCurve(chunk: Chunk, node: NodeObj, params: Record<string, any>): void
    {
        if (!Coin.hasNecessaryResources()) return;

        const distance = chunk.game.stats.speed * 50;
        const numCoins = Math.floor(distance / 14);
        const curveO = node.components.CoinCurve ? node.components.CoinCurve._curveOffset : 0.5;
        const spacing = distance / numCoins;
        const curve = Math.PI / (numCoins);
        const curveOffset = distance * curveO;

        for (let i = 0; i < numCoins; i++)
        {
            const coin = Coin.spawn(chunk, node, params);

            if (coin)
            {
                const offz = (i * spacing) - curveOffset;
                const offy = Math.sin(curve * i) * 22;

                coin.body.bottom += offy;
                coin.body.z -= offz;
                coin.arc = i + 1;
                coin.removableOnCrash = true;
            }
        }
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(Coin, 128);
    }
}

