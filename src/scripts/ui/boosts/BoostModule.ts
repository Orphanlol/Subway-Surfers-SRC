import { I18nLabel, I18nLabelOptions } from '@goodboydigital/astro';
import { Back, TweenLite } from 'gsap';
import { Container,  Rectangle, Sprite } from 'pixi.js';
import { Signal } from 'signals';
import type { BoostType, ConsumableBoost, PermanentBoost } from 'src/scripts/data/boosts/BoostData';

import { app } from '../../SubwaySurfersApp';
import { Button } from '../buttons/Button';
import { CurrencyButton } from '../buttons/CurrencyButton';
import { CoinsTag } from '../CoinsTag';
import Graph from '../Graph';
import { BoostCounter } from './BoostCounter';

export class BoostModule extends Container
{
    public static allModules: BoostModule[];
    public base: Container;
    public toggled = false;
    public onUserTap = new Signal();

    private header: I18nLabel;
    private subHeader?: I18nLabel;
    private body: Container;
    private type: BoostType;
    private upgradeCounter?: BoostCounter;
    private icon: Container;
    private targetMiddleHeight: number;
    private initMiddleHeight: number;
    private coinsTag: CoinsTag;
    private hint: Sprite;
    private buyButton: CurrencyButton;
    public tappableArea: Container;
    public data: PermanentBoost|ConsumableBoost;

    constructor(data: PermanentBoost|ConsumableBoost)
    {
        super();
        if (!BoostModule.allModules) BoostModule.allModules = [];

        BoostModule.allModules.push(this);
        this.tappableArea = this.addChild(new Container());

        this.data = data;
        this.type = data.subType;

        const top = Sprite.from('upgrade-panel-top.png');
        const middle = Sprite.from('upgrade-panel-middle.png');
        const bottom = Sprite.from('upgrade-panel-bottom.png');

        middle.y = top.height - 1;
        bottom.y = top.height + middle.height - 2;
        bottom.scale.y = -1;
        bottom.anchor.y = 1;

        this.base = this.tappableArea.addChild(new Container());
        this.base.addChild(
            top,
            middle,
            bottom,
        );
        const w = this.base.width;
        const h = this.base.height;

        this.base.x = -w / 2;
        this.base.y = -h / 2;

        this.icon = this.tappableArea.addChild(new Container());
        const baseIcon = this.icon.addChild(Sprite.from('base-item.png'));
        const boostIcon = baseIcon.addChild(Sprite.from(`icon-item-${data.id.toLowerCase()}.png`));

        baseIcon.anchor.set(0.5);
        boostIcon.anchor.set(0.5);
        baseIcon.scale.set(1.15);
        boostIcon.scale.set(0.9);
        this.icon.x = -(w / 2) + (this.icon.width / 2) + 20;

        const labelOptions: I18nLabelOptions = {
            align: 'left',
            fill: 0xeecc32,
            fontSize: 42,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 2,
        };

        this.header = this.makeLabel(data.id, labelOptions);
        this.header.x = this.icon.x + (this.icon.width / 2) + 10;
        this.header.y = 15 - (h / 2);

        labelOptions.fill = 0xFFFFFF;
        labelOptions.fontSize = 25;
        if (data.description)
        {
            this.body = this.makeLabel(data.description, labelOptions);
            this.body.x = 20 - (w / 2);
            this.body.y = h / 2;
        }
        else
        {
            this.body = this.addChild(new Button({
                base: Graph.rectShadow(
                    {
                        round: 12,
                        w: 200, h: 60,
                        shadowAlpha: 0.15,
                        shadowDistance: 2,
                        color: 0xe47f00,
                    },
                ),
                label: 'view-prizes',
                labelFont: 'Lilita One',
                labelShadow: 2,
                labelSize: 28,
                onTap: () => app.prizesPanel.open('mystery-box') },
            ));
            this.body.x = (this.body.width / 2) + 20 - (w / 2);
            this.body.y = (h / 2) + (this.body.height / 2) - 10;
        }
        this.body.visible = false;

        this.initMiddleHeight = middle.height;
        this.targetMiddleHeight = middle.height + this.body.height + 30;
        if (this.type === 'consumables')
        {
            labelOptions.params = { num: data.upgradeCounter };
            this.subHeader = this.makeLabel((data as ConsumableBoost)?.subId || '', labelOptions);
            this.subHeader.x = this.header.x;
            this.subHeader.y = 5;
        }
        else
        {
            this.upgradeCounter = this.tappableArea.addChild(new BoostCounter(data.upgradeCounter));
            this.upgradeCounter.x = this.header.x;
            this.upgradeCounter.y = 5;
        }

        this.coinsTag = new CoinsTag({
            coins: data.cost,
            inverse: true,
            align: 'right' });
        if (data.cost !== -1) this.tappableArea.addChild(this.coinsTag);
        this.coinsTag.x = (w / 2) - this.coinsTag.width - 45;
        this.coinsTag.y = -(h / 2) + (this.coinsTag.height / 2) + 15;

        this.hint = this.tappableArea.addChild(Sprite.from('arrow-down-hint.png'));
        this.hint.x = (w / 2) - this.hint.width - 40;
        this.hint.y = (h / 2) - this.hint.height - 7;

        const desiredWidth = this.coinsTag.label.text.length * 42;

        this.buyButton = new CurrencyButton({
            w: desiredWidth,
            h: 70,
            onTap: this.onBuy,
        });

        if (data.cost !== -1) this.addChild(this.buyButton);
        this.buyButton.value = data.cost;
        this.buyButton.x = (w / 2) - (this.buyButton.width / 2) - 15;
        this.buyButton.y = this.targetMiddleHeight - 70;
        this.buyButton.visible = false;

        this.tappableArea.interactive = true;
        this.tappableArea.buttonMode = true;
        this.tappableArea.addListener('pointertap', this.onTap);
    }

