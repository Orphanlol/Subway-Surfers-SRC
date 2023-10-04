import { Ticker, utils } from 'pixi.js';
import { getIdFromImageAsset } from './getIdFromImageAsset';
export function unloadTextures(manifestAsset, version, basePath, renderer, formats, perFrame = 20) {
    return new Promise((resolve) => {
        const images = [];
        for (const i in manifestAsset) {
            const texture = manifestAsset[i];
            let id = getIdFromImageAsset(manifestAsset, i, version, formats);
            if (texture.tags && texture.tags.tps) {
                id = `${id}_image`;
            }
            const baseTexture = utils.BaseTextureCache[basePath + id];
            if (baseTexture) {
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
                    renderer.texture.destroyTexture(images[count], true);
                }
                count++;
            }
        };
        Ticker.system.add(updateFunction, this);
    });
}
//# sourceMappingURL=unloadTextures.js.map