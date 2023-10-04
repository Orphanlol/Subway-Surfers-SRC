import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardScoreNoCoins extends AwardHandler
{
    private interval?: any;

    public setup(): void
    {
        app.nav.onGameplayStart.add(this.onGameplayStart, this);
        app.nav.onGameplayFinish.add(this.onGameplayFinish, this);
    }

    private onGameplayStart(): void
    {
        if (!app.user.tutorial) return;
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000);
    }

    private onGameplayFinish(): void
    {
        clearInterval(this.interval);
    }

    private update(): void
    {
        if (app.game.stats.coins)
        {
            clearInterval(this.interval);

            return;
        }
        if (app.game.stats.score >= this.getCurrentGoal())
        {
            this.setProgresValue(this.getCurrentGoal());
        }
    }
}
