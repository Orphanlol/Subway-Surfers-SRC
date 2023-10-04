var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getGPUTier } from 'detect-gpu';
import { UAParser } from 'ua-parser-js';
import { autoDetectStorage, StorageType } from '../detections/autoDetectStorage';
import { DetectAVIF } from '../detections/images/detectAVIF';
import { DetectWebp } from '../detections/images/detectWebP';
import { isGalaxyS5, isIPhone6, isKindle } from './deviceQueries';
export var GPU_TIER;
(function (GPU_TIER) {
    GPU_TIER[GPU_TIER["NONE"] = 0] = "NONE";
    GPU_TIER[GPU_TIER["LOW"] = 1] = "LOW";
    GPU_TIER[GPU_TIER["MEDIUM"] = 2] = "MEDIUM";
    GPU_TIER[GPU_TIER["HIGH"] = 3] = "HIGH";
})(GPU_TIER || (GPU_TIER = {}));
export class DeviceClass {
    constructor() {
        this.supportedFileFormats = {
            webp: false,
            avif: false,
        };
        this.customQueries = [];
        this.caches = {
            query: {},
            browser: {},
            os: {},
            device: {},
            custom: {},
        };
        this.uaData = new UAParser().getResult();
        this.isLocalStorageAllowed = autoDetectStorage(StorageType.LOCAL);
        this.isSessionStorageAllowed = autoDetectStorage(StorageType.SESSION);
        this._checkIPadPro();
    }
    get desktop() {
        return !(this.uaData.device.type === 'tablet' || this.uaData.device.type === 'mobile');
    }
    get mobile() {
        return this.isDevice('mobile');
    }
    get phone() {
        return this.isDevice('phone');
    }
    get tablet() {
        return this.isDevice('tablet');
    }
    get android() {
        return this.uaData.os.name === 'Android';
    }
    get ios() {
        return this.uaData.os.name === 'iOS';
    }
    get kindle() {
        return this.isDevice('kindle');
    }
    get ie() {
        return this.uaData.browser.name === 'IE';
    }
    get gpu() {
        var _a;
        if (!((_a = this.gpuData) === null || _a === void 0 ? void 0 : _a.tier)) {
            console.warn('[Device] GPU data has not been initialised, returning default tier value');
            return 2;
        }
        return this.gpuData.tier;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gpuData)
                return;
            this.supportedFileFormats.webp = yield DetectWebp();
            this.supportedFileFormats.avif = yield DetectAVIF();
            this.gpuData = yield getGPUTier();
        });
    }
    addQuery(...funcs) {
        this.customQueries.push(...funcs);
    }
    query(query) {
        const cachedRes = this.checkCache(query, 'query');
        if (cachedRes !== null)
            return cachedRes;
        const splitMatches = this.parseQuery(query);
        let matches = true;
        for (let i = 0; i < splitMatches.length; i++) {
            const value = splitMatches[i];
            switch (value.type) {
                case 'browser':
                    matches = this.isBrowser(value.value);
                    break;
                case 'os':
                    matches = this.isOS(value.value);
                    break;
                case 'device':
                    matches = this.isDevice(value.value);
                    break;
                case 'gpu':
                    matches = this.isGPU(value.value);
                    break;
                default:
                    matches = this.checkCustom(value);
                    break;
            }
            if (!matches)
                break;
        }
        this.addToCache(query, matches, 'query');
        return matches;
    }
    isBrowser(value) {
        const cachedRes = this.checkCache(value, 'browser');
        if (cachedRes !== null)
            return cachedRes;
        const tests = [
            () => this.checkCustom({ type: 'browser', value }),
            () => {
                const isVersion = value.split(':');
                if (isVersion.length > 1) {
                    return this.uaData.browser.version.split('.')[0] === isVersion[1];
                }
                return false;
            },
            () => { var _a; return (_a = this.supportedFileFormats[value]) !== null && _a !== void 0 ? _a : false; },
            () => this.uaData.browser.name.toLowerCase().replace(' ', '-') === value,
        ];
        return this.checkTests(tests, value, 'browser');
    }
    isOS(value) {
        const cachedRes = this.checkCache(value, 'os');
        if (cachedRes !== null)
            return cachedRes;
        const tests = [
            () => this.checkCustom({ type: 'os', value }),
            () => {
                const isVersion = value.split(':');
                if (isVersion.length > 1) {
                    return this.uaData.os.version.split('.')[0] === isVersion[1];
                }
                return false;
            },
            () => {
                if (value === 'mobile' || value === 'desktop') {
                    return value === 'mobile' ? !this.desktop : this.desktop;
                }
                return false;
            },
            () => this.uaData.os.name.toLowerCase().replace(' ', '-') === value,
        ];
        return this.checkTests(tests, value, 'os');
    }
    isDevice(value) {
        const cachedRes = this.checkCache(value, 'device');
        if (cachedRes !== null)
            return cachedRes;
        const tests = [
            () => this.checkCustom({ type: 'device', value }),
            () => {
                if (value === 'tablet')
                    return this.uaData.device.type === 'tablet';
                return false;
            },
            () => {
                if (value === 'mobile')
                    return this.uaData.device.type === 'tablet' || this.uaData.device.type === 'mobile';
                return false;
            },
            () => {
                if (value === 'phone') {
                    return this.uaData.device.type === 'mobile';
                }
                return false;
            },
            () => this.uaData.device.model === value,
        ];
        return this.checkTests(tests, value, 'device');
    }
    isGPU(value) {
        return this.gpu === Number(value);
    }
    parseQuery(query) {
        return query.split('--').map((query) => {
            const split = query.split(':').filter((value) => value !== ':');
            return { type: split.shift(), value: split.join(':') };
        });
    }
    checkCustom(value) {
        const cachedRes = this.checkCache(JSON.stringify(value), 'custom');
        if (cachedRes !== null)
            return cachedRes;
        for (let i = 0; i < this.customQueries.length; i++) {
            const queryTest = this.customQueries[i];
            if (queryTest(value)) {
                this.addToCache(JSON.stringify(value), true, 'custom');
                return true;
            }
        }
        this.addToCache(JSON.stringify(value), false, 'custom');
        return false;
    }
    checkCache(query, cacheType) {
        if (this.caches[cacheType][query]) {
            return this.caches[cacheType][query];
        }
        return null;
    }
    checkTests(tests, value, type) {
        let res = false;
        for (let i = 0; i < tests.length; i++) {
            res = tests[i]();
            if (res)
                break;
        }
        this.addToCache(value, res, type);
        return res;
    }
    addToCache(query, result, cacheType) {
        this.caches[cacheType][query] = result;
    }
    _checkIPadPro() {
        const userAgent = this.uaData.ua;
        const isMacOS = (/Mac OS/).test(userAgent) && !((/like Mac OS/).test(userAgent));
        const touchCheck = 'ontouchstart' in window;
        if (isMacOS && touchCheck) {
            this.uaData.device.type = 'tablet';
            this.uaData.device.vendor = 'apple';
            this.uaData.device.model = 'ipad-pro';
            console.warn('[Device]: OS cannot be determined on this device');
        }
    }
}
const Device = new DeviceClass();
Device.addQuery(isIPhone6, isGalaxyS5, isKindle);
export { Device, };
//# sourceMappingURL=Device.js.map