import * as PIXI from 'pixi.js';

import { app } from '../SubwaySurfersApp';

type WidgetData = any;

export default class Widget extends PIXI.Container
{
    protected _built = false;
    protected _opened = false;
    public viewportWidth = 512;
    public viewportHeight = 512;
    public viewportScale = 1;
    public autoAddChild = true;
    public layer = 0;

    public get built(): boolean
    {
        return this._built;
    }

    public get opened(): boolean
    {
        return this._opened;
    }

    public build(): void
    {
        if (this._built) return;
        this._built = true;
        this.onBuild();
        this.onResize();
    }

    public open(data?: WidgetData): void
    {
        if (this._opened) return;
        this._opened = true;
        if (!this._built) this.build();
        this.visible = true;
        if (this.autoAddChild) app.ui.layers[this.layer].addChild(this);
        this.onOpen(data);
        app.resize.onResize.connect(this.resize);
        this.resize();
    }

    public close(): void
    {
        if (!this._opened || !this._built) return;
        this._opened = false;
        this.visible = false;
        if (this.autoAddChild && this.parent) this.parent.removeChild(this);
        this.onClose();
        app.resize.onResize.disconnect(this.resize);
    }

    public resize = (): void =>
    {
        this.viewportWidth = app.ui.viewportWidth;
        this.viewportHeight = app.ui.viewportHeight;
        this.viewportScale = app.ui.viewportScale;
        if (!this._opened) return;
        this.onResize();
    };

    protected onBuild(): void
    {
        // For subclasses
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onOpen(data?: WidgetData): void
    {
        // For subclasses
    }

    protected onClose(): void
    {
        // For subclasses
    }

    protected onResize(): void
    {
        // For subclasses
    }
}
