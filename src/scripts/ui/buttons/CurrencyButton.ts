import * as PIXI from 'pixi.js';

import Graph from '../Graph';
import { Button, ButtonOptions } from './Button';

export class CurrencyButton extends Button
{
    protected _value: PIXI.Text;

    constructor(opts: Partial<ButtonOptions> = {})
    {
        const w = opts.w || 172;
        const h = opts.h || 64;
        const color = 0x41972a;
        const base = Graph.rectComp(
            { w: w + 24, h: h + 26, image: 'box-border-grey.png', x: 5, y: 6 },
            { w, h, color, round: 12 },
        );

        super({
            base,
            icon: 'icon-coin.png',
            color,
            ...opts,
        });

        this._value = new PIXI.Text('99', {
            align: 'center',
            fontFamily: 'Lilita One',
            fill: 0xFFFFFF,
            fontSize: opts.labelSize || 35,
            dropShadow: true,
            dropShadowDistance: 3,
            dropShadowAlpha: 0.25,
        });
        this._value.anchor.set(0.5);
        this.addChild(this._value);
    }

    public get value(): number
    {
        return Number(this._value.text);
    }

    public set value(v: number)
    {
        this._value.text = String(v);
        this.update();
    }

    private update(opts: Partial<ButtonOptions> = {}): void
    {
        this.setup(opts);

        if (this.icon)
        {
            this.icon.scale.set(0.75);
            this._value.x = this.icon.visible ? 18 : 0;
            this.icon.x = -(this._value.width / 2) - 5;
        }
        this.addChild(this._value);
        this._value.y = 2;
    }
}
