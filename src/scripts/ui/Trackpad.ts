import { DoubleSpring } from '@goodboydigital/odie';
import { Container, DisplayObject, InteractionEvent } from 'pixi.js';

export interface TrackpadOptions
{
    snapTo?: boolean;
    yScrollMax?: number;
    yScrollMin?: number;
    xScrollMax?: number;
    xScrollMin?: number;
    capMovement?: boolean;
    size?: number;
    springiness?: number;
    damp?: number;
    target?: DisplayObject;
    maxSlots?: number;
}

export class Trackpad extends Container
{
    public size: number;
    public maxSlots: number;
    public capMovement: boolean;
    public snapTo: boolean;
    public dragging: boolean;
    public mouseOver = false;
    public locked = false;

    public xEasing: number;
    public xDragOffset: number;
    public xSpeed: number;
    public prevPosition: number;
    public xScrollMin: number;
    public xScrollMax: number;
    protected xCheck = 0;
    protected xMoved: boolean;

    public yEasing: number;
    public yDragOffset: number;
    public ySpeed: number;
    public prevPositionY: number;
    public yScrollMin: number;
    public yScrollMax: number;
    protected yCheck = 0;
    protected yMoved: boolean;

    protected spring: DoubleSpring;

    public targetX: number;
    public targetY: number;

    constructor(options: TrackpadOptions)
    {
        super();

        this.spring = new DoubleSpring();
        this.spring.springiness = options.springiness || 0;
        this.spring.damp = options.damp || 0;

        this.size = options.size || 1024;
        this.maxSlots = options.maxSlots || 25;
        this.dragging = false;
        this.snapTo = options.snapTo || false;
        this.capMovement = options.capMovement || true;

        this.targetX = options.xScrollMin || 0;
        this.xEasing = 0;
        this.xDragOffset = 0;
        this.xSpeed = 0;
        this.prevPosition = 0;
        this.xScrollMin = options.xScrollMin || -Infinity;
        this.xScrollMax = options.xScrollMax || 0;
        this.xMoved = false;
        this.yMoved = false;

        this.targetY = options.yScrollMin || 0;
        this.yEasing = 0;
        this.yDragOffset = 0;
        this.ySpeed = 0;
        this.prevPositionY = 0;
        this.yScrollMin = options.yScrollMin || -Infinity;
        this.yScrollMax = options.yScrollMax || 0;

        const target = options.target || this;

        target.interactive = true;
        target.on('pointerdown', (e: InteractionEvent) => this.onDown(e));
        target.on('pointerup', () => this.onUp());
        target.on('pointerupoutside', () => this.onUp());
        target.on('touchcancel', () => this.onUp());
        target.on('pointermove', (e: InteractionEvent) => this.onMove(e));
        target.on('pointerover', () => { this.mouseOver = true; });
        target.on('pointerout', () => { this.mouseOver = false; });
        window.addEventListener('wheel', this.onMouseWheel, { passive: false });
    }

    unlock(): void
    {
        if (this.locked)
        {
            this.locked = false;
            this.xSpeed = 0;
            this.xEasing = this.targetX;
            this.yEasing = this.targetY;
            this.xSpeed = 0;
            this.ySpeed = 0;
        }
    }

    lock(): void
    {
        this.locked = true;
    }

    update(): void
    {
        this.targetX += (this.xEasing - this.targetX) * 0.3;
        this.targetY += (this.yEasing - this.targetY) * 0.3;

        if (this.locked)
        {
            return;
        }

        if (this.dragging)
        {
            let newSpeed = this.xEasing - this.prevPosition;

            newSpeed *= 0.7;

            this.xSpeed += (newSpeed - this.xSpeed) * 0.5;
            this.prevPosition = this.xEasing;

            let newSpeedY = this.yEasing - this.prevPositionY;

            newSpeedY *= 0.7;

            this.ySpeed += (newSpeedY - this.ySpeed) * 0.5;
            this.prevPositionY = this.yEasing;
        }
        else if (this.snapTo)
        {
            this.spring.update();
            this.xEasing = this.spring.x;
            this.yEasing = this.spring.y;

            if (this.capMovement)
            {
                if (this.xEasing > this.xScrollMax)
                {
                    this.xEasing += (this.xScrollMax - this.xEasing) * 0.3;
                }
                else if (this.xEasing < this.xScrollMin)
                {
                    this.xEasing += (this.xScrollMin - this.xEasing) * 0.3;
                }

                if (this.yEasing > this.yScrollMax)
                {
                    this.yEasing += (this.yScrollMax - this.yEasing) * 0.3;
                }
                else if (this.yEasing < this.yScrollMin)
                {
                    this.yEasing += (this.yScrollMin - this.yEasing) * 0.3;
                }
            }
        }
        else
        {
            this.xSpeed *= this.spring.damp;

            this.xEasing += this.xSpeed;

            this.ySpeed *= 0.95;
            this.yEasing += this.ySpeed;

            if (this.capMovement)
            {
                if (this.xEasing > this.xScrollMax)
                {
                    this.xEasing += (this.xScrollMax - this.xEasing) * 0.3;
                }
                else if (this.xEasing < this.xScrollMin)
                {
                    this.xEasing += (this.xScrollMin - this.xEasing) * 0.3;
                }

                if (this.yEasing > this.yScrollMax)
                {
                    this.yEasing += (this.yScrollMax - this.yEasing) * 0.3;
                }
                else if (this.yEasing < this.yScrollMin)
                {
                    this.yEasing += (this.yScrollMin - this.yEasing) * 0.3;
                }
            }
        }
    }

