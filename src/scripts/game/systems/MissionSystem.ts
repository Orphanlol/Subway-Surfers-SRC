import { i18n } from '@goodboydigital/astro';
import { Entity } from '@goodboydigital/odie';
import { Signal } from 'signals';

import { MissionData, MissionIds } from '../../data/missions/MissionData';
import { app } from '../../SubwaySurfersApp';
import { onWordHuntCompleted } from '../../utils/WordHuntManager';
import { LanePosition } from '../components/Lane';
import { GameSystem } from '../GameSystem';

const allStats: Record<MissionIds, number> = {
    'mission-bump-barriers': 0,
    'mission-bump-lights': 0,
    'mission-bump-trains-onerun': 0,
    'mission-buy-mystery': 0,
    'mission-character-tokens': 0,
    'mission-daily-challenges': 0,
    'mission-dodge': 0,
    'mission-get-caught': 0,
    'mission-headstart': 0,
    'mission-high-score': 0,
    'mission-hoverboard': 0,
    'mission-hoverboard-nocrash': 0,
    'mission-jump': 0,
    'mission-jump-onerun': 0,
    'mission-jump-trains': 0,
    'mission-pickup-coins': 0,
    'mission-pickup-coins-air': 0,
    'mission-pickup-coins-jetpack': 0,
    'mission-pickup-coins-pogo': 0,
    'mission-pickup-coins-magnet': 0,
    'mission-pickup-coins-onerun': 0,
    'mission-pickup-jetpacks': 0,
    'mission-pickup-jetpacks-onerun': 0,
    'mission-pickup-pogos': 0,
    'mission-pickup-pogos-onerun': 0,
    'mission-pickup-keys': 0,
    'mission-pickup-magnets': 0,
    'mission-pickup-magnets-onerun': 0,
    'mission-pickup-mystery': 0,
    'mission-pickup-powerups': 0,
    'mission-pickup-sneakers': 0,
    'mission-pickup-sneakers-onerun': 0,
    'mission-roll': 0,
    'mission-roll-lane': 0,
    'mission-roll-onerun': 0,
    'mission-score': 0,
    'mission-score-nocoins': 0,
    'mission-score-onerun': 0,
    'mission-scoreBooster': 0,
    'mission-spend-coins': 0,
    'mission-coins-mystery': 0,
};

const onerunStats: Record<MissionIds, number> = {} as Record<MissionIds, number>;

type StatsData = typeof allStats;

export default class MissionSystem extends GameSystem
{
    protected _profile?: any;
    public data: StatsData = { ...allStats };
    public onCompleteMission = new Signal();
    private missionsToTrack: MissionData[] = [];
    private completedMissions = 0;

    constructor(entity: Entity)
    {
        super(entity);

        this.game.onReset.add({ reset: this.reset.bind(this) });

        for (const key in allStats)
        {
            const id = key as MissionIds;

            if (id.includes('onerun')) onerunStats[id] = allStats[id];
        }
        this.reset();
        app.user.onCoinsSpent.add((coins: number) => this.addStat(coins, 'mission-spend-coins'));
        onWordHuntCompleted.add(() => this.addStat(1, 'mission-daily-challenges'));
    }

    initMissionTracking(): void
    {
        const missions = app.data.getCurrentMissions();

        this.completedMissions = 0;
        this.missionsToTrack = missions;
        this.missionsToTrack.forEach((m) =>
        {
            this.data[m.id] = m.progress;
            this.completedMissions += Number(m.completed);
        });
    }

    reset(): void
    {
        this.data = { ...this.data, ...onerunStats };
        this.initMissionTracking();
    }

