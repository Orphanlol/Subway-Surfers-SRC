var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ResourcePlugin } from '..';
import { I18n, i18n } from './I18n';
const defaultOptions = {
    name: 'i18n',
    language: 'en',
    fileNameFormat: 'lang-*.json',
};
export class I18nPlugin {
    constructor(app, options = {}) {
        var _a;
        this.app = app;
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
        (_a = this.options.entryDefaults) !== null && _a !== void 0 ? _a : Object.assign(I18n.defaultEntry, this.options.entryDefaults);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = this.app.get(ResourcePlugin);
            resource.manager.onLoadComplete.connect(this.refresh.bind(this));
        });
    }
    refresh() {
        const resource = this.app.get(ResourcePlugin);
        for (const id in resource.cache) {
            const re = this.options.fileNameFormat.replace('*', '(.+)');
            const match = id.match(new RegExp(re));
            if (match) {
                const data = resource.cache[id];
                const lang = match[1];
                i18n.appendDictionary(lang, data);
            }
        }
    }
}
//# sourceMappingURL=I18nPlugin.js.map