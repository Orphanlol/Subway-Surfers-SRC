import { Plugin } from '../core';
import { ResizePlugin } from './resize';
import { StagePlugin } from './StagePlugin';
export var Orientation;
(function (Orientation) {
    Orientation["LANDSCAPE"] = "landscape";
    Orientation["PORTRAIT"] = "portrait";
    Orientation["NONE"] = "none";
})(Orientation || (Orientation = {}));
export class OrientationPlugin extends Plugin {
    constructor(app, options) {
        super(app, options);
        this.orientation = (options === null || options === void 0 ? void 0 : options.orientation) || Orientation.NONE;
    }
    init() {
        if (this.orientation === Orientation.NONE)
            return;
        this._rotateImage = document.createElement('div');
        this._rotateImage.id = 'rotateImage';
        this._rotateImage.style.position = 'absolute';
        this._rotateImage.style.left = '0px';
        this._rotateImage.style.top = '0px';
        this._rotateImage.style.width = '100%';
        this._rotateImage.style.height = '100%';
        this._rotateImage.style.marginLeft = 'auto';
        this._rotateImage.style.marginRight = `${0}auto`;
        this._rotateImage.style.overflow = 'visible';
        this._rotateImage.style.display = 'none';
        this._rotateImage.style.zIndex = '1000';
        this._rotateImage.style.backgroundImage = this.options.imageUrl ? `url(${this.options.imageUrl})` : '';
        this._rotateImage.style.backgroundColor = this.options.backgroundColor || '#000000';
        this._rotateImage.style.backgroundPosition = '50% 50%';
        this._rotateImage.style.backgroundRepeat = 'no-repeat';
        this._rotateImage.style.backgroundSize = '100% auto';
        document.body.appendChild(this._rotateImage);
        this._canvas = this.app.get(StagePlugin).canvas;
        const resizePlugin = this.app.get(ResizePlugin);
        resizePlugin.onResize.connect(this._toggleRotate.bind(this));
        this._toggleRotate(resizePlugin.width, resizePlugin.height);
    }
    _toggleRotate(w, h) {
        const correctOrientation = this.orientation;
        const value = correctOrientation === Orientation.LANDSCAPE ? h >= w : w >= h;
        this._canvas.style.display = value ? 'none' : 'block';
        this._rotateImage.style.display = value ? 'block' : 'none';
        this.isCorrectOrientation = !value;
    }
}
//# sourceMappingURL=OrientationPlugin.js.map