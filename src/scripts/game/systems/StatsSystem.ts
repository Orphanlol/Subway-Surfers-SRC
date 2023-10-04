import { Entity } from '@goodboydigital/odie';

import type { MysteryBoxPrize } from '../../data/mysterybox/MysteryBoxData';
import Game from '../../Game';
import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import Math2 from '../../utils/Math2';
import Chunk from '../data/Chunk';
import { GameSystem } from '../GameSystem';

const baseStatsData = {
    x: 0,
    y: 0,
    z: 0,
    distance: 0,
    distanceDelta: 0,
    score: 0,
    coins: 0,
    keys: 0,
    chunkIndex: 0,
    chunkName: '',
    chunkStart: 0,
    chunkEnd: 0,
    chunkLength: 0,
    block: 0,
    multiplier: 1,
    missionMultiplier: 0,
    route: '',
    time: 0,
    delta: 0,
    prizes: [] as MysteryBoxPrize[],
    baseSpeed: {
        min: 110,
        max: 220,
    },
    speedIncrease: {
        min: 0,
        max: 0,
    },
    lerpTime: 0,
};

type StatsData = typeof baseStatsData;

export default class StatsSystem extends GameSystem
{
    protected _profile?: any;
    public data: StatsData;
    protected mysteryBoxTimer = 0;
    protected mysteryBoxTarget = 120;

    constructor(entity: Entity, data: Partial<StatsData> = {})
    {
        super(entity);
        this.game.onReset.add({ reset: this.reset.bind(this) });
        this.data = { ...baseStatsData, ...data };
        this.reset();
    }

    reset(): void
    {
        Object.assign(this.data, baseStatsData);
        this.missionMultiplier = app.data.getMissionMultiplier();
        this.data.prizes = [];
    }

    preupdate(): void
    {
        this.x = this.game.hero.transform.position.x;
        this.y = this.game.hero.transform.position.y - 5.5;
        this.z = this.game.hero.transform.position.z;
    }

    update(): void
    {
        if (this.game.state === Game.RUNNING)
        {
            this.time += this.game.deltaSecs;

            // The fact that the player is being rewarded with more boxes that picked up in game
            // was pointed by one of the feedback items, and seems that this is the cause.
            // Should we re-eanble this?
            // this.mysteryBoxTimer += this.game.deltaSecs;
            // if (this.mysteryBoxTimer >= this.mysteryBoxTarget)
            // {
            //     this.mysteryBoxTimer = 0;
            //     this.setPrizes(awardMysteryBox());
            // }

            this.delta = this.game.deltaSecs;
        }
        else
        {
            this.delta = 0;
        }
    }

    get missionMultiplier(): number
    {
        return this.data.missionMultiplier;
    }

    set missionMultiplier(v: number)
    {
        this.data.missionMultiplier = v;
    }

    get multiplier(): number
    {
        return this.data.multiplier;
    }

    set multiplier(v: number)
    {
        this.data.multiplier = v;
    }

    get x(): number
    {
        return this.data.x;
    }

    set x(v: number)
    {
        this.data.x = v;
    }

    get y(): number
    {
        return this.data.y;
    }

    set y(v: number)
    {
        this.data.y = v;
    }

    get z(): number
    {
        return this.data.z;
    }

    set z(v: number)
    {
        this.data.z = v;
        this.data.distanceDelta = (-v) - this.data.distance;
        this.data.distance = -v;
        this.data.block = (this.data.distance / GameConfig.blockSize) | 0;
        this.data.score += this.data.distanceDelta * (this.multiplier + this.missionMultiplier);
        this.game.missions.setStat(this.score, 'mission-score');
    }

    get distance(): number
    {
        return this.data.distance;
    }

    get distanceDelta(): number
    {
        return this.data.distanceDelta;
    }

    get score(): number
    {
        return Math.floor(this.data.score * 0.1);
    }

