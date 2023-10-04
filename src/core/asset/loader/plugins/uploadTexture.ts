var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Texture, WRAP_MODES } from 'pixi.js';
import { PromiseQueue, waitAFrame } from '../../../../utils';
const promiseQueue = new PromiseQueue(1);
export function uploadTexture(renderer, preserveImageBitmap = false) {
    return {
        testParse(asset) {
            return asset instanceof Texture;
        },
        parse(asset) {
            return new Promise((resolve) => {
                if (asset.baseTexture.isPowerOfTwo) {
                    asset.baseTexture.wrapMode = WRAP_MODES.REPEAT;
                }
                promiseQueue.promise(() => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    yield waitAFrame(1);
                    renderer.texture.bind(asset);
                    if (!preserveImageBitmap && ((_b = (_a = asset.baseTexture.resource) === null || _a === void 0 ? void 0 : _a.source) === null || _b === void 0 ? void 0 : _b.close)) {
                        asset.baseTexture.resource.source.close();
                    }
                    resolve(asset);
                }), this);
            });
        },
    };
}
//# sourceMappingURL=uploadTexture.js.map