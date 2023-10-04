"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSkins = void 0;
const getBuffer_1 = require("../utils/getBuffer");
function processSkins(gltfRaw, gbObject) {
    if (!gltfRaw.skins) {
        gbObject.skins = [];
        return;
    }
    gbObject.skins = gltfRaw.skins.map((skinRaw) => {
        const inverseBindMatrices = getBuffer_1.getBuffer(gltfRaw, skinRaw.inverseBindMatrices);
        const joints = skinRaw.joints.map((joint, i) => {
            const node = gbObject.nodes[joint];
            node.type = 'bone';
            node.inverseBindMatrix = new Float32Array(16);
            for (let j = 0; j < 16; j++) {
                node.inverseBindMatrix[j] = inverseBindMatrices[(i * 16) + j];
            }
            return joint;
        });
        return {
            joints,
            bindMatrix: skinRaw.bindMatrix || new Float32Array(16),
        };
    });
}
exports.processSkins = processSkins;
