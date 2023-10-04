import * as PIXI from 'pixi.js';

import { Button, ButtonOptions } from './Button';

export class CloseButton extends Button
{
    constructor(opts: Partial<ButtonOptions> = {})
    {
        const base = PIXI.Sprite.from('btn-close.png');

        base.anchor.set(0.5);

        super({
            w: 86,
            h: 86,
            base,
            ...opts,
        });
    }
}
