import { Device } from '../system';
import { StorageType } from '../system/detections/autoDetectStorage';
class DummyStorage {
    constructor() {
        this.hash = new Map();
    }
    setItem(key, value) {
        this.hash.set(key, value);
    }
    getItem(key) {
        return this.hash.get(key);
    }
    clear() {
        this.hash.clear();
    }
    removeItem(key) {
        this.hash.delete(key);
    }
    key() { }
    get length() {
        return this.hash.size;
    }
}
export class AstroStorage {
    constructor(type = StorageType.LOCAL, bundleId = 'com.goodboydigital') {
        this.type = type;
        this.canSave = type === StorageType.LOCAL ? Device.isLocalStorageAllowed : Device.isSessionStorageAllowed;
        this.bundleId = bundleId;
        if (this.canSave) {
            this.storage = type === StorageType.LOCAL ? window.localStorage : window.sessionStorage;
        }
        else {
            this.storage = new DummyStorage();
        }
    }
    setItem(key, value) {
        switch (typeof value) {
            case 'number':
                value = value.toString();
                break;
            case 'object':
                value = JSON.stringify(value);
                break;
            case 'boolean':
                value = value ? 'true' : 'false';
                break;
        }
        this.storage.setItem(this._composeKey(key), value);
    }
    getItem(key) {
        return this.storage.getItem(this._composeKey(key));
    }
    getNumber(key) {
        return parseFloat(this.getItem(key));
    }
    getObject(key) {
        return JSON.parse(this.getItem(key));
    }
    getBoolean(key) {
        return this.getItem(key) === 'true';
    }
    removeItem(key) {
        return this.storage.removeItem(this._composeKey(key));
    }
    clear() {
        this.storage.clear();
    }
    _composeKey(key) {
        return this.bundleId ? `${this.bundleId}.${key}` : key;
    }
}
//# sourceMappingURL=AstroStorage.js.map