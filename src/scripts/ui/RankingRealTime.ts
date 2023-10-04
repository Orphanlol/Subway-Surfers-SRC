import { Pool } from '@goodboydigital/odie';
import * as PIXI from 'pixi.js';

import { scoreApi } from '../api/ScoreApi';
import { app } from '../SubwaySurfersApp';
import { LeaderboardEntryData } from '../utils/Poki';
import Graph from './Graph';
import Label from './Label';

class RankingRealTimeEntryCompact extends PIXI.Container
{
    public w: number;
    public h: number;
    public rankingPos: number;
    public clampChars: number;
    public clean: boolean;
    public bg: any;
    public nameLabel: Label;
    public score: Label;
    public highlight = 0;

    constructor(width = 150, height = 50, clampChars = 10)
    {
        super();

        this.w = width;
        this.h = height;
        this.rankingPos = 0;
        this.clampChars = clampChars;
        this.visible = false;
        this.clean = true;

        this.bg = Graph.rect({ w: this.w + 60, h: this.h, round: 14, color: 0xFFFFFF });
        this.bg.tint = 0x000000;
        this.bg.alpha = 0.2;
        this.addChild(this.bg);

        const styleName = {
            align: 'right',
            fill: 0xFFFFFF,
            fontSize: height * 0.4,
            fontFamily: 'Lilita One',
            dropShadow: false,
            dropShadowDistance: 1,
            maxWidth: 300,
        };

        this.nameLabel = new Label('', styleName);
        this.addChild(this.nameLabel);
        this.nameLabel._text.anchor.x = 1;

        const styleScore = {
            align: 'right',
            fill: 0xFFFFFF,
            fontSize: height * 0.4,
            fontFamily: 'Lilita One',
            dropShadow: false,
            dropShadowDistance: 1,
            maxWidth: 300,
        };

        this.score = new Label('', styleScore);
        this.addChild(this.score);
        this.score._text.anchor.x = 1;
    }

    reset()
    {
        this.clean = true;
    }

    getPosition(num: number)
    {
        if (num === 1) return `${num}st`;
        if (num === 2) return `${num}nd`;
        if (num === 3) return `${num}rd`;

        return `${num}th`;
    }

    update(item: LeaderboardEntryData)
    {
        const rank = item.rank as number;

        this.rankingPos = rank;
        const pos = rankToPos(rank);
        const name = item.profile.name.substr(0, this.clampChars);
        const div = pos ? ` - ` : '';

        this.nameLabel.text = `${name}`;
        this.score.text = `${item.score}${div}${pos}`;

        this.bg.tint = this.highlight ? 0xfff155 : 0x000000;
        this.bg.alpha = this.highlight ? 0.7 : 0.2;
        this.bg.x = (-this.w / 2) + 20;

        this.nameLabel._text.tint = this.highlight ? 0x0a2b53 : 0xFFFFFF;
        this.score._text.tint = this.highlight ? 0x0a2b53 : 0xFFFFFF;

        this.nameLabel.x = -5;
        this.nameLabel.y = -this.height * 0.22;
        this.score.x = -5;
        this.score.y = this.height * 0.22;
    }
}

function rankToPos(rank: number): string
{
    if (!rank) return ``;
    if (rank === 1) return `${rank}st`;
    if (rank === 2) return `${rank}nd`;
    if (rank === 3) return `${rank}rd`;

    return `${rank}th`;
}

export default class RankingRealTime extends PIXI.Container
{
    public entryWidth = 0;
    public entryHeight = 0;
    public clampChars = 10;
    protected pool: Pool<RankingRealTimeEntryCompact>;
    protected entries: RankingRealTimeEntryCompact[] = [];
    protected _syncing = false;
    protected updateFrequency = 3000;
    protected updateTimeout: any = null;

    constructor(entryWidth = 210, entryHeight = 50, clampChars = 10)
    {
        super();
        this.pool = new Pool(RankingRealTimeEntryCompact);
        this.entryWidth = entryWidth;
        this.entryHeight = entryHeight;
        this.clampChars = clampChars;
        this.entries = [];
    }

    clear(): void
    {
        for (const entry of this.entries)
        {
            this.pool.return(entry);
            entry.visible = false;
        }
        this.entries.length = 0;
    }

    update(): void
    {
        if (this.updateTimeout) return;

        this.syncScores();

        // Throttle updates
        this.updateTimeout = setTimeout(() =>
        {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = null;
        }, this.updateFrequency);
    }

    async syncScores(): Promise<void>
    {
        if (this._syncing) return;
        this._syncing = true;
        const entriesData = await scoreApi.getLeaderboard();
        const { leaderboardEntry: user } = app.user;

        user.score = app.game.stats.score;
        entriesData.push(user);

        entriesData.sort((a, b) => b.score - a.score);

        entriesData.forEach((entryData, i) =>
        {
            const isUser = entryData === user;

            entryData.rank = (Number(i) + 1) * Number(!(isUser && i > 9));
        });

        this.refreshItems(entriesData);
        this._syncing = false;
    }

    refreshItems(data: LeaderboardEntryData[]): void
    {
        this.clear();

        for (const i in data)
        {
            const item = data[i];
            const entry = this.pool.get();

            this.addChild(entry);
            entry.visible = true;
            entry.update(item);
            this.entries.push(entry);
            entry.rankingPos = Number(i);
            entry.y = entry.rankingPos * (this.entryHeight + 3);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render(arg: any): void
    {
        super.render(arg);
        // this.animate();
    }

    animate(): void
    {
        for (const f in this.entries)
        {
            const entry = this.entries[f];
            const pos = entry.rankingPos * (this.entryHeight + 3);

            entry.y -= (entry.y - pos) * 0.15;
            if (entry.clean)
            {
                entry.y = pos;
                entry.clean = false;
            }
        }
    }
}
