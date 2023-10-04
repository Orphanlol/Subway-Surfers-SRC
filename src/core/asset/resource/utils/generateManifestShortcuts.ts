export function attachManifestShortcuts(manifest, basePath) {
    Object.keys(manifest).forEach((id) => {
        const shortcut = id.substring(id.lastIndexOf('/') + 1);
        if (!manifest[shortcut]) {
            manifest[shortcut] = manifest[id];
        }
        if (id.startsWith(basePath)) {
            const shortcut = id.split(basePath)[1];
            if (shortcut && !manifest[shortcut]) {
                manifest[shortcut] = manifest[id];
            }
        }
    });
}
//# sourceMappingURL=generateManifestShortcuts.js.map