import { Time } from '@goodboydigital/odie';

import Game from '../../Game';
import Math2 from '../../utils/Math2';
import Random from '../../utils/Random';
import Vector3 from '../../utils/Vector3';
import GameComponent from '../GameComponent';
import GameEntity from '../GameEntity';

export default class Attractable extends GameComponent
{
    public startPosition: Vector3;
    public endPosition: Vector3;
    public speedX!: number;
    public speedY!: number;
    public speedZ!: number;
    public attracted = false;
    public duration = 0;
    public time = 0;
    public sneakersOnly = false;

    constructor(entity: GameEntity, data = { sneakersOnly: false })
    {
        super(entity, data);
        this.startPosition = new Vector3();
        this.endPosition = new Vector3();
        this.sneakersOnly = data.sneakersOnly;
    }

    respawn(): void
    {
        this.speedX = Random.range(0.001, 0.005);
        this.speedY = Random.range(0.001, 0.005);
        this.speedZ = Random.range(0.001, 0.005);
        this.attracted = false;
        this.entity.body.movable = false;
    }

    update(time: Time): void
    {
        const delta = time.frameTime;

        if (!this.entity.game || !this.entity.active) return;
        const hero = this.entity.game.hero;

        if (this.attracted && this.entity.game.state !== Game.RUNNING)
        {
            this.attracted = false;
            this.entity.active = false;
        }

        if (this.attracted) this.attractionUpdate(delta);

        if (!this.attracted && this.entity.game.state === Game.RUNNING)
        {
            if (hero.magnet.isOn() && !this.sneakersOnly)
            {
                const dist = this.entity.body.center.distance(hero.body.center);

                if (dist < 110) this.attractionStart();
            }
            else if (hero.sneakers.isOn())
            {
                const dx = Math.abs(this.entity.body.x - hero.body.x);
                const dy = hero.body.y - this.entity.body.y;
                const dz = Math.abs(hero.body.z - this.entity.body.z);

                if (hero.body.airborne && dx < 10 && dy > 0 && dy < 50 && dz < 50)
                {
                    this.attractionStart();
                }
            }
        }
    }

    attractionStart(): void
    {
        this.attracted = true;
        if (this.entity.movable) this.entity.movable.reset();
        const hero = this.entity.game.hero;

        this.entity.body.movable = true;
        this.entity.body.ghost = true;
        this.startPosition.x = this.entity.body.x;
        this.startPosition.y = this.entity.body.y;
        this.startPosition.z = this.entity.body.z;
        this.endPosition.x = hero.body.x;
        this.endPosition.y = hero.body.y;
        this.endPosition.z = hero.body.z + hero.body.velocity.z;
        const dist = this.startPosition.distance(this.endPosition);

        this.duration = dist * 0.2;
        if (this.duration < 4) this.duration = 4;
        this.time = 0;
    }

    attractionUpdate(delta: number): void
    {
        const hero = this.entity.game.hero;
        const t = this.time / this.duration;

        this.endPosition.x = hero.body.x;
        this.endPosition.y = hero.body.y;
        this.endPosition.z = hero.body.z + (hero.body.velocity.z * 2);
        Math2.lerpVec3(this.entity.body, this.startPosition, this.endPosition, t * t);
        this.time += delta;

        // if (this.entity.body.z >= hero.body.z + 30) {
        //     this.entity.body.x = hero.body.x;
        //     this.entity.body.y = hero.body.y;
        //     this.entity.body.z = hero.body.z;
        //     this.entity.body.velocity.x = 0;
        //     this.entity.body.velocity.y = 0;
        //     this.entity.body.velocity.z = 0;
        //     this.attracted = false;
        //     this.entity.body.movable = false;
        //     this.entity.body.ghost = false;
        // }
    }
}
