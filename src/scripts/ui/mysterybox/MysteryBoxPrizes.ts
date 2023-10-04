import { I18nLabel, I18nLabelOptions } from '@goodboydigital/astro';
import { Container, Sprite } from 'pixi.js';

import GameConfig from '../../GameConfig';
import { CloseButton } from '../buttons/CloseButton';
import Graph from '../Graph';
import ScreenGlow, { ScreenGlowType } from '../ScreenGlow';
import Widget from '../Widget';
import { JackpotLabel } from './JackpotLabel';
import { PrizesLabel } from './PrizesLabel';

const panelsData = [
    { type: 'mini-mystery-box', label: 'in-mini-mystery', icon: 'icon-item-mini-mystery-box.png' },
    { type: 'mystery-box', label: 'in-mystery', icon: 'icon-item-mystery-box.png', jackpotLabel: 'jackpot-coins' },
    { type: 'super-mystery-box', label: 'in-super-mystery', icon: 'icon-item-super-mystery-box.png',
        jackpotLabel: 'super-jackpot-coins' },
];

export class MysteryBoxPrizes extends Widget
{
    private bg!: ScreenGlow;
    private base!: Container;
    private btnClose!: CloseButton;
    private panels: Map<string, Container> = new Map<string, Container>();

    protected onBuild(): void
    {
        this.bg = this.addChild(new ScreenGlow(ScreenGlowType.BLACK));
        this.bg.interactive = true;
        this.bg.on('pointertap', () => this.close());

        const w = 690;
        const h = 935;

        // this.base = this.addChild(Graph.rectComp(
        //     { w, h, color: 0xeeeeee, round: 16 },
        //     { w: w + 22, h: h + 24, image: 'box-border-grey.png', x: 5, y: 6 },
        // ));
        // this.base.interactive = true;

        this.btnClose = this.addChild(new CloseButton({
            onTap: () => this.close(),
        }));

        this.btnClose.x = (-w / 2) + 10;
        this.btnClose.y = (-h / 2) + 10;

        for (let index = 0; index < panelsData.length; index++)
        {
            const container = this.addChild(new Container());
            const opts = panelsData[index];
            const labelOptions: I18nLabelOptions = {
                fill: 0x0e3650,
                fontSize: 68,
                fontFamily: 'Titan One',
            };

            const isMini = opts.type === 'mini-mystery-box';
            const h = isMini ? 680 : 935;

            const header = this.makeLabel('prizes', labelOptions, container);

            header.x = -header.width / 2;
            header.y = (-h / 2) + 40;

            labelOptions.fill = 0x0374a5;
            labelOptions.fontSize = 47;
            labelOptions.fontFamily = 'Lilita One';
            const subHeader = this.makeLabel(opts.label, labelOptions, container);

            subHeader.y = (-h / 2) + 100;

            const icon = container.addChild(Sprite.from(opts.icon));

            icon.scale.set(1.2);
            icon.anchor.set(0.5, 0);

            subHeader.x = -(subHeader.width / 2) - (icon.width / 2);
            icon.x = (subHeader.width / 2) + 5;
            icon.y = subHeader.y - 5;

            const type = opts.type;
            let prizesLabel = container.addChild(new PrizesLabel({ label: 'rare', type }));

            let y = 0;

            if (opts.jackpotLabel)
            {
                const jackpotLabel = container.addChild(new JackpotLabel(opts.jackpotLabel));

                jackpotLabel.y = -190;
                y += jackpotLabel.y + jackpotLabel.height - 10;
            }

            prizesLabel.y = y;
            y += (prizesLabel.height / 2);

            if (!isMini)
            {
                prizesLabel = container.addChild(new PrizesLabel({ color: 0x7ba749, label: 'special', sections: 3, type }));
                prizesLabel.y = y + (prizesLabel.height / 2) + 10;
                y = prizesLabel.y + (prizesLabel.height / 2);
            }

            if (GameConfig.tokens || isMini)
            {
                prizesLabel = container.addChild(new PrizesLabel({ color: 0x58a5c8, h: isMini ? 180 : 135,
                    label: 'common', labelSize: 33, type }));
                prizesLabel.y = y + (prizesLabel.height / 2) + 10;
            }

            this.panels.set(opts.type, container);
        }
    }

    onOpen(type: string): void
    {
        this.panels.forEach((c, s) =>
        {
            c.visible = type === s;
        });

        const w = 690;
        const h = type === 'mini-mystery-box' ? 680 : 935;

        this.removeChild(this.base);
        this.base = this.addChildAt(Graph.rectComp(
            { w, h, color: 0xeeeeee, round: 16 },
            { w: w + 22, h: h + 24, image: 'box-border-grey.png', x: 5, y: 6 },
        ), 1);
        this.base.interactive = true;

        this.btnClose.y = (-h / 2) + 10;
    }

    protected onResize(): void
    {
        const w = this.viewportWidth;
        const h = this.viewportHeight;

        this.x = w * 0.5;
        this.y = h * 0.5;
        this.bg.resize(w, h);
    }

    makeLabel(id: string, data: I18nLabelOptions, container: Container): I18nLabel
    {
        return container.addChild(new I18nLabel(id, data));
    }
}
