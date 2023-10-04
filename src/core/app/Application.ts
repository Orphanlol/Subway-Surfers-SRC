var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Runner, Ticker } from 'pixi.js';
import { Device, promiseRunner } from '../../utils';
export class Application {
    constructor(config = {}) {
        var _a;
        this._defaultPluginName = 'default';
        this.runners = [];
        this.initRunner = this.addRunner('init');
        this.prepareRunner = this.addRunner('prepare');
        this.startRunner = this.addRunner('start');
        this.updateRunner = this.addRunner('update');
        this.config = config;
        this.verbose = (_a = this.config.verbose) !== null && _a !== void 0 ? _a : false;
        this.plugins = new Map();
        this.pluginDefaults = new Map();
    }
    add(PluginClass, options) {
        options = options || {};
        const name = options.name;
        const nameToRegister = name !== null && name !== void 0 ? name : this._defaultPluginName;
        options = Object.assign(options, this.config[name] || {});
        const plugin = new PluginClass(this, options);
        const classPlugins = this.plugins.get(PluginClass) || {};
        if (classPlugins[nameToRegister]) {
            throw new Error(`app plugin ${nameToRegister} already exists`);
        }
        classPlugins[nameToRegister] = plugin;
        if (!this.pluginDefaults.get(PluginClass)) {
            this.pluginDefaults.set(PluginClass, nameToRegister);
        }
        this.runners.forEach((runner) => {
            runner.add(plugin);
        });
        this.plugins.set(PluginClass, classPlugins);
        return plugin;
    }
    get(pluginClass, name) {
        const pluginName = name !== null && name !== void 0 ? name : this.pluginDefaults.get(pluginClass);
        return this.plugins.get(pluginClass)[pluginName];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Device.init();
            yield promiseRunner(this.initRunner);
            Ticker.system.add(this.update, this);
            yield promiseRunner(this.prepareRunner);
            yield promiseRunner(this.startRunner);
        });
    }
    update(dt) {
        this.updateRunner.emit(dt);
    }
    addRunner(name) {
        const runner = new Runner(name);
        this.runners.push(runner);
        return runner;
    }
}
//# sourceMappingURL=Application.js.map