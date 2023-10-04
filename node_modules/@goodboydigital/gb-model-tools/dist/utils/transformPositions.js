"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformPositions = void 0;
/* eslint-disable no-mixed-operators */
function transformPositions(position, matrix) {
    const m0 = matrix[0];
    const m1 = matrix[1];
    const m2 = matrix[2];
    const m3 = matrix[3];
    const m4 = matrix[4];
    const m5 = matrix[5];
    const m6 = matrix[6];
    const m7 = matrix[7];
    const m8 = matrix[8];
    const m9 = matrix[9];
    const m10 = matrix[10];
    const m11 = matrix[11];
    const m12 = matrix[12];
    const m13 = matrix[13];
    const m14 = matrix[14];
    const m15 = matrix[15];
    for (let i = 0; i < position.length; i += 3) {
        const x = position[i];
        const y = position[i + 1];
        const z = position[i + 2];
        let w = m3 * x + m7 * y + m11 * z + m15;
        w = w || 1.0;
        position[i] = (m0 * x + m4 * y + m8 * z + m12) / w;
        position[i + 1] = (m1 * x + m5 * y + m9 * z + m13) / w;
        position[i + 2] = (m2 * x + m6 * y + m10 * z + m14) / w;
    }
}
exports.transformPositions = transformPositions;