    makeLabel(id: string, data: I18nLabelOptions): I18nLabel
    {
        return this.tappableArea.addChild(new I18nLabel(id, data));
    }

    close(): void
    {
        if (this.toggled) this.toggle();
    }

    onTap = (): void =>
    {
        BoostModule.allModules.forEach((module) => { if (module !== this) module.close(); });

        this.toggle();
        this.onUserTap.dispatch();
    };

    toggle(): void
    {
        const [top, middle, bottom] = this.base.children as Sprite[];
        const y = this.toggled ? 1 : this.targetMiddleHeight / this.initMiddleHeight;
        const toggled = this.toggled;

        TweenLite.to(middle.scale, 0.15, { y, overwrite: true, ease: Back.easeOut, onUpdate: () =>
        {
            const offset = 1 + middle.scale.y;

            middle.y = top.height - offset;
            bottom.y = middle.height + middle.y - offset;

            this.tappableArea.hitArea = new Rectangle(this.base.x, this.base.y, this.base.width, this.base.height);
        }, onStart: () =>
        {
            if (toggled)
            {
                this.hint.visible = true;
                TweenLite.to(this.hint, 0.15, { alpha: 1, overwrite: true });

                this.coinsTag.visible = true;
                TweenLite.to(this.coinsTag, 0.15, { alpha: 1, overwrite: true });

                this.buyButton.visible = false;
                this.buyButton.alpha = 0;
                this.body.visible = false;
                this.body.alpha = 0;
            }
            else
            {
                this.hint.visible = false;
                this.hint.alpha = 0;
                this.coinsTag.visible = false;
                this.coinsTag.alpha = 0;

                this.buyButton.visible = true;
                TweenLite.to(this.buyButton, 0.15, { alpha: 1, overwrite: true });
                this.body.visible = true;
                TweenLite.to(this.body, 0.15, { alpha: 1, overwrite: true });
            }
        } });

        this.toggled = !this.toggled;
    }

    onBuy = async (): Promise<void> =>
    {
        const success = await app.shop.purchase(this.data);

        if (!success) return;

        this.refresh();
    };

    getAmountPurchased(): number
    {
        try
        {
            return (app.user as any)[this.data.type][this.data.subType][this.data.id];
        }
        catch (e)
        {
            console.error(`Shop item not - type: ${this.data.type} subType: ${this.data.subType} id: ${this.data.id}`);

            return 0;
        }
    }

    refresh(): void
    {
        if (this.subHeader)
        {
            const num = this.getAmountPurchased();

            this.subHeader.options.params = { num };
            this.subHeader.refresh();
        }
        else if (this.upgradeCounter)
        {
            this.upgradeCounter.setLevel(this.getAmountPurchased());
            const cost = this.data.cost;

            if (cost > -1)
            {
                this.coinsTag.coins = cost;
                this.coinsTag.x = (this.base.width / 2) - this.coinsTag.width - 45;

                const desiredWidth = this.coinsTag.label.text.length * 42;

                this.buyButton.value = cost;
                (this.buyButton as any).base.width = desiredWidth;
                this.buyButton.x = (this.base.width / 2) - (this.buyButton.width / 2) - 15;
            }
            else
            {
                this.removeChild(this.buyButton);
                this.tappableArea.removeChild(this.coinsTag);
            }
        }
    }
}
