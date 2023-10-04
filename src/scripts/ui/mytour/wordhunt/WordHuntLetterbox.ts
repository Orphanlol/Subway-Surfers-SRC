import { Container, Text } from 'pixi.js';

import {  getCurrentLetterIndex, getWordHuntLetters, onWordHuntProgressed } from '../../../utils/WordHuntManager';
import Graph from '../../Graph';

export class WordHuntLetterbox extends Container
{
    base: Container;
    lettersContainer: Container;
    letters: Text[] = [];

    constructor()
    {
        super();

        this.base = this.addChild(Graph.roundRectBorder({
            round: 20,
            w: 564, h: 122,
            borderColor: -1,
            color: 0x5181aa,
        }));
        this.lettersContainer = this.base.addChild(new Container());

        const letters = getWordHuntLetters().toUpperCase();
        let prevPadding = 0;

        const currentLetter = getCurrentLetterIndex();

        for (let i = 0; i < letters.length; i++)
        {
            const letter = this.lettersContainer.addChild(new Text(letters[i], {
                align: 'center',
                fontFamily: 'Titan One',
                fontSize: 72,
                fill: currentLetter > i ? 0xffcc00 : 0x36373b,
                dropShadow: true,
                dropShadowDistance: 3,
                dropShadowColor: currentLetter > i ? 0x36373b : 0x6990be,
            }));

            letter.anchor.set(0.5);
            prevPadding += ((this.letters[i - 1]?.width || 0) / 2) + (letter.width / 2);
            letter.x = prevPadding - (this.base.width / 2) + (15 * i);

            this.letters.push(letter);
        }

        const first = this.letters[0];
        const last = this.letters[letters.length - 1];
        const lettersWidth = (last.x + (last.width / 2)) - (first.x - (first.width / 2));
        const sidePadding = (this.base.width - lettersWidth) / 2;

        for (let index = 0; index < letters.length; index++)
        {
            this.letters[index].x += sidePadding;
        }

        onWordHuntProgressed.add((index) =>
        {
            this.letters[index].style = {
                align: 'center',
                fontFamily: 'Titan One',
                fontSize: 72,
                fill: 0xffcc00,
                dropShadow: true,
                dropShadowDistance: 3,
                dropShadowColor: 0x36373b,
            };
        });
    }
}
