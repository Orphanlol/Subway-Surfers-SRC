import { I18nLabel } from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import { AwardHandler } from '../../../awards/AwardHandler';
import { Button } from '../../buttons/Button';
import Graph from '../../Graph';
import { AwardUIKeys } from './AwardUIKeys';
import { AwardUIProgressBar } from './AwardUIProgressBar';
import { AwardUITrophies } from './AwardUITrophies';

export class AwardUIItem extends PIXI.Container
{
    private bg: PIXI.Sprite;
    private btnCollect: Button;
    private labelTitle: I18nLabel;
    private labelDesc: I18nLabel;
    private trophies: AwardUITrophies;
    private keys: AwardUIKeys;
    private progressBar: AwardUIProgressBar;
    public award: AwardHandler;
    public width = 1;
    public height = 1;

    constructor(award: AwardHandler, width: number, height: number)
    {
        super();
        this.award = award;
        this.bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.bg.anchor.set(0.5);
        this.bg.tint = 0xa9d7ee;
        this.addChild(this.bg);

        this.trophies = new AwardUITrophies(112, height - 20);
        this.addChild(this.trophies);

        const rightWidth = width - this.trophies.width - 20;

        this.labelTitle = new I18nLabel(this.award.id, {
            fontFamily: 'Lilita One',
            fontSize: 36,
            anchorX: 0,
            anchorY: 0,
            wordWrap: true,
            wordWrapWidth: rightWidth,
            lineHeight: 36,
            fill: 0x1a5c8d,
        });
        this.addChild(this.labelTitle);

        this.labelDesc = new I18nLabel(`${this.award.id}-desc`, {
            fontFamily: 'Lilita One',
            fontSize: 24,
            anchorX: 0,
            anchorY: 0,
            fill: 0x2f89b7,
            wordWrap: true,
            wordWrapWidth: rightWidth,
            lineHeight: 20,
            params: { x: 0 },
        });
        this.addChild(this.labelDesc);

        this.keys = new AwardUIKeys(rightWidth, 50);
        this.addChild(this.keys);

        this.progressBar = new AwardUIProgressBar(rightWidth - 100, 34);
        this.addChild(this.progressBar);

        this.btnCollect = new Button({
            label: 'award-collect',
            base: Graph.rectComp(
                { w: 350 + 16, h: 56 + 20, image: 'box-border-grey.png', x: 5, y: 6 },
                { w: 350 - 8, h: 56 - 6, color: 0x41972a, round: 12 },
            ),
            labelSize: 30,
            labelFont: 'Lilita One',
            onTap: () =>
            {
                this.award.collect();
                this.refresh();
            },
        });
        this.addChild(this.btnCollect);

        this.resize(width, height);
        this.refresh();
    }

    public resize(width?: number, height?: number): void
    {
        if (width) this.width = width;
        if (height) this.height = height;

        this.bg.width = this.width;
        this.bg.height = this.height;

        this.trophies.x = (-this.width / 2) + 10;
        this.trophies.y = (-this.height / 2) + 10;

        this.labelTitle.x = (-this.width / 2) + this.trophies.width + 10;
        this.labelTitle.y = (-this.height / 2) + 10;

        this.labelDesc.x = this.labelTitle.x;
        this.labelDesc.y = this.labelTitle.y + this.labelTitle.height + 5;

        this.keys.x = this.labelTitle.x;
        this.keys.y = (this.height / 2) - this.keys.height - 10;

        this.progressBar.x = this.keys.x + 8;
        this.progressBar.y = this.keys.y + 8;

        this.btnCollect.x = this.labelTitle.x + (this.btnCollect.width / 2) - 10;
        this.btnCollect.y = this.keys.y + (this.keys.height / 2) - 3;
    }

    public refresh(): void
    {
        if (this.award.allTiersCompleted())
        {
            this.btnCollect.visible = false;
            this.progressBar.visible = false;
            this.keys.visible = false;
            this.labelDesc.id = 'award-completed';
            this.labelDesc.refresh();
            this.trophies.hideBadge();
        }
        else
        {
            const ratio = this.award.getProgressRatio();

            this.keys.visible = true;
            this.btnCollect.visible = ratio === 1;
            this.progressBar.visible = !this.btnCollect.visible;
            this.progressBar.ratio = ratio;
            this.keys.amount = this.award.getCurrentReward();

            this.labelDesc.id = `${this.award.id}-desc`;
            this.labelDesc.options.params = { x: this.award.getCurrentGoal() };
            this.labelDesc.refresh();

            this.award.isReadyToCollect() ? this.trophies.showBadge() : this.trophies.hideBadge();
        }

        this.trophies.tier = this.award.getCurrentTier();
    }
}
