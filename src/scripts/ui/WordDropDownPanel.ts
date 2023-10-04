import { i18n } from '@goodboydigital/astro';
import { Linear, TimelineLite, TweenLite } from 'gsap';
import gsap from 'gsap/gsap-core';
import { PixiPlugin } from 'gsap/PixiPlugin';
import * as PIXI from 'pixi.js';

import {  getCurrentLetterIndex, getTodaysPrize, getWordHuntLetters, onWordHuntProgressed } from '../utils/WordHuntManager';
import { CoinsTag } from './CoinsTag';
import Graph from './Graph';

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);
gsap.defaults({ overwrite: 'auto' });

export class WordDropDownPanel extends PIXI.Container
{
    base: PIXI.Container;
    letters: PIXI.Text[] = [];
    lettersContainer: PIXI.Container;
    onCompletePanel = new PIXI.Container();
    timeline = new TimelineLite();
    currentLetter = 0;

    constructor()
    {
        super();

        this.base = this.addChild(Graph.roundRectBorder({
            w: 300, h: 90,
            color: 0x3a8bba,
        }));

        this.lettersContainer = this.addChild(new PIXI.Container());
        const letters = getWordHuntLetters().toUpperCase();

        let prevPadding = 0;

        this.currentLetter = getCurrentLetterIndex();
        for (let i = 0; i < letters.length; i++)
        {
            const letter = this.lettersContainer.addChild(new PIXI.Text(letters[i], {
                align: 'center',
                fontFamily: 'Titan One',
                fontSize: 53,
                fill: i >= this.currentLetter ? 0xFFFFFF : 0xffcc00,
                dropShadow: true,
                dropShadowDistance: 2,
            }));

            letter.anchor.set(0.5);

            prevPadding += ((Number(this.letters[i - 1]?.width) || 0) / 2) + (letter.width / 2);
            letter.x = prevPadding - (this.base.width / 2) + (15 * i);

            this.letters.push(letter);
        }

        const availableWidth = 260;

        if (this.lettersContainer.width > availableWidth)
        {
            this.lettersContainer.scale.set(availableWidth / this.lettersContainer.width);
        }

        const first = this.letters[0];
        const last = this.letters[letters.length - 1];
        const lettersWidth = (last.x + (last.width / 2)) - (first.x - (first.width / 2));
        const sidePadding = (this.base.width - lettersWidth) / 2;

        for (let index = 0; index < letters.length; index++)
        {
            this.letters[index].x += sidePadding;
        }

        this.y = -this.height / 2;

        let iconBase = this.onCompletePanel.addChild(Graph.roundRectBorder({
            w: 100, h: 90,
            color: 0x226184,
            borderColor: -1,
        }));

        iconBase.x = 56 - (this.base.width / 2);
        const prize = getTodaysPrize();

        if (typeof prize === 'number')
        {
            const coinsTag = iconBase.addChild(new CoinsTag({ coins: prize, fontSize: 40 }));

            coinsTag.scale.set(1 - ((`${prize}`.length - 2) / 5));
            coinsTag.x = -30;
        }
        else if (typeof prize === 'string')
        {
            const sprite = iconBase.addChild(PIXI.Sprite.from(`icon-item-${prize}.png`));

            sprite.anchor.set(0.5);
            sprite.scale.set(0.6);
        }

        iconBase = iconBase.addChildAt(Graph.rect({
            w: 50, h: 90,
            color: 0x226184,
        }), 0);
        iconBase.x = 25;

        const label = this.onCompletePanel.addChild(new PIXI.Text('', {
            align: 'center',
            fontFamily: 'Titan One',
            fontSize: 30,
            fill: 0xFFFFFF,
            dropShadow: true,
            dropShadowDistance: 2,
        }));

        label.anchor.set(0.2, 0.5);
        label.text = i18n.translate('word-hunt-complete');
        this.addChild(this.onCompletePanel);
        this.onCompletePanel.visible = false;

        this.timeline.pause();
        this.timeline.add(TweenLite.to(this, 0.3, { y: (this.height / 2) + 20, ease: Linear.easeInOut }) as any);
        this.timeline.call(this.progress);
        this.timeline.delay(0.5);
        this.timeline.add(TweenLite.to(this, 0.3, { y: -this.height / 2, ease: Linear.easeInOut, onComplete: () =>
        {
            if (this.currentLetter === letters.length - 1 && !this.onCompletePanel.visible)
            {
                this.onCompletePanel.visible = true;
                this.letters.forEach((l) => { l.visible = false; });
                this.timeline.delay(1.5);
                this.timeline.restart(true);
            }
        } }) as any, 2);
        onWordHuntProgressed.add(this.show);
    }

    progress = (): void =>
    {
        const letter = this.letters[this.currentLetter];

        TweenLite.to(letter, 0.25, { pixi: { tint: 0xffcc00 }, ease: Linear.easeInOut });
        TweenLite.to(letter.scale, 0.25, { x: 1.7, y: 1.7, ease: Linear.easeInOut });
        TweenLite.to(letter.scale, 0.25, { x: 1, y: 1, ease: Linear.easeInOut, delay: 0.25 });
    };

    show = (index: number): void =>
    {
        this.currentLetter = index;
        this.timeline.restart(true);
    };
}
