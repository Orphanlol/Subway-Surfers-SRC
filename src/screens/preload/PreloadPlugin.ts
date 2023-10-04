var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Plugin, ResourceManager } from '../../core';
import { LoaderScreen } from '../LoaderScreen';
import { ScreensPlugin } from '../ScreensPlugin';
export class PreloadPlugin extends Plugin {
    prepare() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const screens = this.app.get(ScreensPlugin);
            if (!screens) {
                throw new Error('[Preload Plugin] Error plugin depends on the ScreenPlugin');
            }
            const preloadId = this.options.preloadManifestId || 'preload';
            if (ResourceManager.hasManifestFor(preloadId)) {
                yield ResourceManager.load([preloadId]);
            }
            const LoaderScreenClass = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.loaderScreenClass) || LoaderScreen;
            screens.add(LoaderScreenClass, { app: this.app }, 'preload');
            yield screens.goto('preload');
            this._loaderScreen = screens.main.screens['preload'].instance;
            const connectionLoad = ResourceManager.onLoadProgress.connect(this._onLoadProgress.bind(this));
            const connectionStart = ResourceManager.onLoadStart.connect(this._onLoadStart.bind(this));
            const connectionComplete = ResourceManager.onLoadStart.connect(this._onLoadComplete.bind(this));
            yield ResourceManager.load(['default'].concat((_b = this.options.manifests) !== null && _b !== void 0 ? _b : []));
            connectionLoad.disconnect();
            connectionStart.disconnect();
            connectionComplete.disconnect();
        });
    }
    _onLoadStart() {
        var _a;
        if ((_a = this._loaderScreen) === null || _a === void 0 ? void 0 : _a.start)
            this._loaderScreen.start();
    }
    _onLoadComplete() {
        var _a;
        if ((_a = this._loaderScreen) === null || _a === void 0 ? void 0 : _a.complete)
            this._loaderScreen.complete();
    }
    _onLoadProgress(progress) {
        this._loaderScreen.updateProgress(progress / 100);
    }
}
//# sourceMappingURL=PreloadPlugin.js.map