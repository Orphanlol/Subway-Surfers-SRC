import GameConfig from '../GameConfig';
import { allWords, getUTCDay } from './WordHuntManager';

const today = getUTCDay();
const numberEncryptMap = ['8', '0', '4', '2', '1', '3', '9', '5', '7', '6'];

const charEncryptMap: {[key: string]:string} = {
    a: '~t0',
    b: '9%/',
    c: '!J6',
    d: 'Y~g',
    e: '0d(',
    f: 'w*/',
    g: '&hu',
    h: 'ZHD',
    i: 'Ud8',
    j: 'OVp',
    k: '!gb',
    l: '^Vj',
    m: '26/',
    n: 'w1?',
    o: 'DGO',
    p: '-Oj',
    q: 'Gq-',
    r: '&m5',
    s: 'r@8',
    t: '$z=',
    u: 'wO=',
    v: 'lXK',
    w: 'Mgz',
    x: '@PM',
    y: '@wc',
    z: 'S/-',
};

const charDecryptMap: {[key: string]:string} = {
    '0d(': 'e',
    '9%/': 'b',
    '26/': 'm',
    '!J6': 'c',
    '!gb': 'k',
    '$z=': 't',
    '&hu': 'g',
    '&m5': 'r',
    '-Oj': 'p',
    '@PM': 'x',
    '@wc': 'y',
    DGO: 'o',
    'Gq-': 'q',
    Mgz: 'w',
    OVp: 'j',
    'S/-': 'z',
    Ud8: 'i',
    'Y~g': 'd',
    ZHD: 'h',
    '^Vj': 'l',
    lXK: 'v',
    'r@8': 's',
    'w1?': 'n',
    'w*/': 'f',
    'wO=': 'u',
    '~t0': 'a',
};

function getUTCTime():number
{
    const d = new Date();
    const utcToday = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + GameConfig.dayModifier);

    return utcToday.getTime();
}

function encryptDate():string
{
    const string = `${getUTCTime()}`;
    let encryptedString = '';

    for (let i = 0; i < string.length; i++)
    {
        const e = string[i];

        encryptedString += `${numberEncryptMap.indexOf(e)}`;
    }

    return encryptedString;
}

function decryptDate(string:string):number
{
    let decryptedString = '';

    for (let i = 0; i < string.length; i++)
    {
        const e = string[i];

        decryptedString += `${numberEncryptMap[parseInt(e, 10)]}`;
    }

    return parseInt(decryptedString, 10);
}

export function encryptProgress(progress: number): string
{
    const encryptedDate = encryptDate();
    const encryptedProgress = encryptedDate.substring(0, today) + progress
    + encryptedDate.substring(today);

    return encryptedProgress;
}

export function validateProgress(progress: string): number
{
    const tmp = progress.split('');
    const storedProgress = parseInt(tmp.splice(today, 1)[0], 10);

    progress = tmp.join('');
    const date = decryptDate(progress);

    return getUTCTime() === date ? storedProgress : 0;
}

export function encryptWord(string:string): string
{
    let encryptedString = '';

    for (let i = 0; i < string.length; i++)
    {
        encryptedString += charEncryptMap[string[i]];
    }

    return encryptedString;
}

export function decryptWord(string:string): string
{
    let decryptedString = '';

    for (let i = 0; i < string.length; i += 3)
    {
        decryptedString += charDecryptMap[string.substr(i, 3)];
    }

    return decryptedString;
}

export function validateCompletedWords(strings:string[]): string[]
{
    const validStrings: string[] = [];
    const isValidWord = (word: string) =>
        allWords.indexOf(word) >= 0;

    for (let i = 0; i < strings.length; i++)
    {
        const s = strings[i];
        let valid = typeof s === 'string';

        valid = valid && isValidWord(decryptWord(s));

        if (valid) validStrings.push(s);
    }

    return validStrings;
}

