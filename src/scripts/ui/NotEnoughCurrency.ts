import { I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import type { CurrencyTypes } from '../shop/Shop';
import { app } from '../SubwaySurfersApp';
import { CloseButton } from './buttons/CloseButton';
import Graph from './Graph';
import ScreenGlow, { ScreenGlowType } from './ScreenGlow';
import Widget from './Widget';

export default class NotEnoughCurrency extends Widget
{
    private bg!: ScreenGlow;
    private content!: PIXI.Container;
    private base!: PIXI.Container;
    private labelTitle!: I18nLabel;
    private labelMessage!: I18nLabel;
    private btnClose!: CloseButton;
    private requiredCurrency = 0;
    private onExit = () => { /***/ };
    private currencyIcon!: PIXI.Sprite;
    private currencyType!: CurrencyTypes;

    protected onBuild(): void
    {
        this.bg = new ScreenGlow(ScreenGlowType.BLACK);
        this.addChild(this.bg);
        this.bg.interactive = true;
        this.bg.on('pointertap', () => this.exit());

        this.content = new PIXI.Container();
        this.addChild(this.content);

        const w = 600;
        const h = 300;

        this.base = Graph.rectComp(
            { w, h, color: 0xeeeeee, round: 16 },
            { w: w + 22, h: h + 24, image: 'box-border-grey.png', x: 5, y: 6 },
        );
        this.content.addChild(this.base);
        this.base.interactive = true;
        this.base.on('pointertap', () => this.exit());

        const splat1 = PIXI.Sprite.from('background-splat.png');
        const splat2 = PIXI.Sprite.from('background-splat.png');
        const currencyIcon = PIXI.Sprite.from(PIXI.Texture.WHITE);

        splat1.anchor.set(0.5);
        splat1.x = w * 0.28;
        splat1.y = -20;
        this.content.addChild(splat1);
        splat1.tint = 0x70569a;

        splat2.anchor.set(0.5);
        splat2.x = splat1.x - 3;
        splat2.y = splat1.y - 3;
        this.content.addChild(splat2);
        splat2.tint = 0xac97e8;

        currencyIcon.anchor.set(0.5);
        currencyIcon.x = splat1.x;
        currencyIcon.y = splat1.y - 20;
        this.currencyIcon = currencyIcon;

        this.content.addChild(currencyIcon);

        this.labelTitle = new I18nLabel('not_enough_keys_title', {
            align: 'left',
            fill: 0x074b7e,
            fontSize: 50,
            fontFamily: 'Titan One',
            dropShadow: false,
            dropShadowDistance: 1,
            anchorX: 0,
            anchorY: 0,
        });
        this.labelTitle.x = (-w / 2) + 40;
        this.labelTitle.y = -100;
        this.content.addChild(this.labelTitle);

        this.labelMessage = new I18nLabel('not_enough_keys_message', {
            align: 'left',
            fill: 0x19669b,
            fontSize: 30,
            fontFamily: 'Titan One',
            dropShadow: false,
            dropShadowDistance: 1,
            anchorX: 0,
            anchorY: 0,
            params: { num: 5 },
        });

        this.labelMessage.x = this.labelTitle.x;
        this.labelMessage.y = this.labelTitle.y + this.labelTitle.height + 20;
        this.content.addChild(this.labelMessage);

        this.btnClose = new CloseButton({
            onTap: () => this.exit(),
        });
        this.content.addChild(this.btnClose);

        this.btnClose.x = (-w / 2) + 10;
        this.btnClose.y = (-h / 2) + 10;
    }

    public setup(requiredCurrency: number, onExit: () => void, type: CurrencyTypes): void
    {
        this.currencyType = type;
        this.requiredCurrency = requiredCurrency - app.user.gameSettings.currencies[type];
        this.onExit = onExit;
    }

    protected onOpen(): void
    {
        this.labelTitle.id = `not_enough_${this.currencyType}_title`;
        this.labelMessage.id = `not_enough_${this.currencyType}_message`;
        this.currencyIcon.texture = PIXI.Texture.from(`icon-${this.currencyType.slice(0, -1)}-large.png`);
        this.labelMessage.options.params = { num: this.requiredCurrency };
        this.labelTitle.refresh();
        this.labelMessage.refresh();
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
        this.onExit();
    }
}
