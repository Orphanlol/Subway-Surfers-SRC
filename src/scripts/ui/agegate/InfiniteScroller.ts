import { Container, Text } from 'pixi.js';

import { makeDashedLine } from '../../utils/makeDashedLine';
import { Trackpad, TrackpadOptions } from '../Trackpad';

export interface InfiniteScrollerOptions extends TrackpadOptions
{
    elements: string[];
    topBoundary: number;
    bottomBoundary: number;
}

export class InfiniteScroller extends Trackpad
{
    public elements: (Container|Text)[] = [];
    private topBoundary: number;
    private bottomBoundary: number;
    private topY: number;
    private bottomY: number;
    private spacing = 20;
    private elementHeight = 35;

    constructor(data: InfiniteScrollerOptions)
    {
        super(data);

        const sample = new Text('W', {
            fontSize: 40,
            fill: 0x4b86a6,
            fontFamily: 'Lilita One',
        });

        this.elementHeight = sample.height + 5;
        const dashed = this.addChild(makeDashedLine());

        this.elements.push(dashed);

        let y = this.elementHeight + this.spacing;

        this.elements.push(...data.elements.map((month) =>
        {
            const monthTag = this.addChild(new Text(month, {
                fontSize: 45,
                fill: 0x4b86a6,
                fontFamily: 'Lilita One',
            }));

            monthTag.anchor.set(0.5);
            monthTag.y = y;
            y += this.elementHeight + this.spacing;

            return monthTag;
        }));

        this.topBoundary = data.topBoundary;
        this.bottomBoundary = data.bottomBoundary;
        this.topY = -this.elementHeight - this.spacing;
        this.bottomY = this.height + this.spacing;

        this.refresh(0.1);
    }

    updateTransform(): void
    {
        super.updateTransform();

        this.update();

        this.refresh(this.ySpeed);
        this.y = this.targetY;
    }

    refresh(speed: number): void
    {
        if (speed > 0.02)
        {
            this.elements.filter((monthTag) => this.y + monthTag.y > this.bottomBoundary)
                .sort((a, b) => b.y - a.y)
                .forEach((monthTag) =>
                {
                    monthTag.y = this.topY;
                    this.topY -= this.elementHeight + this.spacing;
                    this.bottomY -= this.elementHeight + this.spacing;
                });
        }
        else if (speed < -0.02)
        {
            this.elements.filter((monthTag) => (this.y + monthTag.y + this.elementHeight) < this.topBoundary)
                .sort((a, b) => a.y - b.y)
                .forEach((monthTag) =>
                {
                    monthTag.y = this.bottomY;
                    this.bottomY += this.elementHeight + this.spacing;
                    this.topY += this.elementHeight + this.spacing;
                });
        }
    }

    goToPrevious(): void
    {
        this.yEasing += this.elementHeight + this.spacing;
        this.refresh(0.1);
    }

    goToNext(): void
    {
        this.yEasing -= this.elementHeight + this.spacing;
        this.refresh(-0.1);
    }
}
