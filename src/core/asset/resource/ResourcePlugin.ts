var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Plugin } from '../../../core';
import { StagePlugin } from '../../../stage';
import { cache } from '../loader/Loader';
import { ResourceManager } from './ResourceManager';
export class ResourcePlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.loadingIds = [];
    }
    init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const stage = this.app.get(StagePlugin);
            const options = {
                renderer: stage.renderer,
                basePath: (_a = this.options.basePath) !== null && _a !== void 0 ? _a : '',
                manifest: this.options.manifest,
                version: this.options.version || 'high',
                canOptimise: this.options.canOptimise,
                verbose: this.options.verbose,
                canCacheBust: this.options.canCacheBust,
                uploadTexturesOnLoad: this.options.uploadTexturesOnLoad,
                disableGarbageCollection: this.options.disableGarbageCollection,
                preserveImageBitmap: this.options.preserveImageBitmap,
                manifestBasePath: this.options.manifestBasePath,
                imageFormatPreference: this.options.imageFormatPreference,
            };
            ResourceManager.init(options);
        });
    }
    load(...ids) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadingIds = ids.slice(0);
            yield ResourceManager.load(ids);
            this.loadingIds = [];
        });
    }
    backgroundLoad(...ids) {
        return __awaiter(this, void 0, void 0, function* () {
            ResourceManager.backgroundLoad(ids);
        });
    }
    get cache() {
        return cache || {};
    }
    get loading() {
        return this.loadingIds.length > 0;
    }
    get manager() {
        return ResourceManager;
    }
}
//# sourceMappingURL=ResourcePlugin.js.map