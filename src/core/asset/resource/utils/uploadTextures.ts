import { SCALE_MODES, Ticker, TYPES, utils, WRAP_MODES } from 'pixi.js';
import { getIdFromImageAsset } from './getIdFromImageAsset';
export function uploadTextures(manifestAssets, version, basePath, renderer, formats, perFrame = 20) {
    return new Promise((resolve) => {
        const images = [];
        for (const i in manifestAssets) {
            const asset = manifestAssets[i];
            let id = getIdFromImageAsset(manifestAssets, i, version, formats);
            if (asset.tags && asset.tags.tps) {
                id = id.split('.').slice(0, -1).join('.');
            }
            const baseTexture = utils.BaseTextureCache[basePath + id];
            if (baseTexture) {
                if (asset.tags) {
                    if (asset.tags['4444']) {
                        baseTexture.type = TYPES.UNSIGNED_SHORT_4_4_4_4;
                    }
                    if (asset.tags.nearest) {
                        baseTexture.scaleMode = SCALE_MODES.NEAREST;
                    }
                }
                if (baseTexture.isPowerOfTwo) {
                    baseTexture.wrapMode = WRAP_MODES.REPEAT;
                }
                images.push(baseTexture);
            }
            else {
                console.warn(`Image not found: ${id}`);
            }
        }
        let count = 0;
        const updateFunction = () => {
            for (let i = 0; i < perFrame; i++) {
                if (count === images.length) {
                    Ticker.system.remove(updateFunction, this);
                    resolve();
                    break;
                }
                else {
                    renderer.texture.bind(images[count]);
                }
                count++;
            }
        };
        Ticker.system.add(updateFunction, this);
    });
}
//# sourceMappingURL=uploadTextures.js.map