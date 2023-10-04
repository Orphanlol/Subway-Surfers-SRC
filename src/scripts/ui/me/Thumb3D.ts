import { Linear, TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';

import { AnimationOptions } from './ThumbScene3D';

type Thumb3DSelectCallback = (thumb: Thumb3D) => void;

export interface Thumb3DOptions
{
    thumbId: string;
    sceneName: string;
    animData: AnimationOptions;
}
export class Thumb3D extends PIXI.Container
{
    public static scene: any;
    public sprite: PIXI.Sprite;
    public shadow: PIXI.Sprite;
    public thumbId = '';
    protected _onSelect: Thumb3DSelectCallback | null;

    constructor()
    {
        super();
        this._onSelect = null;

        this.shadow = PIXI.Sprite.from('shadow.png');
        this.addChild(this.shadow);
        this.shadow.alpha = 0.3;

        this.sprite = new PIXI.Sprite();
        this.addChild(this.sprite);
        this.on('pointertap', this.onTap.bind(this));
    }

    public deselect(): void
    {
        TweenLite.to(this.scale, 0.15, { x: 0.45, y: 0.45, overwrite: true, ease: Linear.easeInOut });
    }

    protected onTap(): void
    {
        if (this._onSelect) this._onSelect(this);
    }

    public get onSelect(): Thumb3DSelectCallback | null
    {
        return this._onSelect;
    }

    public set onSelect(v: Thumb3DSelectCallback | null)
    {
        this._onSelect = v;
        this.interactive = !!v;
        this.buttonMode = !!v;
    }
}
