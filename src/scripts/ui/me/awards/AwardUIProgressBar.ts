import * as PIXI from 'pixi.js';

export class AwardUIProgressBar extends PIXI.Container
{
    public base: PIXI.Graphics;
    public fill: PIXI.Graphics;
    public label: PIXI.Text;

    constructor(width: number, height: number)
    {
        super();
        this.base = new PIXI.Graphics();
        this.base.beginFill(0xf8ebc8);
        this.base.drawRect(0, 0, width, height);
        this.addChild(this.base);

        this.fill = new PIXI.Graphics();
        this.fill.beginFill(0xf5be41);
        this.fill.drawRect(0, 0, width, height);
        this.addChild(this.fill);

        this.label = new PIXI.Text('99%', {
            fontFamily: 'Lilita One',
            align: 'center',
            fill: 0x1a5c8d,
            fontSize: 30,
        });
        this.label.anchor.set(0.5);
        this.addChild(this.label);
        this.label.x = width / 2;
        this.label.y = height / 2;

        this.ratio = 1;
    }

    public get ratio(): number
    {
        return this.fill.scale.x;
    }

    public set ratio(v: number)
    {
        if (v < 0) v = 0;
        if (v > 1) v = 1;
        this.fill.scale.x = v;
        this.label.text = `${Math.round(v * 100)}%`;
    }
}
