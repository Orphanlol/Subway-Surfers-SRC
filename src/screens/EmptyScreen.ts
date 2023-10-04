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
export class EmptyScreen {
    constructor(app) {
        this.app = app;
        this.view = new Container();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[Empty Screen] init empty!');
        });
    }
    show() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[Empty Screen] show empty!');
        });
    }
    shown() {
        console.log('[Empty Screen] shown empty!');
    }
    hide() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[Empty Screen] hide empty!');
        });
    }
    hidden() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[Empty Screen] hidden empty!');
        });
    }
    resize(w, h) {
        console.log(`[Empty Screen] resize ${w} ${h}!`);
    }
}
//# sourceMappingURL=EmptyScreen.js.map