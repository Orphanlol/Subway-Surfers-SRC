import { Point } from 'pixi.js';
import { BaseNavigation } from '../BaseNavigation';
export class SmartNavigationPlugin extends BaseNavigation {
    constructor(app, options) {
        super(app, options);
        this.onSearchButton.connect((direction) => this.getClosestButton.bind(this)(direction));
        this._currentPoint = new Point();
        this._otherPoint = new Point();
    }
    _getFirst() {
        let closestDistance = 999999;
        let firstObject = null;
        for (let i = 0; i < this.buttons.length; i++) {
            const element = this.buttons[i];
            const viable = this.checkViable(element.view);
            if (viable) {
                const globalPos = element.view.toGlobal(this._currentPoint);
                const x = globalPos.x * globalPos.x;
                const y = globalPos.y * globalPos.y;
                const distance = Math.sqrt(x + y);
                if (distance < closestDistance) {
                    firstObject = element;
                    closestDistance = distance;
                }
            }
        }
        return firstObject;
    }
    getClosestButton(direction) {
        if (this.buttons.length < 1)
            this.focusedButton(null);
        if (!this.currentButton) {
            this.focusedButton(this._getFirst());
        }
        const currentPos = this.currentButton.view.toGlobal(this._currentPoint);
        let closest = null;
        let otherPos = null;
        let value = 9999;
        const availableButtons = [];
        for (let i = 0; i < this.buttons.length; i++) {
            const element = this.buttons[i];
            if (this.currentButton === element || element.ignoreNavigation || !this.checkViable(element.view))
                continue;
            otherPos = element.view.toGlobal(this._otherPoint);
            element.otherPos = otherPos;
            switch (direction) {
                case 'left':
                    if (otherPos.x < currentPos.x) {
                        availableButtons.push(element);
                    }
                    break;
                case 'right':
                    if (otherPos.x > currentPos.x) {
                        availableButtons.push(element);
                    }
                    break;
                case 'up':
                    if (otherPos.y < currentPos.y) {
                        availableButtons.push(element);
                    }
                    break;
                case 'down':
                    {
                        if (otherPos.y > currentPos.y) {
                            availableButtons.push(element);
                        }
                        break;
                    }
                default:
                    break;
            }
        }
        for (let j = 0; j < availableButtons.length; j++) {
            const element = availableButtons[j];
            const distance = Math.sqrt(((currentPos.x - element.otherPos.x) * (currentPos.x - element.otherPos.x))
                + ((currentPos.y - element.otherPos.y) * (currentPos.y - element.otherPos.y)));
            if (distance < value) {
                value = distance;
                closest = element;
            }
        }
        this.focusedButton(closest);
    }
}
//# sourceMappingURL=SmartNavigationPlugin.js.map