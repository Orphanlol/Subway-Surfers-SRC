import { I18nLabel } from '@goodboydigital/astro';
import { Container, Sprite } from 'pixi.js';

import { makeDashedLine } from '../../utils/makeDashedLine';
import { WordHuntLetterbox } from '../mytour/wordhunt/WordHuntLetterbox';
import { WordHuntTimer } from '../mytour/wordhunt/WordHuntTimer';

export class PauseHuntSection extends Container
{
    constructor()
    {
        super();

        const h1Label = this.addChild(new I18nLabel('word-hunt', {
            fill: 0x07294a,
            fontSize: 40,
            fontFamily: 'Titan One',
        }));
        const h2Label = this.addChild(new I18nLabel('collect-letters', {
            fill: 0x6fb500,
            fontSize: 35,
            fontFamily: 'Lilita One',
        }));

        h2Label.y = h1Label.height;

        const timer = this.addChild(new WordHuntTimer());

        const letterBox = this.addChild(new WordHuntLetterbox());
        const dashed = letterBox.addChild(makeDashedLine({
            sections: 6,
            orientation: 'vertical',
            color: 0xFFFFFF,
            lineHeight: 4,
        }));

        dashed.x = 110;

        const availableWidth = (letterBox.width / 2) + 110 - (dashed.width / 2);
        const letters = letterBox.lettersContainer;

        if (letters.width > availableWidth - 40)
        {
            letters.scale.set((availableWidth - 40) / letters.width);
        }
        const availableMargin = availableWidth - letterBox.lettersContainer.width;

        letterBox.lettersContainer.x = (-this.width / 2) + (letterBox.lettersContainer.width / 2) + (availableMargin / 2);
        letterBox.y = h1Label.height + h2Label.height + (letterBox.height / 2) + 20;

        h1Label.x = -letterBox.width / 2;
        h2Label.x = -letterBox.width / 2;
        timer.x = (letterBox.width / 2) - (timer.width / 2);
        timer.y = h1Label.height;

        const prizeContainer = letterBox.addChild(new Container());
        const prize = prizeContainer.addChild(Sprite.from('mystery-box-icon.png'));

        prizeContainer.x = 200;
        prize.scale.set(0.6);
        prize.anchor.set(0.5);
        prize.y = -14;

        const labelOptions = {
            align: 'center',
            fontFamily: 'Lilita One',
            fontSize: 24,
            fill: 0xFFFFFF,
            dropShadow: true,
            dropShadowDistance: 2,
            dropShadowColor: 0x000000,
            anchorX: 0.5,
            anchorY: 0.5,
        };
        const label = prizeContainer.addChild(new I18nLabel('mystery', labelOptions));

        label.y = 42;
    }
}
