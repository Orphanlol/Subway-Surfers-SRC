import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardOwnOutfits extends AwardHandler
{
    public setup(): void
    {
        app.user.shopSettings.onChange.add(() => this.update());
        this.update();
    }

    protected afterCollect(): void
    {
        this.update();
    }

    private update(): void
    {
        const owned = app.user.shopSettings.purchased.outfits.length - 1;

        this.setProgresValue(owned);
    }
}
