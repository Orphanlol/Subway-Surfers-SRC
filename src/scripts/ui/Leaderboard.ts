import { Pool } from '@goodboydigital/odie';

import { scoreApi } from '../api/ScoreApi';
import { app } from '../SubwaySurfersApp';
import { LeaderboardEntryData } from '../utils/Poki';
import { LeaderboardEntry } from './LeaderboardEntry';
import { Trackpad, TrackpadOptions } from './Trackpad';
export interface LeaderboardOptions extends TrackpadOptions
{
    entryHeight: number;
    entryWidth: number;
    clampChars: number;
}
export default class Leaderboard extends Trackpad
{
    public entries: LeaderboardEntry[];
    public maxLength: number;
    public pool: Pool<LeaderboardEntry>;
    private entryHeight: number;
    private entryWidth: number;
    private clampChars: number;

    constructor(opts: Partial<LeaderboardOptions> = {})
    {
        super(opts);
        this.entryHeight = opts.entryHeight || 70;
        this.entryWidth = opts.entryWidth || 640;
        this.clampChars = opts.clampChars || 10;
        this.pool = new Pool(LeaderboardEntry);
        this.entries = [];
        this.maxLength = 11;
    }

    updateTransform():void
    {
        super.updateTransform();

        this.update();
        this.y = this.targetY;
    }

    async refresh(): Promise<void>
    {
        this.clearEntries();

        const leaderboardEntry = app.user.leaderboardEntry;

        await scoreApi.setUser(leaderboardEntry);
        const entriesData: LeaderboardEntryData[] = await scoreApi.getLeaderboard();

        let user = entriesData.find((u) => u.profile.name === app.user.name);

        if (!user)
        {
            user = leaderboardEntry;
            entriesData.push(user);
        }

        // Insert provided user name/score into the score list and re-rank that
        entriesData.sort((a, b) => b.score - a.score);
        entriesData.forEach((entryData, i) =>
        {
            const isUser = entryData === user;

            entryData.profile.me = isUser;
            entryData.rank = (Number(i) + 1) * Number(!(isUser && i > 9));
        });

        this.updateEntries(entriesData);
    }

    clearEntries(): void
    {
        for (const entry of this.entries)
        {
            entry.visible = false;
            if (entry.parent) entry.parent.removeChild(entry);
            this.pool.return(entry);
        }
        this.entries.length = 0;
    }

    updateEntries(scores: LeaderboardEntryData[]): void
    {
        const offset = 0;
        const length = Math.min(this.maxLength, scores.length);

        for (let i = 0; i < length; i++)
        {
            const entry = this.pool.get();

            entry.build(this.entryHeight, this.entryWidth, this.clampChars);
            this.addChild(entry);
            const user = scores[i];

            entry.visible = !!user;
            if (!user) continue;
            entry.update(user);
            entry.y = (i * entry.h) + offset;
            this.entries.push(entry);
        }
    }
}
