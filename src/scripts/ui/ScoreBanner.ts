import { I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import Label from './Label';

export interface ScoreBannerData
{
    score: number;
    coins: number;
}

export default class ScoreBanner extends PIXI.Container
{
    public base: PIXI.Sprite;
    public title: I18nLabel;
    public score: Label;
    public coins: Label;
    public icon: PIXI.Sprite;
    public starL: PIXI.Sprite;
    public starR: PIXI.Sprite;

    constructor()
    {
        super();

        this.base = PIXI.Sprite.from('scoreboard.png');
        this.base.anchor.set(0.5);
        this.addChild(this.base);

        this.title = new I18nLabel('score', {
            align: 'center',
            fill: 0x004a80,
            fontSize: 60,
            fontFamily: 'Titan One',
            dropShadow: false,
            dropShadowDistance: 1,
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this.addChild(this.title);
        this.title.x = -15;
        this.title.y = -110;
        this.title.rotation = -0.07;

        this.score = new Label('', {
            align: 'center',
            fill: 0xFFFFFF,
            fontSize: 55,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 1,
        });
        this.addChild(this.score);
        this.score.y = -33;

        this.coins = new Label('', {
            align: 'center',
            fill: 0xFFFFFF,
            fontSize: 45,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 1,
        });
        this.addChild(this.coins);
        this.coins.y = 35;

        this.icon = PIXI.Sprite.from('icon-coin.png');
        this.icon.anchor.set(0.5);
        this.icon.scale.set(0.75);
        this.addChild(this.icon);
        this.icon.x = this.coins.x - 100;
        this.icon.y = this.coins.y;

        this.starL = PIXI.Sprite.from('icon-star.png');
        this.starL.anchor.set(0.5);
        this.starL.x = -120;
        this.title.addChild(this.starL);

        this.starR = PIXI.Sprite.from('icon-star.png');
        this.starR.anchor.set(0.5);
        this.starR.x = -this.starL.x;
        this.title.addChild(this.starR);
    }

    update(opts: {score: number, coins: number}): void
    {
        this.score.text = String(opts.score);
        this.coins.text = String(opts.coins);

        const w = this.title['display'].width || 1;

        this.starL.x = (-w / 2) - 25;
        this.starR.x = (w / 2) + 25;
    }
}
