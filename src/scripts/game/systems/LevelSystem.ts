import { Entity, Entity3D, Pool, Runner } from '@goodboydigital/odie';

import Game from '../../Game';
import GameConfig from '../../GameConfig';
import Random from '../../utils/Random';
import Chunk from '../data/Chunk';
import Data from '../data/Data';
import GameEntity from '../GameEntity';
import { GameSystem } from '../GameSystem';

/**
 * Fills up the game world with entities and chunks,
 * also responsible for removing passed entities.
 */
export default class LevelSystem extends GameSystem
{
    public entities: GameEntity[];
    public chunks: Chunk[];
    public currentChunk: Chunk | null = null;
    public sequence: string[];
    public queued: string[];
    public nextPosition = 0;

    public onEnterChunk: Runner;
    public onExitChunk: Runner;
    public onEnterTutorial: Runner;
    public onExitTutorial: Runner;

    private preUpdateCount = 10; // Force alternated updates
    private postUpdateCount = 0;
    private chunkPool: Pool<Chunk>;

    constructor(entity: Entity)
    {
        super(entity);
        this.chunkPool = new Pool(Chunk);
        this.entities = [];
        this.chunks = [];
        this.currentChunk = null;
        this.game.onReset.add({ reset: this.reset.bind(this) });
        this.sequence = [];
        this.queued = [];

        this.onEnterChunk = new Runner('onEnterChunk', 1);
        this.onExitChunk = new Runner('onExitChunk', 1);
        this.onEnterTutorial = new Runner('onEnterTutorial');
        this.onExitTutorial = new Runner('onExitTutorial');
    }

    /**
     * Cleanup level elements and set to initial state
     */
    reset(): void
    {
        if (this.currentChunk && this.currentChunk.name.indexOf('intro') >= 0) return;
        this.game.physics.cleanup();
        console.log('[LevelSystem] reset');
        for (const chunk of this.chunks)
        {
            chunk.reset();
            this.chunkPool.return(chunk);
        }
        this.chunks = [];
        this.sequence = [];
        this.queued = [];
        this.nextPosition = 0;

        // Make pre/pos update to alternate - to be better formalised
        this.preUpdateCount = 10;
        this.postUpdateCount = 0;

        this.removeAllEntities();
        this.queueChunk('intro');
    }

    /**
     * Only entities marked as `levelEntity` should be considered by this system
     * @param entity - Entity to check
     */
    public isLevelEntity(entity: Entity): boolean
    {
        return !!(entity as any).levelEntity;
    }

    /**
     * Include eligible entity to the system
     * @param entity - Entity that has been added
     */
    entityAddedToScene(entity: Entity): void
    {
        if (!this.isLevelEntity(entity)) return;
        const index = this.entities.indexOf(entity as GameEntity);

        if (index >= 0) return;
        this._addEntity(entity);
    }

    /**
     * Remove entity from the system
     * @param entity - Entity that has been removed
     */
    entityRemovedFromScene(entity: Entity): void
    {
        if (!this.isLevelEntity(entity)) return;
        const index = this.entities.indexOf(entity as GameEntity);

        if (index < 0) return;
        this._removeEntity(entity);
    }

    /**
     * Add entity to game
     * @param entity - Entity to be placed into the game
     */
    private _addEntity(entity: Entity): void
    {
        if (!this.isLevelEntity(entity)) return;
        this.entities.push(entity as GameEntity);
        (entity as GameEntity).sendMessage('respawn');
    }

    /**
     * Remove existing entity from the game
     * @param entity - Entity to be removed
     * @param i - Index of the entity to be removed
     */
    private _removeEntity(entity: Entity, i?: number): void
    {
        const en = entity as GameEntity;

        if (!this.isLevelEntity(en)) return;
        if (i === undefined) i = this.entities.indexOf(en);
        if (i < 0) return;

        // Remove 'ghosts' that stays on screen for a frame
        en.z = 99999;
        if (en.body) en.body.z = en.z;

        // Remove child from the system and the game
        this.entities.splice(i, 1);
        this.game.removeChild(en);
        this.game.pool.return(entity);
    }

    /**
     * Cleanup passed and removed entities
     */
    public preupdate(): void
    {
        // Hold this to one call each 20 updates
        if (this.preUpdateCount--) return;
        this.preUpdateCount = 20;

        this.removeObsoleteEntities();
    }

    /**
     * Setup and enqueue chunks on demand
     */
    public postupdate(): void
    {
        // Hold this to one call each 20 updates
        if (this.postUpdateCount--) return;
        this.postUpdateCount = 20;

        // retrieve current chunk
        const chunk = this.chunks[this.game.stats.chunkIndex];

        // change current chunk if is a new one
        if (chunk !== this.currentChunk)
        {
            if (this.currentChunk)
            {
                if (this.isTutorial()) this.onExitTutorial.dispatch();
                this.onExitChunk.dispatch(this.currentChunk.name);
            }

            this.currentChunk = chunk;

            if (this.currentChunk)
            {
                // this.currentChunk.triggerEnter();
                this.onEnterChunk.dispatch(this.currentChunk.name);
                if (this.isTutorial()) this.onEnterTutorial.dispatch();
            }
        }

        if (chunk)
        {
            // report current chunk
            this.game.stats.setCurrentChunk(chunk);

            // increase chunk index when current is passed
            if (this.game.stats.distance > chunk.end) this.game.stats.chunkIndex += 1;
        }

        this.placeChunks();
    }

