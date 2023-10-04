import * as PIXI from 'pixi.js';

import { LeaderboardEntryData } from '../utils/Poki';
import AvatarIcon from './AvatarIcon';
import Graph from './Graph';
import Label from './Label';

export class LeaderboardEntry extends PIXI.Container
{
    public w!: number;
    public h!: number;
    protected index!: Label;
    protected playerName!: Label;
    protected score!: Label;
    protected avatar!: AvatarIcon;
    protected bg!: PIXI.Container;
    protected clampChars!: number;
    protected built = false;

    constructor()
    {
        super();
    }

    build(height = 70, width = 640, clampChars = 10): void
    {
        if (this.built) return;

        this.built = true;
        this.w = width;
        this.h = height;
        this.clampChars = clampChars;

        const style = {
            align: 'center',
            fill: 0x0a2b53,
            fontSize: height * Math.min(height / 100, 0.5),
            fontFamily: 'Lilita One',
            dropShadow: false,
            dropShadowDistance: 1,
            maxWidth: 300,
        };

        this.index = new Label('', style);
        this.addChild(this.index);
        this.index._text.anchor.x = 1;

        this.playerName = new Label('', style);
        this.addChild(this.playerName);
        this.playerName._text.anchor.x = 0;

        this.score = new Label('', style);
        this.addChild(this.score);
        this.score._text.anchor.x = 1;

        this.avatar = new AvatarIcon(height * 0.85);
        this.addChild(this.avatar);
    }

    update(data: LeaderboardEntryData): void
    {
        this.playerName.text = data.profile.name;
        this.score.text = `${data.score}`;
        this.index.text = `${data.rank}` || '';

        if (data.profile.image !== undefined)
        {
            const image = data.profile.image;

            this.avatar.update({ image });
        }

        if (this.bg)
        {
            this.removeChild(this.bg);
            Graph.clear(this.bg);
            this.bg.destroy();
        }

        let color = Number(data.rank) % 2 ? 0xcadae4 : 0xadc7d8;

        if (data.profile.me) color = 0xfff155;
        this.bg = Graph.rect({ w: this.w, h: this.h, round: 0, color });
        this.addChildAt(this.bg, 0);

        const offset = (this.w / 2) - 70;

        this.index.x = 0 - offset;
        this.avatar.x = 50 - offset;
        this.playerName.x = 100 - offset;
        this.score.x = this.w - 100 - offset;
    }
}
