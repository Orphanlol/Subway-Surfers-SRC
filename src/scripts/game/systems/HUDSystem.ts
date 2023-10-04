import { Entity } from '@goodboydigital/odie';
import { TweenLite } from 'gsap';
import { Container, Text } from 'pixi.js';

import Game from '../../Game';
import GameConfig from '../../GameConfig';
import { app } from '../../SubwaySurfersApp';
import { BoostGauge } from '../../ui/BoostGauge';
import { Button } from '../../ui/buttons/Button';
import { SmallButton } from '../../ui/buttons/SmallButton';
import { Countdown } from '../../ui/Countdown';
import { HUDLabel } from '../../ui/HUDLabel';
import { HUDMultiplierLabel } from '../../ui/HUDMultiplierLabel';
import { ItemBoost, ItemBoostType } from '../../ui/ItemBoost';
import ItemTimer from '../../ui/ItemTimer';
import { MissionsDropDownPanel } from '../../ui/mytour/missions/MissionDropDownPanel';
import PausePanel from '../../ui/pause/PausePanel';
import RankingRealTime from '../../ui/RankingRealTime';
import { WordDropDownPanel } from '../../ui/WordDropDownPanel';
import { delay } from '../../utils/Utils';
import { GameSystem } from '../GameSystem';

// TODO merge word and missions dropdown
// TODO add a queue for dropdown animations
export default class HudSystem extends GameSystem
{
    public view: Container;

    private _built = false;
    public paused!: PausePanel;
    private btnPause!: Button;
    private distance!: HUDLabel;
    private coins!: HUDLabel;
    private multiplier!: HUDMultiplierLabel;
    private countdown!: Countdown;
    private timers!: Container;
    private boosts!: Container;
    private ranking?: RankingRealTime;
    private message?: Text;
    private stats?: Container;
    private timersList: Record<string, ItemTimer> = {};
    private boostsList: Record<string, ItemBoost> = {};
    private w = 0;
    private h = 0;
    private updateCount = 0;
    public boostGauge!: BoostGauge;
    public wordDropDownPanel!: WordDropDownPanel;
    public missionDropDownPanel!: MissionsDropDownPanel;

    constructor(entity: Entity)
    {
        super(entity);
        this.view = new Container();
        this.view.visible = false;
        this.game.onReset.add(this as any);
        this.game.onIdle.add(this as any);
        this.game.onRun.add(this as any);
        this.game.onPause.add(this as any);
        this.game.onResume.add(this as any);
        this.game.onGameover.add(this as any);
        this.game.onRevive.add(this as any);
        this.updateCount = 1;
    }

    public build(): void
    {
        if (this._built) return;
        this._built = true;

        this.paused = new PausePanel(() => this.onBtnPausePress());

        this.distance = new HUDLabel({ base: 'base-long.png' });
        this.view.addChild(this.distance);

        this.coins = new HUDLabel({ base: 'base-long.png', icon: 'icon-coin-large.png' });
        this.view.addChild(this.coins);

        this.multiplier = new HUDMultiplierLabel(this.game);
        this.view.addChild(this.multiplier);

        this.countdown = new Countdown('start_countdown');
        this.view.addChild(this.countdown);

        this.timers = new Container();
        this.view.addChild(this.timers);

        this.boosts = new Container();
        this.view.addChild(this.boosts);

        this.boostGauge = new BoostGauge();
        this.view.addChild(this.boostGauge);

        this.wordDropDownPanel = this.view.addChild(new WordDropDownPanel());
        this.missionDropDownPanel = this.view.addChild(new MissionsDropDownPanel());

        this.btnPause = new SmallButton({ icon: 'icon-pause.png', key: 'Escape' });
        this.btnPause.onTap = this.onBtnPausePress.bind(this);
        this.view.addChild(this.btnPause);

        if (GameConfig.leaderboard === 'realtime')
        {
            this.ranking = new RankingRealTime();
            this.view.addChild(this.ranking);
        }

        this.view.visible = false;
        this.resize();

        app.resize.onResize.connect(() =>
        {
            this.game.pause();
            this.resize();
        });
    }

    public update(): void
    {
        if (this.game.state !== Game.RUNNING || !this._built) return;

        this.multiplier.update();

        this.updateCount += 1;

        if (this.updateCount === 480)
        {
            this.removeAllItemBoost(true);
        }

        if (this.updateCount % 4 > 0) return;

        const stats = this.game.stats;

        if (this.distance.getText() <= stats.score) this.distance.setText(stats.score, 6);
        this.coins.setText(stats.coins);
        this.multiplier.text = `x${stats.multiplier + stats.missionMultiplier}`;
        if (this.ranking) this.ranking.update();
    }

    public reset(): void
    {
        if (this.paused) this.paused.close();
        this.close();
        if (this.message) this.message.text = '';
        this.updateCount = 1;
        this.removeAllItemBoost();
    }

    public idle(): void
    {
        if (this.paused) this.paused.close();
        this.close();
        if (this.message) this.message.text = '';
        this.updateCount = 1;
        this.removeAllItemBoost();
    }

    public async run(): Promise<void>
    {
        await delay(0.2);
        this.build();
        if (this.boostGauge) this.boostGauge.lowlightAll();
        if (this.ranking) this.ranking.clear();
        this.updateCount = 1;
        this.distance.setText(this.game.stats.score, 6);
        this.open();
        app.ui.mainLayer.addChild(this.view);
        app.ui.mainLayer.addChild(this.paused);
        if (this.message) this.message.text = '';
        this.paused.close();

        if (app.user.boosts.consumables.headstart > 0)
        {
            this.addItemBoost(ItemBoostType.HEADSTART, true);
        }

        if (app.user.boosts.consumables.scoreBooster > 0)
        {
            this.addItemBoost(ItemBoostType.MULTIPLIER, true);
        }

        this.organizeBoosts(false);
    }

