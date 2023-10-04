var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from 'path';
import { isAbsoluteUrl } from '../../../utils';
const plugins = [];
export const cache = {};
const promiseCache = {};
export function addLoaderPlugins(newPlugins) {
    if (newPlugins instanceof Array) {
        plugins.push(...newPlugins);
    }
    else {
        plugins.push(newPlugins);
    }
}
function getLoadPromise(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let asset = null;
        for (let i = 0; i < plugins.length; i++) {
            const plugin = plugins[i];
            if (plugin.load && plugin.test && plugin.test(url)) {
                asset = yield plugin.load(url);
            }
        }
        for (let i = 0; i < plugins.length; i++) {
            const plugin = plugins[i];
            if (plugin.parse) {
                if (!plugin.testParse || plugin.testParse(asset, url)) {
                    asset = (yield plugin.parse(asset, url)) || asset;
                }
            }
        }
        cache[url] = asset;
        return asset;
    });
}
export function loadAssets(assetUrls, onProgress) {
    return __awaiter(this, void 0, void 0, function* () {
        let count = 0;
        const total = assetUrls.length;
        const assets = {};
        let singleAsset = false;
        if (!(assetUrls instanceof Array)) {
            singleAsset = true;
            assetUrls = [assetUrls];
        }
        const promises = assetUrls.map((url) => __awaiter(this, void 0, void 0, function* () {
            if (!isAbsoluteUrl(url)) {
                url = path.normalize(url);
            }
            try {
                if (!promiseCache[url]) {
                    promiseCache[url] = getLoadPromise(url);
                }
                assets[url] = yield promiseCache[url];
            }
            catch (e) {
                console.error(e);
                console.error(`[loadAssets] failed to load: ${url}`);
            }
            if (onProgress)
                onProgress(++count / total);
        }));
        yield Promise.all(promises);
        return singleAsset ? assets[assetUrls[0]] : assets;
    });
}
//# sourceMappingURL=Loader.js.map