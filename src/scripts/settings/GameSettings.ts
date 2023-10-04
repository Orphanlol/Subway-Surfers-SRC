import { MissionIds } from '../data/missions/MissionData';
import type { CurrencyTypes } from '../shop/Shop';
import DeepStore from '../utils/DeepStore';
import { NicknameGen } from '../utils/NicknameGen';

interface WordHuntSettings
{

    word: string;
    currentLetter: string;
    completed: string[];
}
export class GameSettings extends DeepStore
{
    public name = NicknameGen.generateName();
    public muted = false;
    public tutorial = false;
    public adConsent = false;
    public wordHunt: WordHuntSettings = {
        word: '',
        currentLetter: '',
        completed: [],
    };

    public currencies: Record<CurrencyTypes, number> = {
        coins: 0,
        keys: 5,
    };

    public highscore = 0;
    public missions: {id: MissionIds, progress:number}[][] =
    [

    ];

    public rewardedBreakPrize = 0;

    constructor()
    {
        super('GameSettings');
        this.load();
    }
}
