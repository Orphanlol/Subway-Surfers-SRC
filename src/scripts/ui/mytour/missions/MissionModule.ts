import { I18nLabel } from '@goodboydigital/astro';
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { Signal } from 'signals';

import { MissionData } from '../../../data/missions/MissionData';
import { app } from '../../../SubwaySurfersApp';
import { BgStripes } from '../../BgStripes';
import { CurrencyButton } from '../../buttons/CurrencyButton';
import Graph from '../../Graph';

export class MissionModule extends Container
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
            w: 580, h: 172, color: 0xb6cce0, round: 18,
        }));

        this.completedBg = this.addChild(new BgStripes({
            radius: 20,
            w: 580, h: 172,
            color: 0x70b501,
            glow: 0xFFFFFF,
            glowScale: { x: 4, y: 4 },
            glowAlpha: 0.5,
            mask: Graph.rectColor({
                w: 580, h: 172, color: 0xb6cce0, round: 18,
            }),
            center: { x: 0, y: 1 },
        }));
        this.completedBg.interactive = true;
        const completedLabel = this.completedBg.addChild(new I18nLabel('completed', {
            align: 'left',
            fill: 0x4a8400,
            fontSize: 45,
            dropShadow: true,
            dropShadowColor: 0xFFFFFF,
            dropShadowDistance: 1,
            fontFamily: 'Lilita One',
            anchorX: 0.5,
            anchorY: 0.5,
        }));

        completedLabel.position.set(-15, 43);
        const checkmark = this.completedBg.addChild(Sprite.from('mission-completed-checkmark.png'));

        checkmark.anchor.set(0.5);
        checkmark.position.set((completedLabel.width / 2) + (checkmark.width / 2) - 5, 43);
        this.addChild(Graph.rectColor({
            w: 580, h: 86, color: 0x567ea9, round: 18,
            y: -43,
        }));

        this.addChild(Graph.rectBorder({
            w: 100, h: 55, color: 0x7993ae, round: 6,
            y: -43, x: 220, borderWidth: 3, borderAlpha: 0.2,
        }));

        const progressContiner = this.addChild(new Container());

        this.progressFill = progressContiner.addChild(new Graphics().beginFill(0x67bfc3)
            .drawRect(0, 0, 100, 54));
        this.progressFill.mask = this.addChild(new Graphics().beginFill(0x67bfc3)
            .drawRoundedRect(170, -70, 100, 54, 6));
        progressContiner.position.set(170, -70);

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

        this.progressLabel = this.addChild(new Text('0', {
            align: 'left',
            fill: 0xFFFFFF,
            fontSize: 35,
            fontFamily: 'Lilita One',
        }));
        this.progressLabel.anchor.set(0.5);
        this.progressLabel.position.set(220, -43);

        const skipText = this.addChildAt(new I18nLabel('skip-mission', {
            align: 'left',
            fill: 0x668ab6,
            fontSize: 30,
            fontFamily: 'Lilita One',
            anchorY: 0.5,
        }), 1);

        skipText.x = -270;
        skipText.y = 43;

        const base = Graph.rectColor(
            { w: 178, h: 52, color: 0x6FB500, round: 12 },
        );
        const skipButton = this.addChildAt(new CurrencyButton({ base, labelSize: 25 }), 1);

        skipButton.value = 1700;
        skipButton.icon?.scale.set(0.6);
        skipButton.position.set(270 - (skipButton.width / 2), 43);
        skipButton.onTap = () =>
        {
            if (app.user.coins >= skipButton.value)
            {
                app.user.coins -= skipButton.value;
                this.mission.completed = true;
                this.mission.progress = this.mission.params.amount;
                app.user.progressMission(this.mission.id, this.mission.params.amount, this.mission.set);
            }
            else
            {
                app.notEnoughCurrency.setup(skipButton.value, () => null, 'coins');
                app.notEnoughCurrency.open();
            }
        };
    }

    public populate(mission: MissionData): void
    {
        const { id, params, hideAmountLabel } = mission;

        this.descriptionLabel.id = id;
        this.descriptionLabel.options.params = params;
        this.descriptionLabel.refresh();
        this.descriptionLabel.y = -(this.descriptionLabel.height / 2) - 43;

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
