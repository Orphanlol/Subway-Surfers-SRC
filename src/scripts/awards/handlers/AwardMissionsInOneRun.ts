import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardMissionsInOneRun extends AwardHandler
{
    private accumulated = 0;

    public setup(): void
    {
        app.nav.onGameplayStart.add(this.onGameplayStart, this);
        app.nav.onGameplayFinish.add(this.onGameplayFinish, this);
        app.game.missions.onCompleteMission.add(this.onCompleteMission, this);
    }

    private onCompleteMission(): void
    {
        this.accumulated += 1;
    }

    private onGameplayStart(): void
    {
        this.accumulated = 0;
    }

    private onGameplayFinish(): void
    {
        if (this.accumulated >= this.getCurrentGoal())
        {
            this.setProgresValue(this.accumulated);
        }
        this.accumulated = 0;
    }
}
