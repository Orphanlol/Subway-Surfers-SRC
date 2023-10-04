import * as PIXI from 'pixi.js';

import { ButtonOptions } from './Button';
import { LargeButton } from './LargeButton';

export class ShopButton extends LargeButton
{
    public currencyIcon: PIXI.Sprite;

    constructor(opts: Partial<ButtonOptions> = {})
    {
        super(opts);

        this.currencyIcon = PIXI.Sprite.from('icon-coin.png');
        this.currencyIcon.anchor.set(0.5);
        this.addChild(this.currencyIcon);
    }

    public update(opts: Partial<ButtonOptions> = {}): void
    {
        this.setup(opts);
        this.addChild(this.currencyIcon);
        this.currencyIcon.visible = this.label?.id === 'cost';

        const currencyIcons: Record<string, string> = {
            coins: 'icon-coin.png',
            keys: 'icon-key.png',
            coin: 'icon-coin.png',
            key: 'icon-key.png',
        };

        if (this.label)
        {
            const currency = opts.labelParams?.currency ?? 'keys';
            const icon = currencyIcons[currency ?? 'icon-coin.png'];

            this.currencyIcon.texture = PIXI.Texture.from(icon);
            this.currencyIcon.x = (this.label.width / 2) + 15;
            this.label.x = this.currencyIcon.visible ? -15 : 0;
        }
    }

    set state(state: string)
    {
        // TODO implement a state "system"
    }
}
