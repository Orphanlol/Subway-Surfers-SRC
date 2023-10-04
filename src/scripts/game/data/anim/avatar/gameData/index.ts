import { Clips, offsetAndCopyFrames } from '../../animationUtils';
import Catch from './avatar-catch.json';
import Hover from './avatar-hover.json';
import Jet from './avatar-jet.json';
import Movement from './avatar-movement.json';
import Pogo from './avatar-pogo.json';
import TopRun from './avatar-toprun.json';

const clipData: Record<string, {offset: number, rawClips: Clips}> = {
    Movement: { offset: 0, rawClips: Movement },
    TopRun: { offset: 2455, rawClips: TopRun },
    Catch: { offset: 3272, rawClips: Catch },
    Hover: { offset: 3993, rawClips: Hover },
    Jet: { offset: 7339, rawClips: Jet },
    Pogo: { offset: 7573, rawClips: Pogo },
};
const clips = {};

for (const key in clipData)
{
    const { offset, rawClips } = clipData[key];

    offsetAndCopyFrames(rawClips, clips, offset);
}

export default {
    fps: 24,
    clips,
};
