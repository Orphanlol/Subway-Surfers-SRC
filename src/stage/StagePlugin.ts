import { Container, PRECISION, Renderer, settings } from 'pixi.js';
import { Plugin } from '../core';
import { autoDetectAntialias, autoDetectResolution, autoDetectTransparency, Device } from '../utils';
if (Device.android) {
    settings.PRECISION_FRAGMENT = PRECISION.LOW;
    settings.PRECISION_VERTEX = PRECISION.HIGH;
}
else if (Device.ios) {
    settings.PRECISION_FRAGMENT = PRECISION.HIGH;
    settings.PRECISION_VERTEX = PRECISION.HIGH;
}
export class StagePlugin extends Plugin {
    constructor(app, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        super(app, options);
        options.resolution = (_a = options.resolution) !== null && _a !== void 0 ? _a : autoDetectResolution();
        options.antialias = (_b = options.antialias) !== null && _b !== void 0 ? _b : autoDetectAntialias();
        options.powerPreference = (_c = options.powerPreference) !== null && _c !== void 0 ? _c : 'high-performance';
        options.transparent = (_d = options.transparent) !== null && _d !== void 0 ? _d : autoDetectTransparency();
        this.canvas = options.view = options.view || this._setupCanvas();
        if ((_e = options.autoAddToDocument) !== null && _e !== void 0 ? _e : true) {
            document.body.appendChild(options.view);
        }
        this.renderer = new Renderer(options);
        this.renderer.plugins.accessibility.debug = (_f = options.accessibilityDebug) !== null && _f !== void 0 ? _f : false;
        this.stage = new Container();
        this.mainContainer = new Container();
        this.overlayContainer = new Container();
        this.stage.addChild(this.mainContainer);
        this.stage.addChild(this.overlayContainer);
        this.useHalfFPS = (_g = options.useHalfFPS) !== null && _g !== void 0 ? _g : false;
        this._halfTick = 0;
        if ((_h = options.alwaysOnAccessibility) !== null && _h !== void 0 ? _h : false) {
            this.renderer.plugins.accessibility._isMobileAccessibility = true;
            this.renderer.plugins.accessibility.activate();
            this.renderer.plugins.accessibility.destroyTouchHook();
        }
    }
    _setupCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'pixi-canvas';
        canvas.style.position = 'absolute';
        canvas.style.left = '0px';
        canvas.style.right = '0px';
        canvas.style.top = '0px';
        canvas.style.bottom = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.overflow = 'visible';
        canvas.style.display = 'block';
        return canvas;
    }
    start() {
        this.app.updateRunner.remove(this.update);
        this.app.updateRunner.add(this.update);
    }
    update(dt) {
        if (!Device.ios || dt > 0.8) {
            this._halfTick++;
            if (!this.useHalfFPS || this._halfTick % 2) {
                this.renderer.render(this.stage);
            }
        }
    }
    get view() {
        return this.renderer.view;
    }
    set interactive(value) {
        this.stage.interactive = value;
        this.stage.interactiveChildren = value;
    }
    get interactive() {
        return this.stage.interactive;
    }
}
//# sourceMappingURL=StagePlugin.js.map