import { Plugin } from '../core';
import { Stats } from './stats/Stats';
export class StatsPlugin extends Plugin {
    prepare() {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.container);
    }
    update() {
        var _a;
        (_a = this.stats) === null || _a === void 0 ? void 0 : _a.update();
    }
}
//# sourceMappingURL=StatsPlugin.js.map