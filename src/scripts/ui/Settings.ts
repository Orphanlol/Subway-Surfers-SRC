import { I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import GameConfig from '../GameConfig';
import { CloseButton } from './buttons/CloseButton';
import Graph from './Graph';
import Label from './Label';
import ScreenGlow from './ScreenGlow';
import { SettingsItem, SettingsItemPrivacy, SettingsItemProfile, SettingsItemSound } from './SettingsItem';
import Widget from './Widget';

export default class Settings extends Widget
{
    public title!: I18nLabel;
    public bg!: ScreenGlow;
    public base!: PIXI.Container;
    public items!: SettingsItem[];
    public version!: Label;
    private btnClose!: CloseButton;

    protected onBuild(): void
    {
        this.interactive = true;
        this.bg = new ScreenGlow();
        this.addChild(this.bg);

        const w = 586.5;
        const h = 850;

        this.base = this.addChild(Graph.rectComp(
            { w, h, color: 0xeeeeee, round: 16 },
            { w: w + 22, h: h + 24, image: 'box-border-grey.png', x: 5, y: 6 },
        ));

        this.title = this.addChild(new I18nLabel('settings', {
            align: 'center',
            fill: 0x004a80,
            fontSize: 60,
            fontFamily: 'Titan One',
            dropShadow: false,
            dropShadowDistance: 2,
            anchorX: 0.5,
            anchorY: 0.5,
        }));
        this.title.y = -360;

        if (GameConfig.leaderboard !== 'none')
        {
            this.addItem(new SettingsItemProfile());
        }
        this.addItem(new SettingsItemSound());
        this.addItem(new SettingsItemPrivacy());

        this.btnClose = this.addChild(new CloseButton({
            onTap: () => this.close(),
        }));

        this.btnClose.x = (-w / 2) + 10;
        this.btnClose.y = (-h / 2) + 10;

        this.version = this.addChild(new Label(`v${APP_VERSION}`, {
            align: 'right',
            fill: 0x3a8bbf,
            fontSize: 18,
            fontFamily: 'Titan One',
            anchor: 1,
        }));
        this.version.alpha = 0.5;
        this.version.x = (w / 2) - 10;
        this.version.y = (h / 2) - 10;
    }

    private addItem(item: SettingsItem)
    {
        if (!this.items) this.items = [];
        this.base.addChild(item);
        item.y = (this.items.length * item.h) - 250;
        item.scale.set(0.85);
        this.items.push(item);
    }

    onOpen(): void
    {
        for (const item of this.items) item.enable();
    }

    onClose(): void
    {
        for (const item of this.items) item.disable();
    }

    onResize(): void
    {
        const w = this.viewportWidth;
        const h = this.viewportHeight;

        this.x = w * 0.5;
        this.y = h * 0.5;
        this.bg.resize(w, h);
    }
}
