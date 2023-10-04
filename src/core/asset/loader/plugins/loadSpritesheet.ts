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
import { BaseTexture, Spritesheet, Texture } from 'pixi.js';
import { loadAssets } from '../Loader';
const loadSpritesheet = {
    testParse(asset, url) {
        return (extname(url).includes('.json') && !!asset.frames);
    },
    parse(asset, url) {
        return __awaiter(this, void 0, void 0, function* () {
            let basePath = dirname(url);
            if (basePath && basePath.lastIndexOf('/') !== (basePath.length - 1)) {
                basePath += '/';
            }
            const imagePath = basePath + asset.meta.image;
            const assets = yield loadAssets([imagePath]);
            const texture = assets[imagePath];
            const cacheId = url.split('.')[0];
            BaseTexture.addToCache(texture.baseTexture, cacheId);
            Texture.addToCache(texture, cacheId);
            const spritesheet = new Spritesheet(texture.baseTexture, asset, url);
            yield new Promise((r) => {
                spritesheet.parse(r);
            });
            return spritesheet;
        });
    },
};
export { loadSpritesheet };
//# sourceMappingURL=loadSpritesheet.js.map