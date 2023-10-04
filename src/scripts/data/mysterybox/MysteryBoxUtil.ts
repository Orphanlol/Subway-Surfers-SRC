import { randomRange } from '@goodboydigital/odie';
import { Chance } from 'chance';

import { app } from '../../SubwaySurfersApp';
import miniPrizesJson from './mini-mystery-box-notoken.json';
import { MysteryBoxPrize, MysteryBoxType, RawMysteryBoxPrize } from './MysteryBoxData';
import prizesJson from './normal-mystery-box-notoken.json';
import superPrizesJson from './super-mystery-box-notoken.json';

const miniPrizes = miniPrizesJson as RawMysteryBoxPrize[];
const prizes = prizesJson as RawMysteryBoxPrize[];
const superPrizes = superPrizesJson as RawMysteryBoxPrize[];
const chanceInstance = new Chance();

const miniChances = miniPrizes.map((p) => p.chance);
const chances = prizes.map((p) => p.chance);
const superChances = superPrizes.map((p) => p.chance);

function getMiniMysteryBoxPrize(): MysteryBoxPrize
{
    const { type, amount: rawAmount } = chanceInstance.weighted(miniPrizes, miniChances);
    const amount = typeof rawAmount === 'number' ? rawAmount : randomRange(rawAmount[0], rawAmount[1] + 1, true);

    return { type, amount, boxType: 'mini-mystery-box' };
}

function getMysteryBoxPrize(): MysteryBoxPrize
{
    const { type, amount: rawAmount } = chanceInstance.weighted(prizes, chances);
    const amount = typeof rawAmount === 'number' ? rawAmount : randomRange(rawAmount[0], rawAmount[1] + 1, true);

    return { type, amount, boxType: 'mystery-box' };
}

function getSuperMysteryBoxPrize(): MysteryBoxPrize
{
    const { type, amount: rawAmount } = chanceInstance.weighted(superPrizes, superChances);
    const amount = typeof rawAmount === 'number' ? rawAmount : randomRange(rawAmount[0], rawAmount[1] + 1, true);

    return { type, amount, boxType: 'super-mystery-box' };
}

export function awardMysteryBox(type: MysteryBoxType = 'mystery-box'): MysteryBoxPrize
{
    let prize = getMysteryBoxPrize();

    if (type === 'mini-mystery-box')
    {
        prize = getMiniMysteryBoxPrize();
    }
    else if (type === 'super-mystery-box')
    {
        prize = getSuperMysteryBoxPrize();
    }

    if (prize.type === 'coins') app.game.missions.addStat(prize.amount, 'mission-coins-mystery');

    // This function has been moved to PrizeScreen - double check if that would not cause trouble
    // app.user.openMysteryBox(prize);

    return prize;
}

