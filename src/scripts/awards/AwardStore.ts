import Store from '../utils/Store';
import { AwardProgress } from './AwardData';

export class AwardStore extends Store
{
    public progress: Record<string, AwardProgress> = {};

    constructor()
    {
        super('Awards');
    }

    public getProgress(id: string): AwardProgress
    {
        if (!this.progress[id]) this.progress[id] = { tier: 0, value: 0 };

        return this.progress[id];
    }
}
