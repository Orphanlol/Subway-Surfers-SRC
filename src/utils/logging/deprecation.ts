const warnings = {};
export function deprecation(version, message, ignoreDepth = 3) {
    if (warnings[message]) {
        return;
    }
    let stack = new Error().stack;
    if (typeof stack === 'undefined') {
        console.warn('Astro Deprecation Warning: ', `${message}\nDeprecated since v${version}`);
    }
    else {
        stack = stack.split('\n').splice(ignoreDepth).join('\n');
        if (console.groupCollapsed) {
            console.groupCollapsed('%cAstro Deprecation Warning: %c%s', 'color:#614108;background:#fffbe6', 'font-weight:normal;color:#614108;background:#fffbe6', `${message}\nDeprecated since v${version}`);
            console.warn(stack);
            console.groupEnd();
        }
        else {
            console.warn('Astro Deprecation Warning: ', `${message}\nDeprecated since v${version}`);
            console.warn(stack);
        }
    }
    warnings[message] = true;
}
//# sourceMappingURL=deprecation.js.map