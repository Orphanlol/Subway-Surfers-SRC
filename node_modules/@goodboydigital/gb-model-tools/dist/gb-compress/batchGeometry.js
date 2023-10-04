"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchGeometry = void 0;
const mergePrimitives_1 = require("../utils/mergePrimitives");
const map = {
    positions: 3,
    normals: 3,
    weights: 4,
    boneIndices: 4,
    uvs: 2,
    tangents: 4,
};
/**
 * This will look through a gbObject and removed any duplicate models.
 * Saving out a model from maya with say 100 trees will save out 100 models even if the model is the same.
 * This function will would keep the first model and remove the 99 duplicates
 *
 * @param gbObject the gbObject to remove duplicates from
 */
function batchGeometry(gbObject) {
    // -- //
    const geometry = gbObject.geometry;
    // const map = new Map();
    const sigMap = new Map();
    // first pass through and sort all primitives into matching formats
    geometry.forEach((g) => {
        g.primitives.forEach((primitive) => {
            const sig = getSig(primitive);
            const matchingPrimitives = sigMap.get(sig) || [];
            matchingPrimitives.push(primitive);
            sigMap.set(sig, matchingPrimitives);
        });
    });
    // no sort them into correct size (max indices..)
    let groupsToMerge = [];
    sigMap.forEach((primitives, key) => {
        const groups = splitGroupsToCorrectSize(primitives, key)
            // filter out groups that are only have one primitive
            .filter((g) => g.primitives.length > 1);
        groupsToMerge = groupsToMerge.concat(groups);
    });
    // no we have a bunch of primitives that we know will merge as they are the same type and not be too big!
    const geometryBatch = [];
    groupsToMerge.forEach((g) => {
        const data = mergeGBPrimitives(g);
        geometryBatch.push(data.primitive);
        geometry.forEach((g) => {
            g.primitives.forEach((primitive, i) => {
                const index = data.primitives.indexOf(primitive);
                if (index !== -1) {
                    data.frags[index].geometry = geometryBatch.length - 1;
                    g.primitives[i] = data.frags[index];
                }
            });
        });
        //  console.log(data.frags);
    });
    gbObject.geometryBatch = geometryBatch;
}
exports.batchGeometry = batchGeometry;
const maxSize = 0xFFFF;
// eslint-disable-next-line max-len
function mergeGBPrimitives(group) {
    let indexOffset = 0;
    const frags = group.primitives.map((primitive) => {
        const frag = {
            bounds: primitive.bounds,
            start: indexOffset,
            size: primitive.indices.length,
            material: primitive.material,
            geometry: -1,
        };
        indexOffset += primitive.indices.length;
        return frag;
    });
    // {primitive: GBPrimitive; frags: GBPrimitiveFragment[]; primitives: GBPrimitive[]}
    return {
        primitive: mergePrimitives_1.mergePrimitives(group.primitives),
        primitives: group.primitives,
        frags,
    };
}
function splitGroupsToCorrectSize(primitives, sigMap) {
    const groups = [];
    let currentGroup = { indexSize: 0, size: 0, primitives: [], sigMap };
    groups.push(currentGroup);
    primitives.forEach((primitive) => {
        if (!primitive.indices) {
            throw new Error('can only merge geometry with indices for now..');
        }
        const maximumVert = primitive.attributes.positions.length / 3;
        if ((currentGroup.indexSize + maximumVert) > maxSize) {
            // SPLIT!
            currentGroup = { indexSize: 0, size: 0, primitives: [], sigMap };
            // TODO only push if its bigger than one!
            groups.push(currentGroup);
        }
        currentGroup.indexSize += maximumVert;
        currentGroup.size += primitive.indices.length;
        currentGroup.primitives.push(primitive);
    });
    return groups;
}
const UUID = 0;
function getSig(primitive) {
    const sigStrings = [];
    for (const i in map) {
        if (primitive.attributes[i]) {
            sigStrings.push(i);
        }
    }
    return sigStrings.join('|');
}
