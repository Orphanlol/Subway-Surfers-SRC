import { CentralDispatch, i18n } from '@goodboydigital/astro';

import GameConfig from '../GameConfig';
import { SubwaySurfersApp } from '../SubwaySurfersApp';
import Poki from './Poki';
import { delay } from './Utils';

/**
 * Handle app loading modes:
 *
 * - Mode 'all'
 * Load `idle`, `basic` and `full` levels all at once, during the loading screen
 * That means all assets are going to loaded when title screen appears, and game ready to go
 *
 * - Mode 'simple'
 * Load only `idle` during loading screen, then show title screen
 * After that, load `basic` and `full` in background and make game playable only after that
 * but will full set of assets
 *
 * - Mode 'progressive'
 * Load only `idle` during loading screen, then show title screen
 * After that, load `basic` and make game available to be played, showing 'tap to play'
 * while loading `full` in background
 *
 * - Mode 'progressive-discrete'
 * Very similar to 'progressive' mode, but loads `idle` + `basic` all together,
 * then show title screen and load `full` in background.
 * Game will be available to be played as soon as title screen appears.
 *
 * Each load mode will have a corresponding function and will proceed in linear steps:
 * ```
 * wait load('a');
 * doSomething();
 * wait load('b');
 * doSomethingElse();
 * ```
 * Nothing in this game is loaded automatically - manifest.default is empty. Every assets sub-folder is
 * tagged as `{manifest}` so they should be called explicitly.
 */
export class AppLoader
{
    public app: SubwaySurfersApp;
    private idleCharactersLoaded = [] as string[];
    private fullCharactersLoaded = [] as string[];
    private characterLoadPromises: Record<string, Promise<void>> = {};
    private loading = false;

    constructor(app: SubwaySurfersApp)
    {
        this.app = app;
        CentralDispatch.useWorkers = GameConfig.useWebWorkers && GameConfig.loadExtraAttempts === 0;
        app.resources.manager.onLoadStart.connect(this.onLoadStart.bind(this));
        app.resources.manager.onLoadProgress.connect(this.onLoadProgress.bind(this));
        app.resources.manager.onLoadComplete.connect(this.onLoadComplete.bind(this));
    }

    /**
     * Load things and make app ready for user interaction
     */
    public async proceed(): Promise<void>
    {
        switch (GameConfig.loadMode)
        {
            case 'all':
                await this.loadAll();
                break;
            case 'simple':
                await this.loadSimple();
                break;
            case 'progressive':
                await this.loadProgressive();
                break;
            case 'progressive-discrete':
                await this.loadProgressiveDiscrete();
                break;
        }
    }

    /** Safe load groups or shut down the app if something goes wrong */
    private async loadGroups(...groups: string[]): Promise<void>
    {
        console.log(`[AppLoader] Load groups:`, ...groups);
        try
        {
            await this.app.resources.load(...groups);
        }
        catch (e)
        {
            this.app.tearDown('Sorry, game did not load properly. Try again.');

            throw new Error(`Game failed to load due to network problems.`);
        }
    }

    // === LOADING MODE: ALL ======================================================================

    /**
     * Load everything at once, during the loading screen
     */
    private async loadAll(): Promise<void>
    {
        // Preload
        await this.loadGroups('preload', 'font');

        // Load everything
        await this.loadGroups(
            'chunks-idle',
            'chunks-basic',
            'chunks-full',
            'game-idle',
            'game-basic',
            'game-full',
            'data',
            'ui',
            `character-${this.app.user.character}-idle`,
            `character-${this.app.user.character}-basic`,
        );

        // Update language
        i18n.language = GameConfig.language;

        // Load all audio
        this.app.sound.loadGroup('audio-idle');
        this.app.sound.loadGroup('audio-basic');
        this.app.sound.loadGroup('audio-full');

        // Setup the game
        this.app.createGame();
        this.app.nav.toTitleScreen();
        Poki.SDK.gameLoadingFinished();
        this.app.hideLoadingMessage();
    }

    // === LOADING MODE: SIMPLE ===================================================================

    /**
     * Load idle assets first, then load basic and full all together
     */
    private async loadSimple(): Promise<void>
    {
        // Preload
        await this.loadGroups('preload', 'font');

        // Load enough stuff for the title screen
        await this.loadGroups(
            'chunks-idle',
            'game-idle',
            'data',
            'ui',
            `character-${this.app.user.character}-idle`,
        );

        // Update language
        i18n.language = GameConfig.language;

        // Instantiate the game and got to title screen
        this.app.createGame();
        this.app.nav.toTitleScreen();

        // For debugging only
        if (GameConfig.loadDelay) await delay(GameConfig.loadDelay);

        // Load all remaining assets for the game
        this.loadGroups(
            'chunks-basic',
            'chunks-full',
            'game-basic',
            'game-full',
            `character-${this.app.user.character}-basic`,
        );

        // Load remaining audio in background
        this.app.sound.loadGroup('audio-idle');
        this.app.sound.loadGroup('audio-basic');
        this.app.sound.loadGroup('audio-full');

        // Now game should be playable, but still not fully loaded
        Poki.SDK.gameLoadingFinished();
        this.app.hideLoadingMessage();
    }

    // === LOADING MODE: PROGRESSIVE ==============================================================

