import Game from '../../Game';
import GameConfig from '../../GameConfig';
import Random from '../../utils/Random';
import Node, { NodeObj } from '../data/Node';
import Cube from '../entities/Cube';
import { Fillers } from '../entities/Fillers';
import Floor from '../entities/Floor';
import Logo from '../entities/Logo';
import GameEntity from '../GameEntity';
import { EntityProvider } from './EntityProvider';

// Static game logo - should be instantiated only once
let logo: Logo | null = null;

export type NodeMountParams = Record<string, any>;

/**
 * Chunk parse chunk data extracted from Unity project and mounts its elements into the game.
 * Chunk is not an entity itself, it only converts data into entities in game.
 * Unity chunks are actual GameObjects, containin child GameObjects as entities or groups of entities,
 * but here, all chunks entities are mounted on the fly, and they are placed all at same level, inside Game's root container
 */
export default class Chunk
{
    public game!: Game;
    public node!: any;
    public name!: string;
    public entities!: GameEntity[];
    public blocks!: number;
    public length!: number;
    public z!: number;
    public start!: number;
    public middle!: number;
    public end!: number;
    public offset!: number;
    public index!: number;
    public section: any | null = null;
    public envNode: any | null = null;
    public environment: any | null = null;
    public envTube = false;
    public envStation = false;
    public envEpic = false;
    public envGates = false;
    public envEmpty = false;
    public envPillars = false;
    public hasGround = false;
    public lastTube = 0;
    public checkpoints: GameEntity[] = [];
    public fillerSlots!: Record<string, boolean>;
    public floorSlots!: Record<string, boolean>;
    public fillerList!: Fillers[];

    constructor()
    {
        this.reset();
    }

    /**
     * Fully reset the chunk, to make reusable with another data
     */
    reset(): void
    {
        this.node = null;
        this.section = null;
        this.name = '';
        this.entities = [];
        this.blocks = 0;
        this.length = 0;
        this.z = 0;
        this.start = 0;
        this.middle = 0;
        this.end = 0;
        this.offset = 0;
        this.index = -1;
        this.envNode = null;
        this.environment = null;
        this.envTube = false;
        this.envStation = false;
        this.envEpic = false;
        this.envGates = false;
        this.envEmpty = false;
        this.envPillars = false;
        this.hasGround = false;
        this.lastTube = 0;
        this.checkpoints = [];
        this.fillerSlots = {};
        this.floorSlots = {};
        this.fillerList = [];
    }

    /**
     * Init a chunk, which will recursively read chunk data provided (Node)
     * then spawn entities accordingly, either game bodies and/or decoration
     * like floor, buildings (fillers)
     * @param game - Game instance
     * @param start - Z position where this chunk should start
     * @param node - Chunk data from json
     * @param index - An index, for reference
     */
    init(game: Game, start: number, node: NodeObj, index: number): void
    {
        console.log('[Chunk] Init:', node.name);
        this.game = game;
        this.node = node;
        this.name = this.node.name;
        this.entities = [];
        this.blocks = node.components?.RouteChunk?._blockCount || 0;
        this.length = this.blocks * GameConfig.blockSize;
        this.z = -start;
        this.start = start;
        this.middle = this.start + (this.length * 0.5);
        this.end = this.start + this.length;
        this.offset = 0;
        this.index = index;
        this.fillerSlots = {};
        this.floorSlots = {};
        this.fillerList = [];

        // First setup the environment - filles (buildings) and floor (tracks)
        this.game.environment.setup(this);

        // Mount node entities
        this.mount(this.node, this);

        // After mounted, then mount the environment
        // because some game entities can have their own environment pieces
        this.game.environment.mount(this);

        // Add chunk debug marks, if this flag is on
        if (GameConfig.chunkMarks) this.addChunkDebugMarks();

        // SPecial case for the intro - the 'title screen' chunk
        if (this.name === 'intro') this.mountIntro();
    }

    /**
     * Intro is a special sort of chunk, that also puts the logo in front of the first train
     * This chunk is the scenario for the title screen, where the main character is painting the train
     */
    private mountIntro(): void
    {
        if (!logo) logo = new Logo();
        logo.x = -20;
        logo.y = 0;
        logo.z = 30;
        this.blocks = 2;
        this.length = 90;
        this.game.addChild(logo);
        logo.updateScore();
        Floor.mount(this);
        Fillers.mount(this);
    }

