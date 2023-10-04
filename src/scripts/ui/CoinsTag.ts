import * as PIXI from 'pixi.js';

import Label from './Label';

const defaultOptions = {
    coins: 0,
    align: 'left',
    anchor: 0,
    fill: 0xf6f6f6,
    fontSize: 30,
    fontFamily: 'Lilita One',
    inverse: false,
    dropShadow: true,
    dropShadowDistance: 1,
    icon: 'icon-coin.png',
};

type CoinsTagOptions = typeof defaultOptions;
export class CoinsTag extends PIXI.Container
{
    public label: Label;

    constructor(opts: Partial<CoinsTagOptions> = {})
    {
        super();

        const options = {
            ...defaultOptions,
            ...opts,
        };

        this.label = this.addChild(new Label('0', options));
        this.coins = options.coins;
    }

    get coins(): number { return Number.parseInt(this.label.text, 10); }

    set coins(v: number)
    {
        this.label.text = String(v);
    }
}
