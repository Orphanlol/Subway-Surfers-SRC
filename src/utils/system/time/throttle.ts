const throttleMap = new Map();
export function throttle(fun, delay = 100, scope) {
    if (!throttleMap.has(fun)) {
        let timerId;
        const throttledFunction = (...args) => {
            throttleMap.get(fun).args = args;
            if (timerId)
                return;
            const callFun = () => {
                timerId = null;
                const latestArgs = throttleMap.get(fun).args;
                if (scope) {
                    fun.call(scope, ...latestArgs);
                }
                else {
                    fun(...latestArgs);
                }
            };
            if (delay === 0) {
                callFun();
            }
            else {
                timerId = setTimeout(callFun, delay);
            }
        };
        throttleMap.set(fun, { throttledFunction, args: null });
    }
    return throttleMap.get(fun).throttledFunction;
}
//# sourceMappingURL=throttle.js.map