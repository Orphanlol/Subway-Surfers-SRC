import { I18nLabel } from '@goodboydigital/astro';
import { Container, Sprite } from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import Poki from '../../utils/Poki';
import { UserButtonOptions, UserPanelButton } from '../buttons/UserPanelButton';
import Graph from '../Graph';
import ScreenGlow from '../ScreenGlow';
import Widget from '../Widget';

export class ConsentPanel extends Widget
{
    public w = 0;
    public h = 0;
    public panel!: Container;
    public bg!: ScreenGlow;
    private confirmButton!: UserPanelButton;
    private toggleButton!: UserPanelButton;
    private age!: number;
    private check!: Sprite;
    private toggled = false;

    protected onBuild(): void
    {
        const confirmDisabledOptions: Partial<UserButtonOptions> = {
            base: Graph.rectComp(
                { w: 592, h: 102, color: 0x000000, round: 12 },
                { w: 614, h: 126, image: 'box-border-grey.png', x: 5, y: 6 },
            ),
            label: 'ok', labelColor: 0x444444, labelY: 0, labelSize: 45,
            labelFont: 'Lilita One', labelShadow: 1, labelShadowColor: 0xFFFFFF };

        const confirmEnabledOptions: Partial<UserButtonOptions> = { bg: 'xl-navigation-button-light-green.png',
            label: 'ok', labelY: 0, labelSize: 45, labelFont: 'Lilita One', labelShadow: 3,
            onTap: () =>
            {
                Poki.SDK.togglePlayerAdvertisingConsent(true, this.age);
                app.user.gameSettings.adConsent = true;
                app.user.save();
                app.nav.toIdleScreen('title');
            } };

        this.bg = this.addChild(new ScreenGlow(1));

        this.panel = this.addChild(Graph.rectComp(
            { w: 690, h: 950, color: 0xEEEEEE, round: 16 },
            { w: 712, h: 974, image: 'box-border-grey.png', x: 5, y: 6 },
        ));

        const bodyContainer = this.addChild(Graph.rectComp(
            { w: 590, h: 210, color: 0xe7f7ff, round: 16 },
            { w: 616, h: 234, image: 'box-border-grey.png', x: 5, y: 6 },
        ));

        bodyContainer.addChild(new I18nLabel('consent-body', {
            align: 'center',
            fill: 0x275086,
            fontSize: 25,
            lineHeight: 30,
            fontFamily: 'Titan One',
            dropShadow: false,
            anchorX: 0.5,
            anchorY: 0.5,
        }));

        bodyContainer.y = -130;

        const banner = this.addChild(Sprite.from('consent-characters-header.png'));

        banner.anchor.set(0.5);
        banner.y = -bodyContainer.height - 115;

        const footer = this.addChild(new I18nLabel('consent-footer', {
            fill: 0x666666,
            lineHeight: 28,
            fontSize: 20,
            fontFamily: 'Titan One',
            dropShadow: false,
            anchorX: 0.5,
            anchorY: 0.5,
        }));

        footer.y = (this.panel.height / 2) - (footer.height / 2) - 50;

        this.confirmButton = this.addChild(new UserPanelButton(confirmDisabledOptions));
        this.confirmButton.base?.scale.set(1);
        this.confirmButton.y = footer.y - this.confirmButton.height - 30;

        const toggleOptions: Partial<UserButtonOptions> = { bg: 'xl-navigation-button-light-green.png',
            label: 'accept', labelY: 0, labelX: 75, labelSize: 45, labelFont: 'Lilita One', labelShadow: 3,
            onTap: () =>
            {
                this.check.visible = !this.check.visible;
                toggleOptions.label = !this.toggled ? 'accepted' : 'accept';

                toggleOptions.base = !this.toggled ? Graph.rectComp(
                    { w: 592, h: 102, color: 0x666666, round: 12 },
                    { w: 614, h: 126, image: 'box-border-grey.png', x: 5, y: 6 },
                ) : null;
                this.toggleButton.setup(toggleOptions);
                if (!this.toggled) this.confirmButton.setup(confirmEnabledOptions);
                else this.confirmButton.setup(confirmDisabledOptions);

                this.toggled = !this.toggled;
            } };

        this.toggleButton = this.addChild(new UserPanelButton(toggleOptions));
        this.toggleButton.base?.scale.set(1);
        this.toggleButton.y = this.confirmButton.y - this.toggleButton.height - 15;
        const checkBox = this.addChild(Graph.rectShadow(
            {
                round: 12,
                w: 75, h: 75,
                shadowAlpha: 0.15,
                shadowDistance: 2,
                shadowColor: 0xFFFFFF,
                color: 0x000000,
                alpha: 0.4,
            },
        ));

        checkBox.x = -75;
        checkBox.y = this.toggleButton.y;

        this.check = checkBox.addChild(Sprite.from('checkmark-icon.png'));

        this.check.scale.set(1.2);
        this.check.anchor.set(0.5);
        this.check.visible = false;
    }

    onOpen(data: {age: number;}): void
    {
        this.age = data.age;
    }

    protected onResize(): void
    {
        this.w = this.viewportWidth;
        this.h = this.viewportHeight;
        this.x = this.w * 0.5;
        this.y = this.h * 0.5;

        this.bg.resize(this.w, this.h);
    }
}
