import { I18nLabel } from '@goodboydigital/astro';
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { Signal } from 'signals';
import { MissionData } from 'src/scripts/data/missions/MissionData';

import { BgStripes } from '../BgStripes';
import Graph from '../Graph';

export class PauseMissionModule extends Container
{
    private mission!: MissionData;
    private descriptionLabel: I18nLabel;
    private amountLabel: Text;
    private progressLabel: Text;
    private progressFill: Graphics;
    private completedBg: BgStripes;
    public onMissionComplete = new Signal();

    constructor()
    {
        super();

        this.addChild(Graph.rectColor({
            w: 580, h: 96, color: 0x567ea9, round: 18,
        }));

        this.addChild(Graph.rectBorder({
            w: 100, h: 55, color: 0x7993ae, round: 6,
            x: 220, borderWidth: 3, borderAlpha: 0.2,
        }));

        const progressContainer = this.addChild(new Container());

        this.progressFill = progressContainer.addChild(new Graphics().beginFill(0x67bfc3)
            .drawRect(0, 0, 100, 54));
        this.progressFill.mask = progressContainer.addChild(new Graphics().beginFill(0x67bfc3)
            .drawRoundedRect(0, 0, 100, 54, 6));
        progressContainer.position.set(170, -27);

        this.progressLabel = progressContainer.addChild(new Text('0', {
            align: 'left',
            fill: 0xFFFFFF,
            fontSize: 35,
            fontFamily: 'Lilita One',
        }));
        this.progressLabel.anchor.set(0.5);
        this.progressLabel.position.set(50, 27);

        this.completedBg = progressContainer.addChild(new BgStripes({
            radius: 6,
            w: 100, h: 54,
            color: 0x70b501,
            glow: 0xFFFFFF,
            glowAlpha: 0.2,
            mask: Graph.rectColor({
                w: 100, h: 54, color: 0xb6cce0, round: 6,
            }),
        }));
        this.completedBg.x = 50;
        this.completedBg.y = 27;
        this.completedBg.visible = false;

        const checkmark = this.completedBg.addChild(Sprite.from('mission-completed-checkmark.png'));

        checkmark.anchor.set(0.5);

        this.descriptionLabel = this.addChild(new I18nLabel('jackpot-coins', {
            align: 'left',
            fill: 0xFFFFFF,
            fontSize: 35,
            fontFamily: 'Lilita One',
            dropShadow: true,
            dropShadowDistance: 2,
            lineHeight: 32,
            wordWrap: true,
            wordWrapWidth: 430,
        }));

        this.descriptionLabel.x = -275;

        this.amountLabel = this.descriptionLabel.addChild(new Text('', {
            align: 'left',
            fill: 0xffcc00,
            fontSize: 35,
            fontFamily: 'Lilita One',
        }));
    }

    public populate(mission: MissionData): void
    {
        const { id, params, hideAmountLabel } = mission;

        this.descriptionLabel.id = id;
        this.descriptionLabel.options.params = params;
        this.descriptionLabel.refresh();
        this.descriptionLabel.y = -(this.descriptionLabel.height / 2);

        this.amountLabel.visible = !hideAmountLabel;
        if (params)
        {
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
            this.amountLabel.text = `${params.amount}`;
        }

        this.mission = mission;
        this.completedBg.visible = mission.completed;
        const progress = mission.progress || 0;

        this.progressFill.scale.x = progress / this.mission.params.amount;
        this.progressLabel.text = `${progress}`;
        if (this.progressLabel.width > 90)
        {
            this.progressLabel.scale.set(90 / this.progressLabel.width);
        }
    }

    progressMission(): void
    {
        const mission = this.mission;

        this.completedBg.visible = mission.completed;
        const progress = mission.progress || 0;

        this.progressFill.scale.x = progress / this.mission.params.amount;
        this.progressLabel.text = `${progress}`;
        if (this.progressLabel.width > 90)
        {
            this.progressLabel.scale.set(90 / this.progressLabel.width);
        }

        if (this.mission.completed)
        {
            this.onMissionComplete.dispatch();
        }
    }

    updateTransform(): void
    {
        super.updateTransform();

        if (!this.mission || this.completedBg.visible) return;
        this.progressMission();
    }
}
