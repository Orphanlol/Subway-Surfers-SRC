import {
    Application,
    I18nPlugin,
    ResourceManager,
    ResourcePlugin,
    StagePlugin,
    StatsPlugin,
    VisibilityPlugin,
    waitAFrame,
} from '@goodboydigital/astro';
import * as PIXI from 'pixi.js';

import { scoreApi } from './api/ScoreApi';
import Awards from './awards/Awards';
import { AppData } from './data/AppData';
import Game from './Game';
import GameConfig from './GameConfig';
import { getManifest } from './getManifest';
import { Shop } from './shop/Shop';
import { AgeGatePanel } from './ui/agegate/AgeGatePanel';
import { ConsentPanel } from './ui/agegate/ConsentPanel';
import BoostShop from './ui/boosts/BoostShop';
import { BoostsPanel } from './ui/BoostsPanel';
import BuyBoards from './ui/BuyBoards';
import Gameover from './ui/Gameover';
import { HighScoreScreen } from './ui/HighScoreScreen';
import { MePanel } from './ui/me/MePanel';
import { MysteryBoxPrizes } from './ui/mysterybox/MysteryBoxPrizes';
import { MyTourPanel } from './ui/mytour/MyTourPanel';
import NotEnoughCurrency from './ui/NotEnoughCurrency';
import { Notification } from './ui/Notification';
import { PrizeScreen } from './ui/PrizeScreen';
import Resizer from './ui/Resizer';
import SaveMe from './ui/SaveMe';
import { ScreenBlocker } from './ui/ScreenBlocker';
import Settings from './ui/Settings';
import TitleScreen from './ui/TitleScreen';
import TopRun from './ui/TopRun';
import UI from './ui/UI';
import { AppExtras } from './utils/AppExtras';
import { AppLoader } from './utils/AppLoader';
import { Library } from './utils/Library';
import { ModelViewer } from './utils/ModelViewer';
import Navigation from './utils/Navigation';
import { Sound } from './utils/Sound';
import User from './utils/User';
import { initWordHunt } from './utils/WordHuntManager';

// On some old android devices fragment precision needs to be low
PIXI.settings.PRECISION_VERTEX = (GameConfig.vertp as unknown as PIXI.PRECISION) || PIXI.PRECISION.HIGH;
PIXI.settings.PRECISION_FRAGMENT = (GameConfig.fragp as unknown as PIXI.PRECISION) || PIXI.PRECISION.LOW;

/**
 * This class is an adaptation of the legacy app class to Astro's app to make it work with existing code.
 * The main difference is the 'extensions' concept - they work exactly the same as plugins, but any object
 * can be added as an extension - that's why most of extensions classes are in `utils` folder, because of the original
 * way they where conceived. In theory, all of these extensions can be converted into Astro plugin safely, so that
 * is something to be done in future updates.
 */
export class SubwaySurfersApp extends Application
{
    // Extensions are like Astro plugins
    public extensions: any[] = [];

    // Astro plugins
    public stage!: StagePlugin;
    public resources!: ResourcePlugin;
    public i18n!: I18nPlugin;
    public visibility!: VisibilityPlugin;

    // Extensions - they act like plugins
    public resize!: Resizer;
    public nav!: Navigation;
    public library!: Library;
    public sound!: Sound;
    public game!: Game;
    public ui!: UI;
    public user!: User;
    public gameover!: Gameover;
    public title!: TitleScreen;
    public viewer!: ModelViewer;
    public saveme!: SaveMe;
    public topRun!: TopRun;
    public boostShop!: BoostShop;
    public mePanel!: MePanel;
    public myTourPanel!: MyTourPanel;
    public settings!: Settings;
    public loader!: AppLoader;
    public extras!: AppExtras;
    public data!: AppData;
    public shop!: Shop;
    public notEnoughCurrency!: NotEnoughCurrency;
    public buyBoards!: BuyBoards;
    public prizesPanel!: MysteryBoxPrizes;
    public prizeScreen!: PrizeScreen;
    public ageGatePanel!: AgeGatePanel;
    public consentPanel!: ConsentPanel;
    public boostPanel!: BoostsPanel;
    public screenBlocker!: ScreenBlocker;
    public notification!: Notification;
    public awards!: Awards;
    public highScoreScreen!: HighScoreScreen;

    private message!: HTMLDivElement;

