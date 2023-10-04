import { Signal } from 'typed-signals';
export class I18n {
    constructor() {
        this.onUpdate = new Signal();
        this.dictionaries = { en: {} };
        this._language = 'en';
    }
    appendDictionary(language, data) {
        if (!data)
            throw new Error('[I18n] Invalid data');
        for (const f in data)
            this.setEntry(f, data[f], language);
        this.onUpdate.emit(this);
    }
    changeLanguage(language) {
        if (!this.dictionaries[language])
            throw new Error(`[I18n] Language not available: ${language}`);
        this._language = language;
        this.onUpdate.emit(this);
    }
    get language() {
        return this._language;
    }
    set language(v) {
        this.changeLanguage(v);
    }
    getLanguages() {
        return Object.keys(this.dictionaries);
    }
    getEntry(id, language) {
        if (!language)
            language = this._language;
        const dictionary = this.dictionaries[language];
        if (!dictionary)
            throw new Error(`[I18n] No content for language: ${language}`);
        const entry = dictionary[id];
        if (!entry)
            throw new Error(`[I18n] Entry ${id} not available on ${language}`);
        return entry;
    }
    setEntry(id, data, language) {
        if (!language)
            language = this._language;
        if (!this.dictionaries[language])
            this.dictionaries[language] = {};
        const dictionary = this.dictionaries[language];
        if (!dictionary[id])
            dictionary[id] = Object.assign({}, I18n.defaultEntry);
        const entry = dictionary[id];
        if (typeof data === 'string')
            data = { text: data };
        Object.assign(entry, data);
        entry.text = String(entry.text);
        entry.type = String(entry.type);
        entry.fontName = String(entry.fontName);
        entry.scale = Number(entry.scale);
        entry.offsetX = Number(entry.offsetX);
        entry.offsetY = Number(entry.offsetY);
        return entry;
    }
    translate(id, params = {}) {
        const item = this.getEntry(id);
        return this.format(item.text, params);
    }
    format(text, params = {}) {
        const variables = text.match(/{{(.*?)}}/gm) || {};
        for (const i in variables) {
            const p = variables[i];
            const n = p.replace('{{', '').replace('}}', '');
            if (params[n] === undefined)
                throw new Error(`[I18n] Missing param ${n} for text: ${text}`);
            text = text.replace(new RegExp(p, 'gm'), String(params[n]));
        }
        return text;
    }
}
I18n.defaultEntry = {
    type: 'text',
    text: '',
    fontName: '',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
};
export const i18n = new I18n();
//# sourceMappingURL=I18n.js.map