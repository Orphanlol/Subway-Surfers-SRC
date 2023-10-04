"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNodes = void 0;
function createMatrix(nodeRaw) {
    if (nodeRaw.matrix && nodeRaw.matrix.length === 16) {
        return new Float32Array(nodeRaw.matrix);
    }
    const scale = nodeRaw.scale || [1, 1, 1];
    const translation = nodeRaw.translation || [0, 0, 0];
    const quat = nodeRaw.rotation || [0, 0, 0, 1];
    const x = quat[0];
    const y = quat[1];
    const z = quat[2];
    const w = quat[3];
    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;
    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;
    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;
    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;
    const out = new Float32Array(16);
    const sx = scale[0];
    const sy = scale[1];
    const sz = scale[2];
    out[0] = (1 - (yy + zz)) * sx;
    out[1] = (xy + wz) * sx;
    out[2] = (xz - wy) * sx;
    out[4] = (xy - wz) * sy;
    out[5] = (1 - (xx + zz)) * sy;
    out[6] = (yz + wx) * sy;
    out[8] = (xz + wy) * sz;
    out[9] = (yz - wx) * sz;
    out[10] = (1 - (xx + yy)) * sz;
    out[12] = translation[0];
    out[13] = translation[1];
    out[14] = translation[2];
    return out;
}
function processNodes(gltfRaw, gbObject) {
    gbObject.nodes = gltfRaw.nodes.map((nodeRaw) => {
        const children = nodeRaw.children || [];
        const transform = createMatrix(nodeRaw);
        const node = {
            name: nodeRaw.name || 'node',
            children,
            transform,
        };
        if (nodeRaw.camera !== undefined) {
            node.type = 'camera';
            node.camera = nodeRaw.camera;
        }
        if (nodeRaw.mesh !== undefined) {
            node.type = 'model';
            node.geometry = nodeRaw.mesh;
        }
        if (nodeRaw.extensions) {
            if (nodeRaw.extensions.KHR_lights_punctual) {
                node.type = 'light';
                node.light = nodeRaw.extensions.KHR_lights_punctual.light;
            }
        }
        if (nodeRaw.skin !== undefined) {
            node.skin = nodeRaw.skin;
        }
        return node;
    });
}
exports.processNodes = processNodes;
