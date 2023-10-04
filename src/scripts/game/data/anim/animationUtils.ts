export type Clips = Record<string, {frames:number[]}>;

export function offsetAndCopyFrames(rawClips: Clips, out: Clips = {}, offset = 0): void
{
    for (const key in rawClips)
    {
        const clip = rawClips[key];

        clip.frames = clip.frames.map((frames) => frames + offset);
        if (!out[key])
        {
            out[key] = clip;
        }
        else console.error(`Found duplicate clip: ${key}`);
    }
}
