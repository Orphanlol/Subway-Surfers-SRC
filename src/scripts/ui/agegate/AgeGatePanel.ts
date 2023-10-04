import { I18nLabel } from '@goodboydigital/astro';
import { Container } from 'pixi.js';

import avatar from '../../game/data/anim/avatar';
import { app } from '../../SubwaySurfersApp';
import { UserButtonOptions, UserPanelButton } from '../buttons/UserPanelButton';
import Graph from '../Graph';
import { CharacterThumb } from '../me/characters/CharacterThumb';
import ScreenGlow from '../ScreenGlow';
import Widget from '../Widget';
import { InfiniteScrollerHandler } from './InfiniteScrollerHandler';
import { YearScroller } from './YearScroller';

// TODO: make two buttons instead of setting up the same to avoid the glitch on the top left corner of the screen.
export class AgeGatePanel extends Widget
{
    public w = 0;
    public h = 0;
    public panel!: Container;
    public bg!: ScreenGlow;
    private confirmButton!: UserPanelButton;
    private title!: I18nLabel;
    private monthScroller!: InfiniteScrollerHandler;
    private yearScroller!: YearScroller;
    private character!: CharacterThumb;

    private month = -1;
    private year = -1;
    private age = 0;

    protected onBuild(): void
    {
        const buttonDisabledOptions: Partial<UserButtonOptions> = {
            base: Graph.rectComp(
                { w: 296, h: 94, color: 0x000000, round: 12 },
                { w: 320, h: 120, image: 'box-border-grey.png', x: 5, y: 6 },
            ),
            label: 'ok', labelColor: 0x444444, labelY: 0, labelSize: 45,
            labelFont: 'Lilita One', labelShadow: 1, labelShadowColor: 0xFFFFFF };

        const buttonEnabledOptions: Partial<UserButtonOptions> = { bg: 'large-navigation-button-light-green.png',
            label: 'ok', labelY: 0, labelSize: 45, labelFont: 'Lilita One', labelShadow: 3,
            onTap: () =>
            {
                app.nav.toIdleScreen('consentPanel', { age: this.age });
            } };

        this.bg = this.addChild(new ScreenGlow(1));

        this.panel = this.addChild(Graph.rectComp(
            { w: 690, h: 950, color: 0xeeeeee, round: 16 },
            { w: 712, h: 974, image: 'box-border-grey.png', x: 5, y: 6 },
        ));
        this.title = this.addChild(new I18nLabel('when-born', {
            fill: 0x275086,
            fontSize: 45,
            fontFamily: 'Titan One',
            dropShadow: false,
            anchorX: 0.5,
            anchorY: 0.5,
        }));
        this.title.y = (-this.panel.height / 2) + this.title.height + 50;

        this.confirmButton = this.addChild(new UserPanelButton(buttonDisabledOptions));
        this.confirmButton.base?.scale.set(1);
        this.confirmButton.y = (this.panel.height / 2) - this.confirmButton.height;

        const w = 160;

        const elements = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        this.monthScroller = this.addChild(new InfiniteScrollerHandler(elements));

        this.monthScroller.x = 30 + (w / 2) - (this.panel.width / 2);
        this.monthScroller.y = -30;

        this.yearScroller = this.addChild(new YearScroller());

        this.yearScroller.x = this.monthScroller.x + w + 15;
        this.yearScroller.y = -30;

        this.monthScroller.onElementSelected.add((id) =>
        {
            this.month = id - 1;
            this.age = this.getAge();

            if (this.age > 0) this.confirmButton.setup(buttonEnabledOptions);
            else this.confirmButton.setup(buttonDisabledOptions);
        });
        this.yearScroller.onElementSelected.add((year) =>
        {
            if (year > 0) this.year = year;
            else this.year = -1;

            this.age = this.getAge();

            if (this.age > 0) this.confirmButton.setup(buttonEnabledOptions);
            else this.confirmButton.setup(buttonDisabledOptions);
        });

        const [start, end] = avatar.idle.clips.popupIdle.frames;
        const animData = { start, end, loop: true, name: 'uiIdle' };
        const thumbOptions = { sceneName: `${app.user.character}-idle`, animData, thumbId: app.user.character };

        this.character = this.addChild(new CharacterThumb(thumbOptions));
        this.character.x = 180;
        this.character.scale.set(1.5);
        this.character.y = 300;
        this.character.play('uiIdle');
    }

    onOpen(): void
    {
        this.character.play('uiIdle');
    }

    onClose(): void
    {
        this.character.stop();
    }

    getAge(): number
    {
        if (this.month !== -1 && this.year !== -1)
        {
            const today = new Date();

            const mDiff = today.getMonth() - this.month;
            let age = today.getFullYear() - this.year;

            if (mDiff < 0) age--;

            return age;
        }

        return 0;
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
