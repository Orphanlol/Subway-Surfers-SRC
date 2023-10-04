"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMeshes = void 0;
const getBounds_1 = require("../../gb-compress/utils/getBounds");
const getBuffer_1 = require("../utils/getBuffer");
const GLTFtoGBAttributes = {
    POSITION: 'positions',
    NORMAL: 'normals',
    TEXCOORD_0: 'uvs',
    TEXCOORD: 'uvs',
    JOINTS_0: 'boneIndices',
    JOINTS: 'boneIndices',
    WEIGHTS_0: 'weights',
    WEIGHTS: 'weights',
    TANGENT: 'tangents',
};
function processPrimitive(gltfRaw, primitiveRaw) {
    const primitive = {
        bounds: [0, 0, 0, 0, 0, 0],
        attributes: {},
    };
    primitive.material = primitiveRaw.material || 0;
    if (primitiveRaw.indices !== undefined) {
        primitive.indices = getBuffer_1.getBuffer(gltfRaw, primitiveRaw.indices, true);
    }
    for (const i in primitiveRaw.attributes) {
        if (!GLTFtoGBAttributes[i]) {
            console.warn(`[gb-model-tools] attribute ${i} skipped`);
        }
        else {
            primitive.attributes[GLTFtoGBAttributes[i]] = getBuffer_1.getBuffer(gltfRaw, primitiveRaw.attributes[i]);
        }
    }
    if (primitive.attributes.positions) {
        const bounds = getBounds_1.getBounds(primitive.attributes.positions, 3);
        const ranges = bounds.ranges;
        primitive.bounds[0] = ranges[0].min;
        primitive.bounds[1] = ranges[1].min;
        primitive.bounds[2] = ranges[2].min;
        primitive.bounds[3] = ranges[0].max;
        primitive.bounds[4] = ranges[1].max;
        primitive.bounds[5] = ranges[2].max;
    }
    if (primitiveRaw.targets) {
        primitive.targets = primitiveRaw.targets.map((target) => {
            const out = {};
            for (const i in target) {
                out[GLTFtoGBAttributes[i]] = getBuffer_1.getBuffer(gltfRaw, target[i]);
            }
            return out;
        });
    }
    return primitive;
}
function processMeshes(gltfRaw, gbObject) {
    gbObject.geometry = gltfRaw.meshes.map((meshRaw) => {
        const gbMesh = {
            name: meshRaw.name,
            primitives: meshRaw.primitives.map((primitiveRaw) => processPrimitive(gltfRaw, primitiveRaw)),
        };
        if (meshRaw.weights) {
            gbMesh.weights = meshRaw.weights;
        }
        return gbMesh;
    });
}
exports.processMeshes = processMeshes;
