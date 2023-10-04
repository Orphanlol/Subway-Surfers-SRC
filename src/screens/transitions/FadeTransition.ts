import { gsap } from 'gsap';
import { Graphics } from 'pixi.js';
export class FadeTransition {
    constructor(data = {}) {
        this.autoManageContainers = true;
        this.bg = new Graphics();
        this.bg.beginFill(data.color || 0x0);
        this.bg.drawRect(-4000, 4000, 8000, 8000);
        this.duration = data.duration || 0.5;
    }
    hide(container) {
        container.addChild(this.bg);
        return new Promise((resolve) => {
            this.bg.alpha = 0;
            gsap.to(this.bg, { duration: this.duration, alpha: 1, ease: 'power1.out', onComplete: () => {
                    container.removeChild(this.bg);
                    resolve();
                } });
        });
    }
    show(container) {
        container.addChild(this.bg);
        this.bg.alpha = 1;
        return new Promise((resolve) => {
            gsap.to(this.bg, { duration: this.duration, alpha: 0, ease: 'power1.in', onComplete: () => {
                    container.removeChild(this.bg);
                    resolve();
                } });
        });
    }
}
//# sourceMappingURL=FadeTransition.js.map