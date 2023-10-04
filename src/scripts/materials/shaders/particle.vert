export default "attribute vec3 aPosition;\nattribute vec3 aNormal;\nattribute vec2 aUv;\n\nuniform mat4 uProjectionMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uModelMatrix;\n\nvarying vec3 vNormal;\nvarying vec3 vPosition;\nvarying vec4 vScreenPosition;\n\n#ifdef MAP\nvarying vec2 vUv;\nuniform vec4 uMapFrame;\n#endif\n\n#HOOK_VERTEX_START\n\nvoid main() {\n\t\n#ifdef MAP\n\tvUv = (aUv * uMapFrame.zw ) + uMapFrame.xy;\n#endif\n    \n    #HOOK_VERTEX_MAIN\n\t\n    vec4 worldPosition =  uModelMatrix * vec4(aPosition, 1.0);\n\tvec4 worldViewPosition =  uProjectionMatrix * uViewMatrix * worldPosition;\n\tgl_Position = worldViewPosition;\n\t\n    #HOOK_VERTEX_END\n}"