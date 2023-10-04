import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardSuperSneakersMinutes extends AwardHandler
{
    private interval?: any;
    private accumulated = 0;

    public setup(): void
    {
        app.nav.onGameplayStart.add(this.onGameplayStart, this);
        app.nav.onGameplayFinish.add(this.onGameplayFinish, this);
    }

    private onGameplayStart(): void
    {
        this.accumulated = 0;
        clearInterval(this.interval);
        this.interval = setInterval(() => this.update(), 1000);
    }

    private onGameplayFinish(): void
    {
        this.accumulated = 0;
        clearInterval(this.interval);
    }

    private update(): void
    {
        if (!app.game.hero.sneakers.isOn()) return;
        this.accumulated += 1 / 60;
        if (this.accumulated >= this.getCurrentGoal())
        {
            this.setProgresValue(this.accumulated);
            this.accumulated = 0;
        }
    }
}
