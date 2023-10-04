/* eslint-disable max-depth */
import { Manifest } from '@goodboydigital/astro';

import GameConfig from './GameConfig';

/**
 * This file exists to isolate all hacks and patches in this project assets manifest
 * and is in fact changing entries in the original manifest.json.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const manifest = require('./manifest.json');

/** Mark that manifest has been processed */
let manifestProcessed = false;

function patchManifest(target: any): void
{
    // Patch manifest splash - to enforce regular resolution ==========================================
    const splashDefault = target['assets/preload'].image['assets/preload/splash.png'].standard.default;

    target['assets/preload'].image['assets/preload/splash.png'].standard = {
        low: splashDefault,
        default: splashDefault,
        high: splashDefault,
    };

    const splashWebp = target['assets/preload'].image['assets/preload/splash.png'].webp.default;

    target['assets/preload'].image['assets/preload/splash.png'].webp = {
        low: splashWebp,
        default: splashWebp,
        high: splashWebp,
    };

    // Patch manifest train start - to enforce regular resolution =====================================
    const trainStartDefault = target['assets/game-idle'].image['assets/game-idle/train-start.png'].standard.default;

    target['assets/game-idle'].image['assets/game-idle/train-start.png'].standard = {
        low: trainStartDefault,
        default: trainStartDefault,
        high: trainStartDefault,
    };

    const trainsStartWebp = target['assets/game-idle'].image['assets/game-idle/train-start.png'].webp.default;

    target['assets/game-idle'].image['assets/game-idle/train-start.png'].webp = {
        low: trainsStartWebp,
        default: trainsStartWebp,
        high: trainsStartWebp,
    };

    // Texture atlas doesn't get loaded if using {fix} so this patch enforce the properties ===========
    target['assets/ui'].image.ui.standard = {
        default: 'assets/ui/ui.json',
        high: 'assets/ui/ui.json',
        low: 'assets/ui/ui.json',
    };

    target['assets/ui'].image.ui.webp = {
        default: 'assets/ui/ui.webp.json',
        high: 'assets/ui/ui.webp.json',
        low: 'assets/ui/ui.webp.json',
    };
}

/** Add cache bust url param to all assets in manifest */
function cacheBust(obj: any)
{
    if (typeof obj !== 'object') return;
    for (const k in obj)
    {
        if (k === 'shortcut') continue;

        const v = obj[k];

        // Skip tps json because of an weird error
        if (typeof v === 'string' && v.includes('assets/') && !v.match(/ui(.*?)\.json/))
        {
            obj[k] = `${v}?h=${HASH}`;
        }
        else if (typeof v === 'object')
        {
            cacheBust(v);
        }
    }
}

/** Load am external assets manifest, to be merged with the built-in one */
async function loadExternalManifest(url: string): Promise<Manifest>
{
    const response = await fetch(url);

    return await response.json();
}

/** Prepend a path to all urls in a manifest, for loading outside current domain */
function repathManifest(obj: any, path: string): void
{
    if (typeof obj !== 'object') return;
    for (const k in obj)
    {
        if (k === 'shortcut') continue;

        const v = obj[k];

        // Skip tps json because of an weird error
        if (typeof v === 'string' && v.includes('/'))
        {
            obj[k] = `${path}/${v}`;
        }
        else if (typeof v === 'object')
        {
            repathManifest(v, path);
        }
    }
}

/** Clone an object */
function clone(obj: any): any
{
    return JSON.parse(JSON.stringify(obj));
}

/** Search assets entries with the same shortcut and replace them */
function replaceEntriesByShortcut(obj: any, entry: any): void
{
    if (typeof obj !== 'object') return;

    for (const k in obj)
    {
        if (obj[k].shortcut && obj[k].shortcut === entry.shortcut)
        {
            obj[k] = clone(entry);
        }
        else
        {
            replaceEntriesByShortcut(obj[k], entry);
        }
    }
}

/** Replace entries into target manifes from another manifest */
function mergeManifest(target: any, other: any): void
{
    for (const k in other)
    {
        if (other[k].shortcut)
        {
            replaceEntriesByShortcut(target, other[k]);
        }
        else if (typeof other[k] === 'object')
        {
            mergeManifest(target, other[k]);
        }
    }
}

/**
 * Get the patched version of the manifest
 */
export async function getManifest(): Promise<Manifest>
{
    if (manifestProcessed) return manifest;

    if (GameConfig.bundlesPath && GameConfig.theme && GameConfig.theme !== '1103-seoul')
    {
        const path = `${GameConfig.bundlesPath}/${GameConfig.theme}`;

        try
        {
            const other = await loadExternalManifest(`${path}/manifest.json`);

            repathManifest(other, path);
            mergeManifest(manifest, other);
        }
        catch (e)
        {
            console.warn(`Could not load theme manifest for: ${GameConfig.theme}`);
        }
    }

    patchManifest(manifest);

    manifestProcessed = true;
    if (GameConfig.cacheBust) cacheBust(manifest);

    return manifest;
}

/**
 * Move main character from regular manifest group to a special one, that can be loaded
 * at the beginning
 * @param main - Main character id to be loaded
 */
export function prepareCharacters(...list: string[]): void
{
    function getKeys(char: string)
    {
        return {
            fbxIdle: `assets/characters-idle/${char}-idle.fbx`,
            fbxBasic: `assets/characters-basic/${char}-game.fbx`,
            tex0: `assets/characters-idle/${char}-tex.png`,
            tex1: `assets/characters-idle/${char}-tex-1.png`,
            tex2: `assets/characters-idle/${char}-tex-2.png`,
        };
    }

    for (const char of list)
    {
        const keys = getKeys(char);

        const entryFbxIdle = manifest['assets/characters-idle']['model'][keys.fbxIdle];
        const entryFbxBasic = manifest['assets/characters-basic']['model'][keys.fbxBasic];
        const entryTex0 = manifest['assets/characters-idle']['image'][keys.tex0];
        const entryTex1 = manifest['assets/characters-idle']['image'][keys.tex1];
        const entryTex2 = manifest['assets/characters-idle']['image'][keys.tex2];

        manifest[`assets/character-${char}-idle`] = completeManifest({
            image: {
                [keys.tex0]: entryTex0,
                [keys.tex1]: entryTex1,
                [keys.tex2]: entryTex2,
            },
            model: {
                [keys.fbxIdle]: entryFbxIdle,
            },
        });

        manifest[`assets/character-${char}-basic`] = completeManifest({
            model: {
                [keys.fbxBasic]: entryFbxBasic,
            },
        });
    }
}

/** Ensure that a group manifest will have all the fields that they should have */
function completeManifest(data: Partial<Manifest>): Manifest
{
    const defaultManifestStructure = {
        image: {},
        fonts: {},
        audio: {},
        json: {},
        atlas: {},
        animate: {},
        misc: {},
        model: {},
    };

    return { ...defaultManifestStructure, ...data };
}
