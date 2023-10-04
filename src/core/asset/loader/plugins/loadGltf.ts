var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { gltfToGbParser } from '@goodboydigital/gb-model-tools';
import { Cache, gbToOdieParser } from '@goodboydigital/odie';
import { dirname, extname, join } from 'path';
function processBuffers(gltfRaw, baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const buffers = [];
        const promises = gltfRaw.buffers.map((buffer, i) => __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(join(baseUrl, buffer.uri));
            const arrayBuffer = yield response.arrayBuffer();
            if (arrayBuffer.byteLength !== buffer.byteLength) {
                throw new Error('byteLength and buffer different sizes..');
            }
            buffers[i] = arrayBuffer;
        }));
        yield Promise.all(promises);
        return buffers;
    });
}
const loadGltf = {
    test(url) {
        return (extname(url).includes('.gltf'));
    },
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const absolutePath = url;
            const response = yield fetch(absolutePath);
            const gltfRaw = yield response.json();
            const dirName = dirname(url);
            const buffers = yield processBuffers(gltfRaw, dirName);
            const gbObject = gltfToGbParser(gltfRaw, buffers);
            const scene = gbToOdieParser(gbObject);
            const tempURL = url.split('?')[0];
            Cache.add(tempURL, scene);
            return scene;
        });
    },
};
export { loadGltf };
//# sourceMappingURL=loadGltf.js.map