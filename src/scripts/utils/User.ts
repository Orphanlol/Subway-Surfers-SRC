import { Signal, SignalCallback } from 'signals';

import { MissionIds } from '../data/missions/MissionData';
import type { MysteryBoxPrize } from '../data/mysterybox/MysteryBoxData';
import GameConfig from '../GameConfig';
import { BoardSettings } from '../settings/BoardSettings';
import { CharacterSettings } from '../settings/CharacterSettings';
import { GameSettings } from '../settings/GameSettings';
import { BoostSettings, ShopSettings } from '../settings/ShopSettings';
import { LeaderboardEntryData } from './Poki';

export default class User
{
    public nameSetByUser = false;
    private _score = 0;
    public avatar = 0;

    public gameSettings = new GameSettings();
    public characterSettings = new CharacterSettings();
    public boardSettings = new BoardSettings();
    public shopSettings = new ShopSettings();

    public onCoinsSpent = new Signal();

    constructor()
    {
        if (GameConfig.reset)
        {
            this.gameSettings.storage.clear();
            this.characterSettings.storage.clear();
            this.shopSettings.storage.clear();

            this.gameSettings = new GameSettings();
            this.characterSettings = new CharacterSettings();
            this.shopSettings = new ShopSettings();
        }

        if (GameConfig.modCoins || GameConfig.gdAwardKeys)
        {
            this.coins += Math.round(Number(GameConfig.modCoins));
            this.keys += Math.round(Number(GameConfig.gdAwardKeys));
            if (this.coins < 0) this.coins = 0;
            if (this.keys < 0) this.keys = 0;
            this.save();
        }
    }

    public save(): void
    {
        this.gameSettings.save();
        this.shopSettings.save();
        this.characterSettings.save();
        this.boardSettings.save();
    }

    /** Just redirect the onChange that is being used by some classes in Settings
     * TODO improve this behaviour so that we dispatch more specific events (e.g onUserNameChange)
    */
    public get onGameSettingsChange(): Signal<SignalCallback>
    {
        return this.gameSettings.onChange;
    }

    public get onCharacterSettingsChange(): Signal<SignalCallback>
    {
        return this.characterSettings.onChange;
    }

    get character(): string
    {
        return this.characterSettings.name;
    }

    set character(value: string)
    {
        this.characterSettings.name = value;
    }

    get outfit(): number
    {
        return this.characterSettings.outfit;
    }

    set outfit(value: number)
    {
        this.characterSettings.outfit = value;
    }

    get board(): string
    {
        return this.boardSettings.name;
    }

    set board(value: string)
    {
        this.boardSettings.name = value;
    }

    get boardPowers(): number[]
    {
        return this.boardSettings.powerups;
    }

    set boardPowers(value: number[])
    {
        this.boardSettings.powerups = value;
    }

    get score(): number
    {
        return this._score;
    }

    set score(score: number)
    {
        if (score === this._score) return;

        this._score = score;
        if (score > this.gameSettings.highscore)
        {
            this.gameSettings.highscore = score;
        }
    }

    get highscore(): number
    {
        return this.gameSettings.highscore;
    }

    set highscore(v: number)
    {
        this.gameSettings.highscore = v;
    }

    get name(): string
    {
        return this.gameSettings.name;
    }

    set name(value: string)
    {
        this.gameSettings.name = value;
    }

    get muted(): boolean
    {
        return this.gameSettings.muted;
    }

    set muted(value: boolean)
    {
        if (value === this.muted) return;

        this.gameSettings.muted = value;
    }

    get tutorial(): boolean
    {
        return this.gameSettings.tutorial;
    }

    set tutorial(value: boolean)
    {
        if (value === this.tutorial) return;

        this.gameSettings.tutorial = value;
    }

    get coins(): number
    {
        return this.gameSettings.currencies.coins;
    }

    set coins(value: number)
    {
        const diff = this.gameSettings.currencies.coins - value;

        if (diff > 0)
        {
            this.onCoinsSpent.dispatch(diff);
        }

        this.gameSettings.currencies.coins = value;
    }

    get keys(): number
    {
        return this.gameSettings.currencies.keys;
    }

    set keys(value: number)
    {
        this.gameSettings.currencies.keys = value;
    }

    get boosts(): BoostSettings
    {
        return this.shopSettings.purchased.boosts;
    }

    set currentLetter(letter: string)
    {
        this.gameSettings.wordHunt.currentLetter = letter;
    }

    get currentLetter():string
    {
        return this.gameSettings.wordHunt.currentLetter;
    }

    set completedHunts(completed: string[])
    {
        this.gameSettings.wordHunt.completed = completed;
    }

    get completedHunts():string[]
    {
        return this.gameSettings.wordHunt.completed;
    }

    set huntWord(word: string)
    {
        this.gameSettings.wordHunt.word = word;
    }

    get huntWord():string
    {
        return this.gameSettings.wordHunt.word;
    }

    get leaderboardEntry(): LeaderboardEntryData
    {
        return {
            score: this.score,
            date: 0,
            profile: {
                name: this.name,
                image: this.avatar,
            },
        };
    }

    progressMission(id: MissionIds, progress: number, set: number): void
    {
        let savedMissionsSet = this.gameSettings.missions[set];

        if (!savedMissionsSet)
        {
            savedMissionsSet = [];
            this.gameSettings.missions[set] = savedMissionsSet;
        }
        const sm = savedMissionsSet.find((m) => m.id === id);

        if (!sm) savedMissionsSet.push({ id, progress });
        else sm.progress = progress;

        this.save();
    }

    public openMysteryBox({ type, amount }: MysteryBoxPrize): void
    {
        const consumables = this.shopSettings.purchased.boosts.consumables;

        if (type === 'coins') this.coins += amount;
        else if (type === 'keys') this.keys += amount;
        else if (type === 'hoverboard') consumables.hoverboard += amount;
        else if (type === 'headstart') consumables.headstart += amount;
        else if (type === 'scoreBooster') consumables.scoreBooster += amount;
        else throw new Error(`Invalid prize type: ${type}`);
        this.save();
    }
}
