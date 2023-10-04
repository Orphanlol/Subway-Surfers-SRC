"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeGBObjects = void 0;
// TODO merge array types??
// assume can be merged!
function mergeGBObjects(gbObjects) {
    const mergedGBObject = {};
    let geometryOffset = 0;
    let nodeOffset = 0;
    gbObjects.forEach((gbObject) => {
        var _a, _b;
        if (gbObject.geometry) {
            if (!mergedGBObject.geometry) {
                mergedGBObject.geometry = gbObject.geometry.slice();
            }
            else {
                gbObject.geometry.forEach((geometry) => {
                    mergedGBObject.geometry.push(geometry);
                });
            }
        }
        if (gbObject.nodes) {
            if (!mergedGBObject.nodes) {
                mergedGBObject.nodes = [];
            }
            gbObject.nodes.forEach((node) => {
                const newNode = Object.assign({
                    name: node.name,
                }, node);
                if (newNode.geometry !== undefined) {
                    newNode.geometry += geometryOffset;
                }
                newNode.children = node.children.map((child) => child + nodeOffset);
                mergedGBObject.nodes.push(newNode);
            });
        }
        if (gbObject.scenes) {
            if (!mergedGBObject.scenes) {
                mergedGBObject.scenes = [];
            }
            gbObject.scenes.forEach((scene) => {
                const newScene = Object.assign({}, scene);
                newScene.children = scene.children.map((child) => child + nodeOffset);
                mergedGBObject.scenes.push(newScene);
            });
        }
        geometryOffset += ((_a = gbObject.geometry) === null || _a === void 0 ? void 0 : _a.length) || 0;
        nodeOffset += ((_b = gbObject.nodes) === null || _b === void 0 ? void 0 : _b.length) || 0;
    });
    return mergedGBObject;
}
exports.mergeGBObjects = mergeGBObjects;