    public pause(): void
    {
        this.clearCountdown();
        this.close();
        this.paused.open();
    }

    public resume(): void
    {
        this.open();
        this.clearCountdown();
        this.paused.close();
    }

    public gameover(): void
    {
        this.close();
        this.paused.close();
    }

    public revive(): void
    {
        this.open();
        this.paused.close();
    }

    public open(): void
    {
        this.build();
        this.view.visible = true;
    }

    public close(): void
    {
        this.view.visible = false;
    }

    public resize(): void
    {
        this.w = app.ui.viewportWidth;
        this.h = app.ui.viewportHeight;

        if (!this._built) return;

        this.distance.x = this.w - 110;
        this.distance.y = 60;
        this.coins.x = this.w - 170;
        this.coins.y = 160;
        this.countdown.x = this.w / 2;
        this.countdown.y = this.h / 2;
        this.multiplier.x = this.distance.x - 170;
        this.multiplier.y = this.distance.y;

        if (this.ranking)
        {
            this.ranking.x = this.w;
            this.ranking.y = 250;
        }

        if (this.message)
        {
            this.message.x = this.w / 2;
            this.message.y = 120;
        }

        if (this.stats)
        {
            this.stats.x = 10;
            this.stats.y = 200;
        }

        if (this.timers)
        {
            this.timers.x = 0;
            this.timers.y = this.h;
        }

        if (this.boosts)
        {
            this.boosts.x = 0;
            this.boosts.y = this.h;
        }

        if (this.boostGauge)
        {
            this.boostGauge.x = this.w / 2;
            this.boostGauge.y = 300;
        }

        if (this.wordDropDownPanel)
        {
            this.wordDropDownPanel.x = this.w / 2;
        }
        if (this.missionDropDownPanel)
        {
            this.missionDropDownPanel.x = this.w / 2;
        }

        this.btnPause.x = 60;
        this.btnPause.y = 60;
    }

    public runCountdown(time: number, callback: () => void): void
    {
        this.paused.close();
        this.clearCountdown();
        this.open();
        this.view.addChild(this.countdown);
        this.countdown.run(time, () =>
        {
            callback();
            this.btnPause.onTap = this.onBtnPausePress.bind(this);
        });
    }

    public clearCountdown(): void
    {
        this.paused.close();
        this.countdown.stop();
    }

    public addItemTimer(id: string): ItemTimer
    {
        if (!this.timersList[id]) this.timersList[id] = new ItemTimer(this.game, id);
        const timer = this.timersList[id];

        this.timers.addChild(timer);
        timer.show();
        this.organiseItems();

        return timer;
    }

    public removeItemTimer(id: string): void
    {
        const timer = this.timersList[id];

        if (!timer) return;
        timer.hide();
        this.organiseItems();
    }

    public addItemBoost(type: ItemBoostType, animated = false): ItemBoost
    {
        if (!this.boostsList[type]) this.boostsList[type] = new ItemBoost(type);
        const boost = this.boostsList[type];

        this.boosts.addChild(boost);
        boost.show(animated, this.boosts.children.length);
        this.organiseItems(animated);

        return boost;
    }

    public async removeItemBoost(type: ItemBoostType, animated = false): Promise<void>
    {
        const boost = this.boostsList[type];

        if (!boost) return;

        await boost.hide(animated);
        this.organiseItems(animated);
    }

    public async removeAllItemBoost(animated = false): Promise<void>
    {
        const promises = [] as Promise<void>[];

        for (const type in this.boostsList)
        {
            const boost = this.boostsList[type];

            promises.push(boost.hide(animated));
        }

        await Promise.all(promises);

        this.organiseItems(animated);
    }

    public updateItemTimer(id: string, ratio: number): void
    {
        const timer = this.timersList[id];

        if (!timer) return;
        timer.ratio = ratio;
    }

    private organiseItems(animated = false): void
    {
        this.organizeTimers();
        this.organizeBoosts(animated);
    }

    private organizeTimers(): void
    {
        if (!this.timers) return;

        const margin = 20;
        let i = this.timers.children.length;

        while (i--)
        {
            const timer = this.timers.children[i] as ItemTimer;

            timer.x = (timer.w / 2) + margin;
            timer.y = (-i * (timer.h + margin)) - (timer.h / 2) - margin;
        }
        this.timers.x = 0;
        this.timers.y = this.h;
    }

    private organizeBoosts(animated = false): void
    {
        if (!this.boosts) return;

        const time = animated ? 0.2 : 0;
        const margin = 20;
        const timersHeight = this.timers?.height ? this.timers?.height + margin : 0;
        let i = this.boosts.children.length;

        while (i--)
        {
            const boost = this.boosts.children[i] as ItemBoost;

            boost.x = (boost.w / 2) + margin;
            const y = (-i * (boost.h + margin)) - (boost.h / 2) - margin - timersHeight;

            TweenLite.killTweensOf(boost);
            TweenLite.to(boost, time, { y });
        }
        this.boosts.x = 0;
        this.boosts.y = this.h;
    }

    private onBtnPausePress(): void
    {
        if (this.game.state === Game.PAUSED)
        {
            this.btnPause.onTap = null;
            this.game.resume(3);
        }
        else
        {
            this.game.pause();
        }
    }
}
