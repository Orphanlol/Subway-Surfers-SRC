import { DisplayObject } from 'pixi.js';

import { Trackpad, TrackpadOptions } from '../Trackpad';

interface HorizontalScrollerOptions extends TrackpadOptions
{
    leftBound: number;
}
export class HorizontalScroller extends Trackpad
{
    private leftBound: number;
    private elementsCount = 0;

    constructor(opts: HorizontalScrollerOptions)
    {
        super(opts);

        this.leftBound = opts.leftBound + 30;
    }

    addElement(child: DisplayObject): void
    {
        this.addChild(child);
        this.elementsCount++;
        this.refresh();
    }

    refresh(): void
    {
        this.xScrollMin = this.leftBound - this.width;
        this.size = this.xScrollMax - this.xScrollMin;
        this.maxSlots = this.elementsCount;
    }

    easeToSlot(slot: number): void
    {
        const slotWidth = this.size / (this.maxSlots - 5);
        const xEasing = Math.max(this.xScrollMin, this.xScrollMax - (slotWidth * slot));

        this.easeToPosition(xEasing, this.y);
    }

    getSlotIndex():number
    {
        const { xScrollMin, xScrollMax, maxSlots, x } = this;
        const totalWidth = xScrollMax - xScrollMin;
        const slotWidth = totalWidth / (maxSlots - 4);

        let dx = Math.max(0, xScrollMax - x);

        dx = Math.min(dx + (slotWidth * 2), (slotWidth * (maxSlots - 3)));

        return Math.floor(dx / slotWidth);
    }
}
