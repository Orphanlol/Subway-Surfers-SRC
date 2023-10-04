import { Entity } from '@goodboydigital/odie';

import { GameSystem } from '../GameSystem';

export default class LeaderboardSystem extends GameSystem
{
    constructor(entity: Entity)
    {
        super(entity);
        this.game.onGameover.add(this as any);
    }

    gameover(): void
    {
        console.log('[LeaderboardSystem] onGameover');
    }
}
