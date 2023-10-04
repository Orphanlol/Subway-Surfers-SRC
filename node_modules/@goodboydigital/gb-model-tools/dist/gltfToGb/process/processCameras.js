"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCameras = void 0;
function processCameras(gltfRaw, gbObject) {
    if (!gltfRaw.cameras) {
        gbObject.cameras = [];
        return;
    }
    gbObject.cameras = gltfRaw.cameras.map((rawCamera) => {
        if (rawCamera.type === 'perspective') {
            const perspectiveData = rawCamera.perspective;
            return {
                fov: perspectiveData.yfov,
                near: perspectiveData.znear,
                far: perspectiveData.zfar,
                aspectRatio: perspectiveData.aspectRatio,
                mode: 0,
            };
        }
        throw new Error('only perspective camera supported right now!');
    });
}
exports.processCameras = processCameras;
