import { Device } from '../../utils';
import CentralCore from './CentralCore';
import CentralWorker from './CentralDispatch.worker.js';
let UUID = 0;
const MAX_WORKERS = navigator.hardwareConcurrency || 4;
class CentralDispatchClass {
    constructor() {
        this.workerPool = [];
        this.queue = [];
        for (let i = 0; i < MAX_WORKERS; i++) {
            this.workerPool.push(new CentralWorker());
        }
        for (const i in CentralCore) {
            this[i] = (...args) => this._run(i, args);
        }
        this.resolveHash = {};
        this.useWorkers = !Device.ie;
        if (this.useWorkers) {
            for (let i = 0; i < MAX_WORKERS; i++) {
                const worker = this.workerPool[i];
                worker.addEventListener('message', (event) => {
                    this.complete(event.data);
                    this.workerPool.push(event.target);
                    this.next();
                });
            }
        }
    }
    complete(data) {
        const result = data.data;
        this.resolveHash[data.uuid](result);
        this.resolveHash[data.uuid] = null;
    }
    _run(id, args) {
        if (this.useWorkers) {
            const promise = new Promise((resolve) => {
                this.queue.push({ id, arguments: args, resolve });
            });
            this.next();
            return promise;
        }
        return CentralCore[id](...args);
    }
    next() {
        if (!this.queue.length)
            return;
        const worker = this.workerPool.pop();
        if (!worker) {
            return;
        }
        const toDo = this.queue.pop();
        const id = toDo.id;
        this.resolveHash[UUID] = toDo.resolve;
        worker.postMessage({
            data: toDo.arguments,
            uuid: UUID++,
            id,
        });
    }
}
const CentralDispatch = new CentralDispatchClass();
export { CentralDispatch, };
//# sourceMappingURL=CentralDispatch.js.map