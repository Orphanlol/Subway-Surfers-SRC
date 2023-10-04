import * as PIXI from 'pixi.js';

export class AwardUIKeys extends PIXI.Container
{
    public base: PIXI.Graphics;
    public icon: PIXI.Sprite;
    public label: PIXI.Text;

    constructor(width: number, height: number)
    {
        super();
        this.base = new PIXI.Graphics();
        this.base.beginFill(0x66737f);
        this.base.drawRoundedRect(0, 0, width, height, 10);
        this.addChild(this.base);

        this.label = new PIXI.Text('0', {
            fontFamily: 'Lilita One',
            align: 'right',
            fill: 0xFFFFFF,
            fontSize: 35,
        });
        this.label.anchor.set(1, 0.5);
        this.addChild(this.label);
        this.label.x = width - 50;
        this.label.y = height / 2;

        this.icon = new PIXI.Sprite(PIXI.Texture.from('icon-key.png'));
        this.icon.anchor.set(0.5);
        this.icon.scale.set(0.8);
        this.addChild(this.icon);
        this.icon.x = this.label.x + this.label.width + 3;
        this.icon.y = this.label.y;

        this.amount = 5;
    }

    public get amount(): number
    {
        return Number(this.label.text);
    }

    public set amount(v: number)
    {
        this.label.text = String(v);
    }
}
