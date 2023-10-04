import { Graphics } from 'pixi.js';

import { app, SubwaySurfersApp } from '../SubwaySurfersApp';
import Poki from '../utils/Poki';

export class ScreenBlocker
{
    static pluginName = 'screenBlocker';
    w = 0;
    h = 0;
    app: SubwaySurfersApp;
    blocker: Graphics;

    constructor()
    {
        this.app = app;

        app.resize.onResize.connect(this.resize.bind(this));

        Poki.SDK.onBreakStart.add(() =>
        {
            this.blocker.interactive = true;
        });
        Poki.SDK.onBreakComplete.add(() =>
        {
            this.blocker.interactive = false;
        });

        this.blocker = app.stage.stage.addChild(new Graphics().beginFill(0x000000, 0.001)
            .drawRect(0, 0, 1, 1));
    }

    resize(w: number, h: number): void
    {
        this.blocker.scale.set(w, h);
    }

    public isOn(): boolean
    {
        return this.blocker.interactive;
    }
}

