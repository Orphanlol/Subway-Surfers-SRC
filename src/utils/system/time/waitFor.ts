export function waitFor(delay = 1000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}
//# sourceMappingURL=waitFor.js.map