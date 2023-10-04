import * as PIXI from 'pixi.js';

const defaultOptions = {
    mask: new PIXI.Graphics() as (PIXI.Graphics | PIXI.Sprite),
    baseAlpha: 1,
    w: 512,
    h: 512,
    radius: 12,
    center: { x: 0, y: 0 },
    color: 0xFF0000,
    glowScale: { x: 1, y: 1 },
    glowAlpha: 1,
    glow: 0xFF0000,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    raysAlpha: 0.25,
};

export type BgStripesOptions = typeof defaultOptions;

export class BgStripes extends PIXI.Container
{
    public w: number;
    public h: number;
    public stripes: PIXI.Container;

    constructor(opts: Partial<BgStripesOptions> = {})
    {
        super();
        const o = { ...defaultOptions, ...opts };

        if (!opts.mask)
        {
            o.mask = new PIXI.Graphics().beginFill(0xFF0000).drawRect(-0.5, -0.5, 1, 1);
            o.mask.scale.set(o.w, o.h);
        }

        this.w = o.w;
        this.h = o.h;

        const base = new PIXI.Graphics();

        base.beginFill(o.color, o.baseAlpha);
        base.drawRoundedRect(-o.w * 0.5, -o.h * 0.5, o.w, o.h, o.radius);

        this.addChild(base);

        this.stripes = new PIXI.Container();

        this.stripes.addChild(
            PIXI.Sprite.from('background-stripes-hq.png'),
            PIXI.Sprite.from('background-stripes-hq.png'),
            PIXI.Sprite.from('background-stripes-hq.png'),
            PIXI.Sprite.from('background-stripes-hq.png'),
        );

        this.stripes.children.forEach((spr) =>
        {
            (spr as PIXI.Sprite).blendMode = o.blendMode;
            (spr as PIXI.Sprite).tint = o.glow;
        });

        this.stripes.children[1].rotation = Math.PI * 0.5;
        this.stripes.children[2].rotation = Math.PI;
        this.stripes.children[3].rotation = Math.PI * 1.5;
        this.stripes.width = Math.max(o.w, o.h) * 1.15;
        this.stripes.height = this.stripes.width;
        this.stripes.x = o.w * o.center.x;
        this.stripes.y = o.h * o.center.y;
        this.stripes.alpha = o.raysAlpha;

        this.addChild(this.stripes);

        const glow = PIXI.Sprite.from('background-superglow.png');

        glow.anchor.set(0.5);
        glow.alpha = o.glowAlpha;
        glow.scale.set(o.glowScale.x, o.glowScale.y);
        glow.blendMode = o.blendMode;

        glow.x = this.stripes.x;
        glow.y = this.stripes.y;
        glow.tint = o.glow;
        this.addChild(glow);

        this.addChild(o.mask);
        this.mask = o.mask;
    }
}
