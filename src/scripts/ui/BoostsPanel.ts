import { I18nLabel, I18nLabelOptions } from '@goodboydigital/astro';
import { Container } from 'pixi.js';

import { app } from '../SubwaySurfersApp';
import { BoostScroller } from './boosts/BoostScroller';
import { CloseButton } from './buttons/CloseButton';
import Graph from './Graph';
import UserCurrencies from './me/characters/UserCurrencies';
import ScreenGlow, { ScreenGlowType } from './ScreenGlow';
import Widget from './Widget';

export class BoostsPanel extends Widget
{
    private bg!: ScreenGlow;
    private base!: Container;
    private btnClose!: CloseButton;
    private currencies!: UserCurrencies;
    boosts!: BoostScroller;

    protected onBuild(): void
    {
        this.bg = this.addChild(new ScreenGlow(ScreenGlowType.BLACK));
        this.bg.interactive = true;
        this.bg.on('pointertap', () => this.close());

        const w = 690;
        const h = 935;

        this.base = this.addChild(Graph.rectComp(
            { w, h, color: 0xeeeeee, round: 16 },
            { w: w + 22, h: h + 24, image: 'box-border-grey.png', x: 5, y: 6 },
        ));
        this.base.interactive = true;

        this.btnClose = this.addChild(new CloseButton({
            onTap: () => this.close(),
        }));

        this.btnClose.x = (-w / 2) + 10;
        this.btnClose.y = (-h / 2) + 10;
        const boostsData = app.shop.boosts;

        this.boosts = this.addChild(new BoostScroller({
            ...boostsData,
            damp: 0.8,
        }));

        this.boosts.yScrollMin = (h / 2) - this.boosts.height + 60;
        this.boosts.yScrollMax = -(h / 2) + 175;
        this.boosts.setPosition(0, this.boosts.yScrollMax);

        const scrollMask = Graph.rectColor({
            w,
            h: h - 90,
            y: 45,
            alpha: 0.4,
        });

        this.addChild(scrollMask);
        this.boosts.mask = scrollMask;

        this.currencies = this.addChild(new UserCurrencies());
        this.currencies.onRefresh.add(() =>
        {
            this.currencies.x = (w / 2) - (this.currencies.width / 2) - 20;
        });
        this.currencies.y = (-h / 2) + (this.currencies.height / 2) + 10;
    }

    async onOpen(): Promise<void>
    {
        this.currencies.coins = app.user.coins;
        this.currencies.keys = app.user.keys;
        this.currencies.refresh();
        this.boosts.refreshItems();
    }

    protected onResize(): void
    {
        const w = this.viewportWidth;
        const h = this.viewportHeight;

        this.x = w * 0.5;
        this.y = h * 0.5;
        this.bg.resize(w, h);
    }

    makeLabel(id: string, data: I18nLabelOptions): I18nLabel
    {
        return this.addChild(new I18nLabel(id, data));
    }
}
