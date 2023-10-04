"use strict";
// ObjLoader.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBounds = void 0;
function getBounds(data, size) {
    const ranges = [];
    for (let i = 0; i < size; i++) {
        ranges[i] = { min: Infinity, max: -Infinity };
    }
    for (let i = 0; i < data.length; i += size) {
        for (let j = 0; j < size; j++) {
            const value = data[i + j];
            if (value < ranges[j].min)
                ranges[j].min = value;
            if (value > ranges[j].max)
                ranges[j].max = value;
        }
    }
    const sizes = ranges.map((range) => range.max - range.min);
    // put  catch in for any bonkers size properties,
    // talk to the modeler if this issue pops up
    sizes.forEach((size, index) => {
        if (size > 100000000) {
            ranges[index].max = 1;
            ranges[index].min = 0;
            console.warn('warning a buffer range is too large, check the model: resizing to range 0-1');
            sizes[index] = 1;
        }
    });
    return {
        ranges,
        sizes,
    };
}
exports.getBounds = getBounds;
