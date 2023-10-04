import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardPickupPowerups extends AwardHandler
{
    public setup(): void
    {
        app.game.onPickupPowerup.add(() => this.update());
    }

    private update(): void
    {
        this.addProgresValue(1);
    }
}
