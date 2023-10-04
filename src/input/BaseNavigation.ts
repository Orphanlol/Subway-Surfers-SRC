import { gsap } from 'gsap';
import { Signal } from 'typed-signals';
import { Plugin } from '../core/app/Plugin';
export class BaseNavigation extends Plugin {
    constructor(app, options) {
        super(app, options);
        this.buttons = [];
        this._enabled = false;
        this.directions.left = options.controls.left || 'left';
        this.directions.right = options.controls.right || 'right';
        this.directions.up = options.controls.up || 'up';
        this.directions.down = options.controls.down || 'down';
        this.onSearchButton = new Signal();
    }
    set enabled(value) {
        this._enabled = value;
    }
    get enabled() {
        return this._enabled;
    }
    addButton(button) {
        if (this.buttons.includes(button)) {
            if (this.verbose)
                console.warn('This button is already stored');
            return;
        }
        this.buttons.push(button);
    }
    removeButton(button) {
        if (!this.buttons.includes(button))
            return;
        if (button === this.currentButton) {
            this.currentButtonRef.view.mouseout();
            this.currentButton = null;
        }
        this.buttons.splice(this.buttons.indexOf(button), 1);
    }
    init() {
        if (!this._enabled)
            return;
        const keys = Object.keys(this.directions);
        for (let i = 0; i < keys.length; i++) {
            const element = keys[i];
            this.keyboard.bindKeyDown(element, () => {
                this.onSearchButton.emit(element);
            });
        }
        const triggerButton = () => {
            this.currentButtonRef = this.currentButton;
            if (this.currentButtonRef && this.currentButtonRef.view && !this.currentButtonRef.view.ignoreNavigation) {
                this.currentButtonRef.view.click();
                this.currentButtonRef.view.mouseout();
                this.currentButtonRef.view.previousIgnoreState = !!this.currentButtonRef.view.ignoreNavigation;
                this.currentButtonRef.view.ignoreNavigation = true;
                gsap.delayedCall(0.1, () => {
                    this.currentButtonRef.view.pointerover();
                    this.currentButtonRef.view.ignoreNavigation = this.currentButtonRef.view.previousIgnoreState || false;
                    this.currentButtonRef = null;
                });
            }
        };
        this.keyboard.bindKeyDown('enter', triggerButton);
        this.keyboard.bindKeyDown('space', triggerButton);
    }
    focusedButton(button) {
        if (this.currentButton)
            this.currentButton.view.mouseout();
        this.currentButton = button;
        button.view.pointerover();
        this.buttonFocused.emit();
    }
    checkViable(displayObject, isViable = true) {
        const parent = displayObject.parent;
        if (!parent || !displayObject.visible || displayObject.alpha === 0) {
            return false;
        }
        if (parent === this.root) {
            return isViable;
        }
        return this.checkViable(parent);
    }
    reset() {
        if (!this.currentButton)
            return;
        this.currentButton.view.mouseout();
        this.currentButton = null;
        if (this.currentButtonRef) {
            this.currentButtonRef.view.mouseout();
            this.currentButtonRef = null;
        }
    }
}
//# sourceMappingURL=BaseNavigation.js.map