import { Container, Graphics, Sprite } from 'pixi.js';
export class Bar extends Container {
    constructor(options = {}) {
        var _a, _b, _c;
        super();
        this.barWidth = (_a = options.width) !== null && _a !== void 0 ? _a : 100;
        const bg = this.getPixiObject(options.bg, this.barWidth);
        const frame = this.getPixiObject(options.frame, this.barWidth);
        const bar = this.getPixiObject((_b = options.bar) !== null && _b !== void 0 ? _b : 0xFF0000, this.barWidth);
        if (options.frameTint !== undefined) {
            frame.tint = 0x3f3f3f;
        }
        this._easing = (_c = options.easing) !== null && _c !== void 0 ? _c : 1;
        this._easeRatio = 0;
        this._ratio = 0;
        if (bg) {
            this.bg = bg;
            this.addChild(bg);
        }
        if (bar) {
            this.addChild(bar);
            this.bar = bar;
        }
        if (frame) {
            if (frame.width > bar.width) {
                frame.x = -(frame.width - bar.width) / 2;
            }
            if (frame.height > bar.height) {
                frame.y = -(frame.height - bar.height) / 2;
            }
            this.addChild(frame);
        }
        const mask = this.getPixiObject(options.mask, this.barWidth);
        if (mask) {
            this._barMask = mask;
            this.addChild(this._barMask);
            this.bar.mask = this._barMask;
            this._barMask.x -= this.bar.width;
        }
    }
    updateTransform() {
        this._easeRatio += (this._ratio - this._easeRatio) * this._easing;
        if (this.bar && !this._barMask) {
            this.bar.scale.x = this._easeRatio;
        }
        else if (this._barMask) {
            this._barMask.x = -this._barMask.width + ((this._barMask.width / 100) * (this._easeRatio * 100));
        }
        this.containerUpdateTransform();
    }
    getPixiObject(id, width) {
        let item = null;
        if (typeof id === 'number') {
            item = new Graphics()
                .beginFill(id)
                .drawRect(0, 0, width, 40);
        }
        else if (typeof id === 'string') {
            item = Sprite.from(id);
        }
        else {
            item = id;
        }
        return item;
    }
    set ratio(value) {
        this._ratio = Math.max(Math.min(value, 1), 0);
    }
    get ratio() {
        return this._ratio;
    }
}
//# sourceMappingURL=Bar.js.map