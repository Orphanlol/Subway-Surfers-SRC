"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gltfToGbParser = void 0;
const processAnimations_1 = require("./process/processAnimations");
const processCameras_1 = require("./process/processCameras");
const processLights_1 = require("./process/processLights");
const processMaterials_1 = require("./process/processMaterials");
const processMeshes_1 = require("./process/processMeshes");
const processNodes_1 = require("./process/processNodes");
const processScenes_1 = require("./process/processScenes");
const processSkins_1 = require("./process/processSkins");
function gltfToGbParser(gltfRaw, buffers) {
    const gbObject = {};
    gltfRaw.realBuffers = buffers;
    processMeshes_1.processMeshes(gltfRaw, gbObject);
    processNodes_1.processNodes(gltfRaw, gbObject);
    processScenes_1.processScenes(gltfRaw, gbObject);
    processAnimations_1.processAnimations(gltfRaw, gbObject);
    processSkins_1.processSkins(gltfRaw, gbObject);
    processLights_1.processLights(gltfRaw, gbObject);
    processCameras_1.processCameras(gltfRaw, gbObject);
    processMaterials_1.processMaterials(gltfRaw, gbObject);
    return gbObject;
}
exports.gltfToGbParser = gltfToGbParser;
