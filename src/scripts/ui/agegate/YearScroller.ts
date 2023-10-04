import { Linear, TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';
import { Signal } from 'signals';

import { makeDashedLine } from '../../utils/makeDashedLine';
import Graph from '../Graph';
import { Trackpad } from '../Trackpad';

export class YearScroller extends PIXI.Container
{
    private current = -1;
    private selector: PIXI.Graphics;
    private elements: (PIXI.Text|PIXI.Container)[] = [];
    public onElementSelected = new Signal<(el:number)=>void>();
    private spacing = 20;
    private elementHeight = 35;
    private scroller: Trackpad;
    private dashIndex: number;

    constructor()
    {
        super();

        const sample = new PIXI.Text('W', {
            fontSize: 40,
            fill: 0x4b86a6,
            fontFamily: 'Lilita One',
        });

        this.elementHeight = sample.height + 5;
        const h = 380;
        const base = this.addChild(Graph.rectColor({
            w: 160,
            h,
            round: 8,
            color: 0xd1dee4,
        }));

        this.scroller = this.addChild(new Trackpad({
            damp: 0.8,
            yScrollMax: (-h / 2) + (base.height / 2),
            target: base,
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
            this.goToPrevious();
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
            this.goToNext();
        });
        arrowUp.on('pointerup', () => { arrowUp.tint = 0xFFFFFF; });
        arrowUp.on('pointerout', () => { arrowUp.tint = 0xFFFFFF; });

        let y = 0;
        const initYear = 1900;
        const currentYear = new Date().getUTCFullYear();

        for (let i = 0; i <= 1999 - initYear; i++)
        {
            const yearTag = this.scroller.addChild(new PIXI.Text(`${i + initYear}`, {
                fontSize: 45,
                fill: 0x4b86a6,
                fontFamily: 'Lilita One',
            }));

            yearTag.anchor.set(0.5);
            yearTag.y = y;
            y += this.elementHeight + this.spacing;

            this.elements.push(yearTag);
        }

        const dashed = this.scroller.addChild(makeDashedLine());

        this.dashIndex = this.elements.length;
        this.elements.push(dashed);
        dashed.y = y;
        y += this.elementHeight + this.spacing;

        for (let i = 0; i <= currentYear - 2000; i++)
        {
            const yearTag = this.scroller.addChild(new PIXI.Text(`${i + 2000}`, {
                fontSize: 45,
                fill: 0x4b86a6,
                fontFamily: 'Lilita One',
            }));

            yearTag.anchor.set(0.5);
            yearTag.y = y;
            y += this.elementHeight + this.spacing;

            this.elements.push(yearTag);
        }

        this.scroller.mask = this.addChild(Graph.rectColor({
            w: 160,
            h,
            round: 8,
            color: 0xd1dee4,
        }));
        this.selector = this.addChild(new PIXI.Graphics().beginFill(0xFF0000, 0.001).drawRect(-100, -25, 200, 50));
        this.scroller.yScrollMin = -this.scroller.height + this.elementHeight;
        this.scroller.targetY = this.scroller.yEasing = -dashed.y;
    }

    updateTransform(): void
    {
        super.updateTransform();

        const toTest = this.elements;

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

                        if (this.current !== this.dashIndex)
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

                    if (i !== this.dashIndex)
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
                    this.onElementSelected.dispatch(parseInt((tag as PIXI.Text).text, 10) || 0);
                    this.current = i;
                }
            }
        });
        this.scroller.update();
        this.scroller.y = this.scroller.targetY;
    }

    goToPrevious(): void
    {
        this.scroller.yEasing += this.elementHeight + this.spacing;
    }

    goToNext(): void
    {
        this.scroller.yEasing -= this.elementHeight + this.spacing;
    }
}
