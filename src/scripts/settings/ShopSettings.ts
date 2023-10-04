import type { ConsumableBoostIds, PermanentBoostIds } from '../data/boosts/BoostData';
import DeepStore from '../utils/DeepStore';

export interface BoostSettings
{
    consumables: Record<ConsumableBoostIds, number>;
    permanents: Record<PermanentBoostIds, number>
}

interface PurchasedItems
{
    characters: string[];
    outfits: string[];
    boards: string[];
    boosts: BoostSettings;
}

export class ShopSettings extends DeepStore
{
    public purchased:PurchasedItems = {
        characters: [
            'jake',
        ],
        outfits: [],
        boards: [
            'hoverboard',
        ],
        boosts: {
            /** Single use powerups purchased in shop */
            consumables: {
                hoverboard: 3,
                mysteryBox: 0,
                scoreBooster: 0,
                headstart: 0,
            },

            /** Upgrade levels purchased in shop */
            permanents: {
                jetpack: 0,
                sneakers: 0,
                magnet: 0,
                multiplier: 0,
            },
        },
    };

    constructor()
    {
        super('ShopSettings');
        this.load();
    }
}