    public async run(): Promise<void>
    {
        // Cap max fps - ideally should be either 30 or 60
        PIXI.Ticker.system.maxFPS = GameConfig.fps;

        // Check if webgl is available before anything else
        if (!PIXI.utils.isWebGLSupported())
        {
            this.tearDown('This browser does not support WebGL.');

            return;
        }

        this.user = this.addExtension(new User());
        this.data = this.addExtension(new AppData());

        // Setup Astro stage plugin
        this.stage = this.add(StagePlugin, {
            backgroundColor: 0x94d2ff,
            width: window.innerWidth,
            height: window.innerHeight,
            antialias: false,
            transparent: false,
            resolution: GameConfig.resolution,
        } as any);

        // Setup Astro resources plugin
        this.resources = this.add(ResourcePlugin, {
            // basePath: GameConfig.assetsPath,
            // canCacheBust: false, // Astro cache bust seems to be creating duplicates of loading entries in network
            // cacheBustValue: HASH, // This would be required if using Astro's cache bust
            manifest: await getManifest(),
            version: GameConfig.quality,
            extraLoadAttempts: GameConfig.loadExtraAttempts,
            extraLoadAttemptsInterval: 1,
        } as any);

        // Setup Astro language plugin
        this.i18n = this.add(I18nPlugin, {
            entryDefaults: { fontName: 'Titan One' },
        });

        // Setup Astro visibility plugin
        this.visibility = this.add(VisibilityPlugin);

        // Stats plugin only if stats flag is on
        if (GameConfig.stats) this.add(StatsPlugin);

        // Resizer plugin is not working well here, using resizer exension instead
        this.resize = this.addExtension(new Resizer({ maxRenderScale: GameConfig.maxRenderScale }));

        // Setup remaining custom plugins, as 'extensions'
        this.ui = this.addExtension(new UI());
        this.nav = this.addExtension(new Navigation());
        this.library = this.addExtension(new Library(this));
        this.sound = this.addExtension(new Sound(this));
        this.title = this.addExtension(new TitleScreen());
        this.gameover = this.addExtension(new Gameover());
        this.saveme = this.addExtension(new SaveMe());
        this.topRun = this.addExtension(new TopRun());
        this.mePanel = this.addExtension(new MePanel());
        this.myTourPanel = this.addExtension(new MyTourPanel());
        this.loader = this.addExtension(new AppLoader(this));
        this.boostShop = this.addExtension(new BoostShop());
        this.settings = this.addExtension(new Settings());
        this.shop = this.addExtension(new Shop());
        this.notEnoughCurrency = this.addExtension(new NotEnoughCurrency());
        this.buyBoards = this.addExtension(new BuyBoards());
        this.prizesPanel = this.addExtension(new MysteryBoxPrizes());
        this.prizeScreen = this.addExtension(new PrizeScreen());
        this.ageGatePanel = this.addExtension(new AgeGatePanel());
        this.consentPanel = this.addExtension(new ConsentPanel());
        this.screenBlocker = this.addExtension(new ScreenBlocker());
        this.boostPanel = this.addExtension(new BoostsPanel());
        this.notification = this.addExtension(new Notification());
        this.awards = this.addExtension(new Awards(this));
        this.highScoreScreen = this.addExtension(new HighScoreScreen());

        // Remove the canvas while app is not ready to be shown yet
        // AppLoader plugin will bring that back as soon preloaded assets are done
        // in order to make a seamless transition from html splash to loading splash
        this.stage.view.remove();

        // Init all plugins and extensions
        await this.init();

        // Init the firebase default app and the score API
        await scoreApi.init();

        initWordHunt();

        // ResourcePlugin version set seems not working - reinforce that on ResourceManager
        (ResourceManager as any)._version = GameConfig.quality;

        if (GameConfig.extra)
        {
            // Instantiate extras if app was set to do so
            this.extras = this.addExtension(new AppExtras(this));
        }
        else
        {
            // Load and start up the app for the user
            await this.loader.proceed();
        }

        this.initUserDebugData();
    }

    /**
     * Present the app stage
     */
    public async show(): Promise<void>
    {
        if (this.stage.view.parentNode) return;
        await waitAFrame();
        await waitAFrame();
        await waitAFrame();
        if (window.loadingBar) window.loadingBar.hide();
        document.body.appendChild(this.stage.view);
    }

    /**
     * Instantiate the game
     */
    public createGame(): void
    {
        if (this.game) return;
        this.game = this.addExtension(new Game(this, this.sound));
        this.game.idle();
        this.awards.initialise();
    }

    /**
     * Extentions was used in place of plugins back in time when this project was conceived
     * Ideally we should convert extensions to plugins
     * @param ext - Extension to be added
     */
    public addExtension<T>(ext: T): T
    {
        if (this.extensions.indexOf(ext) >= 0) throw new Error('Extension already added');
        this.initRunner.add(ext);
        this.prepareRunner.add(ext);
        this.startRunner.add(ext);
        this.extensions.push(ext);

        return ext;
    }

    /**
     * Hide that html loading message that appears at the top of the screen
     */
    public showLoadingMessage(): void
    {
        if (!this.message) this.message = document.getElementById('message') as HTMLDivElement;
        if (this.message) document.body.appendChild(this.message);
    }

    /**
     * Hide that html loading message that appears at the top of the screen
     */
    public hideLoadingMessage(): void
    {
        if (!this.message) this.message = document.getElementById('message') as HTMLDivElement;
        if (this.message) this.message.remove();
    }

    /**
     * If app does not have all resources needed to run, due to some network error
     */
    public tearDown(msg: string): void
    {
        PIXI.Ticker.system.destroy();
        if (this.stage) this.stage.view.remove();
        if (window.loadingBar) window.loadingBar.hide();

        console.log('[SubwaySurfersApp] TEAR DOWN:', msg);

        const el = document.getElementById('message') || document.createElement('div');

        el.id = 'message';
        el.innerHTML = `
        <div id="message">
        <h1>${msg}</h1>
        </div>
        `;

        if (!el.parentNode) document.body.appendChild(el);
    }

    private initUserDebugData():void
    {
        if (GameConfig.gdFreeMysteryBox)
        {
            this.nav.toPrizeScreen();
        }
        this.user.save();
    }
}

/** Single instance of the app, shared and accessible everywhere */
export const app = new SubwaySurfersApp();
