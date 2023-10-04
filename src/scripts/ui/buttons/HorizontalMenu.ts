import * as PIXI from 'pixi.js';

import { Button } from './Button';

const defaultOptions = {
    spacing: 30,
    anchorX: 0.5,
};

export type HorizontalMenuOptions = typeof defaultOptions;

export class HorizontalMenu<T extends Button = Button> extends PIXI.Container
{
    public options: HorizontalMenuOptions;
    public buttons: T[];
    protected container: PIXI.Container;

    constructor(opts: Partial<HorizontalMenuOptions> = {})
    {
        super();

        this.options = { ...defaultOptions, ...opts };
        this.buttons = [];
        this.container = new PIXI.Container();
        this.addChild(this.container);
    }

    public addButton(btn: T): void
    {
        this.buttons.push(btn);
        this.container.addChild(btn);
        this.organise();
    }

    public organise(): void
    {
        let btnX = 0;

        this.buttons.forEach((btn: any) =>
        {
            if (!btn.visible) return;
            btn.x = btnX + (btn.baseWidth / 2);
            btnX += btn.baseWidth + this.options.spacing;
        });

        this.container.x = -this.container.width * this.options.anchorX;
    }
}
