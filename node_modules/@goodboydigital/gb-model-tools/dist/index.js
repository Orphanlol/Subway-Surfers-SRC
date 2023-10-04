"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dedupeGeometry = exports.batchGeometry = exports.flattenScene = exports.transformUvs = exports.transformPositions = exports.mergeGBObjects = exports.mergePrimitives = exports.unpackGBObject = exports.compressGBObject = exports.objToGbParser = exports.gltfToGbParser = void 0;
const batchGeometry_1 = require("./gb-compress/batchGeometry");
Object.defineProperty(exports, "batchGeometry", { enumerable: true, get: function () { return batchGeometry_1.batchGeometry; } });
const compressGBObject_1 = require("./gb-compress/compressGBObject");
Object.defineProperty(exports, "compressGBObject", { enumerable: true, get: function () { return compressGBObject_1.compressGBObject; } });
const dedupeGeometry_1 = require("./gb-compress/dedupeGeometry");
Object.defineProperty(exports, "dedupeGeometry", { enumerable: true, get: function () { return dedupeGeometry_1.dedupeGeometry; } });
const flattenScene_1 = require("./gb-compress/flattenScene");
Object.defineProperty(exports, "flattenScene", { enumerable: true, get: function () { return flattenScene_1.flattenScene; } });
const gltfToGbParser_1 = require("./gltfToGb/gltfToGbParser");
Object.defineProperty(exports, "gltfToGbParser", { enumerable: true, get: function () { return gltfToGbParser_1.gltfToGbParser; } });
const objToGbParser_1 = require("./objToGb/objToGbParser");
Object.defineProperty(exports, "objToGbParser", { enumerable: true, get: function () { return objToGbParser_1.objToGbParser; } });
const mergeGBObjects_1 = require("./utils/mergeGBObjects");
Object.defineProperty(exports, "mergeGBObjects", { enumerable: true, get: function () { return mergeGBObjects_1.mergeGBObjects; } });
const mergePrimitives_1 = require("./utils/mergePrimitives");
Object.defineProperty(exports, "mergePrimitives", { enumerable: true, get: function () { return mergePrimitives_1.mergePrimitives; } });
const transformPositions_1 = require("./utils/transformPositions");
Object.defineProperty(exports, "transformPositions", { enumerable: true, get: function () { return transformPositions_1.transformPositions; } });
const transformUvs_1 = require("./utils/transformUvs");
Object.defineProperty(exports, "transformUvs", { enumerable: true, get: function () { return transformUvs_1.transformUvs; } });
const unpackGBObject_1 = require("./gb-compress/unpackGBObject");
Object.defineProperty(exports, "unpackGBObject", { enumerable: true, get: function () { return unpackGBObject_1.unpackGBObject; } });
__exportStar(require("./GBFormat"), exports);
