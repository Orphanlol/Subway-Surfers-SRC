import { I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';
import Poki from '../utils/Poki';
import { Button } from './buttons/Button';
import Clock from './Clock';
import Graph from './Graph';
import UserCurrencies from './me/characters/UserCurrencies';
import ScreenGlow from './ScreenGlow';
import Widget from './Widget';

export default class SaveMe extends Widget
{
    public bg!: ScreenGlow;
    public clock!: Clock;
    public content!: PIXI.Container;
    public baseShort!: PIXI.Container;
    public baseTall!: PIXI.Container;
    public btnReviveWatch!: Button;
    public btnReviveKeys!: Button;
    public title!: I18nLabel;
    public currencies!: UserCurrencies;
    public onExitCallback!: () => void;

    private heightShort = 260;
    private heightTall = 400;

    protected onBuild(): void
    {
        this.bg = new ScreenGlow();
        this.addChild(this.bg);
        this.bg.interactive = true;
        this.bg.on('pointertap', () => this.exit());

        this.content = new PIXI.Container();
        this.addChild(this.content);

        const w = 550;

        this.baseTall = Graph.rectComp(
            { w, h: this.heightTall, color: 0xeeeeee, round: 16 },
            { w: w + 22, h: this.heightTall + 24, image: 'box-border-grey.png', x: 5, y: 6 },
        );
        this.content.addChild(this.baseTall);
        this.baseTall.interactive = true;
        this.baseTall.on('pointertap', () => this.exit());

        this.baseShort = Graph.rectComp(
            { w, h: this.heightShort, color: 0xeeeeee, round: 16 },
            { w: w + 22, h: this.heightShort + 24, image: 'box-border-grey.png', x: 5, y: 6 },
        );
        this.content.addChild(this.baseShort);
        this.baseShort.interactive = true;
        this.baseShort.on('pointertap', () => this.exit());

        this.btnReviveWatch = new Button({
            base: Graph.rectComp(
                { w: 316, h: 120, image: 'box-border-grey.png', x: 5, y: 6 },
                { w: 300, h: 100, image: 'box-fill-green.png', x: 2, y: 2, r: 20, b: 20 },
            ),
            icon: 'icon-tv.png',
            iconX: 60,
            iconY: -10,
            label: 'free',
            labelFont: 'Lilita One',
            labelSize: 40,
            labelX: -50,
            labelY: 0,
            onTap: () => this.reviveWithAd(),
        });
        this.content.addChild(this.btnReviveWatch);
        this.btnReviveWatch.y = -20;

        this.btnReviveKeys = new Button({
            base: Graph.rectComp(
                { w: 316, h: 120, image: 'box-border-grey.png', x: 5, y: 6 },
                { w: 300, h: 100, image: 'box-fill-blue.png', x: 2, y: 2, r: 20, b: 20 },
            ),
            icon: 'icon-key.png',
            iconX: 30,
            iconY: 0,
            label: 'keys',
            labelParams: { num: 0 },
            labelFont: 'Lilita One',
            labelSize: 40,
            labelX: -30,
            labelY: 0,
            onTap: () => this.reviveWithKeys(),
        });
        this.content.addChild(this.btnReviveKeys);
        this.btnReviveKeys.y = 110;

        this.title = new I18nLabel('save_me', {
            align: 'center',
            fill: 0x004a80,
            fontSize: 40,
            fontFamily: 'Titan One',
            dropShadow: false,
            dropShadowDistance: 1,
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this.content.addChild(this.title);

        this.clock = new Clock();
        this.content.addChild(this.clock);
        this.clock.x = (-w / 2) + 20;

        this.currencies = new UserCurrencies();
        this.currencies.coinsTag.visible = false;
        this.content.addChild(this.currencies);
        this.currencies.onRefresh.add(() =>
        {
            this.currencies.x = (w / 2) - (this.currencies.width / 2) - 18;
        });
    }

    protected onOpen(): void
    {
        const canWatch = app.game.freeRevivals < GameConfig.freeRevivals;
        const h = canWatch ? this.heightTall : this.heightShort;

        this.clock.run(6, () => this.exit());
        this.btnReviveWatch.key = 'Space';
        this.btnReviveKeys.key = 'k';

        this.btnReviveKeys.setup({ labelParams: { num: app.game.paidRevivalCost() } });
        this.currencies.keys = app.user.keys;

        this.baseShort.visible = !canWatch;
        this.baseTall.visible = canWatch;

        if (canWatch)
        {
            this.btnReviveWatch.visible = true;
            this.btnReviveWatch.y = -20;
            this.btnReviveKeys.y = 110;
        }
        else
        {
            this.btnReviveWatch.visible = false;
            this.btnReviveKeys.y = 40;
        }

        this.title.y = (-h / 2) + 60;
        this.clock.y = (-h / 2) + 20;
        this.currencies.y = (-h / 2) + 35;

        const prizes = app.game.stats.getPrizes();

        this.onExitCallback = prizes.length
            ? () => app.prizeScreen.open({ prizes, onExitCallback: () => app.nav.toGameover() })
            : () => app.nav.toGameover();
    }

    protected onClose(): void
    {
        this.clock.stop();
        this.btnReviveWatch.key = null;
        this.btnReviveKeys.key = null;
    }

    protected onResize(): void
    {
        const w = this.viewportWidth;
        const h = this.viewportHeight;

        this.x = w * 0.5;
        this.y = h * 0.5;
        this.bg.resize(w, h);
    }

    public exit(): void
    {
        this.close();
        this.onExitCallback();
    }

    private reviveWithAd(): void
    {
        this.close();

        if (GameConfig.debug)
        {
            app.game.revive(1, false);
        }
        else
        {
            app.sound.volume(0);

            this.btnReviveWatch.key = null;
            this.btnReviveKeys.key = null;
            Poki.SDK.rewardedBreak({ type: 'saveMe' }).then((withReward: boolean) =>
            {
                app.sound.volume(GameConfig.volume);
                if (withReward)
                {
                    app.game.revive(5, false);
                }
                else
                {
                    this.btnReviveWatch.key = 'Space';
                    this.btnReviveKeys.key = 'k';
                    this.onExitCallback();
                }
            });
        }
    }

    private reviveWithKeys(): void
    {
        this.close();

        if (app.user.keys >= app.game.paidRevivalCost())
        {
            app.game.revive(GameConfig.debug ? 1 : 3, true);
        }
        else
        {
            app.notEnoughCurrency.setup(app.game.paidRevivalCost(), this.onExitCallback, 'keys');
            app.notEnoughCurrency.open();
        }
    }
}
