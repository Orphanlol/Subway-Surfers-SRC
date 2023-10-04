let ib = {};
try {
    ib = ImageBitmap;
}
catch (e) { }
function findArray(object, transferables, map) {
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        const o = object[keys[i]];
        if (ArrayBuffer.isView(o) || (o === null || o === void 0 ? void 0 : o.constructor) === ib) {
            const transferable = o.constructor === ib ? o : o.buffer;
            if (!map.get(transferable)) {
                map.set(transferable, true);
                transferables.push(transferable);
            }
        }
        else if ((o === null || o === void 0 ? void 0 : o.constructor) === Array || (o === null || o === void 0 ? void 0 : o.constructor) === Object) {
            findArray(o, transferables, map);
        }
    }
}
export function collectTransferables(object) {
    const map = new Map();
    const transferables = [];
    findArray({ object }, transferables, map);
    return transferables;
}
//# sourceMappingURL=collectTransferables.js.map