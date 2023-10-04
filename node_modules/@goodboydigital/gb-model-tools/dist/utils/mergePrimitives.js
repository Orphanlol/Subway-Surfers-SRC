"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeBounds = exports.mergePrimitives = void 0;
const map = {
    positions: 3,
    normals: 3,
    weights: 4,
    boneIndices: 4,
    uvs: 2,
    tangents: 4,
};
// TODO merge array types??
// assume can be merged!
function mergePrimitives(primitives) {
    // get sizes...
    let indicesSize = 0;
    let attributeSize = 0;
    const bounds = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    primitives.forEach((primitive) => {
        indicesSize += primitive.indices.length;
        attributeSize += primitive.attributes.positions.length / map.positions;
        // calculate bounds..
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        mergeBounds(bounds, primitive.bounds);
    });
    if (attributeSize > 65535) {
        throw new Error('[merge Primitives] cannot merge geometries, they exceed maximum index size of 65535');
    }
    const indices = new Uint16Array(indicesSize);
    const attributes = {};
    for (const i in primitives[0].attributes) {
        attributes[i] = new Float32Array(attributeSize * map[i]);
    }
    let index = 0;
    let indexOffset = 0;
    let attributeOffset = 0;
    primitives.forEach((primitive) => {
        for (const j in primitive.attributes) {
            const attribute = primitive.attributes[j];
            const mergedAttribute = attributes[j];
            const size = map[j];
            for (let i = 0; i < attribute.length; i++) {
                mergedAttribute[i + (attributeOffset * size)] = attribute[i];
            }
        }
        attributeOffset += primitive.attributes.positions.length / map.positions;
        for (let i = 0; i < primitive.indices.length; i++) {
            indices[index++] = primitive.indices[i] + indexOffset;
        }
        indexOffset += primitive.attributes.positions.length / 3;
    });
    const mergedPrimitive = {
        indices,
        attributes: attributes,
        bounds,
    };
    return mergedPrimitive;
    // primatives.forEach();
}
exports.mergePrimitives = mergePrimitives;
function mergeBounds(out, bounds) {
    for (let i = 0; i < 3; i++) {
        out[i] = Math.min(out[i], bounds[i]);
    }
    for (let i = 2; i < 6; i++) {
        out[i] = Math.max(out[i], bounds[i]);
    }
    return out;
}
exports.mergeBounds = mergeBounds;
