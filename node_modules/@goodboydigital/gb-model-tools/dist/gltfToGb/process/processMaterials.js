"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMaterials = exports.processMaterial = exports.rgb2hex = void 0;
const materialProperties = {
    name: 'name',
    doubleSided: 'doubleSided',
    emissiveFactor: 'emissiveFactor',
};
const materialTextures = {
    normalTexture: 'normalTexture',
    emissiveTexture: 'emissiveTexture',
    occlusionTexture: 'occlusionTexture',
};
const blendModeMap = {
    BLEND: 0,
};
function rgb2hex(rgb) {
    if (!rgb)
        return undefined;
    return (((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + (rgb[2] * 255 | 0));
}
exports.rgb2hex = rgb2hex;
const defaultPBR = {
    baseColorFactor: [1, 1, 1, 1],
    metallicFactor: 1,
    roughnessFactor: 1,
};
function processMaterial(rawMaterial) {
    var _a, _b, _c, _d, _e, _f, _g;
    const pbrData = Object.assign(Object.assign({}, defaultPBR), rawMaterial.pbrMetallicRoughness);
    const material = {
        name: rawMaterial.name,
        state: {
            culling: (_a = !rawMaterial.doubleSided) !== null && _a !== void 0 ? _a : true,
            blendMode: (_b = blendModeMap[rawMaterial.alphaMode]) !== null && _b !== void 0 ? _b : 20,
        },
        standard: {
            alpha: pbrData.baseColorFactor[3],
            color: rgb2hex(pbrData.baseColorFactor),
            diffuseMap: (_c = pbrData.baseColorTexture) === null || _c === void 0 ? void 0 : _c.index,
            normalMap: (_d = rawMaterial.normalTexture) === null || _d === void 0 ? void 0 : _d.index,
            emissiveColor: rgb2hex(rawMaterial.emissiveFactor),
            emissiveMap: (_e = rawMaterial.emissiveTexture) === null || _e === void 0 ? void 0 : _e.index,
            occlusionMap: (_f = rawMaterial.occlusionTexture) === null || _f === void 0 ? void 0 : _f.index,
        },
        pbr: {
            metallic: pbrData.metallicFactor,
            roughness: pbrData.roughnessFactor,
            metallicRoughnessMap: (_g = pbrData.metallicRoughnessTexture) === null || _g === void 0 ? void 0 : _g.index,
        },
    };
    return material;
}
exports.processMaterial = processMaterial;
// TODO when I get time.. do more material details!
function processMaterials(gltfRaw, gbObject) {
    var _a, _b;
    gbObject.textures = (_a = gltfRaw.textures) === null || _a === void 0 ? void 0 : _a.map((rawTexture, index) => {
        const uri = gltfRaw.images[rawTexture.source].uri;
        return {
            uri,
        };
    });
    gbObject.materials = (_b = gltfRaw.materials) === null || _b === void 0 ? void 0 : _b.map((rawMaterial) => processMaterial(rawMaterial));
}
exports.processMaterials = processMaterials;
