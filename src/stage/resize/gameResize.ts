export function gameResize(logicalWidth, logicalHeight) {
    return (w, h) => {
        if (w > h) {
            const ratioW = w / logicalWidth;
            const ratioH = logicalHeight / h;
            return {
                rendererWidth: Math.round(Math.floor((logicalWidth * ratioW) * ratioH)),
                rendererHeight: logicalHeight,
                canvasWidth: w,
                canvasHeight: h,
            };
        }
        const ratioW = logicalWidth / w;
        const ratioH = h / logicalHeight;
        return {
            rendererWidth: logicalWidth,
            rendererHeight: Math.round(Math.floor((logicalHeight * ratioH) * ratioW)),
            canvasWidth: w,
            canvasHeight: h,
        };
    };
}
//# sourceMappingURL=gameResize.js.map