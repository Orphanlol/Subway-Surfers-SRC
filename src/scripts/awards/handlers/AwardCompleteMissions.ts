import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardCompleteMissions extends AwardHandler
{
    public setup(): void
    {
        app.game.missions.onCompleteMission.add(this.onCompleteMission, this);
    }

    private onCompleteMission(): void
    {
        this.addProgresValue(1);
    }
}
