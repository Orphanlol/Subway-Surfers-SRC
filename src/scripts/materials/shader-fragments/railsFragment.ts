import type { HighFragment } from '@goodboydigital/odie';

/**
 * Rails metal shine reflection - fully hard coded
 */
export const railsFragment: HighFragment = {
    vertex: {
        header: `
            varying vec3 vPosition;
            varying vec4 vScreenPosition;
        `,
        end: `
            vec4 worldViewPosition =  uProjectionMatrix * uViewMatrix * worldPosition;

            vPosition =  worldPosition.xyz;
            vScreenPosition = worldViewPosition;
        `,
    },
    fragment: {
        header: ` 
            varying vec3 vPosition;
            varying vec4 vScreenPosition;
        `,
        end: `
            if (vPosition.y >= 1.2) {
                finalColor.rgb = gammaCorrectOutput(finalColor.rgb);
                gl_FragColor = finalColor;

                float reflWidth = 1.5;
                float railDist = 7.0;
                float laneWidth = 20.0;
                vec3 reflColor = vec3(1.0, 1.0, 1.0);
                float reflFactor = abs(vScreenPosition.z - 100.0) * 0.015;
                if (reflFactor < 0.0) reflFactor = 0.0;
                if (reflFactor > 1.0) return;
            
            
                // Middle lane
                if (vPosition.x > -4.0 && vPosition.x < -2.5) {
                    gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);
                } else if (vPosition.x > 2.5 && vPosition.x < 4.0) {
                    gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);
                }
            
                // Left lane
                if (vPosition.x > -4.0 - laneWidth && vPosition.x < -2.5 - laneWidth) {
                    gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);
                } else if (vPosition.x > 2.5 - laneWidth && vPosition.x < 4.0 - laneWidth) {
                    gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);
                }
            
                // Right lane
                if (vPosition.x > -4.0 + laneWidth && vPosition.x < -2.5 + laneWidth) {
                    gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);
                } else if (vPosition.x > 2.5 + laneWidth && vPosition.x < 4.0 + laneWidth) {
                    gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);
                }

                return;
            }
        `,
    },
};