    /**
     * Load assets gradually, and make game playable with a basic set of resources
     */
    private async loadProgressive(): Promise<void>
    {
        // Preload
        await this.loadGroups('preload', 'font');

        // Load enough stuff for the title screen
        await this.loadGroups(
            'chunks-idle',
            'game-idle',
            'data',
            'ui',
            `character-${this.app.user.character}-idle`,
        );

        // Update language
        i18n.language = GameConfig.language;

        // Load idle audio in background
        this.app.sound.loadGroup('audio-idle');

        // Instantiate the game and got to title screen
        this.app.createGame();
        this.app.hideLoadingMessage();
        this.app.nav.toTitleScreen();

        // For debugging only
        if (GameConfig.loadDelay) await delay(GameConfig.loadDelay);

        // Load basic assets for the game
        await this.loadGroups(
            'chunks-basic',
            'game-basic',
            `character-${this.app.user.character}-basic`,
        );

        // Load basic audio in background
        this.app.sound.loadGroup('audio-basic');

        // Now game should be playable, but still not fully loaded
        Poki.SDK.gameLoadingFinished();

        // For debugging only
        if (GameConfig.loadDelay) await delay(GameConfig.loadDelay);

        // Load all remaining assets for the game in background
        await this.loadGroups(
            'chunks-full',
            'game-full',
        );

        // Load all remaining audio in background
        this.app.sound.loadGroup('audio-full');

        // For debugging only
        if (GameConfig.loadDelay) await delay(GameConfig.loadDelay);

        this.loadAllIdleCharacters();
    }

    // === LOADING MODE: DISCRETE =================================================================

    /**
     * Load assets gradually, and make game playable with a basic set of resources
     */
    private async loadProgressiveDiscrete(): Promise<void>
    {
        // Preload
        await this.loadGroups('preload', 'font');

        // Load enough stuff for the title screen
        await this.loadGroups(
            'chunks-idle',
            'game-idle',
            'chunks-basic',
            'game-basic',
            'data',
            'ui',
            `character-${this.app.user.character}-idle`,
            `character-${this.app.user.character}-basic`,
            'boards',
        );

        // Load idle audio in background
        this.app.sound.loadGroup('audio-idle');
        this.app.sound.loadGroup('audio-basic');

        // Update language
        i18n.language = GameConfig.language;

        // Instantiate the game and got to title screen
        this.app.createGame();
        this.app.hideLoadingMessage();
        this.app.nav.toTitleScreen();

        // Now game should be playable, but still not fully loaded
        Poki.SDK.gameLoadingFinished();

        // For debugging only
        if (GameConfig.loadDelay) await delay(GameConfig.loadDelay);

        // Load all remaining assets for the game in background
        await this.loadGroups(
            'chunks-full',
            'game-full',
        );

        // Load all remaining audio in background
        this.app.sound.loadGroup('audio-full');

        // For debugging only
        if (GameConfig.loadDelay) await delay(GameConfig.loadDelay);

        this.loadAllIdleCharacters();
    }

    // === CHARACTERS =============================================================================

    public async loadCharacter(char: string, full = false): Promise<void>
    {
        // Also load idle assets if asked for a full load
        if (full) await this.loadCharacter(char, false);

        const tag = full ? 'basic' : 'idle';
        const list = full ? this.fullCharactersLoaded : this.idleCharactersLoaded;
        const groupId = `character-${char}-${tag}`;

        if (this.characterLoadPromises[groupId])
        {
            await this.characterLoadPromises[groupId];

            return;
        }

        if (list.includes(char)) return;
        this.characterLoadPromises[groupId] = this.loadGroups(groupId);

        await this.characterLoadPromises[groupId];
        delete this.characterLoadPromises[groupId];

        list.push(char);
    }

    public async loadSelectedIdleCharacter(): Promise<void>
    {
        const char = this.app.user.character;

        await this.loadCharacter(char, false);
    }

    public async loadSelectedFullCharacter(): Promise<void>
    {
        const char = this.app.user.character;

        await this.loadCharacter(char, true);
    }

    public async loadAllIdleCharacters(): Promise<void>
    {
        const list = this.app.data.getAvailableCharactersIds();
        const promises = [];

        for (const id of list)
        {
            promises.push(this.loadCharacter(id, false));
        }

        await Promise.all(promises);
    }

    public areAllIdleCharactersLoaded(): boolean
    {
        const charList = this.app.data.getAvailableCharactersIds();
        const manifests = [];

        for (const char of charList) manifests.push(`character-${char}-idle`);

        return this.app.resources.manager.areManifestsLoaded(manifests);
    }

    // === HANDLERS ===============================================================================

    private onLoadStart(): void
    {
        // Only start reporting progress if game-idle is included in the loading
        if (!this.app.resources.loadingIds.includes('game-idle')) return;
        this.loading = true;

        // Hardcoded totals, based on devtools profile - to be automatised
        if (window.loadingBar && GameConfig.loadingMbs)
        {
            if (GameConfig.loadMode === 'progressive-discrete') window.loadingBar.setTotal(6.4);
            if (GameConfig.loadMode === 'progressive') window.loadingBar.setTotal(3.6);
            if (GameConfig.loadMode === 'simple') window.loadingBar.setTotal(3.6);
            if (GameConfig.loadMode === 'all') window.loadingBar.setTotal(14.5);
        }
    }

    private onLoadProgress(percent: number): void
    {
        if (!this.loading) return;

        // Update html loading bar
        if (window.loadingBar) window.loadingBar.setProgress(percent / 100);
    }

    private onLoadComplete(): void
    {
        if (!this.loading) return;
        this.loading = false;
    }
}
