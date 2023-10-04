import Box from './Box';

export default class Collision
{
    public static NONE = 0;
    public static LEFT = 4;
    public static TOP = 8;
    public static RIGHT = 16;
    public static BOTTOM = 32;
    public static FRONT = 64;
    public static BACK = 128;
    public static INSIDE = 256;
    public static SLOPE = 512;

    /** Active entity in this collision - the one who hits */
    public act: any = null;

    /** Passive entity in this collision - the one who gets hit */
    public pas: any = null;

    /** Collision hit area (intersection) */
    public hit = new Box();

    /** Collision flags */
    public flags = Collision.NONE;

    reset(): void
    {
        this.act = null;
        this.pas = null;
        this.flags = Collision.NONE;
    }
}

