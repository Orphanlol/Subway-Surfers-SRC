import * as PIXI from 'pixi.js';

export interface SpinnerOpts
{
    radius: number;
    color: number;
}

export default class Spinner extends PIXI.Container
{
    public image:PIXI.Graphics;
    public ticker: PIXI.Ticker;

    constructor(opts: Partial<SpinnerOpts> = {})
    {
        super();
        const o = {
            radius: 32,
            color: 0x000000,
            ...opts,
        };

        this.image = new PIXI.Graphics();
        this.image.lineStyle(o.radius, o.color);
        this.image.arc(0, 0, o.radius * 2, 0, Math.PI * 0.5, true);
        this.addChild(this.image);
        this.image.scale.set(0.5);
        this.image.alpha = 0.25;
        this.visible = false;
        this.ticker = new PIXI.Ticker();
        this.ticker.stop();
        this.ticker.add(this.update, this, 1);
    }

    show(): void
    {
        this.visible = true;
        this.ticker.start();
    }

    hide(): void
    {
        this.visible = false;
        this.ticker.stop();
    }

    update(delta = 0): void
    {
        this.image.rotation += delta * 0.2;
    }
}