    /**
     * Place as many chunks needed to cover visible area
     */
    public placeChunks(): void
    {
        if (this.queued && this.queued.length)
        {
            let i = this.queued.length;

            while (i--) this.placeNextChunk(this.queued[i]);
            this.queued.length = 0;
        }

        // max chunks to be placed at once, crashes if exceded
        let limit = 16;

        // farthest visible point
        const horizon = this.game.stats.distance + GameConfig.visibleMaxDistance;

        // ensure chunks to cover the visible range
        while (this.nextPosition < horizon && this.game.state === Game.RUNNING)
        {
            // avoid too many calls if something goes wrong
            if (!(limit--)) throw new Error('Too many chunks placed at same time');
            this.placeNextChunk();
        }
    }

    /**
     * Get next chunk data from current sequence and renew current sequence if emtpy
     */
    public nextInSequence(): any
    {
        // Route system will provide a list of chunk names to be added in sequence
        if (!this.sequence.length) this.sequence = this.game.route.getSequence();

        // Next item in current sequence
        const item = this.sequence.shift() as any;

        // Randomise if item is an array of names
        const name = typeof (item) === 'string' ? item : Random.item(item);

        // Find chunk data
        const data = Data.chunk(name);

        return data;
    }

    /**
     * Append chunk data by name to the current chunk data queue
     * @param name - Name of a specific the chunk, or next in the current sequence
     */
    public queueChunk(name?: string): void
    {
        const chunkData = name ? Data.chunk(name) : this.nextInSequence();

        console.log('[LevelSystem] Queued chunk:', chunkData.__name);

        this.queued.push(chunkData.__name);

        this.postUpdateCount = 0;
    }

    /**
     * Queue the tutorial chunk data
     */
    public queueTutorial(): void
    {
        this.sequence = this.game.route.getSequence();

        const chunkData = this.nextInSequence();

        console.log('[LevelSystem] Queued chunk:', chunkData.__name);

        this.queued.push(chunkData.__name);
    }

    /**
     * Mount a chunk in the game, in the next position available
     * @param name - Name of the chunk to be mounted, or mount net in sequence if empty
     */
    public placeNextChunk(name?: string): Chunk | null
    {
        const chunkData = name ? Data.chunk(name) : this.nextInSequence();

        if (!this.game.environment.canSpawn(chunkData)) return null;

        const chunk = this.chunkPool.get();

        console.log('[LevelSystem] place next chunk at:', this.nextPosition, 'name:', chunkData.__name);

        if (!chunkData) throw new Error('Chunk not found');
        chunk.init(this.game, this.nextPosition, chunkData, this.chunks.length);
        this.chunks.push(chunk);
        this.nextPosition += chunk.length;

        return chunk;
    }

    /**
     * Remove passed and/or inactive entities
     */
    public removeObsoleteEntities(): void
    {
        if (this.isTutorial()) return;

        let i = this.entities.length;

        while (i--)
        {
            const entity = this.entities[i];
            const entityZ = entity.body ? entity.body.front : entity.z;
            const removalPoint = this.game.stats.z - GameConfig.visibleMinDistance;
            const elegibleToRemove = !entity.active || entityZ > removalPoint;

            if (elegibleToRemove) this._removeEntity(entity, i);
        }
    }

    /**
     * Remove all placed entities
     */
    public removeAllEntities(list?: Entity3D[]): void
    {
        if (!list) list = this.entities.slice(0);
        console.log('[LevelSystem] RETURN ALL');
        let i = list.length;

        while (i--) this._removeEntity(list[i], i);
    }

    /**
     * Replace all entities on the fly
     */
    public reshuffle(): void
    {
        this.game.route.resetSpawns();
        this.currentChunk = null;
        this.game.physics.cleanup();
        this.removeAllEntities();
        this.nextPosition = this.game.stats.distance - 10;
        this.queueChunk('default_fallback');
        this.queueChunk('default_fallback');
    }

    /**
     * Check if current chunk is tutorial
     */
    public isTutorial(): boolean
    {
        if (!this.currentChunk) return false;

        const isTutorialChunk = this.currentChunk && this.currentChunk.name === 'routeChunk_default_tutorial';

        if (!isTutorialChunk) return false;

        return this.game.stats.distance < this.currentChunk.end - 300;
    }

    /**
     * Replace chunks at position for a safe jetpack landing
     * @param pos - Position z of the scenario where player will land
     */
    public setSafeLanding(pos: number): number
    {
        while (this.nextPosition <= pos) this.placeNextChunk();
        const landingPos = this.nextPosition;

        this.placeNextChunk('jetpack_landing');

        return landingPos;
    }

    /**
     * Remove all entities that are flagged as `removableOnCrash` in a range
     * relative to the player's current z position.
     * @param range - The z length of the removal
     */
    public removeObstacles(range = 600): void
    {
        const list = this.entities.slice(0);

        console.log('[LevelSystem] Remove obstacles in range:', range);
        let i = list.length;

        while (i--)
        {
            const en = list[i];

            if (en.removableOnCrash && en.body.back > this.game.stats.z - range)
            {
                this._removeEntity(en, i);
            }
        }
    }
}
