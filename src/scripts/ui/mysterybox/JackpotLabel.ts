import { I18nLabel, I18nLabelOptions } from '@goodboydigital/astro';
import { Container, Sprite } from 'pixi.js';

import { BgStripes } from '../BgStripes';

export class JackpotLabel extends Container
{
    base: BgStripes;

    constructor(label: string)
    {
        super();

        const w = 650;

        const labelOptions: I18nLabelOptions = {
            fill: 0xFFFFFF,
            fontSize: 48,
            fontFamily: 'Lilita One',
            anchorX: 1,
            dropShadow: true,
            dropShadowDistance: 7,
            dropShadowAngle: Math.PI / 4,
        };

        this.base = this.addChild(new BgStripes({
            radius: 20,
            w, h: 220,
            color: 0xaa0f1b,
            glow: 0xf5c70f,
            glowAlpha: 0.7,
            glowScale: { x: 2.5, y: 2.5 },
        }));

        let coinsIcon = this.base.addChild(Sprite.from('jackpot-coins-1.png'));

        coinsIcon.anchor.set(0.5);
        coinsIcon.x = 20 + (coinsIcon.width / 2) - (w / 2);

        coinsIcon = this.base.addChild(Sprite.from('jackpot-coins-2.png'));
        coinsIcon.anchor.set(0.5);
        coinsIcon.x = (w / 2) - 20 - (coinsIcon.width / 2);

        const jackpotSubHeader = this.addChild(new I18nLabel(label, labelOptions));

        jackpotSubHeader.x = 195;
        jackpotSubHeader.y = -10;

        labelOptions.fill = 0xffcc00;
        labelOptions.fontSize = 68;
        labelOptions.fontFamily = 'Titan One';
        const jackpotHeader = this.addChild(new I18nLabel('jackpot', labelOptions));

        jackpotHeader.x = 210;
        jackpotHeader.y = -80;
    }
}
