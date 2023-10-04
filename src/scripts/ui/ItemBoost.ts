import { I18nLabel } from '@goodboydigital/astro';
import { TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';

import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';

export enum ItemBoostType
    {
    MULTIPLIER = 'MULTIPLIER',
    HEADSTART = 'HEADSTART',
}

const textureByType: Record<ItemBoostType, string> = {
    MULTIPLIER: 'boost-multiplier.png',
    HEADSTART: 'boost-headstart.png',
};

const keyByType: Record<ItemBoostType, string> = {
    MULTIPLIER: 'c',
    HEADSTART: 'v',
};

export class ItemBoost extends PIXI.Container
{
    public readonly type: ItemBoostType;
    protected container: PIXI.Container;
    protected base: PIXI.NineSlicePlane;
    protected over: PIXI.NineSlicePlane;
    protected icon: PIXI.Sprite;
    protected label: PIXI.Text;
    protected key?: I18nLabel;
    protected showing: boolean;
    protected level = 0;

    constructor(type: ItemBoostType)
    {
        super();

        this.type = type;

        this.container = new PIXI.Container();
        this.addChild(this.container);

        this.base = new PIXI.NineSlicePlane(PIXI.Texture.from('btn-base-small.png'), 20, 20, 20, 20);
        this.base.width = 160;
        this.base.height = 220;
        this.container.addChild(this.base);
        this.base.x = -this.base.width * 0.5;
        this.base.y = -this.base.height * 0.5;
        this.base.alpha = 0.65;
        this.base.tint = 0x000000;

        this.over = new PIXI.NineSlicePlane(PIXI.Texture.from('btn-base-small.png'), 20, 20, 20, 20);
        this.over.width = this.base.width;
        this.over.height = this.base.height;
        this.container.addChild(this.over);
        this.over.x = this.base.x;
        this.over.y = this.base.y;
        this.over.alpha = 0;

        this.icon = PIXI.Sprite.from(textureByType[type]);
        this.icon.scale.set(0.75);
        this.icon.anchor.set(0.5);
        this.container.addChild(this.icon);

        this.label = new PIXI.Text('', {
            align: 'right',
            fontFamily: 'Lilita One',
            fontSize: 32,
            fill: 0xFFFFFF,
            dropShadow: true,
            dropShadowDistance: 2,
        });
        this.label.anchor.set(1, 1);
        this.container.addChild(this.label);
        this.label.x = (this.w / 2) - 10;
        this.label.y = (this.h / 2) - 5;

        if (!GameConfig.mobile)
        {
            this.key = new I18nLabel('keyboard-key', {
                align: 'left',
                fontFamily: 'Lilita One',
                fontSize: 20,
                fill: 0x999999,
                params: { key: keyByType[type].toUpperCase() },
            });
            this.container.addChild(this.key);
            this.key.x = -(this.w / 2) + 10;
            this.key.y = -(this.h / 2) + 5;
        }

        this.base.on('pointertap', this.activateBoost.bind(this), this);
        this.base.interactive = true;
        this.base.buttonMode = true;
        this.showing = false;
        this.visible = false;

        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    private onKeyDown(e: KeyboardEvent): void
    {
        if (e.repeat || !this.showing) return;
        if (e.key === keyByType[this.type]) this.activateBoost();
    }

    public get w(): number
    {
        return this.base.width;
    }

    public get h(): number
    {
        return this.base.height;
    }

    public async show(animated = false, flashDelay = 1): Promise<void>
    {
        this.refresh();
        if (!this.showing)
        {
            TweenLite.killTweensOf(this.container);
            this.showing = true;
            this.visible = true;
            this.level = 0;

            if (animated)
            {
                this.container.x = -300;
                await TweenLite.to(this.container, 0.3, { x: 0 });
            }
            else
            {
                this.container.x = 0;
            }

            this.flashIdle(flashDelay);
        }
    }

    public async hide(animated = false): Promise<void>
    {
        if (!this.showing) return;
        this.showing = false;
        this.level = 0;
        TweenLite.killTweensOf(this.container);
        if (animated)
        {
            await TweenLite.to(this.container, 0.3, { x: -500, onComplete: () =>
            {
                this.visible = false;
                if (this.parent) this.parent.removeChild(this);
            } });
        }
        else
        {
            this.visible = false;
            if (this.parent) this.parent.removeChild(this);
            this.container.x = -300;
        }
    }

    private async flashIdle(delay: number): Promise<void>
    {
        TweenLite.killTweensOf(this.over);
        this.over.alpha = 0;
        await TweenLite.to(this.over, 0.2, { alpha: 0.4, delay });
        await TweenLite.to(this.over, 0.2, { alpha: 0.0 });
        await TweenLite.to(this.over, 0.2, { alpha: 0.4 });
        await TweenLite.to(this.over, 0.2, { alpha: 0.0 });
        await TweenLite.to(this.over, 0.2, { alpha: 0.4 });
        await TweenLite.to(this.over, 0.2, { alpha: 0.0 });
    }

    private async flashActivate(): Promise<void>
    {
        TweenLite.killTweensOf(this.over);
        this.over.alpha = 0;
        await TweenLite.to(this.over, 0.2, { alpha: 0.9 });
        await TweenLite.to(this.over, 0.4, { alpha: 0.0 });
    }

    private refresh(): void
    {
        switch (this.type)
        {
            case ItemBoostType.HEADSTART:
                this.label.text = String(app.user.boosts.consumables.headstart);
                break;
            case ItemBoostType.MULTIPLIER:
                this.label.text = String(app.user.boosts.consumables.scoreBooster);
                break;
        }
    }

    private activateBoost(): void
    {
        if (!this.showing) return;
        this.flashActivate();
        switch (this.type)
        {
            case ItemBoostType.HEADSTART:
                this.activateHeadstart();
                app.game.missions.setStat(1, 'mission-headstart');
                break;
            case ItemBoostType.MULTIPLIER:
                this.activateMultiplier();
                app.game.missions.setStat(1, 'mission-scoreBooster');
                break;
        }
    }

    private activateHeadstart(): void
    {
        if (!this.showing || this.level === 3) return;
        if (app.user.boosts.consumables.headstart < 1) return;

        this.level += 1;

        // Make the game faster on headstart
        app.game.stats.time += 20 * this.level;

        app.game.hero.jetpack.turnOn(this.level);
        app.user.boosts.consumables.headstart -= 1;
        app.user.gameSettings.save();

        app.game.hud.boostGauge.show();
        app.game.hud.boostGauge.lowlightHeadstart();
        app.game.hud.boostGauge.highlightSlice(`${this.level}`);
        this.refresh();

        if (this.level >= 3 || app.user.boosts.consumables.headstart <= 0)
        {
            app.game.hud.removeItemBoost(this.type, true);
        }
    }

    private activateMultiplier(): void
    {
        if (!this.showing || this.level === 3) return;
        if (app.user.boosts.consumables.scoreBooster < 1) return;

        this.level += 1;

        const multiplier = 4 + this.level;

        app.game.stats.multiplier = 1 + multiplier;
        app.user.boosts.consumables.scoreBooster -= 1;
        app.user.gameSettings.save();

        app.game.hud.boostGauge.show();
        app.game.hud.boostGauge.lowlightMultiplier();
        app.game.hud.boostGauge.highlightSlice(`+${multiplier}`);
        this.refresh();

        if (this.level >= 3 || app.user.boosts.consumables.scoreBooster <= 0)
        {
            app.game.hud.removeItemBoost(this.type, true);
        }
    }
}
