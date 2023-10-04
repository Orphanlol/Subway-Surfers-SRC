import {  throttle } from '@goodboydigital/astro';
import { Signal } from 'typed-signals';

import { app, SubwaySurfersApp } from '../SubwaySurfersApp';

export interface ResizerPluginOptions
{
    maxRenderScale?: number;
}

export default class Resizer
{
    static pluginName = 'resizer';

    // app: AppInterface;

    maxRenderScale = 2;
    renderScale = 1;
    onResize: Signal<any>;
    w = 0;
    h = 0;
    app: SubwaySurfersApp;

    constructor(opts: ResizerPluginOptions = {})
    {
        this.app = app;
        if (opts.maxRenderScale) this.maxRenderScale = opts.maxRenderScale;
        this.onResize = new Signal();
    }

    init(): void
    {
        window.addEventListener('resize', () =>
        {
            window.scrollTo(0, 0);
            for (let i = 0; i < 10; i++)
            {
                setTimeout(() => this._resize(window.innerWidth, window.innerHeight), 100 * i);
            }
            // this._resize(window.innerWidth, window.innerHeight)
            // throttle(this._resize, 100, this)(window.innerWidth, window.innerHeight);
        });

        throttle(this._resize, 100, this)(window.innerWidth, window.innerHeight);
    }

    _resize(width: number, height: number): void
    {
        window.scrollTo(0, 0);

        const maxRenderScale = this.maxRenderScale;
        let renderScale = window.devicePixelRatio || 1;

        if (renderScale > maxRenderScale) renderScale = maxRenderScale;
        this.renderScale = renderScale;

        const w = width * renderScale;
        const h = height * renderScale;

        const renderer = this.app.stage.renderer;
        const view = this.app.stage.view;

        view.style.width = `${width}px`;
        view.style.height = `${height}px`;
        view.style.left = '0px';
        view.style.top = '0px';

        // only update is we actually resized!
        if (this.w !== w || this.h !== h)
        {
            this.w = w;
            this.h = h;

            renderer.resize(this.w, this.h);
            this.onResize.emit(this.w, this.h);
        }
    }
}

