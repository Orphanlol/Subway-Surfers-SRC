import urlJoin from 'url-join';
import { isAbsoluteUrl } from './isAbsoluteUrl';
const re = new RegExp(/^.*\//);
const baseUrl = re.exec(window.location.href)[0];
export function makeAbsoluteUrl(url) {
    const absolutePath = isAbsoluteUrl(url) ? url : urlJoin(baseUrl, url);
    return absolutePath;
}
//# sourceMappingURL=makeAbsoluteUrl.js.map