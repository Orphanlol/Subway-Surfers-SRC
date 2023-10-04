"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformUvs = void 0;
// assume the frame is normalized..
function transformUvs(uvs, frame) {
    const { x, y, w, h } = frame;
    for (let i = 0; i < uvs.length; i += 2) {
        uvs[i] = (uvs[i] * w) + x;
        uvs[i + 1] = (uvs[i + 1] * h) + y;
    }
}
exports.transformUvs = transformUvs;