    get coins(): number
    {
        return this.data.coins;
    }

    set coins(v: number)
    {
        this.data.coins = v;
    }

    get keys(): number
    {
        return this.data.keys;
    }

    set keys(v: number)
    {
        this.data.keys = v;
    }

    get chunkIndex(): number
    {
        return this.data.chunkIndex;
    }

    set chunkIndex(v: number)
    {
        this.data.chunkIndex = v;
    }

    get speed(): number
    {
        if (GameConfig.speed) return GameConfig.speed;

        // Game time in seconds
        const time = this.data.time;

        // These numbers are coming from Unity project
        const rampUpDuration = 180;
        let min = this.data.baseSpeed.min;
        let max = this.data.baseSpeed.max;

        if (this.data.speedIncrease.min > 0)
        {
            this.data.lerpTime += this.delta;
            min = Math2.lerp(min, min + this.data.speedIncrease.min, this.data.lerpTime);
            max = Math2.lerp(max, max + this.data.speedIncrease.max, this.data.lerpTime);
        }
        else this.data.lerpTime = 0;

        // Returning result, default to max if game time is lower than rampUpDuration
        let result = max;

        // Also this time based speed ramp up is the same as in Unity
        if (time < rampUpDuration)
        {
            const rampUpFactor = time / rampUpDuration;

            result = min + ((max - min) * rampUpFactor);
        }

        // Divide result because game basic time step is in frames
        return result / 60;
    }

    get minSpeed(): number
    {
        const min = this.data.baseSpeed.min + this.data.speedIncrease.min;

        return min / 60;
    }

    get maxSpeed(): number
    {
        const max = this.data.baseSpeed.max + this.data.speedIncrease.max;

        return max / 60;
    }

    get speedRatio(): number
    {
        const diff = this.maxSpeed - this.minSpeed;

        return (this.speed - this.minSpeed) / diff;
    }

    get animationSpeed(): number
    {
        return 0.75 + (this.speedRatio * 0.25);
    }

    get level(): number
    {
        const levelDuration = 20;

        return Math.floor(this.data.time / levelDuration);
    }

    get levelName(): string
    {
        const lvl = this.level;

        switch (lvl)
        {
            case 0:
                return 'easy';
            case 1:
                return 'normal';
            case 2:
                return 'hard';
            default:
                return 'expert';
        }
    }

    get time(): number
    {
        return this.data.time;
    }

    set time(v: number)
    {
        this.data.time = v;
    }

    get delta(): number
    {
        return this.data.delta;
    }

    set delta(v: number)
    {
        this.data.delta = v;
    }

    set route(v: string)
    {
        this.data.route = v;
    }

    get route(): string
    {
        return this.data.route;
    }

    get chunk(): string
    {
        return this.data.chunkName;
    }

    public setPrizes(...v: MysteryBoxPrize[]): void
    {
        this.data.prizes.push(...v);
    }

    public getPrizes(): MysteryBoxPrize[]
    {
        return this.data.prizes;
    }

    setCurrentChunk(chunk: Chunk): void
    {
        this.data.chunkName = chunk.name;
        this.data.chunkStart = chunk.start;
        this.data.chunkEnd = chunk.end;
        this.data.chunkLength = chunk.length;
    }

    toString(): string
    {
        const fields = ['level', 'route', 'chunk'];
        let str = '';

        for (const i in fields)
        {
            const k = fields[i];

            if (k === 'z' || k === 'distance' || k === 'distanceDelta') continue;
            str += `${k}: ${(this as any)[k]}\n`;
        }

        return str;
    }

    get profile(): Record<string, any>
    {
        if (!this._profile) this._profile = {};
        Object.assign(this._profile, this.data);
        this._profile.speed = this.speed;
        this._profile.speedRatio = this.speedRatio;
        this._profile.level = this.level;
        this._profile.levelName = this.levelName;

        return this._profile;
    }
}
