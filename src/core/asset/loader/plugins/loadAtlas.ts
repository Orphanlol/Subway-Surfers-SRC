var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { dirname, extname } from 'path';
import { loadAssets } from '../Loader';
export const loadAtlas = {
    test(url) {
        const extension = extname(url);
        return extension.includes('.atlas') && extension.indexOf('~') < 0;
    },
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const spine = window.PIXI_SPINE || PIXI.spine;
            const response = yield fetch(url);
            const rawAtlas = yield response.text();
            return new Promise((resolve) => {
                const textureAtlas = new spine.core.TextureAtlas(rawAtlas, textureLoader(dirname(url)), () => {
                    resolve(textureAtlas);
                });
            });
        });
    },
};
function textureLoader(baseUrl) {
    if (baseUrl && baseUrl.lastIndexOf('/') !== (baseUrl.length - 1)) {
        baseUrl += '/';
    }
    return (line, callback) => {
        const url = baseUrl + line;
        loadAssets(url).then((asset) => {
            callback(asset.baseTexture);
        });
    };
}
//# sourceMappingURL=loadAtlas.js.map