"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objToGbParser = void 0;
const getBounds_1 = require("../gb-compress/utils/getBounds");
const objParser_1 = require("./objParser");
function objToGbParser(objRaw, name) {
    const gbObject = {};
    const objData = objParser_1.parseObj(objRaw);
    const bounds = getBounds_1.getBounds(objData.position, 3);
    gbObject.geometry = [
        {
            name,
            primitives: [{
                    bounds: [
                        bounds.ranges[0].min,
                        bounds.ranges[1].min,
                        bounds.ranges[2].min,
                        bounds.ranges[0].max,
                        bounds.ranges[1].max,
                        bounds.ranges[2].max,
                    ],
                    indices: objData.indices,
                    attributes: {
                        positions: objData.position,
                        normals: objData.normals,
                        uvs: objData.uv,
                    },
                }],
        },
    ];
    // only process geometry at the moment..
    return gbObject;
}
exports.objToGbParser = objToGbParser;
