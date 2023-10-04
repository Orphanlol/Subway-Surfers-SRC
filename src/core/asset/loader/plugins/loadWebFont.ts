var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { basename, extname } from 'path';
import { Device } from '../../../../utils';
export function getRawCss(opts) {
    return `
    @font-face {
        font-family: ${opts.fontFamily};
        src: url("${opts.woff2}") format('woff2'),
             url("${opts.woff}") format('woff');
        font-weight: normal;
        font-style: normal;
    }`;
}
export function getFontFamilyName(url) {
    const ext = extname(url);
    const name = basename(url, ext);
    const nameWithSpaces = name.replace(/(-|_)/g, ' ');
    const nameTitleCase = nameWithSpaces.toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    return nameTitleCase;
}
export const loadWebFont = {
    test(url) {
        return extname(url).split('?').shift().endsWith('woff2');
    },
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const fontFamily = getFontFamilyName(url);
            const woff = url.replace('.woff2', '.woff');
            const woff2 = url;
            const rawFontCss = getRawCss({ fontFamily, woff, woff2 });
            const style = document.createElement('style');
            const css = document.createTextNode(rawFontCss);
            style.appendChild(css);
            document.head.appendChild(style);
            const fontCacheDiv = document.createElement('div');
            fontCacheDiv.className = 'fontcache';
            fontCacheDiv.style.fontFamily = fontFamily;
            fontCacheDiv.style.position = 'fixed';
            fontCacheDiv.style.marginLeft = '-100px';
            fontCacheDiv.style.marginTop = '-100px';
            fontCacheDiv.textContent = '.';
            fontCacheDiv.style.backgroundColor = 'blue';
            fontCacheDiv.style.zIndex = '9999';
            document.body.appendChild(fontCacheDiv);
            return new Promise((resolve) => {
                let interval = null;
                let resolved = false;
                function checkFontIsReady() {
                    if (!document.fonts)
                        return false;
                    return document.fonts.check(`1em ${fontFamily}`) || document.fonts.check(`1px ${fontFamily}`);
                }
                function resolveIfFontIsReady() {
                    if (!checkFontIsReady() || resolved)
                        return;
                    if (interval)
                        window.clearInterval(interval);
                    resolved = true;
                    resolve();
                }
                if (Device.ie) {
                    console.warn('[WebFont] IE11 hack to load font:', fontFamily);
                    setTimeout(() => resolve(), 50);
                }
                else {
                    style.onload = () => {
                        if (document.fonts) {
                            const isLoaded = document.fonts.status === 'loaded';
                            if (isLoaded && checkFontIsReady()) {
                                resolve();
                            }
                            else {
                                document.fonts.ready.then(resolveIfFontIsReady);
                                interval = window.setInterval(resolveIfFontIsReady, 100);
                            }
                        }
                        else {
                            console.warn('[WebFont] Fonts API not available, but font was added:', fontFamily);
                            setTimeout(() => resolve(), 50);
                        }
                    };
                }
            });
        });
    },
};
//# sourceMappingURL=loadWebFont.js.map