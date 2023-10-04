export class PromiseQueue {
    constructor(maxConcurrency = PromiseQueue.MAX_CONCURRENCY) {
        this._queue = [];
        this._isActive = false;
        this._activePromises = 0;
        this._maxConcurrency = maxConcurrency;
    }
    promise(creator, scope, ...args) {
        let resolve;
        let reject;
        const promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        this._queue.push({
            creator,
            scope,
            args,
            resolve,
            reject,
            promise,
        });
        if (!this._isActive) {
            this.next();
        }
        return promise;
    }
    next() {
        while (this._queue.length > 0 && this._activePromises < this._maxConcurrency) {
            this._activePromises++;
            this._isActive = true;
            const item = this._queue.shift();
            item.creator.call(item.scope, ...item.args)
                .then((value) => {
                item.resolve(value);
                this._activePromises--;
                this.next();
            }).catch((error) => {
                item.reject(error);
                this._activePromises--;
                this.next();
            });
        }
        if (this._queue.length === 0) {
            this._isActive = false;
        }
    }
}
PromiseQueue.MAX_CONCURRENCY = 6;
//# sourceMappingURL=PromiseQueue.js.map