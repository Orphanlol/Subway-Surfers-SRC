import * as PIXI from 'pixi.js';

import Game from '../Game';
import Math2 from '../utils/Math2';
import Graph from './Graph';

class ProgressBar extends PIXI.Container
{
    public w = 0;
    public h = 0;
    public barBg: PIXI.Graphics;
    public masked: PIXI.Container;
    public barFill: PIXI.Sprite;
    public barRed: PIXI.Sprite;
    public barMask: PIXI.Sprite;
    protected _ratio = 0;

    constructor(w: number, h: number, bg = 0x000000)
    {
        super();
        this.w = w;
        this.h = h;

        let width = w;
        let height = h;

        this.barBg = new PIXI.Graphics();
        this.barBg.beginFill(bg, 0.75);
        this.barBg.drawRect(0, 0, width, height);
        this.barBg.position.set(-width / 2, -height / 2);
        this.addChild(this.barBg);

        this.masked = new PIXI.Container();
        this.addChild(this.masked);

        width -= 8;
        height -= 8;

        this.barFill = PIXI.Sprite.from('item-duration-full-bar.png');
        this.barFill.x = -width / 2;
        this.barFill.anchor.y = 0.5;
        this.barFill.width = width;
        this.barFill.height = height;
        this.masked.addChild(this.barFill);

        this.barRed = PIXI.Sprite.from('item-duration-full-bar.png');
        this.barRed.x = -width / 2;
        this.barRed.anchor.y = 0.5;
        this.barRed.width = width;
        this.barRed.height = height;
        this.masked.addChild(this.barRed);
        this.barRed.tint = 0xFF0000;

        this.barMask = PIXI.Sprite.from(PIXI.Texture.WHITE);
        this.barMask.width = width;
        this.barMask.height = height + 2;
        this.barMask.anchor.x = 1;
        this.barMask.position.set(width / 2, (-height / 2) - 1);
        this.addChild(this.barMask);

        this._ratio = 1;
        this.update();
    }

    get ratio()
    {
        return this._ratio;
    }

    set ratio(v)
    {
        this._ratio = Math2.clamp(v);
        this.update();
    }

    update()
    {
        this.barMask.width = (1 - this._ratio) * this.w;
        this.barRed.alpha = (1 - this._ratio) * 0.5;
    }
}

export default class ItemTimer extends PIXI.Container
{
    public id: string;
    public game: Game;
    public iconBase: PIXI.Sprite;
    public icon: PIXI.Sprite;
    public bar: ProgressBar;
    public base: PIXI.Container;
    private _amount?: PIXI.Text;

    constructor(game: Game, id: string)
    {
        super();
        this.id = id;
        this.game = game;

        this.iconBase = PIXI.Sprite.from('base-item.png');
        this.iconBase.anchor.set(0.5);
        this.addChild(this.iconBase);

        this.icon = PIXI.Sprite.from(`icon-item-${id.toLowerCase()}.png`);
        this.icon.anchor.set(0.5);
        this.addChild(this.icon);

        this.bar = new ProgressBar(200, 34, 0xFFFFFF);
        this.addChild(this.bar);
        this.bar.x = (this.iconBase.width / 2) + (this.bar.w / 2) + 6;

        this.base = Graph.roundRectBorder({
            w: this.bar.w + 34,
            h: this.bar.h + 16,
            round: 5,
            color: 0xFFFFFF,
            alpha: 1,
            borderWidth: 3,
            borderColor: 0x999999,
        });
        this.addChildAt(this.base, 0);
        this.base.x = this.bar.x - 4;

        this.visible = false;
    }

    get w(): number
    {
        return this.iconBase.width;
    }

    get h(): number
    {
        return this.iconBase.height;
    }

    show(): void
    {
        if (this.visible) return;
        this.visible = true;
        if (this._amount)
        {
            this._amount.text = '0';
            this._amount.visible = false;
        }
    }

    hide(): void
    {
        if (!this.visible) return;
        this.visible = false;
        if (this.parent) this.parent.removeChild(this);
    }

    get ratio(): number
    {
        return this.bar.ratio;
    }

    set ratio(v: number)
    {
        this.bar.ratio = v;
    }

    get amount(): number
    {
        return this._amount ? Number(this._amount.text) : 0;
    }

    set amount(v: number)
    {
        if (!this._amount)
        {
            this._amount = new PIXI.Text(String(v), {
                align: 'right',
                fontFamily: 'Lilita One',
                fontSize: 18,
                dropShadow: true,
                dropShadowDistance: 2,
                dropShadowColor: 0xFFFFFF,
            });
            this._amount.anchor.set(1.0, 1.0);
            this._amount.x = 26;
            this._amount.y = 30;
            this.addChild(this._amount);
        }
        else
        {
            this._amount.text = String(v);
        }

        this._amount.visible = true;
    }
}

