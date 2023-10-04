import { i18n } from '@goodboydigital/astro';
import { Linear, TimelineLite, TweenLite } from 'gsap';
import * as PIXI from 'pixi.js';

import Graph from '../../Graph';

export class MissionsDropDownPanel extends PIXI.Container
{
    base: PIXI.Container;
    missionLabel: PIXI.Text;
    timeline = new TimelineLite();

    constructor()
    {
        super();

        this.base = this.addChild(Graph.roundRectBorder({
            w: 300, h: 130, round: 15,
            color: 0x3a8bba,
        }));

        this.y = -this.height / 2;

        this.missionLabel = this.base.addChild(new PIXI.Text('', {
            align: 'center',
            fontFamily: 'Lilita One',
            fontSize: 26,
            fill: 0xFFFFFF,
            dropShadow: true,
            dropShadowDistance: 2,
            lineHeight: 32,
            wordWrap: true,
            wordWrapWidth: 300,
        }));

        this.missionLabel.anchor.set(0.5);
        const footer = this.base.addChild(new PIXI.Container());
        const checkmark = footer.addChild(PIXI.Sprite.from('mission-completed-checkmark.png'));

        footer.x = -75;
        footer.y = 40;
        checkmark.anchor.set(0.5);
        checkmark.scale.set(0.85);
        checkmark.x = (-checkmark.width / 2) - 10;
        const label = footer.addChild(new PIXI.Text('', {
            align: 'center',
            fontFamily: 'Lilita One',
            fontSize: 26,
            fill: 0xFFFFFF,
            dropShadow: true,
            dropShadowDistance: 2,
        }));

        label.anchor.set(0.5);
        label.text = i18n.translate('mission-complete');
        label.x = label.width / 2;

        this.timeline.pause();
        this.timeline.add(TweenLite.to(this, 0.3, { y: (this.height / 2) + 20, ease: Linear.easeInOut }) as any);
        this.timeline.delay(0.5);
        this.timeline.add(TweenLite.to(this, 0.3, { y: -this.height / 2, ease: Linear.easeInOut }) as any, 2);
    }

    show = (id: string, amount: number): void =>
    {
        this.missionLabel.text = i18n.translate(id, { amount });
        this.missionLabel.y = (-this.base.height / 4) + 10;
        this.timeline.restart(true);
    };
}
