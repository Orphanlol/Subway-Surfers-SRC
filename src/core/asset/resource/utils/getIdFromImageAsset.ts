export function getIdFromImageAsset(imageAsset, index, version, formats) {
    if (imageAsset[index].standard) {
        for (let i = 0; i < formats.length; i++) {
            const format = formats[i];
            if (imageAsset[index][format]
                && imageAsset[index][format][version]) {
                return imageAsset[index][format][version];
            }
        }
    }
    return imageAsset[index][version] || imageAsset[index].default;
}
//# sourceMappingURL=getIdFromImageAsset.js.map