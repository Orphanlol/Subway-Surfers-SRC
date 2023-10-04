import { I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import { app } from '../../../SubwaySurfersApp';
import { Trackpad } from '../../Trackpad';
import Widget from '../../Widget';
import { AwardUIItem } from './AwardUIItem';

export default class AwardsUIList extends Widget
{
    public width: number;
    public height: number;
    private items: AwardUIItem[];
    private trackpad: Trackpad;
    private labelTitle: I18nLabel;

    constructor(width: number, height: number)
    {
        super();
        this.width = width;
        this.height = height;
        this.autoAddChild = false;
        this.items = [];

        this.trackpad = new Trackpad({ });
        this.addChild(this.trackpad);
        this.trackpad.y = this.trackpad.targetY = -this.height * 0.25;

        const mask = new PIXI.Sprite(PIXI.Texture.WHITE);

        mask.anchor.set(0.5);
        mask.width = width;
        mask.height = height - 180;
        this.addChild(mask);
        this.trackpad.mask = mask;

        this.labelTitle = new I18nLabel('awards', {
            fontFamily: 'Lilita One',
            fontSize: 60,
            anchorX: 0.5,
            anchorY: 0,
            fill: 0x003c6e,
        });
        this.addChild(this.labelTitle);
        this.labelTitle.y = (-this.height / 2) + 10;
    }

    protected onBuild(): void
    {
        const itemWidth = this.width - 60;
        const itemHeight = 190;
        const spacing = 10;

        for (const handler of app.awards.handlers)
        {
            const item = new AwardUIItem(handler, itemWidth, itemHeight);

            this.trackpad.addChild(item);
            this.items.push(item);
        }

        this.trackpad.yScrollMin = (-this.items.length * (itemHeight + spacing)) + (this.height * 0.5);
        this.trackpad.yScrollMax = -this.height * 0.25;
        this.reorderItems();
    }

    private reorderItems(): void
    {
        const spacing = 200;

        let items = this.items.slice(0);

        // Order by ready to collect - the ones ready comes first
        items = items.sort((a) => (a.award.isReadyToCollect() ? -1 : 1));

        // Order by tier - higher to lower
        items = items.sort((a, b) => (b.award.getCurrentTier() - a.award.getCurrentTier()));

        // Order by percentual completed - higher to lower
        items = items.sort((a, b) => (b.award.getProgressRatio() - a.award.getProgressRatio()));

        for (let i = 0; i < items.length; i++)
        {
            const item = items[i];

            item.y = i * spacing;
        }
    }

    public onOpen(): void
    {
        for (const item of this.items) item.refresh();
        this.reorderItems();
        this.trackpad.targetY = this.trackpad.yScrollMax;
        this.trackpad.y = this.trackpad.targetY;
        this.trackpad.lock();
        this.trackpad.unlock();
    }

    public updateTransform(): void
    {
        super.updateTransform();
        this.trackpad.update();
        this.trackpad.y = this.trackpad.targetY;
    }
}
