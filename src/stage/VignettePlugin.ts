var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BLEND_MODES, Sprite } from 'pixi.js';
import { Plugin } from '../core';
import { ResizePlugin } from './resize';
import { StagePlugin } from './StagePlugin';
export class VignettePlugin extends Plugin {
    start() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this._overlay = Sprite.from((_a = this.options.texture) !== null && _a !== void 0 ? _a : 'vignette.png');
            this._overlay.blendMode = (_b = this.options.blendMode) !== null && _b !== void 0 ? _b : BLEND_MODES.NORMAL;
            this._overlay.alpha = (_c = this.options.alpha) !== null && _c !== void 0 ? _c : 1;
            this.app.get(StagePlugin).overlayContainer.addChild(this._overlay);
            const resizer = this.app.get(ResizePlugin);
            if (resizer) {
                resizer.onResize.connect((w, h) => { this.resize(w, h); });
                this.resize(resizer.w, resizer.h);
            }
        });
    }
    resize(w, h) {
        this._overlay.width = w;
        this._overlay.height = h;
    }
}
VignettePlugin.pluginName = 'vignette';
//# sourceMappingURL=VignettePlugin.js.map