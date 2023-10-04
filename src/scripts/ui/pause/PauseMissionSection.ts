import { I18nLabel } from '@goodboydigital/astro';
import { Container } from 'pixi.js';

import { app } from '../../SubwaySurfersApp';
import { MissionProgressCounter } from '../mytour/missions/MissionProgressCounter';
import { PauseMissionModule } from './PauseMissionModule';

const TOTAL_MISSIONS = 3;

export class PauseMissionSection extends Container
{
    private missionModules: PauseMissionModule[] = [];
    private completedMissions = 0;
    private progressCounter: MissionProgressCounter;
    private h2Label: I18nLabel;

    constructor()
    {
        super();

        const h1Label = this.addChild(new I18nLabel('missions', {
            fill: 0x07294a,
            fontSize: 40,
            fontFamily: 'Titan One',
        }));

        this.h2Label = this.addChild(new I18nLabel('mission-set', {
            fill: 0x3a7fbf,
            fontSize: 35,
            fontFamily: 'Lilita One',
            params: { num: 1 },
        }));

        h1Label.x = -290;
        this.h2Label.x = -290;
        this.h2Label.y = h1Label.height;

        this.progressCounter = this.addChild(new MissionProgressCounter());

        this.progressCounter.x = 270 - (this.progressCounter.width / 2);
        this.progressCounter.y = h1Label.height;
        this.missionModules = [];

        for (let i = 0; i < TOTAL_MISSIONS; i++)
        {
            const module = this.addChild(new PauseMissionModule());

            module.y = 150 + ((module.height + 15) * i);
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

        this.h2Label.options.params = { num };
        this.h2Label.refresh();
    }
}
