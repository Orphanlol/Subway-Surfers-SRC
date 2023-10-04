import * as glm from 'gl-matrix';

import Math2 from './Math2';

export default class Vector3
{
    public static UP = new Vector3(0, 1, 0);
    public static RIGHT = new Vector3(1, 0, 0);
    public static FORWARD = new Vector3(0, 0, -1);
    public static DOWN = new Vector3(0, -1, 0);
    public static LEFT = new Vector3(-1, 0, 0);
    public static BACK = new Vector3(0, 0, 1);
    public static ZERO = new Vector3(0, 0, 0);
    public static ONE = new Vector3(1, 1, 1);

    public vec: glm.vec3;

    constructor(x = 0, y = 0, z = 0)
    {
        this.vec = glm.vec3.create();
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get x(): number
    {
        return this.vec[0];
    }

    set x(v: number)
    {
        this.vec[0] = v;
    }

    get y(): number
    {
        return this.vec[1];
    }

    set y(v: number)
    {
        this.vec[1] = v;
    }

    get z(): number
    {
        return this.vec[2];
    }

    set z(v: number)
    {
        this.vec[2] = v;
    }

    reset(x = 0, y = 0, z = 0): void
    {
        this.vec[0] = x;
        this.vec[1] = y;
        this.vec[2] = z;
    }

    copy(other: Vector3): void
    {
        this.vec[0] = other.vec[0];
        this.vec[1] = other.vec[1];
        this.vec[2] = other.vec[2];
    }

    clone(): Vector3
    {
        return new Vector3(this.vec[0], this.vec[1], this.vec[2]);
    }

    distance(other: Vector3): number
    {
        return glm.vec3.distance(this.vec, other.vec);
    }

    magnitude(): number
    {
        return glm.vec3.length(this.vec);
    }

    add(other: Vector3): void
    {
        glm.vec3.add(this.vec, this.vec, other.vec);
    }

    subtract(other: Vector3): void
    {
        glm.vec3.add(this.vec, this.vec, other.vec);
    }

    lerp(other: Vector3, ratio: number, snap = 0): void
    {
        if (ratio !== -1)
        {
            // Math2.lerpVec3(this, this, other, ratio, snap, cap);
            Math2.lerpVec3(this, this, other, ratio, snap);
        }
        else
        {
            this.copy(other);
        }
    }
}
