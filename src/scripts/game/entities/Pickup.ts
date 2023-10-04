/* eslint-disable @typescript-eslint/no-use-before-define */
import { Entity3D } from '@goodboydigital/odie';

import { awardMysteryBox } from '../../data/mysterybox/MysteryBoxUtil';
import Game from '../../Game';
import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Random from '../../utils/Random';
import { getCurrentLetter, isHuntCompleted, onWordHuntCompleted, progressWordHunt } from '../../utils/WordHuntManager';
import Attractable from '../components/Attractable';
import Body from '../components/Body';
import Bouncing from '../components/Bouncing';
import Collectible from '../components/Collectible';
import Floating from '../components/Floating';
import Halo from '../components/Halo';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import GameEntity, { GameEntityCtor } from '../GameEntity';

export default class Pickup extends GameEntity
{
    public type = '';

    constructor()
    {
        super();
        this.add(Body, { ghost: true });
        this.add(Collectible);
        this.add(Halo, { type: 'rays' });
        this.add(Attractable, { sneakersOnly: true });
        this.body.width = 12;
        this.body.height = 12;
        this.body.depth = 12;
    }

    awake(): void
    {
        if (!this.model) return;
        this.addChild(this.model);
    }

    onCollect(): void
    {
        if (this.halo) this.halo.hide();
        const hasComp = !!(this.game.hero as any)[this.type];

        // This should be in case of powerups
        if (hasComp)
        {
            (this.game.hero as any)[this.type].turnOn();
            this.game.missions.addStat(1, 'mission-pickup-powerups');
            this.game.onPickupPowerup.dispatch(this.type);
        }
        if (this.type === 'letter') progressWordHunt();

        if (this.type === 'key')
        {
            this.game.stats.keys += 1;
            this.game.missions.addStat(1, 'mission-pickup-keys');
        }
        if (this.type !== 'jetpack') this.game.sfx.play('pickup-powerup');
        if (this.game.hero.popPickup) this.game.hero.popPickup.play();
    }

    // ===== STATIC ===============================================================================

    /** Check if this entity have required resources to work */
    public static hasNecessaryResources(): boolean
    {
        return app.library.hasGeometry('powerups_superSneakers');
    }

    /** Check if node object is related to this class */
    public static match(node: NodeObj): boolean
    {
        return !!node.name.match(/PickupSpawn/);
    }

    /** Spawn one or more entities in a chunk, using node object and spawn params */
    public static factory(chunk: Chunk, node: NodeObj, params: Record<string, any>): void
    {
        // Don't spawn pickups inside tubes?
        if (chunk.envTube) return;
        let EntityClass: GameEntityCtor | null = null;

        const pz = chunk.z - node.components.Transform.position.z;
        const spawnMode = node.components?.PickupSpawnPoint?.__spawnPointMode || '';
        const spawnType = node.components?.PickupSpawnPoint?.__forceSpawnPickupType || '';
        // const spawnDifficulty = node.components?.PickupSpawnPoint?._spawnPointDifficulty || 'Hard';
        const timedType = chunk.game.pickup.getNextPickup();

        // Prevent anything other than letters to spawn if world hunt is active
        if (!isHuntCompleted() && timedType !== PickupLetter) return;

        if (timedType)
        {
            EntityClass = timedType;
        }
        else if (spawnMode === 'WillForcePickupType')
        {
            // Forced pickup
            EntityClass = PICKUP_BY_TYPE[spawnType];
        }
        else
        {
            // Check with route if pickup can be spawned
            if (!chunk.game.route.canSpawn('pickup', pz)) return;

            const type = Random.item(PICKUP_WEIGHT_LIST);

            EntityClass = PICKUP_MAP[type];
        }

        // Debug flag, to force a certain pickups
        if (GameConfig.forcePickup && PICKUP_MAP[GameConfig.forcePickup])
        {
            EntityClass = PICKUP_MAP[GameConfig.forcePickup];
        }

        // No entity class, do nothing
        if (!EntityClass) return;

        // Check if can spawn jetpack based on minimum distance
        if (EntityClass === PickupJetpack && !chunk.game.route.canSpawn('jetpack', pz)) return;

        // Check if can spawn mystery box based on minimum distance
        if (EntityClass === PickupMysteryBox && !chunk.game.route.canSpawn('mysteryBox', pz)) return;

        const entity = chunk.game.pool.get(EntityClass) as Pickup;
        const px = node.components.Transform.position.x;
        const py = node.components.Transform.position.y;

        entity.body.z = pz;
        entity.body.x = params.offsetX !== null ? params.offsetX : px;
        entity.body.y = py;
        entity.removableOnCrash = py > 2;
        if (params.flip) entity.body.x *= -1;
        entity.awake();
        chunk.game.addChild(entity);

        // After spawn a pickup, mark in the route system the minimum distance for the next spawn
        chunk.game.route.setSpawn('pickup', pz - 1800);
        if (EntityClass === PickupJetpack) chunk.game.route.setSpawn('jetpack', pz - 2700);
        if (EntityClass === PickupMysteryBox) chunk.game.route.setSpawn('mysteryBox', pz - 9999);
    }

    /** Spawn random pickup from type list */
    public static spawnRandomType(game: Game, types: string[]): Pickup
    {
        const keys = types || Object.keys(PICKUP_MAP);
        const key = Random.pick(...keys);
        const EntityClass = PICKUP_MAP[key];
        const entity = game.pool.get(EntityClass, {}) as Pickup;

        entity.awake();
        game.addChild(entity);

        return entity;
    }

