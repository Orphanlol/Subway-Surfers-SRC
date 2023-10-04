var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { extname } from 'path';
import { BaseTexture, Texture, utils } from 'pixi.js';
import { makeAbsoluteUrl } from '../../../../utils';
import { CentralDispatch } from '../../../central-dispatch/CentralDispatch';
const validImages = ['.jpg', '.png', '.jpeg', '.avif', '.webp'];
const loadTextures = {
    test(url) {
        const tempURL = url.split('?')[0];
        return (validImages.includes(extname(tempURL)));
    },
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let src = null;
            if (window.createImageBitmap) {
                const absolutePath = makeAbsoluteUrl(url);
                src = yield CentralDispatch.loadImageBitmap(absolutePath);
            }
            else {
                src = yield new Promise((resolve) => {
                    src = new Image();
                    src.crossOrigin = 'anonymous';
                    src.src = url;
                    if (src.complete) {
                        resolve(src);
                    }
                    else {
                        src.onload = () => {
                            resolve(src);
                        };
                    }
                });
            }
            const base = new BaseTexture(src, {
                resolution: utils.getResolutionOfUrl(url),
            });
            const texture = new Texture(base);
            BaseTexture.addToCache(base, url);
            Texture.addToCache(texture, url);
            return texture;
        });
    },
};
export { loadTextures };
//# sourceMappingURL=loadTexture.js.map