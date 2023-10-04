import { Device } from '@goodboydigital/astro';

import Platform from './utils/Platform';

/**
 * All config properties for the app and game.
 * GameConfig default values can be overriden by global window.GAME_CONFIG object,
 * which can also be overriden by url params.
 * Ideally all properties in this config should be string, number or boolean.
 * Nested objects will not be available to be changed through the url.
 */
class GameConfig
{
    // RENDERING SETTINGS -------------------------------------------------

    /** Game target frame rate */
    public fps = 60;

    /** Rendering resolution */
    public resolution = 1;

    /** Smooth update delta to ease abrupt changes - 0 will disable delta smoothing */
    public smoothDelta = 0.2;

    /** Rendering culling */
    public culling = false;

    /** Vertex shader float precision */
    public vertp: 'lowp'|'mediump'|'highp' = 'highp';

    /** Fragment shader float precision */
    public fragp: 'lowp'|'mediump'|'highp' = 'lowp';

    /** Max viewport scale */
    public maxRenderScale = 1.5;

    /** Default image resolution - low, default or high */
    public quality = 'low';

    /** Turn on grind particles */
    public grindParticles = true;

    /** Base speed for 3D animation */
    public baseAnimSpeed = 0.02;

    // PHYSICS ----------------------------------------------------------------

    /** Steps multiplier per speed - higher is more precise, with a performance cost */
    public physicsStepsPerSpeed = 1;

    /** Fixed number of additional physics steps per frame */
    public physicsExtraSteps = 1;

    /** Maximum physics steps allowed per frame */
    public physicsMaxSteps = 60;

    // DEBUG ------------------------------------------------------------------

    /** Enable debug mode and all debug features */
    public debug = false;

    /** Show fps monitor */
    public stats = false;

    /** Show entities models */
    public models = true;

    /** Show environment models */
    public environment = true;

    /** Show entities bounding boxes */
    public blocks = false;

    /** Show entities bounding boxes */
    public chunkMarks = false;

    /** Set up a repeating route section for testing */
    public route = '';

    /** Set up repeating chunks for testing - can be multiple names, separated by comma */
    public chunk = '';

    /** Base time scale, for fast/slow motion */
    public timeScale = 1;

    /** Force tube on all chunks */
    public forceTube = false;

    /** Force game tutorial */
    public tutorial = false;

    /** Delay between loading steps */
    public loadDelay = 0;

    /** Invincible mode */
    public god = false;

    /** Enable on-air jumps */
    public freejump = false;

    /** Enforce only one of existing pickups */
    public forcePickup = '';

    /** Add or subtract (if negative) coins when the game opens */
    public modCoins = 0;

    /** Add or subtract (if negative) keys when the game opens */
    public gdAwardKeys = 0;

    /** Reset app persistent data */
    public reset = false;

    /** Award a free mystery box when the game opens */
    public gdFreeMysteryBox = false;

    // MISSIONS ------------------------------------------------------------------

    /** Alter the current mission set by modifyng the saved data */
    public missionSet = -1;

    /** Alter the current mission set progress by modifyng the saved data */
    public missionProgress: number[] = [];

    // WORD HUNT ------------------------------------------------------------------

    /** Simulate a day of week increase */
    public dayModifier = 0;

    // WORLD -------------------------------------------------------------

    /** Lane width, in game units */
    public laneWidth = 20;

    /** Game block size, in game units */
    public blockSize = 90;

    /** Max game visible distance, for placing entities */
    public visibleMaxDistance = 1000;

    /** Min game visible distance, for removing passed entities */
    public visibleMinDistance = -500;

    /** Turn on/off world fog */
    public fog = true;

    /** Turn on/off world bend */
    public bend = true;

    /** Bend X ratio */
    public bendX = -0.00065;

    /** Bend Y ratio */
    public bendY = -0.0003;

    /** Turn scenario fillers on/off */
    public fillers = true;

    /** Turn ground on/off */
    public ground = true;

    /** Pre-populate pool of entities */
    public prepopulate = false;

    // GAMEPLAY -----------------------------------------------------------

    /** Game starting speed - 0 is default speed*/
    public speed = 0;

    /** Base world gravity */
    public gravity = 0.055;

    /** Number of times player can revive for free (watching ad) */
    public freeRevivals = 1;

    /** Default dizzy duration for the character, in secs */
    public dizzyDuration = 3;

    // CAMERA -----------------------------------------------------------------

    /** Base field of view */
    public cameraFov = 68;

    /** Base position x from main character */
    public cameraPosX = 0;

    /** Base position y from main character */
    public cameraPosY = 33.8;

    /** Base position z from main character */
    public cameraPosZ = 33;

    /** Character x position multiplier */
    public cameraModX = 0.75;

    /** Base rotation x (-21.50143 * DEG_TO_RAD) */
    public cameraRotX = -0.375;

    /** Base rotation y */
    public cameraRotY = 0;

    /** Base rotation z */
    public cameraRotZ = 0;

    // APP SETTINGS -----------------------------------------------------------

    /** Set mobile mode */
    public mobile = false;

    /** Set game world environment */
    public bundlesPath = './bundles/';

    /** Set game world environment */
    public theme = '198-atlanta';

    /** Set sound base volume */
    public volume = 0.25;

    /** Use system default prompt for text input */
    public useDefaultPrompt = false;

    /** Max chars allowed for a nickname */
    public maxNicknameChars = 15;

    /** Assets folder for the app */
    public assetsPath = 'assets/';

    /** App default language */
    public language = 'en';

    /** Set leaderboard mode */
    public leaderboard: 'normal'|'realtime'|'ingame'|'none'|'mockup' = 'mockup';

    /** Open extra tools for development */
    public extra: 'models'|'chunks'|'' = '';

    /** Switch app load mode */
    public loadMode: 'all'|'simple'|'progressive'|'progressive-discrete' = 'progressive-discrete';

    /** Switch cache bust on/off */
    public cacheBust = true;

    /** Show estimated loaded and total loading mbs */
    public loadingMbs = true;

    /** Use web workers */
    public useWebWorkers = false;

    /** How many times the app will attempt to load things after failure */
    public loadExtraAttempts = 5;

    /** Enable or disable tokens like hat, guitar, soundsystem */
    public tokens = false;

    constructor()
    {
        this.mobile = !Device.desktop;

        // Override with global config object
        this.override(window.GAME_CONFIG);

        // Override with params from url
        this.override(Platform.getUrlParams());
    }

    /**
     * Override current config fields by given params
     * @param params - Object to replace current values
     */
    public override(params?: Partial<typeof GameConfig>): void
    {
        if (!params) return;
        for (const k in this)
        {
            if ((params as any)[k] === undefined) continue;
            this[k] = (params as any)[k];
        }
    }
}

export default new GameConfig();
