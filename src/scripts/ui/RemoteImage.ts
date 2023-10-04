import * as PIXI from 'pixi.js';

import Spinner from './Spinner';

export interface RemoteImageOpts
{
    path: string;
    fallback: string;
    w: number;
    h: number;
    bg: number | null;
}

export default class RemoteImage extends PIXI.Container
{
    public bg!: PIXI.Graphics;
    public image: PIXI.Sprite;
    public spinner: Spinner;
    protected _path = '';
    protected _fallback = '';
    protected _failed = false;

    public static cache: Record<string, PIXI.Loader> = {};

    constructor(opts: Partial<RemoteImageOpts> = {})
    {
        super();
        const o: RemoteImageOpts = Object.assign({}, {
            path: '',
            fallback: '',
            w: 0,
            h: 0,
            bg: null,
        });

        if (typeof (opts) === 'string')
        {
            o.path = opts;
        }
        else
        {
            Object.assign(o, opts);
        }

        this._fallback = o.fallback;

        if (o.bg !== null)
        {
            this.bg = new PIXI.Graphics();
            this.bg.beginFill(o.bg);
            this.bg.drawRect(-o.w / 2, -o.h / 2, o.w, o.h);
            this.bg.endFill();
            this.addChildAt(this.bg, 0);
        }

        this.image = new PIXI.Sprite();
        if (o.w) this.image.width = o.w;
        if (o.h) this.image.height = o.h;
        this.addChild(this.image);

        this.spinner = new Spinner();
        this.addChild(this.spinner);

        this.spinner.show();
        if (o.path) this.load(o.path);
    }

    load(path: string): void
    {
        this._path = path;
        this.image.visible = false;
        if (this.spinner) this.spinner.show();
        if (!PIXI.utils.TextureCache[path] || this._failed)
        {
            let loader = RemoteImage.cache[path];

            if (!loader)
            {
                loader = new PIXI.Loader();
                loader.add(path, path);
                RemoteImage.cache[path] = loader;
            }

            loader.onLoad.once(this.onLoadComplete, this);
            loader.onError.once(this.onLoadError, this);
            loader.load();
        }
        else
        {
            this.onLoadComplete();
        }
    }

    onLoadComplete(): void
    {
        this._failed = false;
        this.image.visible = true;
        this.image.texture = PIXI.Texture.from(this._path);
        this.image.anchor.set(0.5);
        if (this.spinner) this.spinner.hide();
    }

    onLoadError(): void
    {
        if (RemoteImage.cache[this._path])
        {
            RemoteImage.cache[this._path].destroy();
            delete RemoteImage.cache[this._path];
        }

        this._failed = true;
        if (this._fallback)
        {
            this.image.visible = true;
            this.image.texture = PIXI.Texture.from(this._fallback);
            this.image.anchor.set(0.5);
        }
        if (this.spinner) this.spinner.hide();
    }
}

