const adjectives = [
    'angry',
    'amazing',
    'ultimate',
    'mysterious',
    'obscure',
    'fancy',
    'funky',
    'skiing',
    'falling',
    'super',
    'sling',
    'rodeo',
    'crazy',
    'rooftop',
    'pointy',
    'rolling',
    'double',
    'virtual',
    'original',
    'total',
    'triple',
    'happy',
    'jelly',
    'magic',
    'interactive',
    'talking',
    'extreme',
    'grippy',
    'loopy',
    'hidden',
    'smart',
    'pixel',
    'real',
    'random',
    'charming',
    'epic',
    'fruity',
    'sweet',
    'mini',
    'giant',
    'tiny',
    'bubbly',
    'little',
];

const noums = [
    'android',
    'boom',
    'beach',
    'station',
    'wolf',
    'glass',
    'banana',
    'train',
    'road',
    'snout',
    'ham',
    'bob',
    'kong',
    'town',
    'subway',
    'iron',
    'slime',
    'king',
    'knight',
    'survival',
    'princess',
    'doctor',
    'hair',
    'zoi',
    'booze',
    'piano',
    'library',
    'party',
    'rogue',
    'chicken',
    'horse',
    'penguin',
    'sloth',
    'geometry',
    'burger',
    'cooking',
    'factory',
    'town',
    'cave',
    'pants',
    'judge',
    'shoe',
    'salon',
    'money',
    'candy',
    'paint',
    'stickman',
    'master',
    'cookie',
    'story',
    'helix',
    'piñata',
    'dragon',
    'ball',
    'picnic',
    'bottle',
    'tower',
    'soda',
    'bullet',
    'hero',
    'sky',
    'guru',
    'news',
    'space',
    'fruit',
    'ninja',
    'samurai',
    'shock',
    'lightning',
    'cowboy',
    'water',
    'bubble',
    'palace',
    'skate',
    'coffee',
    'freeze',
    'ice',
    'vanilla',
    'summer',
    'business',
    'elevator',
    'guitar',
    'room',
    'plant',
    'tree',
    'zombie',
    'pizza',
    'fire',
    'marble',
    'tunnel',
    'fish',
    'snake',
    'desk',
    'phone',
];

function capFirstLetter(str: string): string
{
    return str.charAt(0).toUpperCase() + str.slice(1);
}
export class NicknameGen
{
    static generateName(): string
    {
        return this.randomPick(...adjectives) + this.randomPick(...noums);
    }

    static randomPick(...args: string[]): string
    {
        return capFirstLetter(args[Math.floor(Math.random() * args.length)]);
    }
}
