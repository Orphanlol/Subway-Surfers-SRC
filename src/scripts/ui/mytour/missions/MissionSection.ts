import { Container, Sprite, Text } from 'pixi.js';

import { app } from '../../../SubwaySurfersApp';
import { MyTourSection } from '../MyTourSection';
import { MissionModule } from './MissionModule';
import { MissionProgressCounter } from './MissionProgressCounter';

const progressBarWidth = 166;
const TOTAL_MISSIONS = 3;

export class MissionSection extends MyTourSection
{
    private progressCounter: MissionProgressCounter;
    private multiplierLabel: Text & {gradient: Text};
    private missionModules: MissionModule[];
    private completedMissions!: number;

    constructor()
    {
        const options = {
            headerIcon: 'missions-splat.png',
            h1Options: {
                label: 'missions',
                fill: 0x07294a,
                fontSize: 40,
                fontFamily: 'Titan One',
            },
            h2Options: {
                label: 'mission-set',
                params: { num: 1 },
                fill: 0x3a7fbf,
                fontSize: 35,
                fontFamily: 'Lilita One',
            },
        };

        super(options);
        this.headerIcon.scale.set(1.1);
        this.headerIcon.tint = 0x6f930b;

        const headerIconShadow = this.headerIcon.addChild(Sprite.from(options.headerIcon));

        headerIconShadow.anchor.set(1, 0);
        headerIconShadow.tint = 0x6FB500;
        headerIconShadow.position.set(-3, -2);

        const labelContainer = this.headerIcon.addChild(new Container());
        const { width, height } = this.headerIcon;
        const xLabel = labelContainer.addChild(this.makeGradientText('x'));

        this.multiplierLabel = labelContainer.addChild(this.makeGradientText('1'));

        xLabel.x = -xLabel.width / 2;
        this.multiplierLabel.x = (this.multiplierLabel.width / 2.3);
        labelContainer.position.set((-width / 2) - (this.multiplierLabel.width / 4), (height / 2) - 30);
        labelContainer.rotation = Math.PI / 20;

        this.progressCounter = this.addChild(new MissionProgressCounter());
        this.missionModules = [];

        for (let i = 0; i < TOTAL_MISSIONS; i++)
        {
            const module = this.addChildAt(new MissionModule(), 0);

            module.y = -135 + ((module.height + 15) * i);
            module.onMissionComplete.add(() =>
            {
                this.completedMissions++;

                if (this.completedMissions === TOTAL_MISSIONS)
                {
                    this.initMissions();
                }
            });
            this.missionModules.push(module);
        }
    }

    open(): void
    {
        this.initMissions();
    }

    initMissions(): void
    {
        const missions = app.data.getCurrentMissions();
        const set = app.data.getMissionSet();

        this.completedMissions = 0;

        for (let i = 0; i < missions.length; i++)
        {
            const m = missions[i];

            this.progressCounter.setProgress(this.completedMissions + TOTAL_MISSIONS, m.completed);
            this.missionModules[i].populate(m);
            this.completedMissions += Number(m.completed);
        }

        const num = set + 1 + Number(this.completedMissions === 3);

        this.multiplierLabel.text = `${num}`;
        this.multiplierLabel.gradient.text = `${num}`;
        this.h2Label.options.params = { num };
        this.h2Label.refresh();
    }

    makeGradientText(text: string): Text & {gradient: Text}
    {
        const label = new Text(text, {

            fill: 0xFFFFFF,
            fontSize: 100,
            stroke: 0x000000,
            strokeThickness: 15,
            fontFamily: 'Lilita One',
        }) as Text & {gradient: Text};
        const gradient = label.addChild(new Text(text, {

            fill: [0xffd83c, 0xffa200],
            fillGradientStops: [0, 0.9],
            fontSize: 98,
            fontFamily: 'Lilita One',
        }));

        label.anchor.set(0, 0.5);
        gradient.anchor.set(0, 0.5);
        gradient.position.set(9, 3);
        label.gradient = gradient;

        return label;
    }

    resize(w: number, h: number): void
    {
        super.resize(w, h);
        this.progressCounter.position.set(this.h2Label.x + (progressBarWidth / 2),
            this.h2Label.y + this.h2Label.height + (this.progressCounter.height / 2));
    }
}
