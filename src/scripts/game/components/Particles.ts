import { PoolSystem, Time } from '@goodboydigital/odie';

import Random from '../../utils/Random';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

const defaultData = {
    EntityClass: null,
    container: null,
    rate: 5,
    spawns: 1,
    life: 30,
    color: null,

    x: 0,
    y: 0,
    z: 0,
    xMod: [0, 0],
    yMod: [0, 0],
    zMod: [0, 0],

    velocityX: 0,
    velocityY: 0,
    velocityZ: 0,
    velocityXMod: [0, 0],
    velocityYMod: [0, 0],
    velocityZMod: [0, 0],

    forceX: 0,
    forceY: 0,
    forceZ: 0,
    forceXMod: [0, 0],
    forceYMod: [0, 0],
    forceZMod: [0, 0],

    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    scaleXMod: [0, 0],
    scaleYMod: [0, 0],
    scaleZMod: [0, 0],

    growX: 0,
    growY: 0,
    growZ: 0,
    growXMod: [0, 0],
    growYMod: [0, 0],
    growZMod: [0, 0],
};

function getParticlesData(partial: Partial<ParticlesData> = {}): ParticlesData
{
    const result: any = {};

    for (const f in defaultData)
    {
        const v = (defaultData as any)[f];
        const p = (partial as any)[f];

        if (Array.isArray(v))
        {
            result[f] = p !== undefined ? p.slice(0) : v.slice(0);
        }
        else
        {
            result[f] = p !== undefined ? p : v;
        }
    }

    return result;
}

export type ParticlesData = typeof defaultData;

export class Particle extends GameComponent
{
    constructor(entity: GameEntity, data: Partial<ParticlesData> = {})
    {
        super(entity);
        this.data = getParticlesData(data);
    }

    spawn(data: Partial<ParticlesData> = {}): void
    {
        this.data = getParticlesData(data);
        this.entity.x = this.data.x + Random.range(this.data.xMod[0], this.data.xMod[1]);
        this.entity.y = this.data.y + Random.range(this.data.yMod[0], this.data.yMod[1]);
        this.entity.z = this.data.z + Random.range(this.data.zMod[0], this.data.zMod[1]);

        this.entity.scale.x = this.data.scaleX + Random.range(this.data.scaleXMod[0], this.data.scaleXMod[1]);
        this.entity.scale.y = this.data.scaleY + Random.range(this.data.scaleYMod[0], this.data.scaleYMod[1]);
        this.entity.scale.z = this.data.scaleZ + Random.range(this.data.scaleZMod[0], this.data.scaleZMod[1]);

        this.data.growX = this.data.growX + Random.range(this.data.growXMod[0], this.data.growXMod[1]);
        this.data.growY = this.data.growY + Random.range(this.data.growYMod[0], this.data.growYMod[1]);
        this.data.growZ = this.data.growZ + Random.range(this.data.growZMod[0], this.data.growZMod[1]);

        this.data.velocityX += Random.range(this.data.velocityXMod[0], this.data.velocityXMod[1]);
        this.data.velocityY += Random.range(this.data.velocityYMod[0], this.data.velocityYMod[1]);
        this.data.velocityZ += Random.range(this.data.velocityZMod[0], this.data.velocityZMod[1]);

        this.data.forceX += Random.range(this.data.forceXMod[0], this.data.forceXMod[1]);
        this.data.forceY += Random.range(this.data.forceYMod[0], this.data.forceYMod[1]);
        this.data.forceZ += Random.range(this.data.forceZMod[0], this.data.forceZMod[1]);
    }

    updateParticle(delta: number): void
    {
        this.data.life -= delta;
        if (this.data.life < 0) this.data.life = 0;

        this.entity.x += this.data.velocityX * delta;
        this.entity.y += this.data.velocityY * delta;
        this.entity.z += this.data.velocityZ * delta;

        this.data.velocityX += this.data.forceX * delta;
        this.data.velocityY += this.data.forceY * delta;
        this.data.velocityZ += this.data.forceZ * delta;

        this.entity.scale.x += this.data.growX * delta;
        this.entity.scale.y += this.data.growY * delta;
        this.entity.scale.z += this.data.growZ * delta;
    }
}

export default class Particles extends GameComponent
{
    public _time = 0;
    public rateCount = 0;
    public list: any[] = [];
    public idle = true;
    public delta = 0;

    private _pool?: PoolSystem;

    constructor(entity: GameEntity, data: Partial<ParticlesData> = {})
    {
        super(entity);
        this.setup(data);
        this._time = 0;
        this.rateCount = 0;
        this.list = [];
        this.idle = true;
        this.delta = 0;
    }

    get time(): number
    {
        return this._time;
    }

    set time(v: number)
    {
        this.idle = v <= 0;
        this._time = v;
    }

    setup(data: Record<string, any>): void
    {
        this.data = getParticlesData(data);
        this.reset();
    }

    reset(): void
    {
        this.list = [];
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (this.idle) return;
        this.delta = delta;
        let i = this.list.length;

        while (i--)
        {
            const particle = this.list[i].particle;

            particle.updateParticle(delta);
            if (particle.data.life <= 0) this.removeParticle(i);
        }
        this.idle = !this.list.length && !this._time;

        if (this._time <= 0) return;
        this._time -= delta;
        if (this._time < 0) this._time = 0;
        this.rateCount -= delta;
        if (this.rateCount <= 0)
        {
            this.spawn(this.data.spawns);
            this.rateCount = this.data.rate;
        }
    }

    run(duration = 9999999): void
    {
        this._time = duration;
        this.rateCount = 0;
        this.idle = false;
    }

    stop(): void
    {
        this._time = 0;
    }

    clear(): void
    {
        this.stop();
        let i = this.list.length;

        while (i--) this.removeParticle(i);
    }

    removeParticle(ref: number): void
    {
        const en = this.list[ref];

        if (!en) return;
        this.list.splice(ref, 1);
        if (en.parent)
        {
            en.parent.removeChild(en);
            this.pool.return(en);
        }
    }

    spawn(amount = 1, data?: Record<string, any>): void
    {
        if (!data) data = this.data as ParticlesData;
        this.idle = false;
        const EntityClass = data.EntityClass;
        const en = this.pool.get(EntityClass, {});

        if (!(en as any).particle) (en as any).particle = en.addComponent(Particle as any);
        (en as any).particle.spawn(data);
        const container = data.container || this.entity.scene;

        container.addChild(en);
        this.list.push(en);
        (en as any).particle.active = true;
        if (amount > 1) this.spawn(amount - 1, data);
    }

    public get pool(): PoolSystem
    {
        if (!this._pool) this._pool = this.entity.scene.getSystem(PoolSystem);

        return this._pool;
    }
}
