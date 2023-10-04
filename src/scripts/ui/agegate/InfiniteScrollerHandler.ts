import { Linear, TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';

import Graph from '../Graph';
import { InfiniteScroller } from './InfiniteScroller';

export class InfiniteScrollerHandler extends PIXI.Container
{
    private monthScroller: InfiniteScroller;
    private current = -1;
    private selector: PIXI.Graphics;
    public onElementSelected = new Signal<(el:number)=>void>();

    constructor(elements: string[])
    {
        super();

        const h = 380;
        const scrollerContainer = this.addChild(Graph.rectColor({
            w: 160,
            h,
            round: 8,
            color: 0xd1dee4,
        }));

        const arrowDown = this.addChild(PIXI.Sprite.from('button-arrow-down.png'));

        arrowDown.scale.set(0.75);
        arrowDown.anchor.x = 0.5;
        arrowDown.y = (h / 2) + 15;
        arrowDown.interactive = true;
        arrowDown.buttonMode = true;
        arrowDown.on('pointerdown', () =>
        {
            arrowDown.tint = 0xAAAAAA;
            this.monthScroller.goToPrevious();
        });
        arrowDown.on('pointerup', () => { arrowDown.tint = 0xFFFFFF; });
        arrowDown.on('pointerout', () => { arrowDown.tint = 0xFFFFFF; });

        const arrowUp = this.addChild(PIXI.Sprite.from('button-arrow-down.png'));

        arrowUp.scale.set(0.75);
        arrowUp.anchor.x = 0.5;
        arrowUp.rotation = Math.PI;
        arrowUp.y = (-h / 2) - 15;
        arrowUp.interactive = true;
        arrowUp.buttonMode = true;
        arrowUp.on('pointerdown', () =>
        {
            arrowUp.tint = 0xAAAAAA;
            this.monthScroller.goToNext();
        });
        arrowUp.on('pointerup', () => { arrowUp.tint = 0xFFFFFF; });
        arrowUp.on('pointerout', () => { arrowUp.tint = 0xFFFFFF; });

        const scrollerMask = this.addChild(Graph.rectColor({
            w: 160,
            h,
            round: 8,
            color: 0xd1dee4,
        }));

        this.monthScroller = scrollerContainer.addChild(new InfiniteScroller({
            elements,
            damp: 0.8,
            yScrollMax: Infinity,
            topBoundary: -h / 2,
            bottomBoundary: h / 2,
            target: scrollerContainer,
        }));
        this.monthScroller.mask = scrollerMask;
        this.selector = this.addChild(new PIXI.Graphics().beginFill(0xFF0000, 0.001).drawRect(-100, -25, 200, 50));
    }

    updateTransform(): void
    {
        super.updateTransform();

        const toTest = this.monthScroller.elements;

        toTest.forEach((tag, i) =>
        {
            if (this.selector.containsPoint(tag.toGlobal(this.selector.position)))
            {
                if (i !== this.current)
                {
                    if (this.current !== -1)
                    {
                        const previous = toTest[this.current];

                        TweenLite.to(previous.scale, 0.15, { x: 1, y: 1, ease: Linear.easeInOut });

                        if (this.current > 0)
                        {
                            TweenLite.to(previous, 0.25, { pixi: { tint: 0xFFFFFF }, ease: Linear.easeInOut });
                        }
                        else
                        {
                            previous.children.forEach((c) =>
                            {
                                TweenLite.to(c, 0.25, { pixi: { tint: 0xFFFFFF }, ease: Linear.easeInOut });
                            });
                        }
                    }

                    TweenLite.to(tag.scale, 0.15, { x: 1.4, y: 1.4, ease: Linear.easeInOut });

                    if (i > 0)
                    {
                        TweenLite.to(tag, 0.25, { pixi: { tint: 0x092a53 }, ease: Linear.easeInOut });
                    }
                    else
                    {
                        tag.children.forEach((c) =>
                        {
                            TweenLite.to(c, 0.25, { pixi: { tint: 0x092a53 }, ease: Linear.easeInOut });
                        });
                    }
                    this.onElementSelected.dispatch(i);
                    this.current = i;
                }
            }
        });
    }
}
