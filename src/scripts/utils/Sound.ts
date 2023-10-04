import { SoundOptions } from '@goodboydigital/astro';
import SoundBoy from '@goodboydigital/soundboy';
import { SoundInstance, SoundInstanceOptions } from '@goodboydigital/soundboy/lib/SoundInstance';
import { Signal } from 'signals';

import GameConfig from '../GameConfig';
import { getManifest } from '../getManifest';
import { SubwaySurfersApp } from '../SubwaySurfersApp';
import Poki from './Poki';
import { delay } from './Utils';

/**
 * Store a reference to a sound without actually registering in SoundBoy
 * Done this way for pratical loading purposes
 */
interface SoundItem extends SoundOptions
{
    group: string;
    loop: boolean;
    volume: number;
    url: string
    stream: boolean;
    registered: boolean;
    mp3: string;
    ogg: string;
}

/** Sound wrapper for Subway Surfer's App */
export class Sound
{
    private app: SubwaySurfersApp;
    private ready = true;
    private items: Record<string, SoundItem>;
    private _volume = 1;
    private _musicPlaying = '';
    public onMutedChange: Signal<(muted: boolean) => void>;

    constructor(app: SubwaySurfersApp)
    {
        this.app = app;
        this.onMutedChange = new Signal();
        this.items = {};
        this.init();
    }

    private async init(): Promise<void>
    {
        // Isolate items from manifest and prepare them
        const manif = await getManifest();

        for (const group in manif)
        {
            const manifItems = (manif as any)[group]['audio'];

            for (const id in manifItems)
            {
                const name = manifItems[id].shortcut.split('.').shift();
                const url = GameConfig.assetsPath + id;

                this.items[name] = {
                    group: group.split('/').pop(), // turns 'assets/audio-basic' into 'audio-basic'
                    loop: false,
                    volume: 1,
                    url,
                    stream: false,
                    registered: false,
                    ...manifItems[id],
                };
            }
        }

        this.muted = this.app.user.muted;
        this.app.visibility.onVisibilityChange.connect(this.onVisibilityChange.bind(this));

        Poki.SDK.onBreakStart.add(() =>
        {
            this.volume(0);
        });
        Poki.SDK.onBreakComplete.add(() =>
        {
            this.volume(GameConfig.volume);
        });
    }

    private onVisibilityChange(visible: boolean): void
    {
        SoundBoy.systemMuted = !visible;
    }

    /**
     * Register item into SOundBoy, starts its loading immediately
     * @param name - Name of the sound item to be registered
     */
    private ensureRegister(name: string): void
    {
        const item = this.items[name];

        if (!item) throw new Error(`[Sound] Sound item not found: ${name}`);

        if (item.registered) return;
        item.registered = true;
        SoundBoy.registerSound({
            id: name,
            src: [item.ogg, item.mp3],
            preload: true,
            stream: item.stream,
            loop: item.loop,
            volume: item.volume,
        });
    }

    /**
     * Load a bunch of items by group - idle, basic and full
     * @param group - Grupo to be loaded
     */
    public loadGroup(group = ''): void
    {
        for (const name in this.items)
        {
            const item = this.items[name];

            if (item.group === group)
            {
                this.ensureRegister(name);
            }
        }
    }

    /**
     * Set and return volume
     * @param v - Volume's value to set
     */
    public volume(v: number): number
    {
        this._volume = v;
        SoundBoy.volume = this._volume;

        return v;
    }

    /**
     * Play sound fx item by id, if sound is not muted
     * @param id - Name of the sound to be played
     * @param opts - SoundBoy options
     */
    public play(id: string, opts?: SoundInstanceOptions): SoundInstance | null
    {
        if (!this.ready || this.muted) return null;

        this.ensureRegister(id);

        return SoundBoy.playSfx(id, opts);
    }

    /**
     * Stop a playing sound fx - if no argument is provided will stop all sfx
     * @param id - Name of the sound to be stopped
     */
    public stop(id?: string): void
    {
        if (!id)
        {
            SoundBoy.sfxChannel.stop();
        }
        else
        {
            const item = this.items[id];

            if (!item.registered) return;

            SoundBoy.sfxChannel.forEach((sound) =>
            {
                if (sound.id === id) sound.stop();
            });
        }
    }

    /**
     * Play music by name
     * @param id - Name of the music to be played
     * @param opts - SoundBoy options
     */
    public playMusic(id: string, opts?: SoundInstanceOptions): SoundInstance | null
    {
        if (!this.ready || this._musicPlaying) return null;

        this.ensureRegister(id);

        this._musicPlaying = id;

        return SoundBoy.playMusic(id, opts);
    }

    /**
     * Stopp all music being played
     */
    public stopMusic(): void
    {
        this._musicPlaying = '';
        SoundBoy.musicChannel.stop();
    }

    public get muted(): boolean
    {
        return !!SoundBoy.muted;
    }

    public set muted(v: boolean)
    {
        SoundBoy.muted = v;
        SoundBoy.volume = v ? 0 : this._volume;
        this.app.user.muted = v;
        this.app.user.save();
        this.onMutedChange.dispatch(v);
    }

    public toggleMuted(): void
    {
        this.muted = !this.muted;
    }

    public stopAllFx(): void
    {
        SoundBoy.sfxChannel.stop();
    }

    public async musicFadeOut(fadeInAfterSecs?: number): Promise<void>
    {
        SoundBoy.musicChannel.fadeTo(0, 0.5);
        if (fadeInAfterSecs)
        {
            await delay(fadeInAfterSecs);
            SoundBoy.musicChannel.fadeTo(1, 0.5);
        }
    }

    public musicFadeIn(): void
    {
        SoundBoy.musicChannel.fadeTo(1, 1);
    }
}
