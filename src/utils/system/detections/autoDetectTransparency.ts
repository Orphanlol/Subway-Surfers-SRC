export function autoDetectTransparency() {
    const canvas = document.createElement('canvas');
    let gl;
    let debugInfo;
    let renderer;
    let transparent = false;
    try {
        gl = canvas.getContext('webgl');
        debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const sub = renderer.substring(0, 8);
        if (sub === 'Mali-400' || sub === 'Mali-450') {
            transparent = true;
        }
    }
    catch (e) {
        console.warn('WebGL or renderer info not supported!');
    }
    return transparent;
}
//# sourceMappingURL=autoDetectTransparency.js.map