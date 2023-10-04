import { Entity } from '@goodboydigital/odie';

import Game from '../../Game';
import GameConfig from '../../GameConfig';
import Box from '../../utils/Box';
import Collision from '../../utils/Collision';
import Math2 from '../../utils/Math2';
import GameEntity from '../GameEntity';
import { GameSystem } from '../GameSystem';

export default class PhysicsSystem extends GameSystem
{
    public collision: Collision;
    public stats: any = {};
    public entities: any[] =[];
    public _hasReset = false;

    constructor(entity: Entity)
    {
        super(entity);
        this.collision = new Collision();
        this.game.onReset.add(this as any);
        this.cleanup();
    }

    /**
     * Cleanup physics elements
     */
    cleanup(): void
    {
        this.stats = {};
        this.entities = [];
        this._hasReset = true;
    }

    /**
     * Includes eligible entity to the physics system
     * @param entity - Entity to be included in physics
     */
    entityAddedToScene(entity: GameEntity): void
    {
        // Skip non-body and decoration entities
        if (!entity.body || entity.body.deco || entity.player) return;
        const index = this.entities.indexOf(entity);

        if (index >= 0) return;
        this.entities.push(entity);
    }

    /**
     * Remove entity from  physics system
     * @param entity - ENtity to be removed from physics
     */
    entityRemovedFromScene(entity: GameEntity): void
    {
        // Skip non-body and decoration entities
        if (!entity.body || entity.body.deco || entity.player) return;
        const index = this.entities.indexOf(entity);

        if (index < 0) return;
        this.entities.splice(index, 1);
    }

    /**
     * Move bodies and resolve collisions
     */
    postupdate(): void
    {
        const delta = this.game.delta;
        const hero = this.game.hero;

        // Only update if game is not idle
        if (this.game.state !== Game.RUNNING && !hero.player.dead) return;

        // Reset main body ground
        if (!hero.player.dead)
        {
            hero.body.groundBefore = hero.body.ground;
            hero.body.ground = 0;
        }

        // define minimum steps based on current delta
        const baseSteps = Math.ceil(delta) + GameConfig.physicsExtraSteps;

        // absolute z velocity
        const absvz = Math.ceil(Math.abs(hero.body.velocity.z * GameConfig.physicsStepsPerSpeed));

        // num of steps to execute
        const steps = Math2.clamp(baseSteps + absvz, 1, GameConfig.physicsMaxSteps);

        // delta of each step
        const stepsDelta = delta / steps;

        // update stats (for debugging)
        if (GameConfig.debug)
        {
            this.stats.delta = delta;
            this.stats.steps = steps;
            this.stats.stepsDelta = stepsDelta;
            this.stats.bodies = this.entities.length;
            this.stats.collidables = 0;
        }

        // Execute physics steps
        let i = steps;

        while (i--)
        {
            if (this._hasReset) break;
            // Move hero first
            hero.body.move(stepsDelta);
            let j = this.entities.length;

            while (j--)
            {
                const other = this.entities[j];

                if (!other || !other.active || other === hero) continue;

                // Move other entities
                if (other.body.movable) other.body.move(stepsDelta);

                // Break the loop if has been reset
                if (this._hasReset) break;

                // Check objject position relative to hero position and skip if too far
                if (other.body.back < hero.body.z - 6) continue; // too far;
                if (other.body.front > hero.body.z + 3) continue; // passed;
                if (other.body.top < hero.body.y - 10) continue; // too far down;
                if (other.body.right < hero.body.x - 5) continue; // too far left;
                if (other.body.left > hero.body.x + 5) continue; // too far right;

                if (this.game.state !== Game.RUNNING) break; // Game not running
                if (hero.player.dead) break; // Hero is dead

                // INLINING RESOLVE PROCEDURES FOR PERFORMANCE
                // Physics step can run several times in a single frame,
                // reducing a bit function calls can save some performance

                // Increase collidable count if debugging
                if (GameConfig.debug) this.stats.collidables += 1;

                // Test regular collision, resolve only if other is not a trigger
                const hit = hero.body.box.hitTest(other.body.box);

                if (hit && !other.body.trigger)
                {
                    this.resolveHit(hero, other, hit);
                }

                // If hero has a ground sensor we should test and evaluate it
                if (hero.body.sensor && !other.body.ghost && !other.body.trigger)
                {
                    const sensorHit = hero.body.sensor.hitTest(other.body.box);

                    if (sensorHit) this.resolveGroundSensorHit(hero, other, sensorHit);
                }

                // Update body collision, for triggers
                if (other.body.trigger)
                {
                    const index = hero.body.colliding.indexOf(other.body);

                    // No hit but body was on colliding list - remove
                    if (!hit && index >= 0)
                    {
                        hero.body.colliding.splice(index, 1);
                        hero.body.triggerExit(other.body);
                    }

                    // Hit & body not on colliding list - add
                    if (hit && index < 0)
                    {
                        hero.body.colliding.push(other.body);
                        hero.body.triggerEnter(other.body);
                    }
                }
            }
        }

        if (hero.body.ground < hero.body.groundBefore)
        {
            hero.body.groundChangeTolerance = 8;
        }

        this._hasReset = false;
    }

