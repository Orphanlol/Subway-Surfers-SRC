"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dedupeGeometry = void 0;
function arraysEqual(a, b) {
    if (a === b)
        return true;
    if (!a || !b || a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
function compareStructure(geom1, geom2) {
    if (geom1.primitives.length !== geom2.primitives.length) {
        return false;
    }
    let match = true;
    for (let i = 0; i < geom1.primitives.length; i++) {
        const p1 = geom1.primitives[0];
        const p2 = geom2.primitives[0];
        for (const j in p1) {
            const arraysAreTheSame = arraysEqual(p1[j], p2[j]);
            if (!arraysAreTheSame) {
                match = false;
                break;
            }
        }
        if (!match) {
            break;
        }
    }
    return match;
}
/**
 * This will look through a gbObject and removed any duplicate models.
 * Saving out a model from maya with say 100 trees will save out 100 models even if the model is the same.
 * This function will would keep the first model and remove the 99 duplicates
 *
 * @param gbObject the gbObject to remove duplicates from
 */
function dedupeGeometry(gbObject) {
    const hash = new Map();
    const { geometry, nodes } = gbObject;
    const toRemove = [];
    // console.log(geometry.map((g, i)=>i + ': ' + g.name));
    for (let i = 0; i < geometry.length; i++) {
        const g1 = geometry[i];
        if (hash[i] === undefined) {
            hash[i] = i;
        }
        else {
            continue;
        }
        for (let j = i + 1; j < geometry.length; j++) {
            const g2 = geometry[j];
            const match = compareStructure(g1, g2);
            if (match) {
                hash[j] = hash[i];
                console.log(`removing: ${g2.name} copy of: ${g1.name} :${hash[i]}`);
                toRemove.push(j);
            }
        }
    }
    let count = -1;
    // const ids = geometry.map((g, i) => i);
    const otherHash = {};
    const newIdMap = geometry
        .map((g, i) => i) // just get the indexes (lazy!)
        .map((i) => hash[i]) // map duplicates to their new id
        .map((i) => {
        if (!otherHash[i]) {
            otherHash[i] = true;
            count++;
        }
        return count;
    }); // now re-calculate the index of each model removing duplicates
    // ids.forEach((id, i) =>{
    //     console.log(ids[i] + "->" + newIdMap[i])
    // })
    // remove all duplicate geometries
    gbObject.geometry = geometry.filter((_g, i) => toRemove.indexOf(i) === -1);
    // console.log('to remove:', toRemove);
    // console.log( gbObject.geometry.length, geometry.length, geometry.length - gbObject.geometry.length)
    // reassign all the removed geometries to the single one
    nodes.forEach((node) => {
        if (node.geometry) {
            // if(newIdMap[node.geometry] >= 36)
            // {
            //     console.log("UNACCEPTABLE")
            //     console.log(node.geometry, newIdMap[node.geometry])
            // }
            node.geometry = newIdMap[node.geometry];
        }
    });
    // let the world know and be proud!
    if (toRemove.length) {
        console.log(`huzzah! removed ${toRemove.length} duplicate models from gb object`);
    }
}
exports.dedupeGeometry = dedupeGeometry;
