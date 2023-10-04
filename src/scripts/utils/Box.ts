import Vector3 from './Vector3';

export default class Box
{
    public size: Vector3;
    public center: Vector3;

    protected _intersection?: Box;

    constructor(sx = 1, sy = 1, sz = 1)
    {
        this.size = new Vector3(sx, sy, sz);
        this.center = new Vector3(0, 0, 0);
    }

    copy(box: Box): void
    {
        this.size.copy(box.size);
        this.center.copy(box.center);
    }

    resize(w = 1, h = 1, d = 1): void
    {
        this.size.x = w;
        this.size.y = h;
        this.size.z = d;
    }

    reposition(x = 1, y = 1, z = 1): void
    {
        this.center.x = x;
        this.center.y = y;
        this.center.z = z;
    }

    get x(): number
    {
        return this.center.x;
    }

    set x(v: number)
    {
        this.center.x = v;
    }

    get y(): number
    {
        return this.center.y;
    }

    set y(v: number)
    {
        this.center.y = v;
    }

    get z(): number
    {
        return this.center.z;
    }

    set z(v: number)
    {
        this.center.z = v;
    }

    get left(): number
    {
        return this.center.x - (this.size.x * 0.5);
    }

    set left(v: number)
    {
        this.center.x = v + (this.size.x * 0.5);
    }

    get right(): number
    {
        return this.center.x + (this.size.x * 0.5);
    }

    set right(v: number)
    {
        this.center.x = v - (this.size.x * 0.5);
    }

    get top(): number
    {
        return this.center.y + (this.size.y * 0.5);
    }

    set top(v: number)
    {
        this.center.y = v - (this.size.y * 0.5);
    }

    get bottom(): number
    {
        return this.center.y - (this.size.y * 0.5);
    }

    set bottom(v: number)
    {
        this.center.y = v + (this.size.y * 0.5);
    }

    get front(): number
    {
        return this.center.z - (this.size.z * 0.5);
    }

    set front(v: number)
    {
        this.center.z = v + (this.size.z * 0.5);
    }

    get back(): number
    {
        return (this.size.z * 0.5) + this.center.z;
    }

    set back(v: number)
    {
        this.center.z = v - (this.size.z * 0.5);
    }

    get width(): number
    {
        return this.size.x;
    }

    set width(v: number)
    {
        this.size.x = v;
    }

    get height(): number
    {
        return this.size.y;
    }

    set height(v: number)
    {
        this.size.y = v;
    }

    get depth(): number
    {
        return this.size.z;
    }

    set depth(v: number)
    {
        this.size.z = v;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hitTest(box: Box, intersection = null): Box | null
    {
        const hitX = this.left <= box.right && this.right >= box.left;
        const hitY = this.bottom <= box.top && this.top >= box.bottom;
        const hitZ = this.front <= box.back && this.back >= box.front;
        const hit = hitX && hitY && hitZ;

        if (!hit) return null;

        if (!this._intersection) this._intersection = new Box();

        const left = Math.max(this.left, box.left);
        const right = Math.min(this.right, box.right);
        const bottom = Math.max(this.bottom, box.bottom);
        const top = Math.min(this.top, box.top);
        const front = Math.max(this.front, box.front);
        const back = Math.min(this.back, box.back);

        this._intersection.size.x = right - left;
        this._intersection.size.y = top - bottom;
        this._intersection.size.z = back - front;
        this._intersection.center.x = left + (this._intersection.size.x * 0.5);
        this._intersection.center.y = bottom + (this._intersection.size.y * 0.5);
        this._intersection.center.z = back - (this._intersection.size.z * 0.5);

        return this._intersection;
    }
}
