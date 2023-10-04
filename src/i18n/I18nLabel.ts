import { Container, Sprite, Text, Texture } from 'pixi.js';
import { i18n } from './I18n';
export class I18nLabel extends Container {
    constructor(id, options) {
        super();
        this.onLanguageUpdate = () => this.refresh();
        this.id = id;
        this.options = options;
        i18n.onUpdate.connect(this.onLanguageUpdate);
        this.refresh();
    }
    destroy() {
        var _a;
        i18n.onUpdate.disconnect(this.onLanguageUpdate);
        (_a = this.display) === null || _a === void 0 ? void 0 : _a.destroy();
        super.destroy();
    }
    refresh() {
        var _a, _b;
        const entry = i18n.getEntry(this.id);
        switch (entry.type) {
            case 'image':
                this.updateImage(entry);
                break;
            default:
                this.updateText(entry);
        }
        this.display.x = entry.offsetX;
        this.display.y = entry.offsetY;
        this.display.anchor.x = (_a = this.options.anchorX) !== null && _a !== void 0 ? _a : this.display.anchor.x;
        this.display.anchor.y = (_b = this.options.anchorY) !== null && _b !== void 0 ? _b : this.display.anchor.y;
        this.display.scale.set(entry.scale);
    }
    updateText(entry) {
        if (entry.type !== 'text')
            return;
        const text = this.ensureDisplay(Text);
        text.text = i18n.format(entry.text, this.options.params);
        Object.assign(text.style, this.options);
        if (entry.fontName)
            text.style.fontFamily = entry.fontName;
    }
    updateImage(entry) {
        if (entry.type !== 'image')
            return;
        const image = this.ensureDisplay(Sprite);
        const name = i18n.format(entry.text, this.options.params);
        const texture = Texture.from(name);
        if (!texture)
            throw new Error(`[I18nLabel] Missing texture: ${name}`);
        image.texture = texture;
    }
    ensureDisplay(DisplayClass) {
        var _a, _b, _c;
        if (((_a = this.display) === null || _a === void 0 ? void 0 : _a.constructor) !== DisplayClass) {
            (_b = this.display) === null || _b === void 0 ? void 0 : _b.parent.removeChild(this.display);
            (_c = this.display) === null || _c === void 0 ? void 0 : _c.destroy();
            this.display = new DisplayClass();
            this.addChild(this.display);
        }
        return this.display;
    }
}
//# sourceMappingURL=I18nLabel.js.map