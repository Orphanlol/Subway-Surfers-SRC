import { cache } from '../../loader';
export function addJsonShortcuts(manifest) {
    Object.values(manifest.json).forEach((value) => {
        cache[value.shortcut] = cache[value.default];
    });
}
//# sourceMappingURL=addJsonShortcuts.js.map