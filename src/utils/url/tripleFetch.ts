var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const DEFAULT_RETRY_VALUES = [404, 403, 423, 500, 503, 504];
export function tripleFetch(input, init, retryStatus = DEFAULT_RETRY_VALUES) {
    return new Promise((resolve, reject) => {
        let attempt = 0;
        const attemptFetch = () => __awaiter(this, void 0, void 0, function* () {
            attempt++;
            let response;
            let error;
            try {
                response = yield fetch(`${input}`, init);
            }
            catch (e) {
                error = e;
                console.warn('[tripleFetch] fetch failed...');
            }
            if (!response || (response && (retryStatus.indexOf(response.status) !== -1 || !response.ok))) {
                if (attempt >= 3) {
                    if (!response) {
                        reject(error);
                    }
                    else {
                        resolve(response);
                    }
                }
                else {
                    console.warn(`[tripleFetch] fetch failed, trying again`);
                    attemptFetch();
                }
            }
            else {
                resolve(response);
            }
        });
        attemptFetch();
    });
}
//# sourceMappingURL=tripleFetch.js.map