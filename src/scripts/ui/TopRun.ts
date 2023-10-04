import { I18nLabel } from '@goodboydigital/astro';

import GameConfig from '../GameConfig';
import Leaderboard from './Leaderboard';
import RemoteImage from './RemoteImage';
import UserPanel from './UserPanel';
import Widget from './Widget';

export default class TopRun extends Widget
{
    public w = 0;
    public h = 0;
    public jake!: RemoteImage;
    public leaderboard!: Leaderboard;
    public panel!: UserPanel;
    public title!: I18nLabel;

    protected onBuild(): void
    {
        this.panel = new UserPanel();
        this.addChild(this.panel);
        this.title = this.addChild(new I18nLabel('highscores', {
            align: 'center',
            fill: 0x033b71,
            fontSize: 70,
            fontFamily: 'Titan One',
            dropShadowDistance: 1,
            anchorX: 0.5,
        }));

        this.addChild(this.title);
        this.title.y = 20 - (this.panel.base.height / 2);

        this.leaderboard = new Leaderboard({ entryHeight: 56, entryWidth: this.panel.base.width - 20,
            clampChars: GameConfig.maxNicknameChars });
        this.leaderboard.locked = true;
        this.panel.addChild(this.leaderboard);
        this.leaderboard.setPosition(0, -247);
    }

    async onOpen(): Promise<void>
    {
        await this.leaderboard.refresh();
        this.visible = true;
    }

    onClose(): void
    {
        this.visible = false;
    }

    onResize(): void
    {
        this.w = this.viewportWidth;
        this.h = this.viewportHeight;

        this.x = this.w * 0.5;
        this.y = this.h * 0.5;
        this.panel.resize(this.w, this.h);
    }
}

