var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { dirname, extname, join } from 'path';
import { BitmapText } from 'pixi.js';
import { loadAssets } from '../Loader';
const loadBitmapFont = {
    test(url) {
        return (extname(url).includes('.xml'));
    },
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            const text = yield response.text();
            const data = new window.DOMParser().parseFromString(text, 'text/xml');
            const pages = data.getElementsByTagName('page');
            for (let i = 0; i < pages.length; ++i) {
                const pageFile = pages[i].getAttribute('file');
                const imagePath = join(dirname(url), pageFile);
                const assets = yield loadAssets([imagePath]);
                const texture = assets[imagePath];
                BitmapText.registerFont(data, texture);
            }
        });
    },
};
export { loadBitmapFont };
//# sourceMappingURL=loadBitmapFont.js.map