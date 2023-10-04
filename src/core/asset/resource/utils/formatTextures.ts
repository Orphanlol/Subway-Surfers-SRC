import { SCALE_MODES, TYPES, utils, WRAP_MODES } from 'pixi.js';
export function formatTextures(manifestAsset, optimise = false) {
    for (const i in manifestAsset) {
        const texture = manifestAsset[i];
        let id = i;
        if (texture.tags && texture.tags.tps) {
            id = `${id}_image`;
        }
        const baseTexture = utils.BaseTextureCache[id];
        if (baseTexture) {
            if (texture.tags) {
                if (texture.tags.REPEAT) {
                    baseTexture.wrapMode = WRAP_MODES.REPEAT;
                }
                if (texture.tags.NEAREST) {
                    baseTexture.scaleMode = SCALE_MODES.NEAREST;
                }
            }
            if (optimise) {
                if (!texture.tags || (texture.tags && !texture.tags.high)) {
                    baseTexture.type = TYPES.UNSIGNED_SHORT_4_4_4_4;
                }
            }
        }
    }
}
//# sourceMappingURL=formatTextures.js.map