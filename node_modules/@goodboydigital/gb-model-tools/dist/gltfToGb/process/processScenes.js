"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processScenes = void 0;
function processScenes(gltfRaw, gbObject) {
    gbObject.scenes = gltfRaw.scenes.map((sceneRaw) => ({
        children: sceneRaw.nodes,
        name: sceneRaw.name,
    }));
}
exports.processScenes = processScenes;
