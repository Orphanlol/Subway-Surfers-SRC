import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardScoreNoChangeLanes extends AwardHandler
{
    private interval?: any;

    public setup(): void
    {
        app.nav.onGameplayStart.add(this.onGameplayStart, this);
        app.nav.onGameplayFinish.add(this.onGameplayFinish, this);
        app.game.hero.lane.onLaneChanged.add(this as any);
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

    protected update(): void
    {
        if (app.game.stats.score >= this.getCurrentGoal())
        {
            this.setProgresValue(this.getCurrentGoal());
            clearInterval(this.interval);
        }
    }

    protected onLaneChanged(): void
    {
        clearInterval(this.interval);
    }
}