    stop(): void
    {
        this.xSpeed = 0;
        this.ySpeed = 0;

        this.targetX = this.prevPosition = this.xEasing;
        this.targetY = this.prevPositionY = this.yEasing;
    }

    setPosition(value: number, valueY: number): void
    {
        this.targetX = this.xEasing = value;
        this.targetY = this.yEasing = valueY;
    }

    easeToPosition(value: number, valueY: number): void
    {
        this.xEasing = value;
        this.yEasing = valueY;
    }

    onDown = (e: InteractionEvent): void =>
    {
        if (this.locked) return;

        this.xSpeed = 0;
        this.ySpeed = 0;

        this.stop();

        this.xMoved = false;
        this.yMoved = false;
        this.xCheck = e.data.global.x;
        this.yCheck = e.data.global.y;

        this.dragging = true;
        this.xDragOffset = e.data.global.x - this.targetX;
        this.yDragOffset = e.data.global.y - this.targetY;
    };

    onMouseWheel = (event: WheelEvent): void =>
    {
        if (!this.interactive || !this.mouseOver) return;

        if (event.preventDefault)
        {
            event.preventDefault();
        }
        else
        {
            event.returnValue = false;
        }

        if (this.locked)
        {
            return;
        }

        this.xSpeed = event.deltaX * 0.15;
        this.ySpeed = -event.deltaY * 0.15;
    };

    onUp = (): void =>
    {
        if (this.locked) return;

        this.dragging = false;

        if (this.snapTo)
        {
            let target;

            if (this.xMoved)
            {
                this.spring.dx = this.xSpeed;

                if (this.xSpeed < 0)
                {
                    target = Math.floor(this.xEasing / this.size);
                }
                else
                {
                    target = Math.ceil(this.xEasing / this.size);
                }

                if (this.capMovement)
                {
                    if (target > 0)
                    {
                        target = 0;
                    }
                    else if (target < -this.maxSlots)
                    {
                        target = -this.maxSlots;
                    }
                }

                this.spring.tx = target * this.size;

                // / do y!
            }
            if (this.yMoved)
            {
                this.spring.dy = this.ySpeed;

                if (this.ySpeed < 0)
                {
                    target = Math.floor(this.yEasing / this.size);
                }
                else
                {
                    target = Math.ceil(this.yEasing / this.size);
                }
                if (this.capMovement)
                {
                    if (target > 0)
                    {
                        target = 0;
                    }
                    else if (target < -this.maxSlots)
                    {
                        target = -this.maxSlots;
                    }
                }

                this.spring.ty = target * this.size;
            }

            this.spring.x = this.xEasing;
            this.spring.y = this.yEasing;
        }

        this.cap();
    };

    cap(): void
    {
        if (!this.capMovement) return;

        if (this.snapTo)
        {
            if (this.spring.tx > this.xScrollMax)
            {
                this.spring.tx = this.xScrollMax;
            }
            else if (this.spring.tx < this.xScrollMin)
            {
                this.spring.tx = this.xScrollMin;
            }
        }

        if (this.snapTo)
        {
            if (this.spring.ty > this.yScrollMax)
            {
                this.spring.ty = this.yScrollMax;
            }
            else if (this.spring.ty < this.yScrollMin)
            {
                this.spring.ty = this.yScrollMin;
            }
        }
    }

    onMove = (event: InteractionEvent): void =>
    {
        if (this.locked || !this.dragging) return;

        let dist;

        dist = Math.abs(this.xCheck - event.data.global.x);
        if (dist > 10)
        {
            this.xMoved = true;
        }

        dist = Math.abs(this.yCheck - event.data.global.y);
        if (dist > 10)
        {
            this.yMoved = true;
        }

        this.xEasing = (event.data.global.x - this.xDragOffset);
        this.yEasing = (event.data.global.y - this.yDragOffset);

        if (this.capMovement)
        {
            if (this.xEasing > this.xScrollMax)
            {
                this.xEasing = this.xScrollMax + ((this.xEasing - this.xScrollMax) * 0.3);
            }
            else if (this.xEasing < this.xScrollMin)
            {
                this.xEasing = this.xScrollMin + ((this.xEasing - this.xScrollMin) * 0.3);
            }

            if (this.yEasing > this.yScrollMax)
            {
                this.yEasing = this.yScrollMax + ((this.yEasing - this.yScrollMax) * 0.3);
            }
            else if (this.yEasing < this.yScrollMin)
            {
                this.yEasing = this.yScrollMin + ((this.yEasing - this.yScrollMin) * 0.3);
            }
        }
    };
}
