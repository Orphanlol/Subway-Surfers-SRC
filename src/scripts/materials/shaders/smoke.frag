export default "precision lowp float;\n\nvarying vec3 vNormal;\nvarying vec3 vPosition;\nvarying vec4 vScreenPosition;\nuniform float uOpacity;\n\n#ifdef COLOR\nuniform vec3 uColor;\n#endif\n\n// ----------------------------------------------------------------------------\n\n#if defined( MAP )\nvarying vec2 vUv;\nvarying float vOffset;\n#endif\n\n// ----------------------------------------------------------------------------\n\n#ifdef MAP\nuniform sampler2D uMap;\n#endif\n\n// ----------------------------------------------------------------------------\n\n#ifdef FOG\nvarying float vFogFactor;\nvarying vec3 vFogColor;\n#endif\n\n// ----------------------------------------------------------------------------\n\nvec3 gammaCorrectInput(vec3 color) {\n    return pow(color, vec3(2.2));\n}\n\nfloat gammaCorrectInput(float color) {\n    return pow(color, 2.2);\n}\n\nvec4 gammaCorrectInput(vec4 color) {\n    return vec4(pow(color.rgb, vec3(2.2)), color.a);\n}\n\nvec3 gammaCorrectOutput(vec3 color) {\n    color += vec3(0.0000001);\n    return pow(color, vec3(0.55));\n}\n\nvec4 texture2DSRGB(sampler2D tex, vec2 uv) {\n    vec4 rgba = texture2D(tex, uv);\n    rgba.rgb = gammaCorrectInput(rgba.rgb);\n    return rgba;\n}\n\nvoid main() {\n\n#ifdef MAP\n    vec2 uvs = vOffset != 0.0 ? vec2(vUv.x + vOffset, vUv.y) : vUv;\n    gl_FragColor = texture2DSRGB(uMap, uvs) * uOpacity;\n#else\n    gl_FragColor.rgb = uColor.rgb * uOpacity;\n#endif\n\n    gl_FragColor.rgb = gammaCorrectOutput(gl_FragColor.rgb);\n\n#ifdef FOG\n    // FORCING FOG COLOR TO PREVENT A BUG WHERE SOME RED FOG OBJECT WHERE SHOWING UP \n    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.388, 0.698, 1.0), vFogFactor);\n#endif\n\n#ifdef RAILS\n    if (vPosition.y < 1.2) return;\n\n    float reflWidth = 1.5;\n    float railDist = 7.0;\n    float laneWidth = 20.0;\n    vec3 reflColor = vec3(1.0, 1.0, 1.0);\n    float reflFactor = abs(vScreenPosition.z - 100.0) * 0.015;\n    if (reflFactor < 0.0) reflFactor = 0.0;\n    if (reflFactor > 1.0) return;\n\n\n    // Middle lane\n    if (vPosition.x > -4.0 && vPosition.x < -2.5) {\n        gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);\n    } else if (vPosition.x > 2.5 && vPosition.x < 4.0) {\n        gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);\n    }\n\n    // Left lane\n    if (vPosition.x > -4.0 - laneWidth && vPosition.x < -2.5 - laneWidth) {\n        gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);\n    } else if (vPosition.x > 2.5 - laneWidth && vPosition.x < 4.0 - laneWidth) {\n        gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);\n    }\n\n    // Right lane\n    if (vPosition.x > -4.0 + laneWidth && vPosition.x < -2.5 + laneWidth) {\n        gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);\n    } else if (vPosition.x > 2.5 + laneWidth && vPosition.x < 4.0 + laneWidth) {\n        gl_FragColor.rgb = mix(reflColor, gl_FragColor.rgb, reflFactor);\n    }\n#endif\n\n}\n"