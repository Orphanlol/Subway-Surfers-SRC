import * as PIXI from 'pixi.js';

export enum ScreenGlowType
    {
    BLUR,
    BLACK,
}

export default class ScreenGlow extends PIXI.Container
{
    public w = 0;
    public h = 0;
    private bottom?: PIXI.Sprite;
    private top?: PIXI.Sprite;
    private bg?: PIXI.Graphics;

    constructor(type = ScreenGlowType.BLUR)
    {
        super();

        if (type === ScreenGlowType.BLUR)
        {
            this.top = PIXI.Sprite.from('base-blurry.png');
            this.addChild(this.top);
            this.top.anchor.y = 1;
            this.top.scale.y = -1;
            this.top.anchor.x = 0.5;

            this.bottom = PIXI.Sprite.from('base-blurry.png');
            this.addChild(this.bottom);
            this.bottom.anchor.x = 0.5;
            this.bottom.anchor.y = 1;

            this.bg = new PIXI.Graphics();
            this.bg.beginFill(0x000000, 0.5);
            this.bg.drawRect(-8, -8, 16, 16);
            this.bg.endFill();
            this.addChild(this.bg);
        }
        else
        {
            this.bg = new PIXI.Graphics();
            this.bg.beginFill(0x000000, 0.95);
            this.bg.drawRect(-8, -8, 16, 16);
            this.bg.endFill();
            this.addChild(this.bg);
        }
    }

    resize(w = 0, h = 0): void
    {
        this.w = w || this.w;
        this.h = h || this.h;

        if (this.bg)
        {
            this.bg.width = this.w;
            this.bg.height = this.h;
        }

        if (this.top)
        {
            this.top.y = -this.h / 2;
            this.top.width = this.w;
            this.top.height = 230;
        }

        if (this.bottom)
        {
            this.bottom.y = this.h / 2;
            this.bottom.width = this.w;
            this.bottom.height = 230;
        }
    }
}
