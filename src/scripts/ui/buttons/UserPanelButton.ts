import { Sprite } from 'pixi.js';

import { Button, ButtonOptions } from './Button';

export interface UserButtonOptions extends Partial<ButtonOptions>
{
    bg?: string;
    baseScale?: number;
}
export class UserPanelButton extends Button
{
    constructor(opts: UserButtonOptions = {})
    {
        const base = opts.base || Sprite.from(opts.bg || 'navigation-button-grey.png');

        base.scale.set(opts.baseScale || 0.85, opts.baseScale || 0.9);

        (base as Sprite).anchor?.set(0.5);

        super({
            base,
            color: 0x383838,
            labelSize: 20,
            label: 'menu',
            labelY: 68,
            ...opts,
        });
    }

    setup(opts: UserButtonOptions): void
    {
        const base = opts.base || Sprite.from(opts.bg || 'navigation-button-grey.png');

        (base as Sprite).anchor?.set(0.5);
        opts.base = base;

        if (this.base)
        {
            this.removeChild(this.base);
        }
        super.setup(opts);

        this.onTap = opts.onTap;
    }
}
