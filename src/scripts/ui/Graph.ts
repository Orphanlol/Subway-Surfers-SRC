import * as PIXI from 'pixi.js';

export interface RectColorOpts
{
    name: string;
    w: number;
    h: number;
    x: number;
    y: number;
    round: number;
    alpha: number;
    color: number;
}

export interface RectImgOpts
{
    name: string;
    w: number;
    h: number;
    x: number;
    y: number;
    l: number;
    t: number;
    r: number;
    b: number;
    image: string;
}

export default class Graph
{
    /**
     * Create a rectangle based on given options
     */
    static rect(opts: Partial<RectColorOpts | RectImgOpts>): PIXI.NineSlicePlane | PIXI.Graphics
    {
        if ((opts as RectImgOpts).image)
        {
            return this.rectImg(opts);
        }

        return this.rectColor(opts);
    }

    /**
     * Creates a rectangle graphic
     */
    static rectColor(opts: Partial<RectColorOpts> = {}): PIXI.Graphics
    {
        const defaultOpts = {
            name: 'rectColor',
            w: 120,
            h: 120,
            x: 0,
            y: 0,
            round: 0,
            alpha: 1,
            color: 0x3187be,
        };
        const o = { ...defaultOpts, ...opts };
        const rect = new PIXI.Graphics();

        rect.beginFill(o.color, o.alpha);
        const x = (-o.w / 2) + o.x;
        const y = (-o.h / 2) + o.y;

        if (o.round)
        {
            rect.drawRoundedRect(x, y, o.w, o.h, o.round);
        }
        else
        {
            rect.drawRect(x, y, o.w, o.h);
        }
        rect.endFill();

        return rect;
    }

    /**
     * Creates a 9-sliced image
     */
    static rectImg(opts: Partial<RectImgOpts> = {}): PIXI.NineSlicePlane
    {
        const o = {
            name: 'rectImg',
            w: 120,
            h: 120,
            x: 0,
            y: 0,
            l: 15,
            t: 15,
            r: 25,
            b: 25,
            image: 'box-border-grey.png',
            ...opts,
        };

        const texture = PIXI.Texture.from(o.image);
        const img = new PIXI.NineSlicePlane(texture, o.l, o.t, o.r, o.b);

        img.width = o.w;
        img.height = o.h;
        img.x = (-o.w * 0.5) + o.x;
        img.y = (-o.h * 0.5) + o.y;

        return img;
    }

    /**
     * Create composed rectangles in a single container
     */
    static rectComp(...opts: any[]): PIXI.Container
    {
        const rect = new PIXI.Container();

        for (const o of opts)
        {
            const layer = this.rect(o);

            (rect as any)[o.name] = layer;
            rect.addChild(layer);
        }

        return rect;
    }

    static roundRectBorder(opts = {}): PIXI.Container
    {
        const defaultOpts = {
            w: 120,
            h: 120,
            round: 5,
            color: 0x3187be,
            alpha: 1,
            borderWidth: 12,
            borderColor: 0xFFFFFF,
        };

        const o = Object.assign(defaultOpts, opts);
        const fill = Object.assign({ name: 'fill' }, o);

        if (o.borderColor >= 0)
        {
            const border = {
                name: 'border',
                w: o.w + o.borderWidth,
                h: o.h + o.borderWidth,
                round: o.round + (o.borderWidth * 0.5),
                color: o.borderColor,
                alpha: o.alpha,
            };

            return this.rectComp(border, fill);
        }

        return this.rect(fill);
    }

    static rectShadow(opts = {}): PIXI.Container
    {
        const def = Object.assign({
            w: 120,
            h: 120,
            round: 0,
            color: 0x3187be,
            alpha: 1,
            shadowDistance: 8,
            shadowColor: 0x000000,
            shadowAngle: Math.PI * 0.25,
            shadowAlpha: 1,
            x: 0,
            y: 0,
        }, opts);

        const fill = Object.assign({}, def, {
            name: 'fill',
        });

        const shadow = Object.assign({}, def, {
            name: 'shadow',
            color: def.shadowColor,
            alpha: def.shadowAlpha,
            x: def.x + (Math.sin(def.shadowAngle) * def.shadowDistance),
            y: def.y + (Math.cos(def.shadowAngle) * def.shadowDistance),
        });

        const rect = this.rectComp(shadow, fill);

        return rect;
    }

    static rectBorder(opts = {}): PIXI.Container
    {
        const def = Object.assign({
            w: 120,
            h: 120,
            round: 5,
            color: 0x3187be,
            alpha: 1,
            borderWidth: 8,
            borderColor: 0x000000,
            borderAlpha: 1,
        }, opts);

        const fill = Object.assign({}, def, {
            name: 'fill',
        });

        const shadow = Object.assign({}, def, {
            name: 'border',
            w: def.w + (def.borderWidth * 2),
            h: def.h + (def.borderWidth * 2),
            color: def.borderColor,
            alpha: def.borderAlpha,
            round: def.round + (def.borderWidth * 0.5),
        });

        const rect = this.rectComp(shadow, fill);

        return rect;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static clear(container: any): void
    {
        if ((container as any).clear) container.clear();
        if (!container.children) return;
        for (const i in container.children) this.clear(container.children[i]);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static resize(container: any, w: number, h: number): void
    {
        if (container.width)
        {
            container.width = w;
            container.height = h;
        }
        if (!container.children) return;
        for (const i in container.children) Graph.resize(container.children[i], w, h);
    }
}
