export class URLParamsClass {
    constructor() {
        this._params = this._getParams();
    }
    get(key) {
        if (this._params.has(key)) {
            return this._params.get(key);
        }
        return null;
    }
    getAll() {
        return this._params;
    }
    _getParams() {
        const url = location.search;
        const items = url.slice(url.indexOf('?') + 1).split('&');
        const params = new Map();
        for (const item of items) {
            const split = item.split('=');
            const k = split[0];
            let v = split[1];
            if (v === undefined)
                continue;
            if (v === 'true' || v === 'false')
                v = v === 'true';
            if (typeof (v) === 'string') {
                params.set(k, v.match(/^[-.0-9]+$/) ? parseFloat(v) : v);
            }
            else {
                params.set(k, v);
            }
        }
        return params;
    }
}
const URLParams = new URLParamsClass();
export { URLParams, };
//# sourceMappingURL=URLParams.js.map