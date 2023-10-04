var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import 'regenerator-runtime/runtime';
import CentralCore from './CentralCore';
import { collectTransferables } from './utils/collectTransferables';
self.addEventListener('message', (event) => __awaiter(void 0, void 0, void 0, function* () {
    const command = CentralCore[event.data.id];
    if (command) {
        const args = event.data.data;
        try {
            const result = yield command(...args);
            const transferables = collectTransferables(result);
            self.postMessage({
                data: result,
                uuid: event.data.uuid,
                id: event.data.id,
            }, transferables);
        }
        catch (e) {
            self.postMessage({
                data: null,
                uuid: event.data.uuid,
                id: event.data.id,
            });
        }
    }
    else {
        throw new Error('command does not exist on worker..');
    }
}));
//# sourceMappingURL=CentralDispatch.worker.js.map