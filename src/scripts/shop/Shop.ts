import { BoardData } from '../data/boards/BoardData';
import type { ConsumableBoost, GenericBoost, PermanentBoost } from '../data/boosts/BoostData';
import type { CharData, OutfitData } from '../data/characters/CharData';
import { app } from '../SubwaySurfersApp';

export type CurrencyTypes = 'coins' | 'keys';

export type ItemTypes = 'characters' | 'outfits' | 'boards' | 'boosts';

// TODO we can probably remove these interfaces
export interface ShopItem
{
    id: string;
    type: ItemTypes;
    currency: CurrencyTypes;
    cost: number;
    purchased?: boolean;
}

interface ShopOutfit extends ShopItem
{
    locked: boolean;
}
export interface ShopCharacter extends ShopItem
{
    outfits: ShopOutfit[];
}

export class Shop
{
    public readonly characters: ShopCharacter[] = [];
    public readonly boards: BoardData[] = [];
    public boosts!: { consumables: ConsumableBoost[], permanents: PermanentBoost[] };
    private onPurchaseFunctions: Partial<Record<ItemTypes, (item: any) => void>>;

    constructor()
    {
        const onCharOutPurchase = (item: ShopItem): void =>
        {
            const character = item as ShopCharacter;

            const type = character.type as 'characters' | 'outfits';

            app.user.shopSettings.purchased[type].push(character.id);
            character.purchased = true;

            character.outfits?.forEach((outfit) => { outfit.locked = false; });
        };

        this.onPurchaseFunctions = {
            characters: onCharOutPurchase,
            outfits: onCharOutPurchase,
            boosts: (item: GenericBoost) =>
            {
                const ownedBoosts = app.user.shopSettings.purchased.boosts;
                const type = item.subType;

                item.upgradeCounter++;
                if (type === 'consumables')
                {
                    const consumable = item as ConsumableBoost;

                    if (consumable.id === 'mysteryBox')
                    {
                        app.game.missions.addStat(1, 'mission-buy-mystery');
                        app.nav.toPrizeScreen();
                    }
                    else ownedBoosts.consumables[consumable.id]++;
                }
                else
                {
                    const permanent = item as PermanentBoost;

                    permanent.cost = permanent.levels[item.upgradeCounter]?.cost || -1;
                    ownedBoosts.permanents[permanent.id]++;
                }
            },
            boards: (board: BoardData) =>
            {
                const ownedBoards = app.user.shopSettings.purchased.boards;

                board.purchased = true;

                board.powerups?.forEach((powerup) =>
                {
                    powerup.locked = false;
                });

                const id = board.boardId ? `${board.boardId}~${board.id}` : board.id;

                ownedBoards.push(id);
            },
        };
    }

    init(): void
    {
        this.setupCharacterData();
        this.setupBoardData();
        this.setupBoostData();
    }

    setupCharacterData(): void
    {
        const charData = app.data.getAvailableCharacters();

        const { characters: ownedCharacters, outfits: ownedOutfits } = app.user.shopSettings.purchased;

        charData.forEach((character) =>
        {
            const characterData: Partial<ShopCharacter> = this.extractCharacterData(character, 'characters');

            characterData.outfits = [];

            const ownedCharacter = ownedCharacters.indexOf((characterData as ShopCharacter).id) >= 0;

            characterData.purchased = ownedCharacter;
            for (let i = 0; i < character.outfits.length; i++)
            {
                const outfit = character.outfits[i];
                const partialOutfit: Partial<ShopOutfit> = this.extractCharacterData(outfit, 'outfits');

                if (!outfit.available) continue;

                partialOutfit.locked = !ownedCharacter;
                const outfitData = partialOutfit as ShopOutfit;

                outfitData.purchased = ownedOutfits.indexOf(outfitData.id) >= 0;
                characterData.outfits.push(outfitData);
            }

            this.characters.push(characterData as ShopCharacter);
        });
    }

    setupBoardData(): void
    {
        const boardData = app.data.getAvailableBoards();
        const ownedBoards = app.user.shopSettings.purchased.boards;

        boardData.forEach((board) =>
        {
            const isBoardOwned = ownedBoards.indexOf(board.id) >= 0;

            board.purchased = isBoardOwned;
            board.type = 'boards';
            for (let i = 0; i < board.powerups.length; i++)
            {
                const powerup = board.powerups[i];

                if (!powerup.available) continue;

                powerup.locked = !isBoardOwned;
                powerup.boardId = board.id;
                powerup.purchased = ownedBoards.indexOf(`${board.id}~${powerup.id}`) >= 0;
                powerup.type = 'boards';
            }
            this.boards.push(board);
        });
    }

    extractCharacterData({ id, cost, currency, purchased }: CharData | OutfitData, type: ItemTypes): ShopItem
    {
        return {
            id,
            currency,
            cost,
            type,
            purchased,
        };
    }

    // TODO consider creating new objects instead of passing the original ones
    setupBoostData(): void
    {
        const allBoosts = app.data.getAvailableBoostsData();
        const permBoostsData = allBoosts.permanents;
        const consBoostsData = allBoosts.consumables;

        this.boosts = {
            consumables: consBoostsData.map((boost) =>
            {
                boost.upgradeCounter = app.user.boosts.consumables[boost.id];
                boost.maxUpgrade = 999;
                boost.type = 'boosts';
                boost.subType = 'consumables';
                boost.description = boost.id === 'mysteryBox' ? '' : `${boost.id}-description`;

                return boost;
            }),
            permanents: permBoostsData.map((boost) =>
            {
                const level = app.user.boosts.permanents[boost.id];

                boost.upgradeCounter = level;
                boost.cost = boost.levels[level]?.cost || -1;
                boost.maxUpgrade = boost.levels.length;
                boost.type = 'boosts';
                boost.subType = 'permanents';
                boost.description = `${boost.id}-description`;

                return boost;
            }),
        };
    }

    async purchase(genericItem: ShopItem): Promise<boolean>
    {
        const success = this.canBuy(genericItem);

        if (success)
        {
            const type = genericItem.type;

            app.user[genericItem.currency] -= genericItem.cost;

            this.onPurchaseFunctions[type]?.(genericItem);

            app.user.save();
        }

        return success;
    }

    private canBuy(item: ShopItem): boolean
    {
        let availableUpgrade = true;

        if (item.type === 'boosts')
        {
            const boost = item as unknown as GenericBoost;

            availableUpgrade = boost.upgradeCounter < boost.maxUpgrade;
        }

        return item.cost <= app.user[item.currency] && availableUpgrade;
    }
}
