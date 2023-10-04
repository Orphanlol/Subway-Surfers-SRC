import { Entity3D, Runner } from '@goodboydigital/odie';

import GameConfig from '../../GameConfig';
import Box from '../../utils/Box';
import Collision from '../../utils/Collision';
import EntityTools from '../../utils/EntityTools';
import Vector3 from '../../utils/Vector3';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class Body extends GameComponent
{
    public trigger = false;
    public ghost = false;
    public deco = false;
    public movable = false;
    public soft = false;
    public box: Box;
    public origin: Box;
    public velocity: Vector3;
    public sensor: Box | null;
    public ground = 0;
    public groundBefore = 0;
    public groundChangeTolerance = 0;
    public colliding: Body[];
    public triggering: Body[];
    public onCollisionEnter: Runner;
    public onCollisionExit: Runner;
    public onTriggerEnter: Runner;
    public onTriggerExit: Runner;
    public view?: Entity3D;
    public sensorView?: Entity3D;
    public lane = 0;

    constructor(entity: GameEntity, data: any = {})
    {
        super(entity, data);

        // For bodies are only triggers and also can be transpassed
        this.trigger = data.trigger || false;

        // For bodies that are not triggers and also can be transpassed
        this.ghost = data.ghost || false;

        // For bodies that dont have any physics interference
        this.deco = data.deco || false;

        // If body moves or not - skips physics move routine
        this.movable = data.movable || false;

        // Body properties
        this.box = new Box(1, 1, 1);
        this.origin = new Box(1, 1, 1);
        this.velocity = new Vector3();

        this.sensor = data.sensor ? new Box(1.0, 100, 1.0) : null;
        this.ground = 0;
        this.groundBefore = 0;
        this.groundChangeTolerance = 0;

        // Keep track of the colliding and triggers
        this.colliding = [];
        this.triggering = [];

        // Draw view if not in debug mode
        if (GameConfig.blocks && !data.noView) this.drawView();

        this.onCollisionEnter = new Runner('onCollisionEnter', 1);
        this.onCollisionExit = new Runner('onCollisionExit', 1);
        this.onTriggerEnter = new Runner('onTriggerEnter', 1);
        this.onTriggerExit = new Runner('onTriggerExit', 1);

        entity.z = 9999;
    }

    reset(): void
    {
        this.ground = 0;
        this.colliding = [];
        this.triggering = [];
        this.origin.copy(this.box);
        this.velocity.reset();
        this.resetGroundChangeTolerance();
    }

    /**
     * Draw a box view for this body
     */
    drawView(): void
    {
        if (this.view) return;
        if (this.entity.ramp)
        {
            this.view = EntityTools.ramp(this.box, this.data.boxColor, 0.6);
        }
        else
        {
            this.view = EntityTools.box(this.box, this.data.boxColor, 0.6);
        }
        this.entity.addChild(this.view);

        if (this.sensor)
        {
            this.sensorView = EntityTools.box(this.sensor, this.data.boxColor, 0.5);
            this.sensorView.y = -50;
            this.entity.addChild(this.sensorView);
        }
    }

    /**
     * Update entity position with the body position in 3d space
     */
    render(): void
    {
        this.entity.transform.position.x = this.box.center.x;
        this.entity.transform.position.y = this.box.center.y;
        this.entity.transform.position.z = this.box.center.z;

        if (this.view)
        {
            this.view.scale.x = this.box.size.x;
            this.view.scale.y = this.box.size.y;
            this.view.scale.z = this.box.size.z;
        }

        if (!GameConfig.models && this.entity.model)
        {
            this.entity.model.active = false;
        }
    }

    /**
     * Match entity position with body
     */
    matchEntityPosition(): void
    {
        this.entity.x = this.box.center.x;
        this.entity.y = this.box.center.y;
        this.entity.z = this.box.center.z;
    }

    /**
     * Move this body based on current velocity and delta time
     * @param delta - Delta time
     */
    move(delta: number): void
    {
        // saving original position, handy for state and hit evaluation
        this.origin.center.x = this.box.center.x;
        this.origin.center.y = this.box.center.y;
        this.origin.center.z = this.box.center.z;
        this.origin.size.x = this.box.size.x;
        this.origin.size.y = this.box.size.y;
        this.origin.size.z = this.box.size.z;

        // Actually move the body using its velocity
        this.box.center.z += this.velocity.z * delta;
        this.box.center.x += this.velocity.x * delta;
        this.box.center.y += this.velocity.y * delta;

        if (this.box.bottom <= this.ground && !this.ghost)
        {
            this.box.bottom = this.ground;
            this.velocity.y = 0;
        }

        if (this.sensor)
        {
            this.sensor.x = this.box.x;
            this.sensor.y = this.box.y - 50;
            this.sensor.z = this.box.z;
        }

        if (this.groundChangeTolerance)
        {
            this.groundChangeTolerance -= delta;
            if (this.groundChangeTolerance < 0) this.groundChangeTolerance = 0;
        }
    }

    matchPosition(box: Box): void
    {
        this.origin.center.x = box.center.x;
        this.origin.center.y = box.center.y;
        this.origin.center.z = box.center.z;
        this.box.center.x = box.center.x;
        this.box.center.y = box.center.y;
        this.box.center.z = box.center.z;
        if (this.sensor)
        {
            this.sensor.x = box.x;
            this.sensor.y = box.y - 50;
            this.sensor.z = box.z;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    triggerEnter(body: Body, collision?: Collision): void
    {
        console.log('[Body] trigger enter', body.entity.name);
        this.onTriggerEnter.dispatch(body);
        // if (this.entity.player && body.trigger) this.entity.player.onCollisionStart(body);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    triggerExit(body: Body, collision?: Collision): void
    {
        console.log('[Body] trigger exit', body.entity.name);
        this.onTriggerExit.dispatch(body);
        // if (this.entity.player && body.trigger) this.entity.player.onCollisionEnd(body);
    }

    collisionEnter(body: Body, collision: Collision): void
    {
        console.log('[Body] collision enter', body.entity.name);
        if (collision.flags & Collision.LEFT || collision.flags & Collision.RIGHT)
        {
            console.log('[Body] collision enter', 'x axis');
            this.velocity.x = 0;
        }
        if (collision.flags & Collision.TOP || collision.flags & Collision.BOTTOM)
        {
            console.log('[Body] collision enter', 'y axis');
            this.velocity.y = 0;
        }
        if (collision.flags & Collision.FRONT || collision.flags & Collision.BACK)
        {
            console.log('[Body] collision enter', 'z axis', collision.hit.width);

            // Zero velocity only in a full front collision
            if (collision.hit.width > 3.5) this.velocity.z = 0;
        }

        this.onCollisionEnter.dispatch(collision);
    }

    collisionExit(body: Body, collision: Collision): void
    {
        console.log('[Body] collision exit', body.entity.name);
        this.onCollisionExit.dispatch(collision);
    }

    isColliding(body: Body): boolean
    {
        return this.colliding.indexOf(body) >= 0;
    }

    isTrigering(body: Body): boolean
    {
        return this.colliding.indexOf(body) >= 0;
    }

    resetGroundChangeTolerance(): void
    {
        this.groundChangeTolerance = 0;
    }

    get ascending(): boolean
    {
        return this.origin.y < this.box.y;
    }

    get descending(): boolean
    {
        return this.origin.y > this.box.y;
    }

    get hangtime(): boolean
    {
        const range = 0.2;
        const hang = this.velocity.y > -range && this.velocity.y < range;

        return !this.landed && hang;
    }

    get airborne(): boolean
    {
        return !this.landed;
    }

    get stable(): boolean
    {
        return this.origin.y === this.box.y;
    }

    get landed(): boolean
    {
        return this.bottom <= this.ground + 1 && !this.ghost;
    }

    get moving(): boolean
    {
        return this.velocity.x !== 0 || this.velocity.y !== 0 || this.velocity.z !== 0;
    }

    get dodging(): -1 | 1 | 0
    {
        const max = 0.25;
        const vx = this.velocity.x;

        if (vx < -max) return -1;
        if (vx > max) return 1;

        return 0;
    }

    get canJump(): boolean
    {
        return !!this.groundChangeTolerance || this.landed;
    }

    get x(): number
    {
        return this.box.center.x;
    }

    set x(v: number)
    {
        this.box.center.x = v;
    }

    get y(): number
    {
        return this.box.center.y;
    }

    set y(v: number)
    {
        this.box.center.y = v;
    }

    get z(): number
    {
        return this.box.center.z;
    }

    set z(v: number)
    {
        this.box.center.z = v;
    }

    get left(): number
    {
        return this.box.left;
    }

    set left(v: number)
    {
        this.box.left = v;
    }

    get right(): number
    {
        return this.box.right;
    }

    set right(v: number)
    {
        this.box.right = v;
    }

    get top(): number
    {
        return this.box.top;
    }

    set top(v: number)
    {
        this.box.top = v;
    }

    get bottom(): number
    {
        return this.box.bottom;
    }

    set bottom(v: number)
    {
        this.box.bottom = v;
    }

    get front(): number
    {
        return this.box.front;
    }

    set front(v: number)
    {
        this.box.front = v;
    }

    get back(): number
    {
        return this.box.back;
    }

    set back(v: number)
    {
        this.box.back = v;
    }

    get width(): number
    {
        return this.box.size.x;
    }

    set width(v: number)
    {
        this.box.size.x = v;
    }

    get height(): number
    {
        return this.box.size.y;
    }

    set height(v: number)
    {
        this.box.size.y = v;
    }

    get depth(): number
    {
        return this.box.size.z;
    }

    set depth(v: number)
    {
        this.box.size.z = v;
    }

    get center(): Vector3
    {
        return this.box.center;
    }

    get size(): Vector3
    {
        return this.box.size;
    }

    // EXPERIMENTAL -----------------------------------------
    // Velocity-base body positioning
    // Whenever plain position is changed by hand, it could skip
    // necessary physics steps to perform proper collision test

    get phx(): number
    {
        return this.box.center.x;
    }

    set phx(v: number)
    {
        const vel = v - this.box.center.x;

        this.velocity.x = vel;
    }

    get phy(): number
    {
        return this.center.y;
    }

    set phy(v: number)
    {
        const vel = v - this.box.center.y;

        this.velocity.y = vel;
    }

    get phz(): number
    {
        return this.center.z;
    }

    set phz(v: number)
    {
        const vel = v - this.box.center.z;

        this.velocity.z = vel;
    }
}
