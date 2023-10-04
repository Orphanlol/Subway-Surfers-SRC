import { I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import Poki from '../../utils/Poki';
import { Badge } from '../Badge';
import Graph from '../Graph';

type ButtonTapCallback = (...args: any[]) => void;

const defaultOptions = {
    name: '',
    key: '',
    base: null as PIXI.Container | null,
    w: 64,
    h: 64,
    round: 5,
    color: 0xFF0000,
    borderColor: 0xFFFFFF,
    borderWidth: 10,
    icon: '',
    iconX: 0,
    iconY: 0,
    iconTint: -1,
    label: '',
    labelX: 0,
    labelY: 0,
    labelSize: 25,
    labelFont: 'Titan One',
    labelShadow: 0,
    labelShadowColor: 0x000000,
    labelColor: 0xFFFFFF,
    labelParams: {} as Record<string, string | number>,
    onTap: null as ButtonTapCallback | null,
    tintBaseOnPress: true,
};

export type ButtonOptions = typeof defaultOptions;

export class Button extends PIXI.Container
{
    public base?: PIXI.Container;
    public icon?: PIXI.Sprite;
    public label?: I18nLabel;
    public badge?: Badge;

    protected _keyField = 'none';
    protected _key: number | string | null = null;
    protected _onTap?: ButtonTapCallback;
    protected _onKeyDownBind?: any;
    protected _selected = false;
    protected _options: ButtonOptions;
    protected _baseOriginalTint = 0xFFFFFF;
    protected _blockEvents = false;

    constructor(opts: Partial<ButtonOptions> = {})
    {
        super();

        this._options = { ...defaultOptions };

        this.setup(opts);
        if (opts.key) this.key = opts.key;
        this.on('pointertap', this.onPointerTap.bind(this), this);
        this.on('pointerdown', this.onPointerDown.bind(this), this);
        this.on('pointerup', this.onPointerUp.bind(this), this);
        this.on('pointerupoutside', this.onPointerUp.bind(this), this);

        Poki.SDK.onBreakStart.add(() =>
        {
            this._blockEvents = true;
        });
        Poki.SDK.onBreakComplete.add(() =>
        {
            this._blockEvents = false;
        });
    }

    public setup(opts: Partial<ButtonOptions> = {}): void
    {
        this._options = { ...this._options, ...opts };

        this.name = this._options.name;
        this.onTap = this._options.onTap;

        this.updateBase();
        this.updateIcon();
        this.updateLabel();
    }

    protected updateBase(): void
    {
        if (this._options.base instanceof PIXI.Container)
        {
            this.base = this._options.base;
            this.addChild(this._options.base);
        }
        else if (this.base)
        {
            Graph.clear(this.base);
            this.removeChild(this.base);
        }
        else
        {
            this.base = Graph.roundRectBorder(this._options);
            this.addChild(this.base);
        }
    }

    protected updateIcon(): void
    {
        if (this.icon)
        {
            this.removeChild(this.icon);
        }

        if (this._options.icon)
        {
            if (!this.icon) this.icon = new PIXI.Sprite();
            this.icon.texture = PIXI.Texture.from(this._options.icon);
            this.icon.anchor.set(0.5);
            this.icon.x = this._options.iconX;
            this.icon.y = this._options.iconY;
            this.icon.tint = this._options.iconTint >= 0 ? this._options.iconTint : 0xFFFFFF;
            this.addChild(this.icon);
        }
    }

    protected updateLabel(): void
    {
        if (this.label)
        {
            this.removeChild(this.label);
        }

        if (this._options.label)
        {
            if (!this.label)
            {
                this.label = new I18nLabel(this._options.label, {
                    fontFamily: this._options.labelFont,
                    fontSize: this._options.labelSize,
                    anchorX: 0.5,
                    anchorY: 0.5,
                    fill: this._options.labelColor,
                    dropShadow: this._options.labelShadow > 0,
                    dropShadowDistance: this._options.labelShadow,
                    dropShadowColor: this._options.labelShadowColor,
                    params: this._options.labelParams,
                });
            }
            this.label.options.params = this._options.labelParams;
            this.label.x = this._options.labelX;
            this.label.y = this._options.labelY;
            this.label.id = this._options.label;
            this.label.refresh();
            this.addChild(this.label);
        }
    }

    protected onPointerTap(e: PIXI.InteractionEvent): void
    {
        e.data.originalEvent.preventDefault();
        if (this._onTap)
        {
            app.sound.play('gui-tap');
            this._onTap();
        }
    }

    protected onKeyDown(e: KeyboardEvent): void
    {
        if (!this.interactive || !this.visible || !this._key) return;
        if (e.repeat || !this._onTap || this._blockEvents) return;
        if ((e as any)[this._keyField] === this._key) this._onTap();
    }

    public get key(): number | string | null
    {
        return this._key;
    }

    public set key(v: number | string | null)
    {
        this._key = v;
        this._keyField = typeof (v) === 'string' ? 'code' : 'which';
        if (!this._onKeyDownBind) this._onKeyDownBind = this.onKeyDown.bind(this);
        document.removeEventListener('keydown', this._onKeyDownBind);
        if (this._key) document.addEventListener('keydown', this._onKeyDownBind);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public set onTap(v: any)
    {
        this._onTap = v;
        this.enabled = !!v;
    }

    public get onTap(): any
    {
        return this._onTap;
    }

    public set enabled(v: boolean)
    {
        this.interactive = v;
        this.buttonMode = v;
        const a = v ? 1 : 0.5;

        if (this.base) this.base.alpha = a;
    }

    public get enabled(): boolean
    {
        return this.interactive;
    }

    public set selected(v: boolean)
    {
        this._selected = v;
        const c = v ? 0x555555 : 0xFFFFFF;

        if (this.base) (this.base as any).fill.tint = c;
    }

    public get selected(): boolean
    {
        return !!this._selected;
    }

    public get baseWidth(): number
    {
        // eslint-disable-next-line no-nested-ternary
        return this.base ? this.base.width : this._options.w ? this._options.w : 1;
    }

    public get baseHeight(): number
    {
        // eslint-disable-next-line no-nested-ternary
        return this.base ? this.base.height : this._options.h ? this._options.h : 1;
    }

    public tintBase(color: number): void
    {
        if (!this.base) return;
        (this.base as any).tint = color;
    }

    public tintIcon(color: number): void
    {
        if (!this.icon) return;
        this.icon.tint = color;
    }

    protected onPointerDown(): void
    {
        if (!this._options.tintBaseOnPress) return;
        if (this.base instanceof PIXI.DisplayObject) tintTree(this.base, 0xAAAAAA);
    }

    protected onPointerUp(): void
    {
        if (!this._options.tintBaseOnPress) return;
        if (this.base instanceof PIXI.DisplayObject) tintTree(this.base, 0xFFFFFF);
    }

    public showBadge(): void
    {
        if (!this.badge) this.badge = new Badge();
        this.addChild(this.badge);
        this.badge.visible = true;
        this.badge.x = (this.baseWidth / 2) - 10;
        this.badge.y = (-this.baseHeight / 2) + 10;
    }

    public hideBadge(): void
    {
        if (!this.badge) return;
        this.badge.visible = false;
    }
}

function tintTree(display: PIXI.DisplayObject, color: number): void
{
    const target = display as any;

    if (!target) return;
    if (target.tint !== undefined) target.tint = color;
    if (target.children) target.children.forEach((c: PIXI.DisplayObject) => tintTree(c, color));
}
