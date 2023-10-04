var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { loadAssets } from '../loader/Loader';
export class BackgroundLoader {
    constructor(verbose = false) {
        this._assetList = [];
        this._isLoading = false;
        this._maxConcurrent = 4;
        this.verbose = verbose;
    }
    add(assetUrls) {
        assetUrls.forEach((a) => {
            this._assetList.push(a);
        });
        this.verbose && console.log('[BackgroundLoader] assets: ', this._assetList);
        if (this._isActive && !this._isLoading) {
            this._next();
        }
    }
    _next() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._assetList.length && this._isActive) {
                this._isLoading = true;
                const toLoad = [];
                const toLoadAmount = Math.min(this._assetList.length, this._maxConcurrent);
                for (let i = 0; i < toLoadAmount; i++) {
                    toLoad.push(this._assetList.pop());
                }
                yield loadAssets(toLoad);
                this._isLoading = false;
                this._next();
            }
        });
    }
    get active() {
        return this._isActive;
    }
    set active(value) {
        if (this._isActive === value)
            return;
        this._isActive = value;
        if (value && !this._isLoading) {
            this._next();
        }
    }
}
//# sourceMappingURL=BackgroundLoader.js.map