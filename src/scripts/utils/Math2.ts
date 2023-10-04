/* eslint-disable no-nested-ternary */

interface IVector3
{
    x: number;
    y: number;
    z: number;
}

export default class Math2
{
    public static PI_HALF = Math.PI * 0.5;
    public static PI_QUARTER = Math.PI * 0.25;
    public static PI_DOUBLE = Math.PI * 2;
    public static DEG_TO_RAD = 0.0174533;

    static lerp(a: number, b: number, t: number, snap = 0): number
    {
        if (snap && a >= b - snap && a <= b + snap) return b;

        return a + ((b - a) * (t < 0 ? 0 : t > 1 ? 1 : t));
    }

    static lerpCap(v0: number, v1: number, t: number, snap = 0, cap = 0): number
    {
        if (snap && v0 >= v1 - snap && v0 <= v1 + snap) return v1;
        let delta = (t < 0 ? 0 : t > 1 ? 1 : t) * (v1 - v0);

        if (cap) delta = this.clamp(delta, -cap, cap);

        return v0 + delta;
    }

    static clamp(v: number, min = 0, max = 1): number
    {
        return v < min ? min : v > max ? max : v;
    }

    static sign(v: number, zero = false): number
    {
        if (!zero)
        {
            return v < 0 ? -1 : 1;
        }

        return v < 0 ? -1 : v > 0 ? 1 : 0;
    }

    static ease(v0: number, v1: number, t: number, max: number): number
    {
        const r = -(v0 - v1) * t;

        return max ? this.clamp(r, -max, max) : r;
    }

    static lerpVec3(out: IVector3, start: IVector3, end: IVector3, t: number, snap = 0): IVector3
    {
        out.x = this.lerp(start.x, end.x, t, snap);
        out.y = this.lerp(start.y, end.y, t, snap);
        out.z = this.lerp(start.z, end.z, t, snap);

        return out;
    }

    static smoothStep(a: number, b: number, t: number): number
    {
        t = this.clamp((t - a) / (b - a), 0.0, 1.0);

        return t * t * (3 - (2 * t));
    }

    // eslint-disable-next-line max-len
    static smoothDamp(current: number, target: number, currentVelocity: number, smoothTime: number, maxSpeed: number, deltaTime: number): number
    {
        smoothTime = Math.max(0.0001, smoothTime);
        const num1 = 2.0 / smoothTime;
        const num2 = num1 * deltaTime;
        const num3 = (1.0 / (1.0 + num2 + (0.479999989271164 * num2 * num2) + (0.234999999403954 * num2 * num2 * num2)));
        const num4 = current - target;
        const num5 = target;
        const max = maxSpeed * smoothTime;
        const num6 = this.clamp(num4, -max, max);

        target = current - num6;
        const num7 = (currentVelocity + (num1 * num6)) * deltaTime;

        currentVelocity = (currentVelocity - (num1 * num7)) * num3;
        let num8 = target + ((num6 + num7) * num3);

        if ((num5 - current > 0.0) === (num8 > num5))
        {
            num8 = num5;
            currentVelocity = (num8 - num5) / deltaTime;
        }

        return num8;
    }
}
