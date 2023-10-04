export function isAbsoluteUrl(url) {
    if ((/^[a-zA-Z]:\\/).test(url)) {
        return false;
    }
    return (/^[a-zA-Z][a-zA-Z\d+\-.]*:/).test(url);
}
//# sourceMappingURL=isAbsoluteUrl.js.map