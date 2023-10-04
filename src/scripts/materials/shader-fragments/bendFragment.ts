import type { HighFragment } from '@goodboydigital/odie';

/**
 * Bend the world
 */
export const bendFragment: HighFragment = {
    vertex: {
        header: `
            uniform vec2 uBend;
            vec4 bend(vec4 pos) {
                float dx = uBend.x;
                float dy = uBend.y;
                float z_sqr = pos.w * pos.w;
                pos.x = pos.x + z_sqr * dx;
                pos.y = pos.y + z_sqr * dy;
                return pos;
            }
        `,
        end: `
            gl_Position = bend(gl_Position);
        `,
    },
};
