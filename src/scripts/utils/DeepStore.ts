import { Device } from '@goodboydigital/astro';
import { Signal } from 'signals';

import { CookieStorage } from './CookieStorage';
import * as Diff from './Diff';

/**
 * Experimental class for persistent data stored as object
 * All enumerable properties are elegible to be saved. If you don't
 * want certain properties included in saves you have to explictily make
 * them non-enumerable (see constructor).
 * This class is made to be extended by other classes - see User.ts,
 * then all you need to do is to set default values for each porperty described
 *
 * Limitations:
 * - properties can't be renamed
 * - properties within different subObects can't share the same names
 * - outdated properties within arrays are not taken cared off
 */

export default class DeepStore
{
    public saved: any = {};
    public onChange = new Signal();
    public storage: Storage;
    protected key: string;

    constructor(key: string)
    {
        this.key = key;

        if (this.constructor.name === 'DeepStore')
        {
            throw new Error('This class is made to be extended, should work only as subclass.');
        }

        if (Device.isLocalStorageAllowed)
        {
            console.log(`[Store] Using local storage: ${this.key}`);
            this.storage = window.localStorage;
        }
        else if (Device.isSessionStorageAllowed)
        {
            console.log(`[Store] Using session storage: ${this.key}`);
            this.storage = window.sessionStorage;
        }
        else
        {
            console.log(`[Store] Using cookie storage: ${this.key}`);
            this.storage = new CookieStorage(this.key, 30);
        }

        // Hide these properties for things such JSON stringify
        Object.defineProperty(this, 'key', { enumerable: false });
        Object.defineProperty(this, 'onChange', { enumerable: false });
        Object.defineProperty(this, 'saved', { enumerable: false });
        Object.defineProperty(this, 'storage', { enumerable: false });
    }

    /** Compare current properties and save only if changed */
    public save(): void
    {
        if (!this.key) throw new Error('[Store] Save failed: invalid key');
        // console.log(`[Store] save: ${this.key}`);

        // Compare current with saved data
        const data = this.getData();
        const d = Diff.diff(this.saved, data);

        if (Diff.isEmpty(d)) return;

        // Data has changed: store data and mark as saved
        const json = JSON.stringify(data);

        this.storage.setItem(this.key, json);
        this.saved = data;
        this.onChange.dispatch();
    }

    /** Load properties from persistent stored data */
    public load(): void
    {
        if (!this.key) throw new Error('[Store] Load failed: invalid key');
        const json = this.storage.getItem(this.key);
        let saved: any = {};

        try
        {
            saved = json ? JSON.parse(json) : {};
        }
        catch (e)
        {
            // Nothing to load!
        }

        // Clean saved object before assign by removing unknown keys
        saved = this.cleanSavedData(saved);
        console.log(`[Store] load: ${this.key}`, this, saved);

        Object.assign(this, saved);
        this.saved = saved;
    }

    cleanSavedData(saved: Record<string, unknown>): void
    {
        const fa = Diff.flatten(this);
        const fb = Diff.flatten(saved);

        for (const j in fb)
        {
            const propB = j.split(Diff.FLAT_SEP).pop();
            let found = false;

            for (const k in fa)
            {
                found = found || k === j;
                if (found)
                {
                    const av = fa[k];
                    const bv = fb[j];

                    if (Array.isArray(av) && Array.isArray(bv))
                    {
                        // Push any missing default elements to the saved objects
                        bv.push(...av.filter((e) => !bv.includes(e)));

                        fb[k] = bv;
                    }

                    if (typeof av !== typeof bv)
                    {
                        fb[k] = av;
                    }

                    break;
                }
                const propA = k.split(Diff.FLAT_SEP).pop();

                // This should happen when we restructure a property in any of the stored objects
                // Given the properties still have the same name we reassign the saved value and delete the old property
                if (propA === propB)
                {
                    fb[k] = fb[j];
                    delete fb[j];
                }
            }
            // Delete any leftover in the saved object
            if (!found) delete fb[j];
        }

        // Add any missing property in the stored data
        for (const j in fa)
        {
            let found = false;

            for (const k in fb)
            {
                found = found || k === j;
            }
            if (!found) fb[j] = fa[j];
        }

        return Diff.unflatten(fb);
    }

    /** Get an object containing enumerable data only */
    public getData(): any
    {
        return JSON.parse(JSON.stringify(this));
    }
}
