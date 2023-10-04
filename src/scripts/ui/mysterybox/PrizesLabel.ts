import { I18nLabel, I18nLabelOptions } from '@goodboydigital/astro';
import { Container, Graphics, Sprite } from 'pixi.js';

import Graph from '../Graph';

let dataMap: any;

// TODO refactor if there is time
export class PrizesLabel extends Container
{
    base: Container;

    constructor(opts = {})
    {
        super();
        if (!dataMap)
        {
            dataMap = {
                'mystery-box': {
                    rare: {
                        labels: [
                            { label: 'prize-key' },
                            { label: 'prize-scoreBoosters' },
                            { label: 'prize-trophies' },
                            { label: 'prize-n-coins', params: { num: 5000 } },
                        ],
                        icons: [
                            this.getKeySprite(),
                            this.getBoostSprite('icon-item-scorebooster.png'),
                            Sprite.from('trophy-headphones-stroke.png'),
                            Sprite.from('coin-pouches-stroke.png'),
                        ],
                    },
                    special: {
                        labels: [
                            { label: 'prize-headstarts' },
                            { label: 'prize-upto-boards', params: { num: 10 } },
                            { label: 'prize-upto-coins', params: { num: 2500 } },
                        ],
                        icons: [
                            this.getBoostSprite('icon-item-headstart.png'),
                            this.getBoostSprite('icon-item-hoverboard.png'),
                            Sprite.from('coin-pouch-stroke.png'),
                        ],
                    },
                    common: {
                        icons: [
                            Sprite.from('trophy-fresh-token.png'),
                            Sprite.from('trophy-yutani-token.png'),
                            Sprite.from('trophy-spike-token.png'),
                            Sprite.from('trophy-tricky-token.png'),
                        ],
                    },
                },
                'super-mystery-box': {
                    rare: {
                        labels: [
                            { label: 'prize-key' },
                            { label: 'prize-scoreBoosters' },
                            { label: 'prize-trophies' },
                            { label: 'prize-n-coins', params: { num: 50000 } },
                        ],
                        icons: [
                            this.getKeySprite(),
                            this.getBoostSprite('icon-item-scorebooster.png'),
                            Sprite.from('trophy-headphones-stroke.png'),
                            Sprite.from('coin-pouches-stroke.png'),
                        ],
                    },
                    special: {
                        labels: [
                            { label: 'prize-headstarts' },
                            { label: 'prize-upto-boards', params: { num: 20 } },
                            { label: 'prize-upto-coins', params: { num: 8000 } },
                        ],
                        icons: [
                            this.getBoostSprite('icon-item-headstart.png'),
                            this.getBoostSprite('icon-item-hoverboard.png'),
                            Sprite.from('coin-pouch-stroke.png'),
                        ],
                    },
                    common: {
                        icons: [
                            Sprite.from('trophy-fresh-token.png'),
                            Sprite.from('trophy-yutani-token.png'),
                            Sprite.from('trophy-spike-token.png'),
                            Sprite.from('trophy-tricky-token.png'),
                        ],
                    },

                },
                'mini-mystery-box': {
                    rare: {
                        labels: [
                            { label: 'prize-upto-keys', params: { num: 2 } },
                            { label: 'prize-scoreBoosters' },
                        ],
                        icons: [
                            this.getKeySprite(),
                            this.getBoostSprite('icon-item-scorebooster.png'),
                        ],
                    },
                    common: {
                        labels: [
                            { label: 'prize-upto-boards', params: { num: 3 } },
                            { label: 'prize-upto-coins', params: { num: 2000 } },
                        ],
                        icons: [
                            this.getBoostSprite('icon-item-hoverboard.png'),
                            Sprite.from('coin-pouch-stroke.png'),
                        ],
                    },

                },
            };
        }

        const options = {
            round: 20,
            w: 650, h: 180,
            borderColor: -1,
            color: 0xea9c24,
            label: '',
            labelSize: 40,
            type: 'mystery-box',
            ...opts,
        };

        this.base = this.addChild(Graph.roundRectBorder(options));
        const mask = this.addChild(Graph.roundRectBorder(options));

        const labelBaseOptions = {
            w: 75, h: options.h,
            color: 0x00000000,
            alpha: 0.28,
            borderColor: -1,
        };
        const labelBase = this.addChild(Graph.rect(labelBaseOptions));

        labelBase.mask = mask;
        labelBase.x = 37.5 - (this.base.width / 2);

        const labelOptions: I18nLabelOptions = {
            fill: 0xFFFFFF,
            fontSize: options.labelSize,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowAngle: Math.PI * 0.8,
            dropShadowDistance: 3,
            anchorX: 0.5,
            anchorY: 0.5,
        };

        const label = labelBase.addChild(new I18nLabel(options.label, labelOptions));

        label.rotation = -Math.PI / 2;

        const { labels, icons } = dataMap[options.type][options.label] as {
            labels?: {label:string; params:{num: number}}[], icons: Sprite[]
        };

        const sections = icons.length;

        for (let i = 0; i < sections; i++)
        {
            const section = this.addChild(new Graphics().beginFill(0xFFFFFF, 0.4)
                .drawRect(-2, -options.h / 2, 4, options.h).endFill());
            const sectionWidth = (this.base.width - labelBase.width) / sections;

            section.x = labelBase.width - (this.base.width / 2) + (sectionWidth * (i + 1));
        }

        if (labels)
        {
            labels.forEach(({ label, params }, i) =>
            {
                labelOptions.fontSize = 30;
                labelOptions.params = params;
                labelOptions.align = 'center';
                labelOptions.dropShadowAngle = 0;
                const prizeLabel = this.addChild(new I18nLabel(label, labelOptions));
                const sectionWidth = (this.base.width - labelBase.width) / sections;

                prizeLabel.x = (sectionWidth / 2) + labelBase.width - (this.base.width / 2) + (sectionWidth * (i));
                prizeLabel.y = (this.height / 2) - 45;
            });
        }

        for (let i = 0; i < icons.length; i++)
        {
            const icon = this.addChild(icons[i]);

            const sectionWidth = (this.base.width - labelBase.width) / sections;

            icon.anchor.set(0.5);
            icon.x = (sectionWidth / 2) + labelBase.width - (this.base.width / 2) + (sectionWidth * (i));
            if (labels) icon.y = (icon.height / 2) + 20 - (this.height / 2);
            else icon.scale.set(1.2);
        }
    }

    getKeySprite(): Sprite
    {
        const keyLarge = Sprite.from('icon-key-large.png');

        keyLarge.scale.set(0.65);

        return keyLarge;
    }

    getBoostSprite(icon: string): Sprite
    {
        const booster = Sprite.from('base-item.png');

        booster.addChild(Sprite.from(icon)).anchor.set(0.5);

        return booster;
    }
}
