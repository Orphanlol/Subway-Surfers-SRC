import * as PIXI from 'pixi.js';

import GameConfig from '../GameConfig';
import { app } from '../SubwaySurfersApp';
import Poki from '../utils/Poki';
import { BoardButton } from './buttons/BoardButton';
import { Button } from './buttons/Button';
import { HorizontalMenu } from './buttons/HorizontalMenu';
import { SmallButton } from './buttons/SmallButton';
import { SoundButton } from './buttons/SoundButton';
import { FreeStuffButton } from './FreeStuffButton';
import PressToPlay from './PressToPlay';
import Widget from './Widget';

export default class TitleScreen extends Widget
{
    public btnPlay!: PressToPlay;
    public btnSound!: SoundButton;
    public btnSettings!: Button;
    public btnBoards!: BoardButton;
    public tapArea!: PIXI.Sprite;
    private btnMyTour!: Button;

    // Bottom buttons
    private bottomMenu!: HorizontalMenu;
    private btnTopRun?: Button;
    private btnMe!: Button;
    private btnShop!: Button;
    private freeStuffButton!: FreeStuffButton;

    protected onBuild(): void
    {
        this.btnPlay = new PressToPlay();
        this.addChild(this.btnPlay);

        this.tapArea = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.addChild(this.tapArea);
        this.tapArea.alpha = 0;
        this.tapArea.interactive = false;
        this.tapArea.on('pointerdown', () => this.startGame());

        this.btnSound = new SoundButton();
        this.addChild(this.btnSound);

        this.btnSettings = new SmallButton({ icon: 'icon-settings.png' });
        this.btnSettings.onTap = () => app.settings.open();
        this.addChild(this.btnSettings);

        this.btnBoards = new BoardButton();
        this.btnBoards.onTap = () => app.buyBoards.open();
        this.addChild(this.btnBoards);

        this.btnMyTour = this.addChild(new Button({
            w: 240, h: 100,
            color: 0x932f3a,
            icon: 'front-icon-mytour.png',
        }));
        this.btnMyTour.onTap = () => app.nav.toIdleScreen('myTourPanel');

        this.buildBottomBtns();

        this.freeStuffButton = this.addChild(new FreeStuffButton());

        app.resources.manager.onLoadComplete.connect(this.updateLoadingState.bind(this));
        this.updateLoadingState();

        Poki.SDK.commercialBreak(true);
    }

    private buildBottomBtns(): void
    {
        this.bottomMenu = new HorizontalMenu({ spacing: 40 });
        this.addChild(this.bottomMenu);

        if (GameConfig.leaderboard !== 'none')
        {
            this.btnTopRun = new Button({
                w: 240, h: 90,
                iconY: -10,
                color: 0x502b8b,
                icon: 'front-icon-top-run.png',
            });
            this.btnTopRun.onTap = () => app.nav.toIdleScreen('topRun');
            this.bottomMenu.addButton(this.btnTopRun);
        }

        this.btnMe = new Button({
            w: 130, h: 90,
            color: 0x006501,
            icon: 'front-icon-me.png',
        });
        this.btnMe.onTap = () => app.nav.toMePanel();
        this.bottomMenu.addButton(this.btnMe);

        this.btnShop = new Button({
            w: 200, h: 90,
            color: 0x276fab,
            icon: 'front-icon-shop.png',
        });

        this.btnShop.onTap = () => app.nav.toIdleScreen('boostShop');
        this.bottomMenu.addButton(this.btnShop);
    }

    private updateLoadingState()
    {
        if (!this.opened) return;

        // Check if has resources for basic gameplay
        const gameLoaded = app.resources.manager.areManifestsLoaded(['game-basic']);

        // Activate tap to play if game has basic resources
        this.btnPlay.visible = gameLoaded;
        this.tapArea.interactive = gameLoaded;

        // Enable ME button, if all idle characters are loaded to bedisplayed
        this.btnMe.visible = app.loader.areAllIdleCharactersLoaded();
        this.bottomMenu.organise();
        this.updateBadges();
    }

    private updateBadges(): void
    {
        if (app.awards.hasPrizeToCollect())
        {
            this.btnMe.showBadge();
        }
        else
        {
            this.btnMe.hideBadge();
        }
    }

    protected onOpen(): void
    {
        this.tapArea.interactive = true;
        this.updateLoadingState();
        this.updateBadges();
        document.addEventListener('keydown', this.onKeyDown);
    }

    protected onClose(): void
    {
        this.tapArea.interactive = false;
        document.removeEventListener('keydown', this.onKeyDown);
    }

    protected onResize(): void
    {
        this.tapArea.width = this.tapArea.height = 5000;
        this.btnSound.x = this.viewportWidth - 60;
        this.btnSound.y = 60;
        this.btnSettings.x = 60;
        this.btnSettings.y = 60;
        this.btnMyTour.x = this.viewportWidth / 2;
        this.btnMyTour.y = 60;
        this.btnBoards.x = this.btnSettings.x;
        this.btnBoards.y = this.btnSettings.y + 110;
        this.btnPlay.position.x = this.viewportWidth / 2;
        this.btnPlay.position.y = this.viewportHeight - 350;
        this.bottomMenu.x = this.viewportWidth / 2;
        this.bottomMenu.y = this.viewportHeight - 120;

        const availableSpace = this.btnSound.x - this.btnMyTour.x - (this.btnSound.width / 2)
        - (this.btnMyTour.width / 2) - this.freeStuffButton.width;

        if (availableSpace >= 20)
        {
            this.freeStuffButton.x = this.btnSound.x - (this.freeStuffButton.width / 2) - (this.btnSound.width / 2) - 10;
            this.freeStuffButton.y = this.btnSettings.y;
        }
        else
        {
            this.freeStuffButton.x = this.btnMyTour.x;
            this.freeStuffButton.y = this.btnMyTour.y + (this.btnMyTour.height / 2) + (this.freeStuffButton.height / 2) + 10;
        }
    }

    private startGame(): void
    {
        if (app.prizeScreen.opened || app.buyBoards.opened || app.settings.opened || app.screenBlocker.isOn()) return;
        app.sound.play('gui-tap');
        app.nav.toGame();
    }

    protected onKeyDown = (e: KeyboardEvent): void =>
    {
        if (!this.tapArea.interactive || e.repeat) return;
        if (e.code === ' ' || e.code === 'Space') this.startGame();
    };
}
