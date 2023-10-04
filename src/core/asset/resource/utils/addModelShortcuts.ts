import { Cache } from '@goodboydigital/odie';
export function addModelShortcuts(manifest) {
    for (const i in manifest.model) {
        const asset = manifest.model[i];
        const path = asset.default;
        if (!path)
            continue;
        const validPath = path.substr(path.lastIndexOf('.') + 1) === 'gb';
        if (!validPath)
            continue;
        if (asset.shortcut) {
            const model = Cache.get(path);
            const extension = `.${path.split('.')[1]}`;
            Cache.add(asset.shortcut.split('.')[0] + extension, model);
        }
    }
}
//# sourceMappingURL=addModelShortcuts.js.map