    /**
     * Check and resolve collisions for given entity
     * @param target - The active entity, usually the player
     */
    resolve(target: GameEntity): void
    {
        if (this.isHeroDead()) return;

        let i = this.entities.length;

        while (i--)
        {
            const other = this.entities[i];

            if (!other) continue;
            if (!other.active) continue;
            if (other.body.back < target.body.z - 10) continue; // too far;
            if (other.body.front > target.body.z + 5) continue; // passed;

            if (GameConfig.debug) this.stats.collidables += 1;

            // Test regular collision, resolve only if other is not a trigger
            const hit = target.body.box.hitTest(other.body.box);

            if (hit && !other.body.trigger)
            {
                this.resolveHit(target, other, hit);
            }

            // Update body collision, for triggers
            if (other.body.trigger)
            {
                const index = target.body.colliding.indexOf(other.body);

                if (!hit && index >= 0)
                {
                    target.body.colliding.splice(index, 1);
                    target.body.triggerExit(other.body);
                }

                if (hit && index < 0)
                {
                    target.body.colliding.push(other.body);
                    target.body.triggerEnter(other.body);
                }
            }
        }
    }

    /**
     * Resolve collision between active and passive entities
     * @param target - Active entity (usually the player)
     * @param entity - Passive entity (usually everythong else)
     * @param hit - Hit intersection box
     */
    resolveHit(target: GameEntity, other: GameEntity, hit: Box): void
    {
        if (this.isHeroDead()) return;

        // lazy collectible evaluation
        if (other.collectible)
        {
            other.collectible.collect(target);

            return;
        }

        if (target.body.ghost) return;

        // offset to avoid "permanent contact" collision
        // system could be improved in order to get rid of this
        const off = 0.2;
        const act = target.body;
        const pas = other.body;

        // reseting collision object
        this.collision.reset();
        this.collision.act = act;
        this.collision.pas = pas;
        this.collision.hit.copy(hit);

        // ramps are tricky, skip resolution if inside one
        if (other.ramp)
        {
            const inside = act.right >= pas.left && act.left <= pas.right;

            if (inside) return;
        }

        // resolving regular collisions using original positions
        // might be enough for high speed or low frame rates
        // to be better tested
        const pasHitBox = pas.movable ? pas.origin : pas.box;

        if (act.y > pas.top && hit.height <= 6 && act.velocity.y > -1)
        {
            // Let's consider it "slope" hit
            act.bottom = pas.top + off;
            this.collision.flags = this.collision.flags | Collision.BOTTOM;
            if (hit.height > 2) this.collision.flags = this.collision.flags | Collision.SLOPE;
            act.matchPosition(act.box);
        }
        else if (act.origin.bottom > pasHitBox.top)
        {
            act.bottom = pas.top + off;
            this.collision.flags = this.collision.flags | Collision.BOTTOM;
            act.matchPosition(act.box);
        }
        else if (act.origin.left >= pasHitBox.right)
        {
            act.box.left = pas.box.right + off;
            this.collision.flags = this.collision.flags | Collision.LEFT;
            act.matchPosition(act.box);
        }
        else if (act.origin.right <= pasHitBox.left)
        {
            act.box.right = pas.box.left - off;
            this.collision.flags = this.collision.flags | Collision.RIGHT;
            act.matchPosition(act.box);
        }
        else if (act.origin.top < pasHitBox.bottom)
        {
            act.box.top = pas.box.bottom - off;
            this.collision.flags = this.collision.flags | Collision.TOP;
            act.matchPosition(act.box);
        }
        else if (act.origin.front <= pasHitBox.back)
        {
            act.box.front = pas.box.back + off;
            this.collision.flags = this.collision.flags | Collision.FRONT;
            act.matchPosition(act.box);
        }

        // Tells active body about the collision
        if (this.collision.flags) act.collisionEnter(pas, this.collision);
    }

    /**
     * Ground sensor hit evaluation
     * @param target - Active entity (usually the player)
     * @param entity - Ground entity
     * @param hit - Hit box
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resolveGroundSensorHit(target: GameEntity, entity: GameEntity, hit?: Box): void
    {
        if (this.isHeroDead()) return;

        if (target.body.ghost)
        {
            target.body.ground = 0;

            return;
        }
        const bodyA = target.body;
        const bodyB = entity.body;

        const off = 0.11;
        let ground = bodyA.ground;

        if (entity.ramp)
        {
            const height = bodyB.box.size.y;
            const depth = bodyB.box.size.z;
            const ratio = (bodyB.back - bodyA.front) / depth;
            const y = height * ratio;

            ground = y + off;
        }
        else
        {
            ground = bodyB.top + off;
        }

        if (ground >= bodyA.ground)
        {
            bodyA.ground = ground;
        }
    }

    canUpdate(): boolean
    {
        return this.game.state === Game.RUNNING;
    }

    isHeroDead(): boolean
    {
        return this.game.hero.player.dead;
    }
}
