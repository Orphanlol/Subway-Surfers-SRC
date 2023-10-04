import { Signal } from 'signals';

type Callback = (...args: any[]) => void;

const _window = window as any;

export interface UserProfile
{
    name: string;
    image?: number;
    me?: boolean;
}

export interface LeaderboardEntryData
{
    profile: UserProfile;
    rank?: number;
    score: number;
    date: number;
}

class PokiSDKWrapper
{
    public onBreakStart = new Signal();
    public onBreakComplete = new Signal();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getScores(arg0: { room: string; }): Promise<void>
    {
        throw new Error('Method not implemented.');
    }

    init(...args: any[])
    {
        const sdk = _window.PokiSDK;

        if (sdk) return sdk.init(...args);

        return mockPromise(false);
    }

    setSkipVideo(v: boolean): void
    {
        const sdk = _window.PokiSDK;

        if (sdk) sdk._skipVideo = v;
    }

    setDebug(...args: any[])
    {
        const sdk = _window.PokiSDK;

        if (sdk) return sdk.setDebug(...args);

        return mockPromise();
    }

    gameLoadingStart(...args: any[])
    {
        const sdk = _window.PokiSDK;

        console.log('[POKISDK] gameLoadingStart');
        if (sdk) return sdk.gameLoadingStart(...args);

        return mockPromise();
    }

    gameLoadingFinished(...args: any[])
    {
        const sdk = _window.PokiSDK;

        console.log('[POKISDK] gameLoadingFinished');
        if (sdk) return sdk.gameLoadingFinished(...args);

        return mockPromise();
    }

    gameplayStart(...args: any[])
    {
        const sdk = _window.PokiSDK;

        console.log('[POKISDK] gameplayStart');
        if (sdk) return sdk.gameplayStart(...args);

        return mockPromise();
    }

    gameplayStop(...args: any[])
    {
        const sdk = _window.PokiSDK;

        console.log('[POKISDK] gameplayStop');
        if (sdk) return sdk.gameplayStop(...args);

        return mockPromise();
    }

    commercialBreak(...args: any[])
    {
        const sdk = _window.PokiSDK;

        if (sdk._skipVideo) return true;

        let promise = mockPromise(true);

        this.onBreakStart.dispatch();
        console.log('[POKISDK] commercialBreak');
        if (sdk) promise = sdk.commercialBreak(...args);

        return promise.then((result) =>
        {
            this.onBreakComplete.dispatch();

            return result;
        });
    }

    happyTime(...args: any[])
    {
        const sdk = _window.PokiSDK;

        console.log('[POKISDK] happyTime');
        if (sdk) return sdk.happyTime(...args);

        return mockPromise();
    }

    customEvent(...args: any[])
    {
        const sdk = _window.PokiSDK;

        console.log('[POKISDK] customEvent');
        if (sdk) return sdk.customEvent(...args);

        return mockPromise();
    }

    async rewardedBreak(options = {})
    {
        const sdk = _window.PokiSDK;

        if (sdk._skipVideo) return true;

        if (!sdk.adBlockerOn) {
            this.customEvent('rewardedBreak', 'start', options);
        }

        let promise = mockPromise(false);

        this.onBreakStart.dispatch();
        console.log('[POKISDK] rewardedBreak');
        if (sdk && !sdk.adBlockerOn) promise = sdk.rewardedBreak();

        return promise.then((result) =>
        {
            if (!sdk.adBlockerOn) {
                this.customEvent('rewardedBreak', 'complete', options);
            }

            this.onBreakComplete.dispatch();

            return result;
        });
    }

    togglePlayerAdvertisingConsent(didConsent: boolean, age: number)
    {
        const sdk = _window.PokiSDK;

        console.log('[POKISDK] togglePlayerAdvertisingConsent');
        if (sdk) return sdk.togglePlayerAdvertisingConsent(didConsent, age);

        return mockPromise(true);
    }
}

const wrapper = new PokiSDKWrapper();

export default class Poki
{
    static get SDK(): PokiSDKWrapper
    {
        return wrapper;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static sendCustomMessage(noun: string, verb: string, data: any): void
    {
        console.log('[POKI] custom message:', noun, verb, data);
        if (!_window.parent) return;
        _window.parent.postMessage({
            type: 'pokiMessageEvent',
            content: {
                event: 'pokiTrackingCustom',
                data: {
                    eventNoun: noun,
                    eventVerb: verb,
                    eventData: data,
                },
            },
        }, '*');
    }
}

// PROMISES MOCKUPS -----------------------------------------------------------

function mockPromise(...args: any[])
{
    const promise = {
        then: (func: Callback) =>
        {
            func(...args);

            return promise;
        },
        catch: () => promise
        ,
    };

    return promise;
}

// POKI'S SITE LOCK SCRIPT
// This snippet is provided by Poki - better not lint this part

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line
// SITE__LOCK

