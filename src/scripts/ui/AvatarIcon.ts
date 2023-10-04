import RemoteImage from './RemoteImage';

export interface AvatarIconOpts
{
    image: number,
    color: number,
    border: number,
}

const iconMap = [
    'assets/images/icon-friend.png',
    'assets/images/icon-00-brody.png',
    'assets/images/icon-01-tagbot.png',
    'assets/images/icon-02-tasha.png',
    'assets/images/icon-03-ninja.png',
    'assets/images/icon-04-lucy.png',
    'assets/images/icon-05-king.png',
    'assets/images/icon-06-frizzy.png',
    'assets/images/icon-07-yutani.png',
    'assets/images/icon-08-spike.png',
    'assets/images/icon-09-fresh.png',
    'assets/images/icon-10-jake.png',
    'assets/images/icon-11-tricky.png',
];

export default class AvatarIcon extends RemoteImage
{
    public w: number;
    public h: number;

    constructor(size = 64)
    {
        super({
            w: size,
            h: size,
            bg: 0xFFFFFF,
            path: '',
            fallback: 'thumb-generic.png',
        });
        this.w = size;
        this.h = size;
        this.spinner.scale.set(0.4);
    }

    update(opts: Partial<AvatarIconOpts> = {}): void
    {
        const o = Object.assign({
            image: 0,
            color: 0xFFFFFF,
            border: 4,
        }, opts);

        this.bg.width = this.w;
        this.bg.height = this.h;
        this.image.width = this.w - (o.border * 2);
        this.image.height = this.h - (o.border * 2);
        this.spinner.scale.set(0.4);

        this.load(iconMap[o.image]);
    }
}