    /**
     * Recursively read chunk data (node) and spawn entities
     * @param node - Object representing chunk or entity data
     * @param params - Persisten settings along the curren hyerarchy
     *
     * If params.flip was set before, everything afterward will be flipped, unless it sees another 'flip'
     * property - that's because flip was set in parent game objects in the original project,
     * but here all entities are placed in the same level.
     *
     * This is the most cpu-intensive process of the game, and source of some frame rate drop in slower devices.
     * What happens is: recurive loop through nodes and children and spawn entities accordingly
     * Usually each entity class will have a 'factory' function and can handle the spawn themselves, based on
     * this chunk, current node and params, and they can be slow on their own too, depending on the amout of
     * things they are reading, comparing and spawning
     *
     * Maybe all chunk data can be pre-mapped rather than fully read on demand while game is running.
     * Probably could be a good thing if we can 'flatten' chunk data in build step, easing things a bit here.
     */
    private mount(node: NodeObj, params: NodeMountParams): void
    {
        // Skip light signal in the intro
        if (this.name === 'intro' && node.name.match('lightSignal')) return;

        // Assign current params values
        params = Object.assign({}, params || {});

        // Set default params values if undefined
        if (params.flip === undefined) params.flip = 0;
        if (params.offsetX === undefined) params.offsetX = null;

        // Pick one of subnodes to mount and ignore the others
        if (Node.comp(node, 'Randomizer') && node.children)
        {
            const child = Random.pick(...node.children);

            this.mount(child, params);

            return;
        }

        // Randomize X position on following nodes - left middle or right
        if (Node.comp(node, 'RandomizeOffset'))
        {
            const l = node.components.RandomizeOffset.randomOffsets.left;
            const m = node.components.RandomizeOffset.randomOffsets.mid;
            const r = node.components.RandomizeOffset.randomOffsets.right;
            const a = [];

            if (l) a.push(-20); // Add 'Left' position to the random list
            if (m) a.push(0); // Add 'Middle' position to the random list
            if (r) a.push(20); // Add 'Right' position to the random list

            // Randomise one of the positions listed
            if (a.length) params.offsetX = Random.pick(...a);
        }

        // Flip X position on following nodes (left turn right, right turn left)
        if (Node.comp(node, 'Mirror'))
        {
            params.flip = Random.pick(0, 1);
        }

        // Find an Entity class suitable for this node
        const EntityClass = EntityProvider.getEntityClass(node);

        if (EntityClass)
        {
            let entity = null;

            if (EntityClass.factory)
            {
                // If EntityClass has a 'factory' function, that will handle
                // what to be done with this chunk, current node (entity data) and current params.
                // Some factory, like Train.factory and Coin.factory can spawn several entities
                // based on information that they parse from given node
                entity = EntityClass.factory(this, node, params);
            }
            else
            {
                // If EntityClass has no 'factory' function, must be something simple
                // Spawn a single entity based on that
                entity = this.game.pool.get(EntityClass) as GameEntity;
                entity.awake(this, node, params);
                this.game.addChild(entity);
            }

            // Special case for tutorial, where some entities are checkpoints
            if (entity && entity.checkpoint)
            {
                if (!this.checkpoints) this.checkpoints = [];
                this.checkpoints.push(entity);
            }

            // Mark all chunk evnviroment slots as set, if this node is an Environment
            // Environment set their fillers (left and right buildings) and floor themselves
            if (entity && Node.comp(node, 'Environment'))
            {
                const a = -entity.body.back - this.start;
                const b = -entity.body.front - this.start;
                const s = GameConfig.blockSize * 2;
                const start = Math.round(a / s);
                const end = Math.round(b / s);

                for (let i = start; i < end; i++) this.fillerSlots[i] = true;
                for (let i = start; i < end; i++) this.floorSlots[i] = true;
            }
        }

        // Loop children to findo more things to mount
        if (node.children)
        {
            let i = node.children.length;

            while (i--) this.mount(node.children[i], params);
        }
    }

    /**
     * Mark filler slots as set inside a position range
     * @param back - The z start of the range
     * @param front - The z end of the range
     */
    public setFillersByPosition(back: number, front: number): void
    {
        const a = -back - this.start;
        const b = -front - this.start;
        const s = GameConfig.blockSize * 2;
        const start = Math.round(a / s);
        const end = Math.round(b / s);

        for (let i = start; i < end; i++) this.fillerSlots[i] = true;
    }

    /**
     * Mark floor slots as set in a range
     * @param back - The z start of the range
     * @param front - The z end of the range
     */
    public setFloorsByPosition(back: number, front: number): void
    {
        const a = -back - this.start;
        const b = -front - this.start;
        const s = GameConfig.blockSize * 2;
        const start = Math.round(a / s);
        const end = Math.round(b / s);

        for (let i = start; i < end; i++) this.floorSlots[i] = true;
    }

    /**
     * Place visual marks in this chunk, useful for dev/debugging
     * Short marks represents start and end of blocks (each 90 units)
     * Tall marks represents start of the chunk
     */
    private addChunkDebugMarks(): void
    {
        let i = this.blocks;

        while (i--)
        {
            const div = this.game.pool.get(Cube) as GameEntity;

            div.body.drawView();
            div.body.deco = true;
            div.body.width = 80;
            div.body.height = i ? 2 : 20;
            div.body.depth = 0.1;
            div.body.x = 0;
            div.body.bottom = 0;
            div.body.z = -this.start - (i * GameConfig.blockSize);
            div.body.drawView();
            this.game.addChild(div);
        }
    }

    /**
     * Find checkpoints and return the last one before given Z position
     * Used by tutorial
     * @param z - The Z position referenced
     */
    public getLastCheckpointByPosition(z: number): GameEntity | null
    {
        if (!this.checkpoints) return null;
        let selected = null;
        let i = this.checkpoints.length;

        while (i--)
        {
            const cp = this.checkpoints[i];

            if (cp.body.z > z)
            {
                selected = cp;
            }
        }

        return selected || this.checkpoints[0];
    }
}

