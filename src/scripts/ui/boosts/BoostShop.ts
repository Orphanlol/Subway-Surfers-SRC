import { app } from '../../SubwaySurfersApp';
import { UserPanelButton } from '../buttons/UserPanelButton';
import Graph from '../Graph';
import UserCurrencies from '../me/characters/UserCurrencies';
import UserPanel from '../UserPanel';
import Widget from '../Widget';
import { BoostScroller } from './BoostScroller';
import { FreeStuffSection } from './FreeStuffSection';

export default class BoostShop extends Widget
{
    public w = 0;
    public h = 0;
    public panel!: UserPanel;

    private scrollMask!: PIXI.Graphics;
    private currencies!: UserCurrencies;
    private section: 'boosts'|'freestuff' = 'boosts';
    private sections!:
    {
        boosts: BoostScroller,
        freestuff: FreeStuffSection,
    };

    protected onBuild(): void
    {
        this.panel = this.addChild(new UserPanel());

        const buttonOptions = { bg: 'navigation-button-blu.png', icon: 'icon-white-upgrades.png', label: 'boosts' };
        const boostsButton = new UserPanelButton(buttonOptions);

        buttonOptions.icon = 'icon-white-piggy.png';
        buttonOptions.label = 'free-stuff';
        const freestuffButton = new UserPanelButton(buttonOptions);

        boostsButton.onTap = () => { this.setSection('boosts'); };
        freestuffButton.onTap = () => { this.setSection('freestuff'); };
        this.panel.addButton(boostsButton, freestuffButton);

        const baseW = this.panel.base.width;
        const baseH = this.panel.base.height;

        this.currencies = this.addChild(new UserCurrencies());
        this.currencies.onRefresh.add(() =>
        {
            this.currencies.x = (baseW / 2) - (this.currencies.width / 2) - 20;
        });
        this.currencies.y = -345;

        const boosts = app.shop.boosts;

        this.sections = {
            boosts: this.addChild(new BoostScroller(({
                ...boosts,
                damp: 0.8,
            }))),
            freestuff: this.addChild(new FreeStuffSection()),
        };
        this.sections.freestuff.visible = false;

        this.sections.boosts.yScrollMin = (baseH / 2) - this.sections.boosts.height;
        this.sections.boosts.yScrollMax = -(baseH / 2) + 175;
        this.sections.boosts.setPosition(0, this.sections.boosts.yScrollMax);

        this.scrollMask = Graph.rectColor({
            w: baseW,
            h: baseH - 180,
            y: 15,
            alpha: 0.4,
        });

        this.panel.addChild(this.scrollMask);
        this.sections.boosts.mask = this.scrollMask;
    }

    updateTransform(): void
    {
        super.updateTransform();

        this.sections.boosts.yScrollMin = (this.panel.base.height / 2) - this.sections.boosts.height - 20;
    }

    async onOpen(): Promise<void>
    {
        this.currencies.coins = app.user.coins;
        this.currencies.keys = app.user.keys;

        this.currencies.refresh();
        this.sections[this.section].visible = true;
    }

    async setSection(section: 'boosts'|'freestuff'): Promise<void>
    {
        if (section === this.section) return;

        this.sections[this.section].visible = false;
        this.section = section;
        this.sections[this.section].visible = true;
        this.sections.boosts.refreshItems();
    }

    protected onClose(): void
    {
        this.sections[this.section].visible = false;
    }

    onResize(): void
    {
        this.w = this.viewportWidth;
        this.h = this.viewportHeight;

        this.x = this.w * 0.5;
        this.y = this.h * 0.5;
        this.panel.resize(this.w, this.h);
        this.sections.freestuff.y = -(this.panel.base.width / 2);
    }
}

