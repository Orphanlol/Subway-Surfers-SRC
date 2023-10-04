import { Plugin } from '../core';
export class VersionPlugin extends Plugin {
    constructor(app, options) {
        super(app, options);
        try {
            options.version = VERSION;
        }
        catch (e) {
            console.warn('[VersionPlugin] VERSION not correctly injected');
        }
        this._version = options.version;
        this._view = options.view || document.body;
    }
    prepare() {
        this._versionElement = document.createElement('div');
        this._versionElement.style.position = 'fixed';
        this._versionElement.style.left = '0px';
        this._versionElement.style.bottom = '0px';
        this._versionElement.style.zIndex = '10000000';
        this._versionElement.style.color = '#1AB9C2';
        this._versionElement.innerText = `v${this._version}`;
        this._versionElement.style.background = '#1A304B';
        this._versionElement.style.border = 'solid #1A1A39';
        this._versionElement.style.fontFamily = 'Lucida Console';
        this._versionElement.style.fontWeight = 'bold';
        this._versionElement.style.padding = '5px';
        this._versionElement.style.userSelect = 'none';
        this._versionElement.style.opacity = '1';
        this._versionElement.setAttribute('aria-hidden', 'true');
        this._versionElement.tabIndex = -1;
        this._view.appendChild(this._versionElement);
        this._versionElement.addEventListener('pointerdown', this.toggleView.bind(this));
    }
    toggleView() {
        if (this._versionElement.style.opacity === '1') {
            this._versionElement.style.opacity = '0';
        }
        else {
            this._versionElement.style.opacity = '1';
        }
    }
    get enabled() {
        return this._versionElement.style.opacity === '1';
    }
    set enabled(value) {
        this._versionElement.style.opacity = value ? '1' : '0';
    }
}
//# sourceMappingURL=VersionPlugin.js.map