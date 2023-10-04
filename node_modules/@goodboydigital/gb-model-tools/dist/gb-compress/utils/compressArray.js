"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpackArray = exports.compressArray = void 0;
const getBounds_1 = require("./getBounds");
function compressValueToUint16(value, bounds, index) {
    const range = bounds.ranges[index];
    const size = bounds.sizes[index];
    return ((value - range.min) / size) * 65535;
}
function compressArray(data, size = 3) {
    const bounds = getBounds_1.getBounds(data, size);
    const metaSize = (size * 2) + 1 + 1;
    let bufferSize = (data.length / 2) + (metaSize);
    bufferSize += bufferSize % 1;
    const float32View = new Float32Array(bufferSize);
    const array = new Uint16Array(float32View.buffer);
    let index = 0;
    for (let i = 0; i < data.length; i += size) {
        for (let j = 0; j < size; j++) {
            array[(metaSize * 2) + index] = compressValueToUint16(data[index], bounds, j);
            index++;
        }
    }
    index = 0;
    float32View[index++] = data.length;
    float32View[index++] = metaSize - 1 - 1;
    for (let i = 0; i < size; i++) {
        float32View[index++] = bounds.ranges[i].min;
        float32View[index++] = bounds.sizes[i];
    }
    return array;
}
exports.compressArray = compressArray;
function unpackArray(array) {
    let float32View = new Float32Array(array.buffer, 0, 2);
    let index = 0;
    const arrayLength = float32View[index++];
    const metaSize = float32View[index++];
    const bounds = [];
    float32View = new Float32Array(array.buffer, 0, 2 + metaSize);
    for (let i = 0; i < metaSize / 2; i++) {
        bounds[i] = {
            min: float32View[index++],
            size: float32View[index++],
        };
    }
    const size = bounds.length;
    // for uint index..
    index *= 2;
    let indexOut = 0;
    const output = new Float32Array(arrayLength);
    for (let i = 0; i < arrayLength; i += size) {
        for (let j = 0; j < size; j++) {
            output[indexOut++] = ((array[index++] / 65535) * bounds[j].size) + bounds[j].min;
        }
    }
    return output;
}
exports.unpackArray = unpackArray;
