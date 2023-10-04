var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Container } from 'pixi.js';
import { Plugin } from '../core';
import { ResizePlugin, StagePlugin } from '../stage';
import { ScreenGroup } from './ScreenGroup';
export class ScreensPlugin extends Plugin {
    constructor(app, options) {
        super(app, options);
        this.screens = {};
        this.w = 0;
        this.h = 0;
        this.main = new ScreenGroup(app, options.main);
        this.overlay = new ScreenGroup(app, options.overlay);
        this.view = new Container();
        this.view.addChild(this.main.view);
        this.view.addChild(this.overlay.view);
        this.stack = [this.main, this.overlay];
    }
    prepare() {
        const resizer = this.app.get(ResizePlugin);
        const stage = this.app.get(StagePlugin);
        if (resizer) {
            resizer.onResize.connect(this.resize.bind(this));
            this.resize(resizer.w, resizer.h);
        }
        stage.mainContainer.addChild(this.view);
    }
    add(_screenClass, options, id, async = false) {
        this.main.add(_screenClass, options, id, async);
    }
    push(_screen) {
    }
    pop() {
    }
    goto(id, data = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.main.goto(id, data);
        });
    }
    resize(w, h) {
        this.w = w;
        this.h = h;
        this.stack.forEach((group) => {
            group.resize(w, h);
        });
    }
    update(dt) {
        this.stack.forEach((group) => {
            group.update(dt);
        });
    }
}
//# sourceMappingURL=ScreensPlugin.js.map