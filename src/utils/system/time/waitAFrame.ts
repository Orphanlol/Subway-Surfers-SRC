export function waitAFrame(framesToWait = 2) {
    return new Promise((resolve) => {
        let framesPassed = 0;
        const checkFrame = () => {
            framesPassed++;
            if (framesPassed >= framesToWait) {
                resolve();
            }
            else {
                requestAnimationFrame(checkFrame);
            }
        };
        requestAnimationFrame(checkFrame);
    });
}
//# sourceMappingURL=waitAFrame.js.map