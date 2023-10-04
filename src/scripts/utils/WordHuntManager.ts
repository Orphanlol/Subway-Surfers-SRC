import { Signal } from 'signals';

import type {  MysteryBoxType } from '../data/mysterybox/MysteryBoxData';
import { awardMysteryBox } from '../data/mysterybox/MysteryBoxUtil';
import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';
import { encryptProgress, encryptWord, validateCompletedWords, validateProgress } from './Encrypter';

export const allWords = [
    'jake', 'tricky', 'fresh', 'spike', 'yutani', 'kiloo', 'sybo',
    'poki', 'coins', 'keys', 'mission', 'hats', 'guitar', 'stereo',
    'surfer', 'subway', 'magnet', 'pogo', 'ufos', 'run', 'bye'];

export const prizes: (number|MysteryBoxType)[] = [
    'mystery-box',
    'mystery-box',
    1050,
    2100,
    'super-mystery-box',
];

const date1 = new Date('06/28/2021');
const date2 = new Date();
const timeDiff = date2.getTime() - date1.getTime();
const index = ((timeDiff / (1000 * 3600 * 24) | 0) + GameConfig.dayModifier) % allWords.length;

const hunt = allWords[index];
let letter = 0;

export let prizeIndex = 0;
let completed = false;

export function getUTCDay(): number
{
    return ((new Date().getUTCDay() || 7) - 1 + (GameConfig.dayModifier)) % 7;
}

function validateUserData(): void
{
    const user = app.user;
    const todaysWord = encryptWord(hunt);
    const huntIndex = user.completedHunts.indexOf(todaysWord);

    user.completedHunts = validateCompletedWords(user.completedHunts);
    if (todaysWord !== user.huntWord)
    {
        user.huntWord = todaysWord;
        user.currentLetter = '';
        if (getUTCDay() === 0)
        {
            user.completedHunts = [];
        }
    }
    letter = validateProgress(user.currentLetter);
    if (letter === hunt.length && huntIndex < 0)
    {
        user.completedHunts.push(todaysWord);
    }
    // else if (huntIndex >= 0 && letter !== hunt.length)
    // {
    //     user.completedHunts.splice(huntIndex, 1);
    // }
    user.save();
}

export function initWordHunt(): void
{
    validateUserData();

    const isTodayCompleted = app.user.completedHunts.includes(encryptWord(hunt));

    prizeIndex = app.user.completedHunts.length - Number(isTodayCompleted);
    completed = isTodayCompleted;
}

export function getTodaysPrize(): number|MysteryBoxType
{
    return prizes[prizeIndex];
}

export const onWordHuntProgressed = new Signal();
export const onWordHuntCompleted = new Signal();
export function isHuntCompleted():boolean
{
    return completed;
}

export function getWordHuntLetters(): string
{
    return hunt;
}

export function getCurrentLetter(): string
{
    return hunt[letter];
}

export function getCurrentLetterIndex(): number
{
    return letter;
}

export function progressWordHunt(): void
{
    if (completed) return;
    completed = letter + 1 === hunt.length;

    onWordHuntProgressed.dispatch(letter);

    const encrypedtWord = encryptWord(hunt);
    const isTodayCompleted = app.user.completedHunts.includes(encrypedtWord);

    if (completed && !isTodayCompleted)
    {
        const prizeId = getTodaysPrize();

        if (typeof prizeId === 'number') app.user.coins += prizeId;
        else
        {
            app.game.stats.setPrizes(awardMysteryBox(prizeId));
        }
        app.user.completedHunts.push(encrypedtWord);
        onWordHuntCompleted.dispatch();
    }
    letter++;
    app.user.currentLetter = encryptProgress(letter);
    app.user.save();
}
