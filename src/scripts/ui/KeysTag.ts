import * as PIXI from 'pixi.js';

import Label from './Label';

export class KeysTag extends PIXI.Container
{
    public label: Label;

    constructor()
    {
        super();

        this.label = new Label('0', {
            align: 'left',
            anchor: 0,
            fill: 0xf6f6f6,
            fontSize: 30,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 1,
            icon: 'icon-key.png',
        });
        this.addChild(this.label);
    }

    get keys(): number { return Number.parseInt(this.label.text, 10); }
    set keys(v: number)
    {
        this.label.text = String(v);
    }
}
