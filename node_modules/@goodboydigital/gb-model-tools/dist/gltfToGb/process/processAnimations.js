"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAnimations = void 0;
const getBuffer_1 = require("../utils/getBuffer");
const pathMap = {
    rotation: 'r',
    translation: 't',
    scale: 's',
    weights: 'w',
};
function processAnimations(gltfRaw, gbObject) {
    if (!gltfRaw.animations) {
        gbObject.animations = [];
        return;
    }
    gbObject.animations = gltfRaw.animations.map((animationRaw) => {
        const animation = {
            data: [],
            duration: 0,
        };
        const nodeMap = {};
        animationRaw.channels.forEach((channelRaw) => {
            const sampler = animationRaw.samplers[channelRaw.sampler];
            const times = getBuffer_1.getBuffer(gltfRaw, sampler.input);
            const values = getBuffer_1.getBuffer(gltfRaw, sampler.output);
            let track = nodeMap[channelRaw.target.node];
            if (!track) {
                track = nodeMap[channelRaw.target.node] = {
                    id: channelRaw.target.node,
                    duration: times[times.length - 1],
                };
                animation.data.push(track);
            }
            animation.duration = Math.max(animation.duration, track.duration);
            track[pathMap[channelRaw.target.path]] = {
                times,
                values,
            };
        });
        return animation;
    });
}
exports.processAnimations = processAnimations;
