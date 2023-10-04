import { Entity } from '@goodboydigital/odie';

import Game from '../../Game';
import { isHuntCompleted, onWordHuntCompleted } from '../../utils/WordHuntManager';
import Pickup, { PickupLetter, PickupMysteryBox } from '../entities/Pickup';
import { GameSystem } from '../GameSystem';

interface TimedPickup
{
    type: string;
    Class: typeof Pickup;
    timer: number;
    targetTime: number;
}
export class PickupSystem extends GameSystem
{
    private letters = 0;
    public static DEFAULT_NAME = 'pickup';
    private timedPickups:TimedPickup[] = [
        {
            type: 'mysteryBox',
            Class: PickupMysteryBox,
            timer: 0,
            targetTime: 180,
        },
    ];

    constructor(entity: Entity)
    {
        super(entity);

        if (!isHuntCompleted())
        {
            const letterPickup = {
                type: 'letter',
                Class: PickupLetter,
                timer: 20,
                targetTime: 20,
            };

            this.timedPickups.unshift(letterPickup);
            onWordHuntCompleted.addOnce(() =>
            {
                this.timedPickups.splice(this.timedPickups.indexOf(letterPickup), 1);
            });
        }
    }

    protected update(): void
    {
        if (this.game.state === Game.RUNNING)
        {
            for (const key in this.timedPickups)
            {
                this.timedPickups[key].timer += this.game.deltaSecs;
            }
        }
    }

    entityAddedToScene(entity: Pickup): void
    {
        if (entity.type === 'letter')
        {
            this.letters++;
        }
    }

    entityRemovedFromScene(entity: Pickup): void
    {
        if (entity.type === 'letter')
        {
            this.letters--;
        }
    }

    public getNextPickup(): typeof Pickup|null
    {
        this.timedPickups.sort((a, b) => b.timer - a.timer);
        for (const key in this.timedPickups)
        {
            const tp = this.timedPickups[key];

            if (tp.timer >= tp.targetTime && this.letters === 0)
            {
                tp.timer = 0;

                return tp.Class;
            }
        }

        return null;
    }
}
