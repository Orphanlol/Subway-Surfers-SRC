"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenScene = void 0;
const mat4_1 = require("../utils/mat4");
const mergePrimitives_1 = require("../utils/mergePrimitives");
const transformPositions_1 = require("../utils/transformPositions");
/**
 * takes a gbObject and loops through the scene flattening everything into a single object.
 * this process will strip out any animation.
 * @param gbObject
 */
function flattenScene(gbObject) {
    const rootTransform = mat4_1.createMat4();
    const flattenDatas = [];
    processNode(gbObject.scenes[0], rootTransform, gbObject, 'scene', flattenDatas);
    // transform...
    const primitivesToMerge = flattenDatas.map((flattenData) => {
        const primitive = flattenData.primitive;
        const newPrimitive = Object.assign({}, primitive);
        const positions = primitive.attributes.positions.slice();
        transformPositions_1.transformPositions(positions, flattenData.transform);
        newPrimitive.attributes.positions = positions;
        return newPrimitive;
    });
    const mergedGBPrimitive = mergePrimitives_1.mergePrimitives(primitivesToMerge);
    // TODO geometry name??
    gbObject.geometry = [
        {
            name: 'merged',
            primitives: [
                mergedGBPrimitive,
            ],
        },
    ];
    gbObject.nodes = [
        {
            name: 'root',
            children: [],
            transform: mat4_1.createMat4(),
            type: 'model',
            geometry: 0,
        },
    ];
}
exports.flattenScene = flattenScene;
function processNode(node, parentTransform, gbObject, indent, flattenData) {
    var _a, _b;
    const localTransform = (_a = node.transform) !== null && _a !== void 0 ? _a : mat4_1.createMat4();
    //    if (node.transform)
    const worldTransform = mat4_1.multiplyMat4(mat4_1.createMat4(), localTransform, parentTransform);
    if (node.geometry !== undefined) {
        gbObject.geometry[node.geometry].primitives.forEach((primitive) => {
            flattenData.push({
                primitive,
                transform: worldTransform,
            });
        });
    }
    // console.log(indent, `children:${node.children.length}`, parentTransform[13], worldTransform[13]);
    for (let i = 0; i < node.children.length; i++) {
        processNode(gbObject.nodes[node.children[i]], worldTransform, gbObject, `${indent}:${(_b = node.name) !== null && _b !== void 0 ? _b : 'scene'}`, flattenData);
    }
}
