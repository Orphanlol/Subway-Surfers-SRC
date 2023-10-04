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
 */
export default class Store
{
    public saved: any = {};
    public onChange = new Signal();
    public storage: Storage;
    protected key: string;

    constructor(key: string)
    {
        this.key = key;

        if (this.constructor.name === 'Store')
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
        console.log(`[Store] load: ${this.key}`, this, saved);

        // Clean saved object before assign by removing unknown keys
        const thisKeys = Object.keys(this);

        for (const k in saved) if (thisKeys.indexOf(k) < 0) delete saved[k];

        Object.assign(this, saved);
        this.saved = saved;
    }

    /** Get an object containing enumerable data only */
    public getData(): any
    {
        return JSON.parse(JSON.stringify(this));
    }
}
