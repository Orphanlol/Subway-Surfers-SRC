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
import { ResourceManager } from '../../';
import { getIdFromImageAsset } from '../../resource/utils/getIdFromImageAsset';
import { addLoaderPlugins, loadAssets } from '../Loader';
import { loadAtlas } from './loadAtlas';
addLoaderPlugins(loadAtlas);
export const loadSpine = {
    testParse(asset, url) {
        return (extname(url).includes('.json') && !!asset.bones);
    },
    parse(spineData, url) {
        return __awaiter(this, void 0, void 0, function* () {
            const spine = window.PIXI_SPINE || PIXI.spine;
            const atlasPath = getAtlasPath(url);
            const textureAtlas = yield loadAssets(atlasPath);
            if (textureAtlas) {
                const attachmentLoader = new spine.core.AtlasAttachmentLoader(textureAtlas);
                const spineParser = new spine.core.SkeletonJson(attachmentLoader);
                const skeletonData = spineParser.readSkeletonData(spineData);
                return skeletonData;
            }
            return null;
        });
    },
};
function getAtlasPath(jsonPath) {
    let atlasPath = jsonPath.replace('.json', '.atlas');
    const version = ResourceManager['_version'];
    const manifest = ResourceManager['_manifest'];
    const formats = ResourceManager['_imageFormatPreference'];
    const basePath = ResourceManager['_basePath'];
    if (basePath !== '') {
        atlasPath = atlasPath.split(basePath)[1];
        jsonPath = jsonPath.split(basePath)[1];
    }
    for (const groupName in manifest) {
        const group = manifest[groupName];
        if (group.json[jsonPath]) {
            const atlasVersion = getIdFromImageAsset(group.atlas, atlasPath, version, formats);
            if (group.atlas[atlasPath] && atlasVersion) {
                return basePath + atlasVersion;
            }
        }
    }
    return basePath + atlasPath;
}
//# sourceMappingURL=loadSpine.js.map