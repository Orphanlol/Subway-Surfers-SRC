import Game from '../../Game';
import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardCollectCoinsSingleRun extends AwardHandler
{
    public setup(): void
    {
        app.nav.onGameplayFinish.add(this.onGameplayFinish, this);
    }

    private onGameplayFinish(): void
    {
        const progress = this.getProgressData();
        const tier = this.tiers[progress.tier];

        if (app.game.state === Game.GAMEOVER && app.game.stats.coins === tier.goal)
        {
            this.setProgresValue(tier.goal);
        }
    }
}
