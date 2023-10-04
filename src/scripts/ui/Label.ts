import * as PIXI from 'pixi.js';

import { app } from '../SubwaySurfersApp';

export interface LabelPreset
{
    align?: string;
    fill?: number;
    fontSize?: number;
    fontFamily?: string;
    lineJoin?: string;
    dropShadow?: boolean;
    dropShadowDistance?: number;
    anchor?: number;
    maxWidth?: number;
    y?: number;
}

const presets: Record<string, LabelPreset> = {
    basic: {
        align: 'center',
        fill: 0xFFFFFF,
        fontSize: 50,
        fontFamily: 'Titan One',
        lineJoin: 'round',
        dropShadow: false,
        dropShadowDistance: 3,
        anchor: 0.5,
        maxWidth: 0,
    },
    title: {
        align: 'center',
        fill: 0x033b71,
        fontSize: 70,
        fontFamily: 'Titan One',
        dropShadow: false,
        dropShadowDistance: 2,
        anchor: 0.5,
    },
    subtitle: {
        align: 'center',
        fill: 0x033b71,
        fontSize: 60,
        fontFamily: 'Titan One',
        dropShadow: false,
        dropShadowDistance: 2,
        anchor: 0.5,
    },
    small: {
        align: 'center',
        fill: 0x033b71,
        fontSize: 50,
        fontFamily: 'Titan One',
    },
};

export default class Label extends PIXI.Container
{
    public _text: PIXI.Text;
    public icon?: PIXI.Sprite;
    public maxWidth?: number;
    public maxHeight?: number;
    public description?: string;
    protected _editable = false;
    protected _prompting = false;
    protected _align = 'center';
    protected inverse = false;

    constructor(text: string, opts: any = 'basic', mods = {})
    {
        super();
        const base = typeof (opts) === 'string' ? presets[opts] : opts;

        opts = Object.assign({}, presets.basic, base, mods);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (opts.i18n) text = app.i18n.t(opts.i18n);

        if (opts.align) this._align = opts.align;
        this._text = new PIXI.Text(text, opts);
        this._text.anchor.set(opts.anchor, 0.5);
        this.addChild(this._text);
        if (opts.anchorX !== undefined) this._text.anchor.x = opts.anchorX;
        if (opts.anchorY !== undefined) this._text.anchor.y = opts.anchorY;
        if (opts.x) this.x = opts.x;
        if (opts.y) this.y = opts.y;
        if (opts.maxWidth) this.maxWidth = opts.maxWidth;

        if (opts.icon)
        {
            this.icon = PIXI.Sprite.from(opts.icon);
            this.icon.anchor.set(0.5);
            this.addChild(this.icon);
            this.icon.x = 0;
            this.inverse = !!opts.inverse;
            this.refresh();
        }
    }

    get text(): string
    {
        return this._text.text;
    }

    set text(v: string)
    {
        if (this._text.text === v) return;
        this._text.text = String(v);
        this.refresh();
    }

    refresh(): void
    {
        if (this.maxWidth && this._text.width > this.maxWidth)
        {
            this._text.scale.x = 1;
            this._text.width = this.maxWidth;
            this._text.scale.y = this._text.scale.x;
        }
        if (!this.icon) return;
        this._text.x = 0;

        if (this._align !== 'left')
        {
            this.icon.x = this._text.x - (this._text.width * 0.5) - (this.icon.width * 0.5) - 5;
            if (this.inverse) this.icon.x = this._text.x + (this._text.width) + (this.icon.width * 0.5);
            const diff = (this.width - this._text.width) * 0.5;

            this.icon.x += diff;
            this._text.x += diff;
        }
        else
        {
            this.icon.x = 0;
            this._text.x = (this.icon.width * 0.5) + 3;
        }
    }

    get editable(): boolean
    {
        return !!this._editable;
    }

    set editable(v: boolean)
    {
        this._editable = v;
        this.interactive = v;
        this.buttonMode = v;
        if (this.description === undefined) this.description = 'Set text';
        const onOrOff = this._editable ? 'on' : 'off';

        this[onOrOff]('pointertap', this.prompt, this);
    }

    prompt(): void
    {
        if (this._prompting) return;
        this._prompting = true;
        const text = (window as any).prompt(this.description, this.text);

        if (text) this.text = text;
        this._prompting = false;
        this.emit('change', this.text);
    }
}
