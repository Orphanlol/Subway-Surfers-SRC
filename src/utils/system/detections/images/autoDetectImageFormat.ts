import { Device } from '../../devices';
export function autoDetectImageFormat(overrides) {
    const webpSupport = Device.supportedFileFormats.webp;
    const avifSupport = Device.supportedFileFormats.avif;
    const formats = overrides || ['avif', 'webp', 'standard'];
    if (webpSupport) {
        if (avifSupport) {
            return formats;
        }
        if (formats.includes('avif')) {
            formats.splice(formats.findIndex((val) => val === 'avif'), 1);
        }
        return formats;
    }
    return ['standard'];
}
//# sourceMappingURL=autoDetectImageFormat.js.map