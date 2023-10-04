import { Signal } from 'typed-signals';
import { Plugin } from '../core';
export class VisibilityPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.onVisibilityChange = new Signal();
    }
    _handleVisibilityChange() {
        if (document.hidden) {
            this.onVisibilityChange.emit(false);
        }
        else {
            this.onVisibilityChange.emit(true);
        }
    }
    prepare() {
        document.addEventListener('visibilitychange', () => {
            this._handleVisibilityChange();
        });
    }
    start() {
        this._handleVisibilityChange();
    }
}
//# sourceMappingURL=VisibilityPlugin.js.map