import { Signal } from 'typed-signals';
import { Plugin } from '../../core';
import { Device, throttle } from '../../utils';
import { StagePlugin } from '../StagePlugin';
import { resizeDefault } from './resizeDefault';
export class ResizePlugin extends Plugin {
    constructor(app, options) {
        var _a;
        super(app, options);
        this.onResize = new Signal();
        this._w = 0;
        this._h = 0;
        this.autoResize = (_a = options.autoResize) !== null && _a !== void 0 ? _a : true;
        this.resizeFunction = (options === null || options === void 0 ? void 0 : options.resizeFunction) || resizeDefault;
    }
    prepare() {
        if (this.autoResize) {
            window.addEventListener('resize', () => {
                throttle(this.resize, Device.desktop ? 0 : 100, this)(window.innerWidth, window.innerHeight);
            });
            this.resize(window.innerWidth, window.innerHeight);
        }
    }
    set resolution(value) {
        const renderer = this.app.get(StagePlugin).renderer;
        renderer.resolution = value;
        this.resize(this._w, this._h, true);
    }
    get resolution() {
        const renderer = this.app.get(StagePlugin).renderer;
        return renderer.resolution;
    }
    resize(w, h, force = false) {
        const renderer = this.app.get(StagePlugin).renderer;
        const newSize = this.resizeFunction(w, h);
        if (force || this._w !== newSize.rendererWidth || this._h !== newSize.rendererHeight) {
            this._w = newSize.rendererWidth;
            this._h = newSize.rendererHeight;
            const canvas = this.app.get(StagePlugin).canvas;
            canvas.style.width = `${newSize.canvasWidth}px`;
            canvas.style.height = `${newSize.canvasHeight}px`;
            window.scrollTo(0, 0);
            renderer.resize(this.w, this.h);
            this.onResize.emit(this.w, this.h);
        }
    }
    get w() {
        return this._w;
    }
    get h() {
        return this._h;
    }
    get width() {
        return this._w;
    }
    get height() {
        return this._h;
    }
}
//# sourceMappingURL=ResizePlugin.js.map