    /** Spawn a pickup */
    public static spawn(game: Game, type: string): Pickup
    {
        const EntityClass = PICKUP_MAP[type];
        const entity = game.pool.get(EntityClass, {}) as Pickup;

        entity.awake();
        game.addChild(entity);

        return entity;
    }

    /** Pre-populate pool instances */
    public static prepopulate(): void
    {
        app.game.pool.prepopulate(PickupJetpack, 2);
        app.game.pool.prepopulate(PickupPogo, 2);
        app.game.pool.prepopulate(PickupMagnet, 2);
        app.game.pool.prepopulate(PickupSneakers, 2);
    }
}

class PickupJetpack extends Pickup
{
    constructor()
    {
        super();
        this.add(Floating, { rotationSpeed: -0.03 });
        this.type = 'jetpack';
        this.model = app.library.getEntity('powerups_jetpack', { map: 'props-tex' });
        this.model.scale.set(1.50);
    }
}

class PickupPogo extends Pickup
{
    constructor()
    {
        super();
        this.add(Floating, { rotationSpeed: -0.03 });
        this.type = 'pogo';
        this.model = app.library.getEntity('powerups_rocketPogo', { map: 'props-tex' });
        this.model.scale.set(1.75);
    }
}

class PickupMagnet extends Pickup
{
    constructor()
    {
        super();
        this.add(Floating, { rotationSpeed: -0.03 });
        this.type = 'magnet';
        this.model = app.library.getEntity('powerups_coinMagnet', { map: 'props-tex' });
        this.model.scale.set(1.50);
    }
}

class PickupSneakers extends Pickup
{
    constructor()
    {
        super();
        this.add(Floating, { rotationSpeed: -0.03 });
        this.type = 'sneakers';
        this.model = app.library.getEntity('powerups_superSneakers', { map: 'props-tex' });
        this.model.scale.set(1.50);
    }
}

class PickupMultiplier extends Pickup
{
    constructor()
    {
        super();
        this.add(Floating, { rotationSpeed: -0.03 });
        this.type = 'multiplier';
        this.model = app.library.getEntity('powerups_2xMultiplier', { map: 'props-tex' });
        this.model.scale.set(1.50);
    }
}

export class PickupLetter extends Pickup
{
    private letter = '';
    private letterModel?: Entity3D;

    constructor()
    {
        super();
        this.add(Bouncing);
        this.type = 'letter';
        this.model = new Entity3D();
        onWordHuntCompleted.add(() =>
        {
            this.game.removeChild(this);
        });
    }

    awake(): void
    {
        if (!this.model) return;

        const letter = getCurrentLetter()?.toUpperCase();

        if (this.letter === letter || !app.library.hasGroup(letter)) return;

        if (this.letterModel) this.model.removeChild(this.letterModel);
        this.letterModel = app.library.getEntity(letter, { map: 'props-tex' });
        this.letterModel.rotation.y = Math.PI;
        this.letterModel.scale.set(1.50);
        this.letter = letter;

        this.model.addChild(this.letterModel);

        super.awake();
    }
}

export class PickupMysteryBox extends Pickup
{
    public base: Entity3D;
    public lid?: Entity3D;

    constructor()
    {
        super();
        this.add(Floating, { rotationSpeed: -0.03 });
        this.type = 'mysteryBox';
        this.model = new Entity3D();

        this.base = app.library.getEntity('mysteryBox_default', { map: 'props-tex' });
        this.model.addChild(this.base);
    }

    async onCollect(): Promise<void>
    {
        this.game.stats.setPrizes(awardMysteryBox());
        this.game.missions.addStat(1, 'mission-pickup-mystery');
        super.onCollect();
    }
}

class PickupKey extends Pickup
{
    constructor()
    {
        super();
        this.add(Floating, { rotationSpeed: -0.03 });
        this.type = 'key';
        this.model = app.library.getEntity('currency_key', { map: 'props-tex' });
        this.model.scale.set(1.50);
    }
}

const PICKUP_MAP: Record<string, any> = {
    jetpack: PickupJetpack,
    pogo: PickupPogo,
    magnet: PickupMagnet,
    sneakers: PickupSneakers,
    multiplier: PickupMultiplier,
    key: PickupKey,
    mysteryBox: PickupMysteryBox,
};

const PICKUP_BY_TYPE: Record<string, any> = {
    Jetpack: PickupJetpack,
    PogoStick: PickupPogo,
    CoinMagnet: PickupMagnet,
    SuperSneakers: PickupSneakers,
    CoinMultiplier: PickupMultiplier,
};

// All pickups that should be placed in the random spawn points
const PICKUP_WEIGHT_MAP: Record<string, number> = {
    magnet: 29,
    multiplier: 29,
    sneakers: 26,
    mysteryBox: 18,
    jetpack: 14,
    key: 2,
    // weekendLetters: 25, // To verify what is this
    // mysteryPowerUp: 23, // To verify what is this
};

// Make a list out of the weight map that will make easier to random pick items
const PICKUP_WEIGHT_LIST: string[] = [];

for (const key in PICKUP_WEIGHT_MAP)
{
    let i = PICKUP_WEIGHT_MAP[key];

    while (i--) PICKUP_WEIGHT_LIST.push(key);
}
