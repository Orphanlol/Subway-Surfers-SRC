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
import { ResourceManager } from '../core';
import { EmptyScreen } from './EmptyScreen';
import { LoaderScreen } from './LoaderScreen';
import { TransitionManager } from './TransitionManager';
import { AlphaTransition } from './transitions/AlphaTransition';
export class ScreenGroup {
    constructor(app, options) {
        this.screens = {};
        this.w = 0;
        this.h = 0;
        this.history = [];
        this.options = options;
        this.app = app;
        this.view = (options === null || options === void 0 ? void 0 : options.view) || new Container();
        this.transitionManager = new TransitionManager();
        if (options === null || options === void 0 ? void 0 : options.defaultTransitionClass) {
            this.transitionManager.default = new options.defaultTransitionClass(options.defaultTransitionOptions);
        }
        else {
            this.transitionManager.default = new AlphaTransition(options.defaultTransitionOptions);
        }
        this.screens.empty = { instance: new EmptyScreen(app), class: EmptyScreen, id: 'empty' };
        this.groups = { root: {} };
        this.visibleScreens = [];
    }
    add(_screenClass, options, id, async = false) {
        if (this.screens[id]) {
            throw new Error(`Screen id ${id} has already been assigned`);
        }
        const screenData = { instance: null, class: _screenClass, options, id };
        if (async) {
            screenData.instance = new _screenClass(this.app, screenData.options);
        }
        this.screens[id] = screenData;
    }
    back() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.history.length) {
                const lastScreenId = this.history.pop();
                this.goto(lastScreenId);
            }
        });
    }
    goto(id, data = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentScreenId === id && !data.force)
                return;
            if (!this.screens[id]) {
                throw new Error(`Screen id ${id} does not exist`);
            }
            this.nextScreenId = id;
            this.nextData = data;
            if (this.transitionPromise) {
                if (this.nextScreenId === id) {
                    return;
                }
                yield this.transitionPromise;
                return;
            }
            else if (this.currentScreenId === id) {
                return;
            }
            this.transitionPromise = this.createTransitionPromise(this.nextData.data);
            yield this.transitionPromise;
            this.transitionPromise = null;
        });
    }
    createTransitionPromise(screenSessionData) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.view.interactiveChildren = false;
            const transition = this.transitionManager.get(this.currentScreenId, this.nextScreenId);
            const autoManageContainers = transition.autoManageContainers;
            const currentData = this.screens[this.currentScreenId];
            const nextData = this.screens[this.nextScreenId];
            const firstRun = !nextData.instance;
            if (firstRun) {
                nextData.instance = new nextData.class(this.app, nextData.options);
            }
            let loadPromise = Promise.resolve();
            let loadComplete = false;
            if (nextData.instance.manifests) {
                loadPromise = ResourceManager.load(nextData.instance.manifests)
                    .then(() => {
                    loadComplete = true;
                });
            }
            if (transition.resize) {
                transition.resize(this.w, this.h);
            }
            if (currentData) {
                this.history.push(this.currentScreenId);
                if (currentData.instance.hide) {
                    yield currentData.instance.hide();
                }
                yield transition.hide(this.view, currentData.instance, nextData.instance);
                if (autoManageContainers) {
                    this.view.removeChild(currentData.instance.view);
                }
                if (currentData.instance.hidden) {
                    currentData.instance.hidden();
                }
            }
            if (!this.loader) {
                const LoaderScreenClass = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.loaderScreenClass) || LoaderScreen;
                this.loader = new LoaderScreenClass(this.app);
                this.loader.resize(this.w, this.h);
            }
            let shownLoader = false;
            const timeoutId = setTimeout(() => {
                if (!loadComplete) {
                    shownLoader = true;
                    this.view.addChild(this.loader.view);
                    this.loader.show();
                    ResourceManager.onLoadProgress.connect(this.loader.updateProgress);
                }
            }, 1000);
            yield loadPromise;
            if (firstRun && nextData.instance.init) {
                yield nextData.instance.init();
            }
            this.currentScreenId = nextData.id;
            if (shownLoader) {
                ResourceManager.onLoadProgress.disconnect(this.loader.updateProgress);
                yield this.loader.hide();
                this.view.removeChild(this.loader.view);
            }
            else {
                clearTimeout(timeoutId);
            }
            if (nextData.instance.prepare) {
                yield nextData.instance.prepare(screenSessionData);
            }
            nextData.instance.resize(this.w, this.h);
            if (nextData.instance.show) {
                yield nextData.instance.show();
            }
            this.view.interactiveChildren = true;
            this.visibleScreens.push(nextData);
            if (autoManageContainers) {
                this.view.addChild(nextData.instance.view);
            }
            yield transition.show(this.view, currentData === null || currentData === void 0 ? void 0 : currentData.instance, nextData.instance);
            if (nextData.instance.shown) {
                nextData.instance.shown();
            }
            const index = this.visibleScreens.indexOf(currentData);
            if (index !== -1) {
                this.visibleScreens.splice(index, 1);
            }
            if (this.currentScreenId !== this.nextScreenId) {
                yield this.createTransitionPromise(this.nextData.data);
            }
            resolve();
        }));
    }
    resize(w, h) {
        this.w = w;
        this.h = h;
        if (this.screens[this.currentScreenId]) {
            this.screens[this.currentScreenId].instance.resize(w, h);
        }
        if (this.loader)
            this.loader.resize(w, h);
    }
    update(dt) {
        const vs = this.visibleScreens;
        for (let i = 0; i < vs.length; i++) {
            if (vs[i].instance.update) {
                vs[i].instance.update(dt);
            }
        }
    }
}
//# sourceMappingURL=ScreenGroup.js.map