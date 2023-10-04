import * as PIXI from 'pixi.js';

class BoostGaugeSlice extends PIXI.Container
{
    private label: PIXI.Text;
    private base: PIXI.Container;
    private slice: PIXI.Sprite;
    private pointer: PIXI.Sprite;
    private labelStyle: Partial<PIXI.TextStyle>;

    constructor(label: string, angle: number)
    {
        super();

        this.base = new PIXI.Container();
        this.addChild(this.base);
        this.base.rotation = angle;

        this.slice = PIXI.Sprite.from('base-slice.png');
        this.slice.anchor.set(0.5, 0.5);
        this.slice.tint = 0x000000;
        this.slice.alpha = 0.4;
        this.base.addChild(this.slice);

        this.pointer = PIXI.Sprite.from('icon-triangle.png');
        this.pointer.anchor.set(0.5, 1);
        this.pointer.y = this.slice.height * 0.5;
        this.pointer.visible = false;
        this.base.addChild(this.pointer);

        this.labelStyle = {
            align: 'center',
            fontFamily: 'Lilita One',
            fontSize: 32,
            fill: 0xFFFFFF,
            dropShadow: true,
            dropShadowDistance: 2,
        };

        this.label = new PIXI.Text(label, this.labelStyle);
        this.label.anchor.set(0.5);
        this.addChild(this.label);
    }

    public highlight(): void
    {
        this.slice.tint = this.base.angle < 0 ? 0xFDE934 : 0x66D6FD;
        this.slice.alpha = 1;

        this.label.tint = this.base.angle < 0 ? 0x971711 : 0x1D419F;
        this.label.alpha = 1;

        this.pointer.tint = this.label.tint;
        this.pointer.visible = true;

        this.labelStyle.dropShadow = false;
        this.label.style = this.labelStyle;
    }

    public lowlight(): void
    {
        this.slice.tint = 0x000000;
        this.slice.alpha = 0.4;
        this.label.tint = 0xFFFFFF;
        this.label.alpha = 1;
        this.pointer.visible = false;

        this.labelStyle.dropShadow = true;
        this.label.style = this.labelStyle;
    }
}

export class BoostGauge extends PIXI.Container
{
    private slices: Record<string, BoostGaugeSlice>;
    private timeout: any;

    constructor()
    {
        super();

        this.slices = {};

        this.addSlice('3', -0.6);
        this.addSlice('2', -1.6);
        this.addSlice('1', -2.6);

        this.addSlice('+7', 0.6);
        this.addSlice('+6', 1.6);
        this.addSlice('+5', 2.6);

        this.visible = false;
    }

    private addSlice(label: string, position: number): void
    {
        const radius = 150;

        const step = Math.PI / 7;

        const angle = step * position;

        const slice = new BoostGaugeSlice(label, angle);

        this.addChild(slice);
        this.slices[label] = slice;

        slice.x = Math.sin(angle) * radius;
        slice.y = -Math.cos(angle) * radius;
    }

    public highlightSlice(id: string): void
    {
        if (!this.slices[id]) throw new Error('Invalid gauge slice');
        this.slices[id].highlight();
    }

    public lowlightSlice(id: string): void
    {
        if (!this.slices[id]) throw new Error('Invalid gauge slice');
        this.slices[id].lowlight();
    }

    public lowlightHeadstart(): void
    {
        this.slices['1'].lowlight();
        this.slices['2'].lowlight();
        this.slices['3'].lowlight();
    }

    public lowlightMultiplier(): void
    {
        this.slices['+5'].lowlight();
        this.slices['+6'].lowlight();
        this.slices['+7'].lowlight();
    }

    public lowlightAll(): void
    {
        for (const k in this.slices) this.slices[k].lowlight();
    }

    public show(autoHideDelay = 5): void
    {
        this.visible = true;
        clearTimeout(this.timeout);
        if (autoHideDelay)
        {
            this.timeout = setTimeout(() => this.hide(), 1000 * autoHideDelay);
        }
    }

    public hide(): void
    {
        this.visible = false;
        clearTimeout(this.timeout);
    }
}
