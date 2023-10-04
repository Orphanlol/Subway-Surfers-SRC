var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Wait {
    constructor() {
        this._callbacks = new Set();
    }
    for(delay) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.then(resolve, delay);
            });
        });
    }
    then(callback, delay) {
        return this._addBinding(callback, delay, 1);
    }
    thenRepeat(callback, delay, loops = Infinity) {
        return this._addBinding(callback, delay, loops);
    }
    update(dt = 1) {
        this._callbacks.forEach((callback) => {
            callback.delayRemaining -= dt;
            if (callback.delayRemaining <= 0) {
                this._executeCallback(callback);
            }
        });
    }
    clear() {
        this._callbacks.clear();
    }
    _addBinding(callback, delay, loops = 1) {
        const data = {
            callback,
            delay,
            delayRemaining: delay,
            loops,
            loopsRemaining: loops,
        };
        this._callbacks.add(data);
        return {
            cancel: () => {
                this._cancelCallback(data);
            },
            reset: (resetLoops) => {
                this._resetCallback(data, resetLoops);
            },
            execute: () => {
                this._executeCallback(data);
            },
        };
    }
    _executeCallback(callback) {
        if (callback.loopsRemaining) {
            callback.loopsRemaining--;
            callback.callback();
            if (callback.loopsRemaining) {
                this._resetCallback(callback, false);
            }
            else {
                this._cancelCallback(callback);
            }
        }
    }
    _resetCallback(callback, resetLoops = false) {
        callback.delayRemaining = callback.delay;
        if (resetLoops) {
            callback.loopsRemaining = callback.loops;
        }
    }
    _cancelCallback(callback) {
        this._callbacks.delete(callback);
    }
}
//# sourceMappingURL=Wait.js.map