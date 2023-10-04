export class Plugin {
    constructor(app, options) {
        var _a, _b;
        this.app = app;
        this.options = options || {};
        this.verbose = (_b = (_a = options.verbose) !== null && _a !== void 0 ? _a : app.verbose) !== null && _b !== void 0 ? _b : false;
    }
}
//# sourceMappingURL=Plugin.js.map