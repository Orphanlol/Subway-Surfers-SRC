import { Geometry3D } from '@goodboydigital/odie';

export default class RampGeometry extends Geometry3D
{
    constructor()
    {
        super();

        const pos = [
            // Front face
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,
            // Back face
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            // Top face
            -0.5, 0.5, -0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, -0.5,
            // Bottom face
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5,
            // Right face
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
            // Left face
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5,
        ];

        const nor = [
            // Front face
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            // Back face
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            // Top face
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            // Bottom face
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            // Right face
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            // Left face
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
        ];

        const ind = [
            // 0,  1,  2,    0,  2,  3,  // Front face
            0, 0, 0, 0, 0, 0, // Front face
            4, 5, 6, 4, 6, 7, // Back face
            8, 9, 10, 8, 10, 11, // Top face
            12, 13, 14, 12, 14, 15, // Bottom face
            //    16, 17, 18,   16, 18, 19,  // Right face
            16, 17, 19, 0, 0, 0, // Right face
            //    20, 21, 22,   20, 22, 23   // Left face
            20, 21, 23, 0, 0, 0, // Left face
        ];

        const uvs = [
            // Front face
            0, 1,
            1, 0,
            1, 1,
            0, 0,

            0, 1,
            1, 0,
            1, 1,
            0, 0,

            0, 1,
            1, 0,
            1, 1,
            0, 0,

            0, 1,
            1, 0,
            1, 1,
            0, 0,

            0, 1,
            1, 0,
            1, 1,
            0, 0,

            0, 1,
            1, 0,
            1, 1,
            0, 0,
        ];

        const vertices = new Float32Array(pos) as any;
        const normals = new Float32Array(nor) as any;
        const indices = new Uint16Array(ind) as any;

        this.addAttribute('aPosition', vertices, 3);
        this.addAttribute('aNormal', normals, 3);
        this.addAttribute('aUv', uvs, 2);
        this.addIndex(indices);
    }
}

