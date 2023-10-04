import { Texture } from 'pixi.js';
import { getIdFromImageAsset } from './getIdFromImageAsset';
export function addTextureShortcuts(manifest, version = 'default', basePath = '', formats) {
    for (const i in manifest.image) {
        const asset = manifest.image[i];
        const path = getIdFromImageAsset(manifest.image, i, version, formats) || asset.standard.default;
        if (!path)
            continue;
        const validPath = path.substr(path.lastIndexOf('.') + 1) !== 'json';
        if (!validPath)
            continue;
        const texture = Texture.from(basePath + path);
        if (texture.constructor === Texture) {
            Texture.addToCache(texture, asset.standard.default);
            if (asset.shortcut) {
                Texture.addToCache(texture, asset.shortcut);
            }
        }
    }
}
//# sourceMappingURL=addTextureShortcuts.js.map