import { Plugin } from '../core/app/Plugin';
import { Device } from '../utils/system/devices/Device';
import { KeyboardPlugin } from './KeyboardPlugin';
import { FixedNavigationPlugin } from './navigation-types/FixedNavigationPlugin';
import { SmartNavigationPlugin } from './navigation-types/SmartNavigationPlugin';
export class NavigationPlugin extends Plugin {
    constructor(app, options) {
        super(app, options);
        this._controller = null;
        this._enabled = Device.desktop;
        if (!this._enabled)
            return;
        if (options.navType === 'smart') {
            this._controller = app.add(SmartNavigationPlugin, options.controls);
        }
        else {
            this._controller = app.add(FixedNavigationPlugin, options.controls);
        }
        this._controller.keyboard = app.add(KeyboardPlugin);
        this._controller.buttonFocused.connect(() => this.addEvents.bind(this));
        this.root = options.root;
    }
    addEvents() {
        window.document.addEventListener('mousemove', this._onMouseInteract.bind(this));
        window.document.addEventListener('pointerdown', this._onMouseInteract.bind(this));
    }
    removeEvents() {
        window.document.removeEventListener('mousemove', this._onMouseInteract.bind(this));
        window.document.removeEventListener('pointerdown', this._onMouseInteract.bind(this));
    }
    _onMouseInteract() {
        if (!this._enabled)
            return;
        this.resetCurrentButton();
        this.removeEvents();
    }
    addButton(button) {
        if (!this._enabled)
            return;
        this._controller.addButton(button);
    }
    addGroup(buttons) {
        for (let i = 0; i < buttons.length; i++) {
            const element = buttons[i];
            this.addButton(element);
        }
    }
    resetCurrentButton() {
        if (!this._enabled)
            return;
        this._controller.reset();
        this.removeEvents();
    }
    forceNewButton(direction) {
        if (!this._enabled)
            return;
        this._controller.getClosestButton(direction);
    }
    set root(value) {
        if (!this._enabled)
            return;
        this._controller.root = value;
    }
    get root() {
        return this._controller.root;
    }
    set enabled(value) {
        if (!this._enabled)
            return;
        this._controller.enabled = value;
    }
    get enabled() {
        return this._controller.enabled;
    }
}
//# sourceMappingURL=NavigationPlugin.js.map