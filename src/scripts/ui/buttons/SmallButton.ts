import * as PIXI from 'pixi.js';

import { Button, ButtonOptions } from './Button';

export class SmallButton extends Button
{
    constructor(opts: Partial<ButtonOptions> = {})
    {
        const base = PIXI.Sprite.from('base-item-flat.png');

        base.anchor.set(0.5);
        base.width = 100;
        base.height = 100;

        super({
            w: 100,
            h: 100,
            base,
            ...opts,
        });
    }
}
