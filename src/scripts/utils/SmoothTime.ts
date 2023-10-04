import { Time } from '@goodboydigital/odie';

interface SmoothTimeOptions
{
    timeScale?: number;
    fps?: number;
    smooth?: number;
}

/**
 * Extends Time to implement optional smooth delta
 */
export class SmoothTime extends Time
{
    public smooth = 0;

    constructor(options: SmoothTimeOptions = {})
    {
        super(options);
        if (options.smooth) this.smooth = options.smooth;
    }

    public nextUpdate(): void
    {
        const now = performance.now();

        const deltaTime = Math.min(now - (this as any)._lastTime, this.maxDeltaTime);

        if (this.smooth > 0 && this.smooth < 1)
        {
            (this as any)._deltaTime -= ((this as any)._deltaTime - deltaTime) * this.smooth;
        }
        else
        {
            (this as any)._deltaTime = deltaTime;
        }

        (this as any)._frameTime = (this as any)._deltaTime / (this as any)._frameDuration;

        (this as any)._lastTime = now;
    }
}
