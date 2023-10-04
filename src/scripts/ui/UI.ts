import * as PIXI from 'pixi.js';

import { app } from '../SubwaySurfersApp';

export default class UI extends PIXI.Container
{
    public viewportWidth = 512;
    public viewportHeight = 512;
    public viewportScale = 1;

    public layers: PIXI.Container[];

    constructor()
    {
        super();
        app.stage.stage.addChild(this);
        this.layers = [
            new PIXI.Container(),
            new PIXI.Container(),
        ];

        for (const layer of this.layers) this.addChild(layer);

        app.resize.onResize.connect(this.resize);
        this.resize();
    }

    public get mainLayer(): PIXI.Container
    {
        return this.layers[0];
    }

    public get frontLayer(): PIXI.Container
    {
        return this.layers[1];
    }

    public resize = (): void =>
    {
        let targetHeight = 500;

        const ratio = app.resize.w / app.resize.h;

        if (ratio < 0.5)
        {
            // very narrow portrait, like iPhone X
            targetHeight = 760;
        }
        else if (ratio < 1)
        {
            // regular portrait
            targetHeight = 667;
        }
        else
        {
            // landscape
            targetHeight = 500;
        }

        this.viewportScale = app.resize.h / targetHeight * 0.5;
        this.viewportWidth = app.resize.w / this.viewportScale;
        this.viewportHeight = app.resize.h / this.viewportScale;
        this.scale.set(this.viewportScale);
    };
}
