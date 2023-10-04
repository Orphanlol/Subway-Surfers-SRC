export class TransitionManager {
    constructor() {
        this._transitionMap = {};
    }
    get default() {
        if (this._transitionMap.all) {
            return this._transitionMap.all.all;
        }
        return null;
    }
    set default(value) {
        this.register(value, 'all', 'all');
    }
    register(transition, from = 'all', to = 'all', both = false) {
        let mapping = this._transitionMap[from];
        if (!mapping) {
            mapping = this._transitionMap[from] = {};
        }
        mapping[to] = transition;
        if (both) {
            this.register(transition, to, from);
        }
    }
    get(currentId, nextId) {
        const checkAndReturn = (from, to) => {
            if (this._transitionMap[from]) {
                return this._transitionMap[from][to] || this._transitionMap[from].all;
            }
            return null;
        };
        return checkAndReturn(currentId, nextId)
            || checkAndReturn('all', nextId)
            || this.default;
    }
}
//# sourceMappingURL=TransitionManager.js.map