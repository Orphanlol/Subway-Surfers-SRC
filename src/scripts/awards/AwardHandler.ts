import { i18n } from '@goodboydigital/astro';

import { app } from '../SubwaySurfersApp';
import { AwardData, AwardProgress, AwardTier, AwardTierNames, AwardTierType } from './AwardData';

export type AwardHandlerCtor = new (id: string, data: AwardData) => AwardHandler;

export class AwardHandler
{
    public id!: string;
    public tiers!: AwardTier[];

    constructor(id: string, data: AwardData)
    {
        this.id = id;
        const mockTier = {
            goal: Infinity,
            reward: 0,
        };

        this.tiers = [
            data.bronze,
            data.silver,
            data.gold,
            data.diamond,
            // If all tiers have been completed we try to access an undefined element in the array.
            // This will make sure that won't happen while sending out data that prevents other function from misbehaving
            mockTier,
        ];
    }

    public setup(): void
    {
        //  For subclasess - called once, when the app starts
    }

    protected afterCollect(): void
    {
        // For subclasses - called after user collect the reward
    }

    public getCurrentGoal(): number
    {
        const progress = this.getProgressData();
        const tier = this.tiers[progress.tier];

        return tier.goal;
    }

    public getCurrentReward(): number
    {
        const progress = this.getProgressData();
        const tier = this.tiers[progress.tier];

        return tier.reward;
    }

    public getCurrentTier(): number
    {
        const progress = this.getProgressData();

        return progress.tier;
    }

    public getProgressData(): AwardProgress
    {
        return app.awards.store.getProgress(this.id);
    }

    public getProgressRatio(): number
    {
        if (this.allTiersCompleted()) return 1;

        const progress = this.getProgressData();
        const tier = this.tiers[progress.tier];

        return Math.min(progress.value, tier.goal) / tier.goal;
    }

    public getProgressValue(): number
    {
        const progress = this.getProgressData();

        return progress.value;
    }

    public setProgresValue(v: number): void
    {
        if (this.isReadyToCollect() || this.allTiersCompleted()) return;

        const progress = this.getProgressData();
        const tier = this.tiers[progress.tier];

        v = Math.min(v, tier.goal);

        if (progress.value !== v)
        {
            progress.value = v;
            app.awards.store.save();
            if (v && this.isReadyToCollect() && !this.allTiersCompleted()) this.showNotification();
        }
    }

    public addProgresValue(v: number): void
    {
        this.setProgresValue(this.getProgressValue() + v);
    }

    public isReadyToCollect(): boolean
    {
        return !this.allTiersCompleted() && this.getProgressRatio() >= 1;
    }

    public collect(): void
    {
        if (this.allTiersCompleted()) return;

        app.awards.awardPlayer(this.getCurrentReward());

        const progress = this.getProgressData();

        progress.value = 0;
        progress.tier += 1;

        app.awards.store.save();
        this.afterCollect();
    }

    public allTiersCompleted(): boolean
    {
        const progress = this.getProgressData();

        return progress.tier === AwardTierType.COMPLETED;
    }

    public showNotification(): void
    {
        app.notification.append({
            text: `${i18n.translate(this.id)}\n${i18n.translate('award-complete')}`,
            icon: `spraycan-big-${AwardTierNames[this.getCurrentTier()]}.png`,
        });
    }
}
