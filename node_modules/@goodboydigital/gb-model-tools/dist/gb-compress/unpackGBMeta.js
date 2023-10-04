"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpackGBMeta = void 0;
function unpackGBMeta(buffer) {
    let index = 0;
    const float32View = new Float32Array(buffer);
    const size = float32View[index++];
    index++; // go past type..  const type = float32View[index++];
    const metaUint16Array = new Uint16Array(buffer, 4 * index, size);
    const metaUint8Array = new Int8Array(buffer, 4 * index, size * 2);
    index += size / 2;
    if (index % 1) {
        index += 0.5;
    }
    // so it turns out there is a limit to String.fromCharCode.apply
    // this happens if the meta file is too large!
    // usually because we have embedded textures or too many keyframes in our animations
    // TextDecoder does the trick!
    // But IE 11 does not support it so we need to fallback
    let metaString = null;
    try {
        const decoder = new TextDecoder('utf-16');
        metaString = decoder.decode(metaUint8Array, {});
    }
    catch (decodeError) {
        try {
            metaString = String.fromCharCode.apply(null, metaUint16Array);
        }
        catch (charError) {
            // eslint-disable-next-line max-len
            throw new Error('[Unpack GB model] meta data is too large, possible - we have large base64 textures or animation');
        }
    }
    return JSON.parse(metaString);
}
exports.unpackGBMeta = unpackGBMeta;
