/* eslint-disable no-nested-ternary */

export type CurveFunc = (t: number) => number;

export default class Curve
{
    static calculateJumpVerticalSpeed(jumpHeight: number, gravity = 0): number
    {
        if (jumpHeight < 0) throw new Error('Jump height cannot be negative');

        return Math.sqrt(2 * jumpHeight * gravity);
    }

    static calculateJumpLength(speed: number, jumpHeight: number, gravity: number): number
    {
        return speed * 2 * Curve.calculateJumpVerticalSpeed(jumpHeight) / gravity;
    }

    // EXPO ----------------------------------------------------------
    static linear(t: number): number
    {
        return t;
    }

    // EXPO ----------------------------------------------------------
    static expoIn(t: number): number
    {
        return t === 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
    }

    static expoOut(t: number): number
    {
        return t === 1.0 ? t : 1.0 - Math.pow(2.0, -10.0 * t);
    }

    static expoInOut(t: number): number
    {
        return (t === 0.0 || t === 1.0)
            ? t
            : t < 0.5
                ? +0.5 * Math.pow(2.0, (20.0 * t) - 10.0)
                : (-0.5 * Math.pow(2.0, 10.0 - (t * 20.0))) + 1.0;
    }

    // SINE ----------------------------------------------------------
    static sineIn(t: number): number
    {
        const v = Math.cos(t * Math.PI * 0.5);

        if (Math.abs(v) < 1e-14) return 1;

        return 1 - v;
    }

    static sineOut(t: number): number
    {
        return Math.sin(t * Math.PI / 2);
    }

    static sineInOut(t: number): number
    {
        return -0.5 * (Math.cos(Math.PI * t) - 1);
    }

    // QUAD ----------------------------------------------------------
    static quadIn(t: number): number
    {
        return t * t;
    }

    static quadOut(t: number): number
    {
        return -t * (t - 2.0);
    }

    static quadInOut(t: number): number
    {
        t /= 0.5;
        if (t < 1) return 0.5 * t * t;
        t--;

        return -0.5 * ((t * (t - 2)) - 1);
    }

    // QUART --------------------------------------------------------
    static quartIn(t: number): number
    {
        return Math.pow(t, 4.0);
    }

    static quartOut(t: number): number
    {
        return (Math.pow(t - 1.0, 3.0) * (1.0 - t)) + 1.0;
    }

    static quartInOut(t: number): number
    {
        return t < 0.5
            ? +8.0 * Math.pow(t, 4.0)
            : (-8.0 * Math.pow(t - 1.0, 4.0)) + 1.0;
    }

    // QUINT -------------------------------------------------------
    static quintIn(t: number): number
    {
        return t * t * t * t * t;
    }

    static quintOut(t: number): number
    {
        return (--t * t * t * t * t) + 1;
    }

    static quintInOut(t: number): number
    {
        if ((t *= 2) < 1) return 0.5 * t * t * t * t * t;

        return 0.5 * (((t -= 2) * t * t * t * t) + 2);
    }

    // BACK --------------------------------------------------------
    static backInOut(t: number): number
    {
        const s = 1.70158 * 1.525;

        if ((t *= 2) < 1)
        { return 0.5 * (t * t * (((s + 1) * t) - s)); }

        return 0.5 * (((t -= 2) * t * (((s + 1) * t) + s)) + 2);
    }

    static backIn(t: number): number
    {
        const s = 1.70158;

        return t * t * (((s + 1) * t) - s);
    }

    static backOut(t: number): number
    {
        const s = 1.70158;

        return (--t * t * (((s + 1) * t) + s)) + 1;
    }

    // CIRC --------------------------------------------------------
    static circInOut(t: number): number
    {
        if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - (t * t)) - 1);

        return 0.5 * (Math.sqrt(1 - ((t -= 2) * t)) + 1);
    }

    static circIn(t: number): number
    {
        return 1.0 - Math.sqrt(1.0 - (t * t));
    }

    static circOut(t: number): number
    {
        return Math.sqrt(1 - (--t * t));
    }

    // ELASTIC -----------------------------------------------------
    static elasticOut(t: number): number
    {
        return (Math.sin(-13.0 * (t + 1.0) * Math.PI / 2) * Math.pow(2.0, -10.0 * t)) + 1.0;
    }

    static elasticIn(t: number): number
    {
        return Math.sin(13.0 * t * Math.PI / 2) * Math.pow(2.0, 10.0 * (t - 1.0));
    }

    static elasticInOut(t: number): number
    {
        return t < 0.5
            ? 0.5 * Math.sin(+13.0 * Math.PI / 2 * 2.0 * t) * Math.pow(2.0, 10.0 * ((2.0 * t) - 1.0))
            : (0.5 * Math.sin(-13.0 * Math.PI / 2 * (((2.0 * t) - 1.0) + 1.0))
            * Math.pow(2.0, -10.0 * ((2.0 * t) - 1.0))) + 1.0;
    }
}
