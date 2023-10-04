import GameConfig from '../GameConfig';
import { prepareCharacters } from '../getManifest';
import { app } from '../SubwaySurfersApp';
import type { BoardData } from './boards/BoardData';
import boardsJson from './boards/boards.json';
import type {  ConsumableBoost, PermanentBoost } from './boosts/BoostData';
import consumableBoosts from './boosts/consumable-boosts.json';
import permanentBoosts from './boosts/permanent-boosts.json';
import charactersJson from './characters/characters.json';
import type { CharData } from './characters/CharData';
import { MissionData } from './missions/MissionData';
import missionsJson from './missions/missions.json';

const characters = charactersJson as CharData[];
const boards = boardsJson as BoardData[];
const rawMissions = missionsJson as MissionData[];
const missions: MissionData[][] = [];

/**
 * Organises all data for the app and make them accessible
 */
export class AppData
{
    constructor()
    {
        // Modify manifest to put each character in its own manifest
        prepareCharacters(...this.getAvailableCharactersIds());

        // Reset outfit if cached does not exist or became unavailable
        if (app.user.character)
        {
            const isCachedCharAvailable = this.isCharacterAvailable(app.user.character, app.user.outfit);

            if (!isCachedCharAvailable)
            {
                app.user.character = 'jake';
                app.user.outfit = 0;
            }
        }

        this.prepareMissions();
    }

    /**
     * Retrieve a list of boards marked as available
     * @returns Available boards ids
     */
    public getAvailableBoardsIds(): string[]
    {
        return boardsJson.filter((board) => board.available).map((board) => board.id);
    }

    /**
     * Retrieve a list of characters marked as available
     * @returns Available characters ids
     */
    public getAvailableCharactersIds(): string[]
    {
        const available = [] as string[];

        for (const data of characters)
        {
            if (data.available) available.push(data.id);
        }

        return available;
    }

    /**
     * Retrieve a single character, by id
     * @param name - Id of a charcter
     * @returns Character data with give id
     */
    public getCharData(name: string): CharData | null
    {
        for (const data of characters)
        {
            if (data.id === name)
            {
                return data;
            }
        }

        return null;
    }

    /**
     * Retrieve a single character, by id
     * @param name - Id of a charcter
     * @returns Character data with give id
     */
    public getBoardData(name: string): BoardData | null
    {
        for (const data of boards)
        {
            if (data.id === name)
            {
                return data;
            }
        }

        return null;
    }

    /**
     * Check if a character is available
     * @param name - Characte name
     * @param outfit - Characte outfit
     * @returns True if character with given outfit is available
     */
    public isCharacterAvailable(name: string, outfit = 0): boolean
    {
        for (const data of characters)
        {
            if (data.id === name)
            {
                if (outfit <= 0)
                {
                    return !!data.available;
                }

                return !!data.available && !!data.outfits[outfit - 1]?.available;
            }
        }

        return false;
    }

    /**
     * Retrieve a data list of available characters
     * @returns List of character data that are marked as available
     */
    public getAvailableCharacters(): CharData[]
    {
        return characters.filter((char) => char.available);
    }

    /**
     * Retrieve a data list of available boards
     * @returns List of board data that are marked as available
     */
    public getAvailableBoards(): BoardData[]
    {
        return boards.filter((board) => board.available);
    }

    // ===== MISSIONS ===========================================================================================================
    /**
     * Retrieve a data list of available characters
     * @returns List of character data that are marked as available
     */
    public prepareMissions(): void
    {
        for (let i = 0; i < rawMissions.length; i += 3)
        {
            missions.push(rawMissions.slice(i, i + 3));
        }

        // TODO Debug remove -------------------------------
        if (GameConfig.missionSet >= 0)
        {
            const missionSets = this.getAvailableMissions();
            const set = Math.min(missionSets.length - 1, GameConfig.missionSet);

            const missionToSave = missionSets.slice(0, set).map((ms) => ms.map((m) => ({ id: m.id, progress: m.progress })));

            missionToSave.forEach((ms, i) => ms.forEach((m, k) =>
            {
                m.progress = i !== set - 1 ? missionSets[i][k].params.amount : 0;
            }));

            app.user.gameSettings.missions = missionToSave;
            app.user.save();
        }
        // --------------------------------------------------

        const savedMissions = app.user.gameSettings.missions;

        for (let i = 0; i < missions.length; i++)
        {
            missions[i].forEach((m) =>
            {
                const sm = savedMissions[i]?.find((sm) => sm.id === m.id);

                m.progress = Math.min(sm?.progress || 0, m.params.amount);
                m.completed = m.progress === m.params.amount;
                m.set = i;
            });
        }

        // TODO Debug remove -------------------------------
        if (GameConfig.missionProgress.length)
        {
            app.user.gameSettings.missions[this.getMissionSet()][0].progress = GameConfig.missionProgress[0] || 0;
            app.user.gameSettings.missions[this.getMissionSet()][1].progress = GameConfig.missionProgress[1] || 0;
            app.user.gameSettings.missions[this.getMissionSet()][2].progress = GameConfig.missionProgress[2] || 0;
            for (let i = 0; i < missions.length; i++)
            {
                missions[i].forEach((m) =>
                {
                    const sm = savedMissions[i]?.find((sm) => sm.id === m.id);

                    m.progress = Math.min(sm?.progress || 0, m.params.amount);
                    m.completed = m.progress === m.params.amount;
                    m.set = i;
                });
            }
            app.user.save();
        }
        // --------------------------------------------------
    }

    /**
     * Retrieve all missions sets
     */
    public getAvailableMissions(): MissionData[][]
    {
        return missions;
    }

    /**
     * Retrieve the current missions set
     */
    public getCurrentMissions(): MissionData[]
    {
        return missions[this.getMissionSet()];
    }

    /**
     * Get the current set number of the looping missions
     */
    public getMissionSet(): number
    {
        return Math.min(this.getMissionMultiplier(), missions.length - 1);
    }

    /**
     * Get the current mission multiplier
     */
    public getMissionMultiplier(): number
    {
        let multiplier = 0;

        for (let i = 0; i < missions.length; i++)
        {
            const missionSet = missions[i];

            if (!missionSet[0].completed || !missionSet[1].completed || !missionSet[2].completed) break;
            multiplier++;
        }

        return multiplier;
    }

    // ===== BOOSTS =============================================================================================================
    /**
     * Retrieve an object with a list for available consumable boosts
     * and available permanent boosts;
     * @returns Object containing a list for both consumable and permanent boosts
     */
    public getAvailableBoostsData(): {consumables:ConsumableBoost[], permanents: PermanentBoost[]}
    {
        return {
            permanents: (permanentBoosts as PermanentBoost[]).filter((boost) => boost.available),
            consumables: (consumableBoosts as ConsumableBoost[]).filter((boost) => boost.available),
        };
    }
}
