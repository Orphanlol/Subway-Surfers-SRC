/* eslint-disable simple-import-sort/sort */
import firebase from 'firebase/app';
import 'firebase/database';

import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';
import { LeaderboardEntryData } from '../utils/Poki';
import { initFireBase } from './initFireBase';

// MOCKUP DATA ----------------------------------------------------------------
const mockDataLeaderboard: LeaderboardEntryData[] = [
    { profile: { name: 'Brody', image: 1 }, date: 0, rank: 7, score: 65900 },
    { profile: { name: 'Tagbot', image: 2 }, date: 0, rank: 8, score: 15505 },
    { profile: { name: 'Tasha', image: 3 }, date: 0, rank: 9, score: 1000 },
    { profile: { name: 'Ninja', image: 4 }, date: 0, rank: 6, score: 123456 },
    { profile: { name: 'Lucy', image: 5 }, date: 0, rank: 5, score: 171110 },
    { profile: { name: 'King', image: 6 }, date: 0, rank: 10, score: 500 },
    { profile: { name: 'Yutani', image: 8 }, date: 0, rank: 1, score: 999999 },
    { profile: { name: 'Spike', image: 9 }, date: 0, rank: 2, score: 810312 },
    { profile: { name: 'Fresh', image: 10 }, date: 0, rank: 3, score: 555555 },
    { profile: { name: 'Tricky', image: 12 }, date: 0, rank: 4, score: 345678 },
];

type Snapshot = firebase.database.DataSnapshot;

// TODO cleaup the db from the server
class ScoreApi
{
    private usersRef!: firebase.database.Reference;
    private usersHash: Map<string, LeaderboardEntryData> = new Map<string, LeaderboardEntryData>();

    public async init(): Promise<void>
    {
        if (!this.mock)
        {
            // TODO This should be moved somewhe else but it makes sens to be here for now
            initFireBase();

            this.usersRef = firebase.database().ref('users');

            this.usersRef.on('child_added', this.onAdded);
            this.usersRef.on('child_changed', this.onChanged);
            this.usersRef.on('child_removed', this.onRemoved);
        }
        else
        {
            const entry = app.user.leaderboardEntry;

            entry.score = app.user.gameSettings.highscore;
            this.setUser(entry);
        }
    }

    private onAdded = (snap: Snapshot) =>
    {
        const user: LeaderboardEntryData = snap.val();

        this.usersHash.set(user.profile.name, user);
    };

    private onChanged = (snap: Snapshot) =>
    {
        const user: LeaderboardEntryData = snap.val();

        this.usersHash.set(user.profile.name, user);
    };

    private onRemoved = (snap: Snapshot) =>
    {
        const name: string = snap.child('profile').child('name').val();

        this.usersHash.delete(name);
    };

    // TODO implement a system to await the hash to be updated if the DB is being updated
    // public async operation(): Promise<any>
    // {

    // }

    private get mock(): boolean
    {
        return GameConfig.leaderboard !== 'ingame';
    }

    public async setUser(userData: LeaderboardEntryData): Promise<void>
    {
        const name = userData.profile.name;

        const user: LeaderboardEntryData = {
            profile: {
                name: userData.profile.name,
                image: userData.profile.image,
            },
            score: userData.score,
            date: Date.now(),
        };

        let promise = Promise.resolve();

        if (this.usersRef)
        {
            // TODO this will refresh the DB entries if needed test it
            await this.getLeaderboard();

            const currentEntry = this.usersHash.get(name);

            if (!currentEntry)
            {
                if (this.usersHash.size < 10)
                {
                    promise = this.usersRef.child(name).set(user);
                }
                else
                {
                    const lastUser = this.getLowestScoreEntry();

                    if (lastUser.score < user.score)
                    {
                        promise = this.usersRef.child(lastUser.profile.name).remove().then(() =>
                            this.usersRef.child(name).set(user),
                        );
                    }
                }
            }
            else
            {
                const isHighScore = Number(currentEntry.score) < user.score;

                if (isHighScore)
                {
                    promise = this.usersRef.child(name).update(user);
                    app.game.missions.setStat(1, 'mission-high-score');
                }
            }
        }
        else
        {
            const entry = mockDataLeaderboard.find((e) => e.profile.name === user.profile.name);

            if (!entry)
            {
                mockDataLeaderboard.push(user);
            }
            else if (user.score > entry.score)
            {
                app.game.missions.setStat(1, 'mission-high-score');
                entry.score = user.score;
            }
        }

        return promise;
    }

    private getLowestScoreEntry(): LeaderboardEntryData
    {
        let lowest = Infinity;
        let i;
        let entry = {} as LeaderboardEntryData;

        this.usersHash.forEach((v, k) =>
        {
            if (v?.score && v.score < lowest)
            {
                lowest = v?.score;
                i = k;
            }
        });

        if (i)
        {
            entry = this.usersHash.get(i) as LeaderboardEntryData;
        }

        return entry;
    }

    public async getLeaderboard(): Promise<LeaderboardEntryData[]>
    {
        let promise;

        await this.cleanUp();
        if (this.mock)
        {
            promise = Promise.resolve(mockDataLeaderboard);
        }
        else
        {
            promise = Promise.resolve(Array.from(this.usersHash.values()));
        }

        return promise;
    }

    async cleanUp(): Promise<void>
    {
        this.usersHash.forEach((v, k) =>
        {
            const pastHours = (Date.now() - v.date) / 1000 / 60 / 60;
            const expired = pastHours >= 4;

            if (expired)
            {
                this.usersRef?.child(k).get().then((data) => data.ref.remove());
                this.usersHash.delete(k);
            }
        });
    }
}

export const scoreApi = new ScoreApi();
