import { I18nLabel } from '@goodboydigital/astro';
import { Graphics } from 'pixi.js';
import type { ConsumableBoost, PermanentBoost } from 'src/scripts/data/boosts/BoostData';

import { Trackpad, TrackpadOptions } from '../Trackpad';
import { BoostModule } from './BoostModule';

interface BoostScrollerOptions extends TrackpadOptions
{
    consumables: ConsumableBoost[];
    permanents: PermanentBoost[];
}

export class BoostScroller extends Trackpad
{
    private consumablesTitle: I18nLabel;
    private permanentsTitle: I18nLabel;
    private consumables: BoostModule[] = [];
    private permanents: BoostModule[] = [];
    private spacing = 10;

    constructor(data: BoostScrollerOptions)
    {
        super(data);

        this.consumablesTitle = this.makeTitle('consumables-title');
        this.consumables = data.consumables.map((data) =>
            this.addChild(new BoostModule(data)),
        );
        this.permanentsTitle = this.makeTitle('permanents-title');

        this.permanents = data.permanents.map((data) =>
            this.addChild(new BoostModule(data)));

        const hitArea = new Graphics()
            .beginFill(0xFFF, 0.001)
            .drawRect(-this.width / 2, (-this.consumablesTitle.height / 2) - 15, this.width, this.height);

        this.addChildAt(hitArea, 0);
    }

    updateTransform():void
    {
        super.updateTransform();

        this.update();
        this.y = this.targetY;
        this.refresh();
    }

    makeTitle(id: string): I18nLabel
    {
        return this.addChild(new I18nLabel(id, {
            align: 'left',
            fill: 0x004a80,
            fontSize: 70,
            fontFamily: 'Titan One',
            dropShadow: false,
            anchorX: 0.5,
            anchorY: 1,
        }));
    }

    easeToSlot(slot: number): void
    {
        const { yScrollMin, yScrollMax } = this;
        const slotWidth = this.size / (this.maxSlots - 5);
        const yEasing = Math.max(yScrollMin, yScrollMax - (slotWidth * slot));

        super.easeToPosition(yEasing, 0);
    }

    getSlotIndex():number
    {
        const { yScrollMin, yScrollMax, maxSlots, y } = this;
        const totalWidth = yScrollMax - yScrollMin;
        const slotWidth = totalWidth / (maxSlots - 4);

        let dy = Math.max(0, yScrollMax - y);

        dy = Math.min(dy + (slotWidth * 2), (slotWidth * (maxSlots - 3)));

        return Math.floor(dy / slotWidth);
    }

    refresh(): void
    {
        let y = 10;

        this.consumablesTitle.y = y;
        y += this.consumablesTitle.height;
        this.consumables.forEach((module) =>
        {
            module.y = y;
            y += module.height + this.spacing;
        });

        this.permanentsTitle.y = y + 10;
        y += this.permanentsTitle.height + 10;
        this.permanents.forEach((module) =>
        {
            module.y = y;
            y += module.height + this.spacing;
        });
    }

    refreshItems(): void
    {
        this.consumables.forEach((item) => item.refresh());
        this.permanents.forEach((item) => item.refresh());
    }
}
