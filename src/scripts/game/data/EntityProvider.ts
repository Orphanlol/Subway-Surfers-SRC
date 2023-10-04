import GameConfig from '../../GameConfig';
import Chunk from '../data/Chunk';
import { NodeObj } from '../data/Node';
import Blocker from '../entities/Blocker';
import Checkpoint from '../entities/Checkpoint';
import Coin from '../entities/Coin';
import Epic from '../entities/Epic';
import Gates from '../entities/Gates';
import LightSignal from '../entities/LightSignal';
import Obstacle from '../entities/Obstacle';
import Pickup from '../entities/Pickup';
import Pillar from '../entities/Pillar';
import PillarsEnvironment from '../entities/PillarsEnvironment';
import Ramp from '../entities/Ramp';
import StartBag from '../entities/StartBag';
import StationEnvironment from '../entities/StationEnvironment';
import Train from '../entities/Train';
import Trigger from '../entities/Trigger';
import TubeEnvironment from '../entities/TubeEnvironment';
import GameEntity from '../GameEntity';

/** Entity classes that should be available for chunks */
const allClasses: GameEntityConstructor[] = [
    Blocker,
    Checkpoint,
    Coin,
    Gates,
    LightSignal,
    Obstacle,
    Pickup,
    Pillar,
    PillarsEnvironment,
    Ramp,
    StartBag,
    StationEnvironment,
    Train,
    Trigger,
    TubeEnvironment,
    Epic,
];

export interface GameEntityConstructor
{
    new (): GameEntity;
    /** Match a node with this entity */
    match?(node: NodeObj): boolean
    /** Delegate to this class the job of reading node and spawn entities - can spawn multiple entities of different types */
    factory?(chunk: Chunk, node: NodeObj, params?: Record<string, any>): void;
    /** Spawn entity of this type, similar to factory, but usually a single instance */
    spawn?(chunk: Chunk, node: NodeObj, params?: Record<string, any>): GameEntity|null;
    /** Check if this entity has necessary resources to be used in game */
    hasNecessaryResources?(): boolean;
    /** Create instances in advance in order to save some performance during gameplay */
    prepopulate?(): void
}

export class EntityProvider
{
    /** Mark if entities has been prepopulated */
    private static prepopulated = false;

    /** Save a map of matched entities by node name */
    private static matchMap: Record<string, GameEntityConstructor | null> = {};

    /**
     * Create entity instances in advance, to reduce amount of `new` calls while playing the game
     * Calls static `prepopulate()` function (if available) on each class listed
     */
    public static prepopulate(): void
    {
        const canPrepopulate = GameConfig.loadMode === 'simple' || GameConfig.loadMode === 'all';

        if (this.prepopulated || !GameConfig.prepopulate || !canPrepopulate) return;
        this.prepopulated = true;

        console.log('[EntityProvider] Pre-populate');

        for (const EntityCtor of allClasses)
        {
            if (EntityCtor.prepopulate) EntityCtor.prepopulate();
        }
    }

    /**
     * Get an Entity constructor that matches given node
     * Only classes with a static `match(node)` method will be tested.
     * @param node - NodeObj (GameObject data) to be tested
     */
    private static match(node: NodeObj): GameEntityConstructor | null
    {
        // Early return if a node with given name has been matched before
        if (this.matchMap[node.name] !== undefined)
        {
            return this.matchMap[node.name];
        }

        // Fron list of all classes, find the one that match positive with provided node
        for (const EntityCtor of allClasses)
        {
            if (EntityCtor.match)
            {
                const matched = EntityCtor.match(node);

                if (matched)
                {
                    // Cache this match, so that does not to be tested again
                    this.matchMap[node.name] = EntityCtor;

                    return EntityCtor;
                }
            }
        }

        // Cache nodes that does not match with anything as well
        this.matchMap[node.name] = null;

        return null;
    }

    /**
     * Get an entity class that corresponds to given node, or null if there is no match for this node.
     * Only classes listed in `allEntities` with a static `match(node)` method are elegible to be returned.
     * @param node - Node entity to be matched
     */
    public static getEntityClass(node: NodeObj): GameEntityConstructor | null
    {
        // Find a class that maches this node
        const matched = this.match(node);

        // Return null if not matched
        if (!matched) return null;

        // Check if matched class has all necessary resources to be created
        // If the game is running with basic assets, that means some models might
        // not be loaded yet, they should be skipped in this case
        if (matched.hasNecessaryResources && !matched.hasNecessaryResources()) return null;

        return matched;
    }
}
