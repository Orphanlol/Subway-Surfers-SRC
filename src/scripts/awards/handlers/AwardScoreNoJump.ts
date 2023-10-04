import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardScoreNoJump extends AwardHandler
{
    private interval?: any;

    public setup(): void
    {
        app.nav.onGameplayStart.add(this.onGameplayStart, this);
        app.nav.onGameplayFinish.add(this.onGameplayFinish, this);
        app.game.hero.jump.onJump.add(this as any);
        app.game.hero.roll.onStart.add(this as any);
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

    protected onJump(): void
    {
        clearInterval(this.interval);
    }

    protected onRollStart(): void
    {
        clearInterval(this.interval);
    }
}
