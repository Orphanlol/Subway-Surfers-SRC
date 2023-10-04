import type { HighFragment } from '@goodboydigital/odie';

/**
 * Custom fog for Subway Surfers
 */
export const fogFragment: HighFragment = {
    vertex: {
        header: `
            varying float vFogDepth;
        `,
        end: `
            vFogDepth = length(worldCameraPosition.xyz);
        `,
    },
    fragment: {
        header: `
            varying float vFogDepth;
        `,
        end: `
            vec3 uFogColor = vec3(0.388, 0.698, 1.0);
            float uFogNear = 600.0;
            float uFogFar = 900.0;
            float fogFactor = smoothstep( uFogNear, uFogFar, vFogDepth );
            finalColor.rgb = mix(finalColor.rgb, uFogColor * diffuseColor.a, fogFactor);
        `,
    },
};
