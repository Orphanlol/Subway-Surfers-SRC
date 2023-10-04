import { throttle } from '@goodboydigital/astro';
import { TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';

import { app } from '../../../SubwaySurfersApp';
import Math2 from '../../../utils/Math2';
import { CoinsTag } from '../../CoinsTag';
import { KeysTag } from '../../KeysTag';

export default class UserCurrencies extends PIXI.Container
{
    public onRefresh = new Signal();
    public base: PIXI.NineSlicePlane;
    public coinsTag: CoinsTag = new CoinsTag();
    public keysTag: KeysTag = new KeysTag();

    private spacing = 10;

    constructor()
    {
        super();

        this.base = new PIXI.NineSlicePlane(PIXI.Texture.from('base-grey.png'), 10, 10, 10, 10);
        this.addChild(this.base);
        this.base.x = 0;

        this.addChild(this.base);
        this.addChild(this.coinsTag);
        this.addChild(this.keysTag);
        const user = app.user;

        user.onGameSettingsChange.add(() =>
        {
            this.tweenCoins(user.coins);
            this.tweenKeys(user.keys);
        });
    }

    get keys(): number { return this.keysTag.keys; }
    set keys(keys: number)
    {
        if (this.keys === keys) return;

        this.keysTag.keys = Math.round(keys);
        this.refresh();
    }

    get coins(): number { return this.coinsTag.coins; }
    set coins(coins: number)
    {
        if (this.coins === coins) return;

        if (this.coins !== 0 && this.worldVisible) throttle(app.sound.play, 150, app.sound)('gui-coin');
        this.coinsTag.coins = Math.round(coins);
        this.refresh();
    }

    tweenCoins(coins: number): void
    {
        const time = Math2.clamp(Math.abs(coins - this.coins) * 0.2, 0.2, 1);

        TweenLite.to(this, time, { coins });
    }

    tweenKeys(keys: number): void
    {
        const time = Math2.clamp(Math.abs(keys - this.keys) * 0.2, 0.2, 1);

        TweenLite.to(this, time, { keys });
    }

    refresh():void
    {
        this.base.width = (Number(this.coinsTag.visible) * this.coinsTag.width)
        + (Number(this.keysTag.visible) * (this.keysTag.width + this.spacing)) + (this.spacing * 2);
        const coinsTagWidth = this.coinsTag.label.icon?.width || 0;
        const keysTagWidth = this.keysTag.label.icon?.width || 0;

        this.keysTag.x = (-this.base.width / 2) + (keysTagWidth / 2) + this.spacing;
        this.coinsTag.x = (-this.base.width / 2) + this.keysTag.width
        + (coinsTagWidth / 2) + (this.spacing * 2);

        this.base.x = -this.base.width * 0.5;
        this.base.y = -this.base.height * 0.5;
        this.onRefresh.dispatch();
    }
}
