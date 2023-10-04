import * as PIXI from 'pixi.js';

import avatar from '../game/data/anim/avatar';
import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';
import Poki from '../utils/Poki';
import { Button } from './buttons/Button';
import { UserPanelButton } from './buttons/UserPanelButton';
import { DoubleUpButton } from './DoubleUpButton';
import Leaderboard from './Leaderboard';
import { CharacterThumb } from './me/characters/CharacterThumb';
import UserCurrencies from './me/characters/UserCurrencies';
import ScoreBanner from './ScoreBanner';
import ScreenGlow from './ScreenGlow';
import UserPanel from './UserPanel';
import Widget from './Widget';

export default class Gameover extends Widget
{
    public w = 0;
    public h = 0;
    public bg!: ScreenGlow;
    public base!: PIXI.Container;
    public character!: CharacterThumb;
    public scoreboard!: ScoreBanner;
    public leaderboard?: Leaderboard;
    public currencies!: UserCurrencies;
    public btnPlay!: Button;
    public panel!: UserPanel;
    public doubleUpButton!: DoubleUpButton;

    protected onBuild(): void
    {
        this.bg = new ScreenGlow();
        this.addChild(this.bg);

        this.panel = this.addChild(new UserPanel({ icon: 'icon-white-house.png', onTap: this.onTapHome.bind(this) }));

        const w = this.panel.base.width;
        const h = this.panel.base.height;

        const [start, end] = avatar.idle.clips.popupIdle.frames;
        const animData = { start, end, loop: true, name: 'uiIdle' };
        const thumbOptions = { sceneName: `${app.user.character}-idle`, animData, thumbId: app.user.character };

        this.character = new CharacterThumb(thumbOptions);
        this.character.x = -190;
        this.character.y = (-h / 2) + 390;
        this.addChild(this.character);

        if (GameConfig.leaderboard !== 'none')
        {
            this.leaderboard = this.addChild(new Leaderboard({ entryHeight: 52, entryWidth:  w - 20,
                clampChars: GameConfig.maxNicknameChars }));

            const scrollMask = this.addChild(new PIXI.Graphics().beginFill(0xFF0000, 0.4)
                .drawRect(-(w - 20) / 2, 35, w - 20, 308));

            this.leaderboard.mask = scrollMask;
        }
        this.doubleUpButton = this.addChild(new DoubleUpButton());
        this.doubleUpButton.onTap = async () =>
        {
            this.btnPlay.key = null;
            const success = await Poki.SDK.rewardedBreak({ type: 'doubleUp' });

            this.btnPlay.key = 32;

            if (success)
            {
                const { user, game } = app;

                this.scoreboard.update({
                    score: game.stats.score,
                    coins: this.doubleUpButton.coins * 2,
                });

                user.coins += this.doubleUpButton.coins;
                user.save();
                this.doubleUpButton.visible = false;
                this.updateLeaderboardArea();
            }
        };

        this.doubleUpButton.y = -20;
        (this.doubleUpButton.base as PIXI.Sprite)?.anchor.set(0.5);

        this.scoreboard = this.addChild(new ScoreBanner());
        this.scoreboard.x = 130;
        this.scoreboard.y = (-h / 2) + 250;

        this.currencies = new UserCurrencies();
        this.addChild(this.currencies);
        this.currencies.x = this.scoreboard.x;
        this.currencies.y = this.scoreboard.y - 200;

        const boostsButton = new UserPanelButton({ bg: 'navigation-button-blu.png', icon: 'icon-white-upgrades.png',
            label: 'boosts', onTap: this.onTapBoosts.bind(this) });

        const base = PIXI.Sprite.from('large-navigation-button-light-green.png');

        base.anchor.set(0.5);
        base.scale.set(0.83);
        this.btnPlay = new Button({ label: 'play', name: 'resume',
            base, labelSize: 55, labelFont: 'Lilita One' });

        this.btnPlay.onTap = this.onTapPlay.bind(this);
        this.panel.addButton(boostsButton, this.btnPlay);
    }

    private async onTapHome(): Promise<void>
    {
        this.visible = false;
        this.btnPlay.key = null;
        app.nav.toIdleScreen('title');
    }

    private async onTapPlay(): Promise<void>
    {
        this.visible = false;
        this.btnPlay.key = null;
        app.nav.toGame();
    }

    async onTapBoosts(): Promise<void>
    {
        app.boostPanel.open();
    }

    onOpen(): void
    {
        // Saving user coins and scores should be somewhere else, not here
        const { user, game } = app;

        user.coins += game.stats.coins;
        user.score = game.stats.score;
        user.keys += game.stats.keys;
        user.save();

        this.doubleUpButton.visible = !!game.stats.coins;
        this.doubleUpButton.setCoins(game.stats.coins);

        if (this.leaderboard)
        {
            this.updateLeaderboardArea();
            this.leaderboard.refresh();
        }

        this.currencies.tweenCoins(user.coins);
        this.currencies.tweenKeys(user.keys);

        this.scoreboard.update({
            score: game.stats.score,
            coins: game.stats.coins,
        });

        // Only enable spacebar key shortcut after 2 seconds, to prevent user skipping
        // game over screen after opening a mystery box
        setTimeout(() =>
        {
            if (this._opened) this.btnPlay.key = 32;
        }, 2000);

        this.visible = true;

        this.character.setChar(user.character, user.character, user.outfit);
        this.character.play('uiIdle');

        game.stats.coins = 0;
        game.stats.keys = 0;
    }

    private updateLeaderboardArea(): void
    {
        if (!this.leaderboard) return;
        if (!this.doubleUpButton.visible)
        {
            this.leaderboard.yScrollMin = -198;
            this.leaderboard.yScrollMax = -40;
            this.leaderboard.setPosition(0, -40);

            const mask = this.leaderboard.mask as PIXI.Graphics;

            mask.y = -112;
            mask.height = 408;
        }
        else
        {
            this.leaderboard.yScrollMin = -198;
            this.leaderboard.yScrollMax = 60;
            this.leaderboard.setPosition(0, 60);

            const mask = this.leaderboard.mask as PIXI.Graphics;

            mask.y = 0;
            mask.height = 308;
        }
    }

    onClose(): void
    {
        this.character.stop();
        this.btnPlay.key = null;
        this.visible = false;
    }

    onResize(): void
    {
        this.w = this.viewportWidth;
        this.h = this.viewportHeight;

        this.x = this.w * 0.5;
        this.y = this.h * 0.5;

        this.bg.resize(this.w, this.h);

        this.panel.resize(this.w, this.h);
    }
}
