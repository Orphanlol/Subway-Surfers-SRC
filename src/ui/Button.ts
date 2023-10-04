import { Signal } from 'typed-signals';
import { Device } from '../utils';
export class Button {
    constructor(view, options) {
        var _a;
        this.view = view;
        this._enabled = true;
        this.onPress = new Signal();
        this.onDown = new Signal();
        this.onUp = new Signal();
        this.onHover = new Signal();
        this.onOut = new Signal();
        this.onUpOut = new Signal();
        this.accessible = (_a = options.accessible) !== null && _a !== void 0 ? _a : true;
        view.accessible = this.accessible;
        view.accessibleTitle = options.accessibleTitle;
        view.tabIndex = options.tabIndex;
        view.on('pointerdown', () => {
            this._isDown = true;
            this.onDown.emit(this);
        });
        view.on('pointerup', () => {
            this._processUp();
        });
        view.on('pointerupoutside', () => {
            this._processUpOut();
        });
        view.on('pointertap', () => {
            this._isDown = false;
            this.onPress.emit(this);
        });
        view.on('pointerover', () => {
            this.onHover.emit(this);
        });
        view.on('pointerout', () => {
            this._processOut();
        });
        this.onDown.connect(() => {
            this.down();
        });
        this.onUp.connect(() => {
            this.up();
        });
        this.onUpOut.connect(() => {
            this._upOut();
        });
        if (Device.desktop) {
            this.onHover.connect(() => {
                this.hover();
            });
        }
        this.onOut.connect(() => {
            this._out();
        });
        this._isDown = false;
        this.enabled = true;
    }
    down() {
    }
    up() {
    }
    hover() {
    }
    get isDown() {
        return this._isDown;
    }
    set enabled(value) {
        this._enabled = value;
        this.view.interactive = value;
        this.view.buttonMode = value;
        this.view.accessible = (this.accessible && value);
        if (!value) {
            this._processUp();
        }
    }
    get enabled() {
        return this._enabled;
    }
    set shown(value) {
        this._shown = value;
        this.enabled = value;
        this.view.visible = value;
    }
    get shown() {
        return this._shown;
    }
    _processUp() {
        if (this._isDown) {
            this.onUp.emit(this);
        }
        this._isDown = false;
    }
    _processUpOut() {
        if (this._isDown) {
            this.onUpOut.emit(this);
        }
        this._isDown = false;
    }
    _processOut() {
        this.onOut.emit();
        this._isDown = false;
    }
    _upOut() {
        this.up();
    }
    _out() {
        this.up();
    }
}
//# sourceMappingURL=Button.js.map