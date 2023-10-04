"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rgb2hex = void 0;
function rgb2hex(rgb) {
    return (((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + (rgb[2] * 255 | 0));
}
exports.rgb2hex = rgb2hex;