    public addStat(value: number, id: MissionIds): void
    {
        if (id === 'mission-pickup-coins')
        {
            this.processCoinsPickup();
        }
        if (id === 'mission-pickup-powerups')
        {
            this.processPowerups();
        }
        if (id === 'mission-roll')
        {
            this.processRoll();
        }
        if (id === 'mission-jump')
        {
            this.processJump();
        }
        if (id === 'mission-get-caught' && this.game.stats.time > 10)
        {
            value = 0;
        }
        this.data[id] += value;
        this.missionsToTrack.forEach((m) =>
        {
            if (!m.completed)
            {
                this.progressMission(m);
            }
        });
    }

    public setStat(value: number, id: MissionIds): void
    {
        if (id === 'mission-score')
        {
            this.processScore(value);
        }
        this.data[id] = value;

        this.missionsToTrack.forEach((m) =>
        {
            if (!m.completed)
            {
                this.progressMission(m);
            }
        });
    }

    private progressMission(mission: MissionData): void
    {
        const goal = mission.params.amount;
        const id = mission.id;
        const progress = Math.min(this.data[id], goal);

        if (mission.progress !== progress)
        {
            mission.progress = progress;
            mission.completed = mission.progress === goal;
            if (mission.completed)
            {
                this.completedMissions++;
                // Now there is a notification plugin in the app level, that can be used
                // in a way that notifications from multiple sources can get queued nicely
                // this.game.hud.missionDropDownPanel.show(mission.id, mission.params.amount);
                this.showNotification(mission.id, mission.params.amount);
                this.onCompleteMission.dispatch(mission.id);

                if (this.completedMissions === this.missionsToTrack.length)
                {
                    this.initMissionTracking();
                }
            }

            app.user.progressMission(id, progress, mission.set);
        }
    }

    private showNotification(id: string, amount: number): void
    {
        // Using app notification plugin. Currently, all notifications are using the same
        // icon+text layout - to verify if they should be different
        app.notification.append({
            text: `${i18n.translate('mission-complete')}\n${i18n.translate(id, { amount })}`,
            icon: 'mission-completed-checkmark.png',
            height: 130,
        });
    }

    private processCoinsPickup(): void
    {
        const hero = this.game.hero;

        if (hero.jetpack.isOn())
        {
            this.data['mission-pickup-coins-jetpack'] += 1;
        }
        if (!hero.body.landed)
        {
            this.data['mission-pickup-coins-air'] += 1;
        }
        if (hero.magnet.isOn())
        {
            this.data['mission-pickup-coins-magnet'] += 1;
        }
        if (hero.pogo.isOn())
        {
            this.data['mission-pickup-coins-pogo'] += 1;
        }
        this.data['mission-pickup-coins-onerun'] += 1;
    }

    private processPowerups(): void
    {
        const hero = this.game.hero;

        if (hero.jetpack.isOn())
        {
            this.data['mission-pickup-jetpacks'] += 1;
            this.data['mission-pickup-jetpacks-onerun'] += 1;
        }
        if (hero.magnet.isOn())
        {
            this.data['mission-pickup-magnets'] += 1;
            this.data['mission-pickup-magnets-onerun'] += 1;
        }
        if (hero.pogo.isOn())
        {
            this.data['mission-pickup-pogos'] += 1;
            this.data['mission-pickup-pogos-onerun'] += 1;
        }
        if (hero.sneakers.isOn())
        {
            this.data['mission-pickup-sneakers'] += 1;
            this.data['mission-pickup-sneakers-onerun'] += 1;
        }
    }

    private processScore(value: number): void
    {
        if (this.game.stats.coins === 0)
        {
            this.data['mission-score-nocoins'] = value;
        }
        this.data['mission-score-onerun'] = value;
    }

    private processRoll(): void
    {
        if (this.game.hero.lane.lane === LanePosition.CENTRAL)
        {
            this.data['mission-roll-lane'] += 1;
        }

        this.data['mission-roll-onerun'] += 1;
    }

    private processJump(): void
    {
        if (this.game.hero.body.ground > 7)
        {
            this.data['mission-jump-trains'] += 1;
        }

        this.data['mission-jump-onerun'] += 1;
    }
}
