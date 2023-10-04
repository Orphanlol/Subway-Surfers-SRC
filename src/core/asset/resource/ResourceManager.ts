var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Signal } from 'typed-signals';
import { autoDetectImageFormat } from '../../../utils/system/detections/images/autoDetectImageFormat';
import { loadWebFont, uploadTexture } from '../loader';
import { addLoaderPlugins, cache, loadAssets } from '../loader/Loader';
import { loadBitmapFont } from '../loader/plugins/loadBitmapFont';
import { loaderPluginGB } from '../loader/plugins/loaderPluginGB';
import { loadJson } from '../loader/plugins/loadJson';
import { loadSpritesheet } from '../loader/plugins/loadSpritesheet';
import { loadTextures } from '../loader/plugins/loadTexture';
import { BackgroundLoader } from './BackgroundLoader';
import { attachManifestShortcuts } from './utils';
import { addJsonShortcuts } from './utils/addJsonShortcuts';
import { addModelShortcuts } from './utils/addModelShortcuts';
import { addTextureShortcuts } from './utils/addTextureShortcuts';
import { formatTextures } from './utils/formatTextures';
import { getIdFromImageAsset } from './utils/getIdFromImageAsset';
import { unloadTextures } from './utils/unloadTextures';
import { uploadTextures } from './utils/uploadTextures';
addLoaderPlugins([loadTextures, loadJson, loadSpritesheet, loaderPluginGB, loadBitmapFont, loadWebFont]);
export class ResourceManagerClass {
    constructor() {
        this.onLoadProgress = new Signal();
        this.onLoadStart = new Signal();
        this.onLoadComplete = new Signal();
        this.backgroundLoader = new BackgroundLoader();
        this._uploadTexturesOnLoad = true;
        this._filesToSkip = ['ttf', 'html', 'css', 'mp4', 'js'];
    }
    init(options) {
        var _a, _b, _c, _d;
        const manifest = options.manifest;
        if (!manifest) {
            throw new Error('Resource manager expects a manifest');
        }
        this._imageFormatPreference = autoDetectImageFormat(options.imageFormatPreference);
        this._basePath = options.basePath;
        this._renderer = options.renderer;
        if (options.disableGarbageCollection) {
            this._renderer.textureGC.mode = 1;
        }
        this._manifest = manifest;
        attachManifestShortcuts(manifest, options.manifestBasePath || 'assets/');
        this._version = options.version || 'default';
        this._uploadTexturesOnLoad = (_a = options.uploadTexturesOnLoad) !== null && _a !== void 0 ? _a : false;
        this._canOptimise = (_b = options.canOptimise) !== null && _b !== void 0 ? _b : false;
        this._verbose = !!options.verbose || false;
        this._canCacheBust = (_c = options.canCacheBust) !== null && _c !== void 0 ? _c : false;
        if (this._uploadTexturesOnLoad) {
            addLoaderPlugins(uploadTexture(this._renderer, (_d = options.preserveImageBitmap) !== null && _d !== void 0 ? _d : true));
        }
    }
    load(manifestIds, options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.backgroundLoader.active = false;
            const manifests = this.getManifestFromIds(manifestIds);
            const version = this._version;
            this._verbose && console.log(`[ResourceManager] load : version : ${version} : manifestIds : `, manifestIds);
            const assetUrls = this._collectAssetsFromManifests(manifests);
            this.onLoadStart.emit();
            this.onLoadProgress.emit(0);
            yield loadAssets(assetUrls, (p) => {
                this.onLoadProgress.emit(p * 100);
            });
            this._verbose && console.log('[ResourceManager] loader loaded : resources : ', cache);
            for (let i = 0; i < manifests.length; i++) {
                const manifest = manifests[i];
                if (!manifest.loaded) {
                    addTextureShortcuts(manifest, version, this._basePath, this._imageFormatPreference);
                    addModelShortcuts(manifest);
                    addJsonShortcuts(manifest);
                }
                manifest.loaded = true;
                if (!manifest.formated) {
                    formatTextures(manifest.image, this._canOptimise);
                    manifest.formated = true;
                }
                if ((_a = options.uploadTexturesOnLoad) !== null && _a !== void 0 ? _a : this._uploadTexturesOnLoad) {
                    if (!manifest.uploaded) {
                        yield uploadTextures(manifest.image, this._version, this._basePath, this._renderer, this._imageFormatPreference);
                        manifest.uploaded = true;
                    }
                }
            }
            this.backgroundLoader.active = true;
            this.onLoadComplete.emit();
        });
    }
    backgroundLoad(manifestIds) {
        const manifests = this.getManifestFromIds(manifestIds);
        const assetUrls = this._collectAssetsFromManifests(manifests);
        this.backgroundLoader.add(assetUrls);
    }
    _collectAssetsFromManifests(manifests) {
        const cacheBust = new Date().getTime();
        const assetUrls = [];
        for (let i = 0; i < manifests.length; i++) {
            const manifest = manifests[i];
            if (!manifest.loaded) {
                for (const k in manifest) {
                    const assetGroup = manifest[k];
                    if (k !== 'audio') {
                        for (const j in assetGroup) {
                            const asset = assetGroup;
                            let skip = false;
                            if (k === 'misc') {
                                const extension = asset[j].default.split('.').pop();
                                if (this._filesToSkip.indexOf(extension) !== -1) {
                                    skip = true;
                                }
                            }
                            if (k === 'fonts') {
                                let pathToLoad = this._basePath + asset[j].woff2;
                                if (this._canCacheBust) {
                                    pathToLoad += `?cache=${cacheBust}`;
                                }
                                assetUrls.push(pathToLoad);
                                skip = true;
                            }
                            if (!skip) {
                                let pathToLoad = this._basePath + getIdFromImageAsset(asset, j, this._version || 'default', this._imageFormatPreference);
                                if (this._canCacheBust) {
                                    pathToLoad += `?cache=${cacheBust}`;
                                }
                                assetUrls.push(pathToLoad);
                            }
                        }
                    }
                }
            }
        }
        return assetUrls;
    }
    unload(manifestIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const manifests = this.getManifestFromIds(manifestIds);
            for (let i = 0; i < manifests.length; i++) {
                const manifest = manifests[i];
                if (manifest.uploaded) {
                    yield unloadTextures(manifest.image, this._version, this._basePath, this._renderer, this._imageFormatPreference);
                    manifest.uploaded = false;
                }
            }
        });
    }
    areManifestsLoaded(manifestIds) {
        return this.getManifestFromIds(manifestIds).every((manifest) => manifest.loaded);
    }
    hasManifestFor(id) {
        return !!this._manifest[id];
    }
    getManifestFromIds(manifestIds) {
        if (!(manifestIds instanceof Array)) {
            manifestIds = [manifestIds];
        }
        manifestIds = Array.from(new Set(manifestIds));
        const manifests = manifestIds.map((v) => {
            if (typeof v === 'string') {
                if (!this._manifest[v]) {
                    throw new Error(`${v} does not exist in manifest`);
                }
                return this._manifest[v];
            }
            return v;
        });
        return manifests;
    }
    loadTexture(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const assets = yield loadAssets([id]);
            return assets[id];
        });
    }
    loadAsset(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const pathToLoad = this._basePath + url;
            const assets = yield loadAssets([pathToLoad]);
            return assets[url];
        });
    }
    getJson(id) {
        return cache[this._basePath + id];
    }
    getAsset(id) {
        return cache[this._basePath + id];
    }
}
const ResourceManager = new ResourceManagerClass();
export { ResourceManager };
//# sourceMappingURL=ResourceManager.js.map