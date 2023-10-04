export var StorageType;
(function (StorageType) {
    StorageType["LOCAL"] = "local";
    StorageType["SESSION"] = "session";
})(StorageType || (StorageType = {}));
export function autoDetectStorage(type) {
    let storage;
    try {
        storage = type === StorageType.LOCAL ? window.localStorage : window.sessionStorage;
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (e.code === 22
            || e.code === 1014
            || e.name === 'QuotaExceededError'
            || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
            && (storage && storage.length !== 0);
    }
}
//# sourceMappingURL=autoDetectStorage.js.map