"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unzipArray = exports.zipArray = void 0;
const pako = require('pako');
function zipArray(array) {
    const compressed = pako.deflate((array.buffer));
    // console.log('compressed matrix', compressed);
    // const unpacked = unpackArray(compressed);
    // console.log('original', data);
    //  console.log('unpacked', unpacked);
    // return array;
    // console.log(array.buffer.byteLength);
    // console.log(compressed.buffer.byteLength);
    // console.log(data);
    // console.log(data, unpackArray(compressed) );
    return compressed;
}
exports.zipArray = zipArray;
function unzipArray(compressed) {
    return new Uint16Array(pako.inflate(compressed).buffer);
}
exports.unzipArray = unzipArray;
