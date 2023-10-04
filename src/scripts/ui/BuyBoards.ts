import { i18n, I18nLabel } from '@goodboydigital/astro';
import { TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';

import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';
import { BgStripes } from './BgStripes';
import { CloseButton } from './buttons/CloseButton';
import { CurrencyButton } from './buttons/CurrencyButton';
import Graph from './Graph';
import UserCurrencies from './me/characters/UserCurrencies';
import ScreenGlow, { ScreenGlowType } from './ScreenGlow';
import Widget from './Widget';

export default class BuyBoards extends Widget
{
    private bg!: ScreenGlow;
    private content!: PIXI.Container;
    private base!: PIXI.Container;
    private labelTitle!: I18nLabel;
    private labelHave!: I18nLabel;
    private labelHelp1!: I18nLabel;
    private labelHelp2!: I18nLabel;
    private btnClose!: CloseButton;
    private bgStripes!: BgStripes;
    private hoverboard!: PIXI.Sprite;
    private btnBuy!: CurrencyButton;
    private wallet!: UserCurrencies;
    private boardCost = 300;
    public onExit?:() => void;

    protected onBuild(): void
    {
        this.bg = new ScreenGlow(ScreenGlowType.BLACK);
        this.addChild(this.bg);
        this.bg.interactive = true;
        this.bg.on('pointertap', () => this.exit());

        this.content = new PIXI.Container();
        this.addChild(this.content);

        const w = 540;
        const h = 540;

        this.base = Graph.rectComp(
            { w, h, color: 0xeeeeee, round: 16 },
            { w: w + 22, h: h + 24, image: 'box-border-grey.png', x: 5, y: 6 },
        );
        this.content.addChild(this.base);
        this.base.interactive = true;

        this.btnClose = new CloseButton({
            onTap: () => this.exit(),
        });
        this.content.addChild(this.btnClose);
        this.btnClose.x = (-w / 2) + 10;
        this.btnClose.y = (-h / 2) + 10;

        this.wallet = new UserCurrencies();
        this.addChild(this.wallet);

        this.bgStripes = new BgStripes({
            w: 510,
            h: 440,
            color: 0x2795D2,
            glow: 0xA1D6EC,
            center: { x: 0, y: -0.15 },
            glowScale: { x: 4.3, y: 4.3 },
        });
        this.content.addChild(this.bgStripes);

        this.hoverboard = PIXI.Sprite.from('hoverboard-large.png');
        this.hoverboard.anchor.set(0.5);
        this.content.addChild(this.hoverboard);

        this.labelTitle = new I18nLabel('hoverboard_need', {
            align: 'center',
            fill: 0xFFFFFF,
            fontSize: 36,
            fontFamily: 'Titan One',
            dropShadow: true,
            dropShadowDistance: 1,
            dropShadowAlpha: 0.5,
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this.labelTitle.x = 0;
        this.labelTitle.y = -130;
        this.content.addChild(this.labelTitle);

        this.labelHave = new I18nLabel('hoverboard_have', {
            align: 'center',
            fill: 0xFFFFFF,
            fontSize: 26,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 1,
            dropShadowAlpha: 0.5,
            anchorX: 0.5,
            anchorY: 0.5,
            params: { num: 5 },
        });
        this.labelHave.x = 0;
        this.labelHave.y = 80;
        this.content.addChild(this.labelHave);

        this.btnBuy = new CurrencyButton({
            onTap: () => this.buyBoard(),
        });
        this.addChild(this.btnBuy);
        this.btnBuy.y = 140;
        this.btnBuy.value = this.boardCost;

        this.labelHelp1 = new I18nLabel('hoverboard_help1', {
            align: 'center',
            fill: 0xACE5FE,
            fontSize: 20,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 1,
            dropShadowAlpha: 0.5,
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this.labelHelp1.x = 0;
        this.labelHelp1.y = 215;
        this.content.addChild(this.labelHelp1);

        this.labelHelp2 = new I18nLabel('hoverboard_help2', {
            align: 'center',
            fill: 0xACE5FE,
            fontSize: 20,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 1,
            dropShadowAlpha: 0.5,
            anchorX: 0.5,
            anchorY: 0.5,
            params: {
                command: i18n.translate(`hoverboard_command${GameConfig.mobile ? '' : '_desktop'}`),
            },
        });
        this.labelHelp2.x = this.labelHelp1.x;
        this.labelHelp2.y = this.labelHelp1.y + 20;
        this.content.addChild(this.labelHelp2);

        app.user.gameSettings.onChange.add(() => this.refresh());
    }

    protected onOpen(): void
    {
        this.refresh();
    }

    protected onResize(): void
    {
        const w = this.viewportWidth;
        const h = this.viewportHeight;

        this.x = w * 0.5;
        this.y = h * 0.5;
        this.bg.resize(w, h);

        this.bgStripes.y = 40;
        this.hoverboard.y = -20;
    }

    public exit(): void
    {
        this.close();
        if (this.onExit) this.onExit();
        this.onExit = undefined;
    }

    public buyBoard(): void
    {
        if (app.user.coins >= this.boardCost)
        {
            app.user.coins -= this.boardCost;
            app.user.boosts.consumables.hoverboard += 1;
            app.user.save();
            this.animateHoverboard();
        }
    }

    public refresh(): void
    {
        this.labelHave.options.params = { num: app.user.boosts.consumables.hoverboard };
        this.labelHave.refresh();

        this.wallet.coins = app.user.coins;
        this.wallet.keys = app.user.keys;
        this.wallet.refresh();
        this.wallet.x = (this.base.width / 2) - (this.wallet.width / 2) - 50;
        this.wallet.y = -220;
    }

    private async animateHoverboard(): Promise<void>
    {
        await TweenLite.to(this.hoverboard.scale, 0.05, { x: 1.2, y: 1.2 });
        await TweenLite.to(this.hoverboard.scale, 0.2, { x: 1, y: 1 });
    }
}
