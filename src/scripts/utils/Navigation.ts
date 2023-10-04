import { Signal } from 'signals';

import { MysteryBoxType } from '../data/mysterybox/MysteryBoxData';
import { awardMysteryBox } from '../data/mysterybox/MysteryBoxUtil';
import { app } from '../SubwaySurfersApp';
import Widget from '../ui/Widget';
import Poki from './Poki';
import { delay } from './Utils';

export default class Navigation
{
    opened?: Widget;
    private firstRun = true;

    public onGameplayStart = new Signal();
    public onGameplayFinish = new Signal();

    private resetUi(): void
    {
        app.show();
        app.prizeScreen.close();
        app.saveme.close();
        app.gameover.close();
        app.notEnoughCurrency.close();
        app.buyBoards.close();
        this.opened?.close();
    }

    public async toIdleScreen(id: string, data = {}, awaitFunc?: () => Promise<void>): Promise<void>
    {
        this.resetUi();
        this.idleGame();
        await awaitFunc?.();
        const widget = ((app as any)[id] as Widget);

        widget.open(data);
        this.opened = widget;
    }

    private idleGame(): void
    {
        app.game.idle();
        app.game.onGameover.remove(this as any);
    }

    public async toMePanel(): Promise<void>
    {
        const toAwait = async () =>
        {
            // Load all characters <char>-idle.gb
            app.showLoadingMessage();
            await app.loader.loadAllIdleCharacters();
            app.hideLoadingMessage();
        };

        this.toIdleScreen('mePanel', {}, toAwait);
    }

    public toTitleScreen(): void
    {
        // if (!app.user.gameSettings.adConsent)
        // {
        //     this.toIdleScreen('ageGatePanel');
        // }
        // else this.toIdleScreen('title');
        this.toIdleScreen('title');
    }

    protected testPrizeScreen(): void
    {
        setTimeout(() =>
        {
            app.prizeScreen.open({ prizes: [
                { type: 'coins', amount: 1, boxType: 'mystery-box' },
                { amount: 1, type: 'keys', icon: 'icon-key.png' },
                { type: 'hoverboard', amount: 1, boxType: 'mystery-box' },
            ] });
            app.prizesPanel.open('mini-mystery-box');
        }, 1000);
    }

    public async toAwards(): Promise<void>
    {
        this.resetUi();
        this.idleGame();

        app.showLoadingMessage();
        await app.loader.loadAllIdleCharacters();
        app.hideLoadingMessage();

        app.mePanel.open();
        app.mePanel.setSection('awards');
        this.opened = app.mePanel;
    }

    public async toGame(): Promise<void>
    {
        this.resetUi();

        // Load selected character <char>-game.gb
        app.showLoadingMessage();
        await app.loader.loadSelectedFullCharacter();
        app.hideLoadingMessage();

        if (!this.firstRun) await Poki.SDK.commercialBreak(true);
        if (app.resources.manager.areManifestsLoaded(['game-basic']))
        {
            this.runGame();
        }
        else if (app.resources.loading)
        {
            // Turn on loading overlay mode wait load finish to run the game
            app.resources.manager.onLoadComplete.connect(this.runGame);
        }
        else
        {
            // All loaded, run the game straight away
            this.runGame();
        }
        this.firstRun = false;
    }

    public toPrizeScreen(type: MysteryBoxType = 'mystery-box'): void
    {
        const prize = awardMysteryBox(type);

        app.prizeScreen.open({ prizes: [prize] });
    }

    public async toGameover(forceHighscore = false): Promise<void>
    {
        this.resetUi();
        app.game.onGameover.remove(this as any);
        this.onGameplayFinish.dispatch();

        // Check if high score has been beaten
        if (app.game.stats.score > app.user.highscore || forceHighscore)
        {
            app.highScoreScreen.open();
            app.highScoreScreen.onExit.addOnce(() => app.gameover.open());
        }
        else
        {
            app.gameover.open();
        }
    }

    protected async gameover(): Promise<void>
    {
        await delay(0.75);
        app.saveme.open();
    }

    protected runGame = (): void =>
    {
        this.onGameplayStart.dispatch();
        app.resources.manager.onLoadComplete.disconnect(this.runGame);
        app.game.onGameover.add(this as any);
        app.game.runWithIntro();
    };
}
