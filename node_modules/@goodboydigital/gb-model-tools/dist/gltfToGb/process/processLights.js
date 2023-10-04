"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLights = void 0;
const rgb2hex_1 = require("../utils/rgb2hex");
const lightMap = {
    directional: 0,
    point: 1,
    spot: 2,
};
function processLights(gltfRaw, gbObject) {
    if (gltfRaw.extensions
        && gltfRaw.extensions.KHR_lights_punctual
        && gltfRaw.extensions.KHR_lights_punctual.lights) {
        gbObject.lights = gltfRaw.extensions.KHR_lights_punctual.lights.map((rawLight) => ({
            name: rawLight.name,
            color: rgb2hex_1.rgb2hex(rawLight.color),
            intensity: rawLight.intensity,
            type: lightMap[rawLight.type],
        }));
    }
}
exports.processLights = processLights;
