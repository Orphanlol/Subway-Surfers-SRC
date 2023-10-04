import { I18nLabel } from '@goodboydigital/astro';
import { TimelineMax } from 'gsap';
import { Sprite, Text } from 'pixi.js';

import { Button } from './buttons/Button';

export class DoubleUpButton extends Button
{
    private tvIcon: Sprite;
    private tvShine: Sprite;
    private timeline: TimelineMax;
    private descriptionLabel: I18nLabel;
    private amountLabel: Text;
    coins = 0;

    constructor()
    {
        super({
            w: 210, h: 80,
            base: Sprite.from('doubleup-module-panel.png'),
        });

        this.tvIcon = this.addChild(Sprite.from('icon-tv.png'));
        this.tvIcon.anchor.set(0.5);
        this.tvIcon.x = (this.width / 2) - 110;
        this.tvIcon.y = -10;
        this.tvShine = this.tvIcon.addChild(Sprite.from('shine-effect.png'));
        const tvShineMask = this.tvIcon.addChild(Sprite.from('icon-tv.png'));

        tvShineMask.anchor.set(0.5);
        this.tvShine.anchor.set(0.5);
        this.tvShine.mask = tvShineMask;

        this.timeline = new TimelineMax({ repeat: -1 });
        this.timeline.delay(0.5);
        this.timeline.to(this.tvIcon.scale, 0.3, { x: 1.2, y: 1.2 })
            .to(this.tvIcon.scale, 0.3, { x: 1, y: 1 })
            .fromTo(this.tvShine, 1, { x: -100, y: 100 }, { x: 100, y: -100 }, 0);
        this.timeline.play();

        const kingIcon = this.addChild(Sprite.from('icon-king.png'));

        kingIcon.anchor.set(0.5);
        kingIcon.x = 85 - (this.width / 2);
        kingIcon.y = -17;

        const header = this.addChild(new I18nLabel('double-up', {
            align: 'left',
            fill: 0xffcc00,
            fontSize: 35,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 2,
        }));

        header.x = -190;
        header.y = -40;

        this.descriptionLabel = this.addChild(new I18nLabel('get-coins', {
            align: 'left',
            fill: 0xFFFFFF,
            fontSize: 30,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 2,
            params: { num: 0 },
        }));
        this.descriptionLabel.x = -190;

        this.amountLabel = this.descriptionLabel.addChild(new Text('', {
            align: 'left',
            fill: 0xffcc00,
            fontSize: 30,
            fontFamily: 'Lilita One',
        }));
    }

    setCoins(num: number): void
    {
        // Cap max coins at 3000, as in original game
        if (num > 3000) num = 3000;

        this.descriptionLabel.options.params = { num };
        this.descriptionLabel.refresh();
        const text = (this.descriptionLabel['display'] as Text).text;

        let rulerString = '';

        for (let i = 0; i < text.length; i++)
        {
            if (!isNaN(parseInt(text[i], 10)))
            {
                rulerString = text.substr(0, i);
                break;
            }
        }

        this.amountLabel.text = rulerString;
        this.amountLabel.x = this.amountLabel.width - 1;
        this.amountLabel.text = `${num}`;
        this.coins = num;
    }
}
