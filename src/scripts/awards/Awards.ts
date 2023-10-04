import { Signal } from 'signals';

import { SubwaySurfersApp } from '../SubwaySurfersApp';
import { AwardData } from './AwardData';
import { AwardHandler, AwardHandlerCtor } from './AwardHandler';
import { AwardStore } from './AwardStore';
import { AwardCollectCoinsSingleRun } from './handlers/AwardCollectCoinsSingleRun';
import { AwardCompleteMissions } from './handlers/AwardCompleteMissions';
import { AwardMissionsInOneRun } from './handlers/AwardMissionsInOneRun';
import { AwardOpenMysteryBoxes } from './handlers/AwardOpenMysteryBoxes';
import { AwardOwnBoards } from './handlers/AwardOwnBoards';
import { AwardOwnCharacters } from './handlers/AwardOwnCharacters';
import { AwardOwnOutfits } from './handlers/AwardOwnOutfits';
import { AwardPickupPowerups } from './handlers/AwardPickupPowerups';
import { AwardScoreNoChangeLanes } from './handlers/AwardScoreNoChangeLanes';
import { AwardScoreNoCoins } from './handlers/AwardScoreNoCoins';
import { AwardScoreNoJump } from './handlers/AwardScoreNoJump';
import { AwardSuperSneakersMinutes } from './handlers/AwardSuperSneakersMinutes';

export default class Awards
{
    public app: SubwaySurfersApp;
    public store: AwardStore;
    public handlers!: AwardHandler[];
    public onUpdate = new Signal();
    private initialised = false;

    constructor(app: SubwaySurfersApp)
    {
        this.app = app;
        this.store = new AwardStore();
    }

    public initialise(): void
    {
        if (this.initialised) return;
        this.initialised = true;
        this.handlers = [];
        this.store.load();

        const data = this.app.resources.cache['awards.json'] as Record<string, AwardData>;
        const map: Record<string, AwardHandlerCtor> = {
            'award-complete-missions': AwardCompleteMissions,
            'award-collect-coins-single-run': AwardCollectCoinsSingleRun,
            'award-own-characters': AwardOwnCharacters,
            'award-own-boards': AwardOwnBoards,
            'award-pickup-powerups': AwardPickupPowerups,
            'award-own-outfits': AwardOwnOutfits,
            'award-score-no-coins': AwardScoreNoCoins,
            'award-missions-in-one-run': AwardMissionsInOneRun,
            'award-super-sneakers-minutes': AwardSuperSneakersMinutes,
            'award-open-mystery-boxes': AwardOpenMysteryBoxes,
            'award-score-no-change-lanes': AwardScoreNoChangeLanes,
            'award-score-no-jump': AwardScoreNoJump,
        };

        for (const id in map)
        {
            const handler = new map[id](id, data[id]);

            this.handlers.push(handler);
            handler.setup();
        }

        this.store.onChange.add(() => this.onUpdate.dispatch());
    }

    public hasPrizeToCollect(): boolean
    {
        for (const handler of this.handlers)
        {
            if (handler.isReadyToCollect()) return true;
        }

        return false;
    }

    public awardPlayer(numKeys: number):void
    {
        this.app.prizeScreen.open({ prizes: [{ amount: numKeys, type: 'keys', icon: 'icon-key.png' }] });
        // Await a few seconds to change the number of keys, to coincide with the
        // prize screen animation
        setTimeout(() =>
        {
            this.app.user.gameSettings.currencies.keys += numKeys;
            this.app.user.gameSettings.save();
        }, 2000);
    }
}
