import { app } from '../../SubwaySurfersApp';
import { AwardHandler } from '../AwardHandler';

export class AwardOpenMysteryBoxes extends AwardHandler
{
    public setup(): void
    {
        app.prizeScreen.onOpenPrize.add(this.onOpenPrize, this);
    }

    protected onOpenPrize(boxType: string): void
    {
        if (boxType !== 'mystery-box' && boxType !== 'mini-mystery-box') return;
        this.addProgresValue(1);
    }
}
