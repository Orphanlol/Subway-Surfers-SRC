import { gsap } from 'gsap';
export class AlphaTransition {
    constructor(data = {}) {
        this.autoManageContainers = true;
        this.duration = data.duration || 0.75;
    }
    hide(_container, current) {
        return new Promise((resolve) => {
            gsap.to(current.view, { duration: 0.4, alpha: 0, onComplete: () => {
                    resolve();
                } });
        });
    }
    show(_container, _current, next) {
        return new Promise((resolve) => {
            next.view.alpha = 0;
            gsap.to(next.view, { duration: 0.4, alpha: 1, onComplete: () => {
                    resolve();
                } });
        });
    }
}
//# sourceMappingURL=AlphaTransition.js.map