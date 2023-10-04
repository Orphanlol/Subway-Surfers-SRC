import { TweenLite } from 'gsap';
import { Container } from 'pixi.js';
import { Bar } from './temp-ui/Bar';
export class LoaderScreen {
    constructor() {
        this.view = new Container();
        this.bar = new Bar({ bg: 0x000000, bar: 0xFF0000, width: 300 });
        this.view.addChild(this.bar);
    }
    updateProgress(value) {
        this.bar.ratio = value;
    }
    show() {
        this.view.alpha = 0;
        TweenLite.to(this.view, 0.4, { alpha: 1 });
    }
    hide() {
        return new Promise((resolve) => {
            TweenLite.to(this.view, 0.4, { alpha: 0, onComplete: resolve });
        });
    }
    resize(w, h) {
        this.bar.x = (w / 2) - (this.bar.barWidth / 2);
        this.bar.y = h / 2;
    }
}
//# sourceMappingURL=LoaderScreen.js.map