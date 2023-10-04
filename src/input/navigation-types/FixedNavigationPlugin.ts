import { BaseNavigation } from '../BaseNavigation';
export class FixedNavigationPlugin extends BaseNavigation {
    constructor(app, options) {
        super(app, options);
        this.onSearchButton.connect((direction) => this.getClosestButton.bind(this)(direction));
    }
    _getFirst() {
        let value = 99999;
        let firstObject = null;
        for (let i = 0; i < this.buttons.length; i++) {
            const element = this.buttons[i];
            const viable = this.checkViable(element.view);
            if (viable) {
                element.view.mouseout();
                const movementIndex = element.view.navigationIndex || element.view.tabIndex;
                if (!isNaN(movementIndex)) {
                    if (movementIndex < value) {
                        value = movementIndex;
                        firstObject = element;
                    }
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
        const currentIndex = this.currentButton.view.navigationIndex || this.currentButton.view.tabIndex;
        let nextIndex = currentIndex;
        let closest = null;
        let value = 99999;
        switch (direction) {
            case 'left':
                nextIndex--;
                break;
            case 'right':
                nextIndex++;
                break;
            default:
                break;
        }
        for (let i = 0; i < this.buttons.length; i++) {
            const element = this.buttons[i];
            if (this.currentButton === element || element.ignoreNavigation || !this.checkViable(element.view))
                continue;
            const index = element.view.navigationIndex || element.view.tabIndex;
            const difference = Math.abs(index - nextIndex);
            switch (direction) {
                case 'left':
                    if (index < currentIndex) {
                        if (difference < value) {
                            value = difference;
                            closest = element;
                        }
                    }
                    break;
                case 'right':
                    if (index > currentIndex) {
                        if (difference < value) {
                            value = difference;
                            closest = element;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        this.focusedButton(closest);
    }
}
//# sourceMappingURL=FixedNavigationPlugin.js.map