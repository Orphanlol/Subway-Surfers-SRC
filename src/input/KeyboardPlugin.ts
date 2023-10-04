import { Plugin } from '../core/app/Plugin';
const aliases = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    space: ' ',
};
export class KeyBindingCollection {
    constructor() {
        this.map = {};
    }
    add(binding) {
        Object.entries(aliases).forEach(([key, value]) => {
            if (key === binding.key) {
                binding.key = value;
            }
        });
        const list = this.map[binding.key] || [];
        list.push(binding);
        this.map[binding.key] = list;
    }
    remove(binding) {
        const list = this.map[binding.key];
        if (!list)
            return;
        const index = list.indexOf(binding);
        if (index < 0)
            return;
        list.splice(index, 1);
    }
    bindingsByKey(key) {
        return this.map[key] || [];
    }
}
export class KeyboardPlugin extends Plugin {
    constructor(app, options) {
        super(app, options);
        this.enabled = true;
        this._onKeyDown = (e) => {
            if (!this.enabled || e.repeat)
                return;
            const key = e.key;
            const bindings = this._keyDownBindings.bindingsByKey(key);
            for (const binding of bindings) {
                if (binding.action)
                    binding.action();
                binding.isDown = true;
            }
        };
        this._onKeyUp = (e) => {
            if (!this.enabled || e.repeat)
                return;
            const key = e.key;
            let bindings = this._keyUpBindings.bindingsByKey(key);
            for (const binding of bindings) {
                if (binding.action)
                    binding.action();
                binding.isDown = false;
            }
            bindings = this._keyDownBindings.bindingsByKey(key);
            for (const binding of bindings) {
                binding.isDown = false;
            }
        };
        this._keyDownBindings = new KeyBindingCollection();
        this._keyUpBindings = new KeyBindingCollection();
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }
    dispose() {
        this._keyDownBindings.map = {};
        this._keyUpBindings.map = {};
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }
    bindKeyDown(key, action, options) {
        if (typeof key === 'string') {
            return this._bindKeyDown(key, action, options);
        }
        return key.map((singleKey) => this._bindKeyDown(singleKey, action, options));
    }
    _bindKeyDown(key, action, options) {
        const allowHold = (options === null || options === void 0 ? void 0 : options.allowHold) || false;
        const currentHoldTime = (options === null || options === void 0 ? void 0 : options.holdTime) || 0.1;
        const binding = { key, action, allowHold, currentHoldTime, holdTime: currentHoldTime };
        this._keyDownBindings.add(binding);
        return binding;
    }
    bindKeyUp(key, action) {
        if (typeof key === 'string') {
            return this._bindKeyUp(key, action);
        }
        return key.map((singleKey) => this.bindKeyUp(singleKey, action));
    }
    _bindKeyUp(key, action) {
        const binding = { key, action };
        this._keyDownBindings.add(binding);
        return binding;
    }
    unbind(binding) {
        this._keyDownBindings.remove(binding);
        this._keyUpBindings.remove(binding);
    }
    update(dt) {
        const bindings = this._keyDownBindings.map;
        for (const key in bindings) {
            const bind = bindings[key];
            for (let i = 0; i < bind.length; i++) {
                const element = bind[i];
                if (element.allowHold && element.isDown) {
                    if (element.currentHoldTime >= 0) {
                        element.currentHoldTime -= dt / 60;
                    }
                    else {
                        element.currentHoldTime = element.holdTime;
                        if (element.action)
                            element.action();
                    }
                }
            }
        }
    }
    getBindings(key) {
        return this._keyDownBindings.bindingsByKey(key);
    }
    isKeyDown(key) {
        if (typeof key === 'string') {
            return this._isKeyDown(key);
        }
        const array = key.map((singleKey) => this._isKeyDown(singleKey));
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (element === true) {
                return true;
            }
        }
        return false;
    }
    _isKeyDown(key) {
        let isDown = false;
        const bindings = this.getBindings(key);
        if (!bindings)
            return false;
        for (const key in bindings) {
            const bind = bindings[key];
            if (bind.isDown) {
                isDown = true;
                break;
            }
        }
        return isDown;
    }
}
//# sourceMappingURL=KeyboardPlugin.js.map