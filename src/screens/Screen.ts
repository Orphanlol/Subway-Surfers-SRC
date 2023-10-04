import { Container } from 'pixi.js';
export class BaseScreen {
    constructor(app) {
        this.manifests = [];
        this.id = '';
        this.app = app;
        this.view = new Container();
    }
    resize(width, height) {
        this.width = width;
        this.height = height;
    }
}
//# sourceMappingURL=Screen.js.map