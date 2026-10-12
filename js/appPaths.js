// Every request belongs to the installation folder, not necessarily the host root.
function installationBase() {
    if (typeof document === 'undefined') return '/';
    const configured = document.querySelector?.('base#app-base')?.href;
    const url = configured ? new URL(configured) : new URL('../', import.meta.url);
    return /^https?:$/.test(url.protocol) ? url.pathname.replace(/\/?$/, '/') : '/';
}
export const appBase = installationBase();
export function appUrl(value = '') {
    const path = String(value);
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;
    if (appBase !== '/' && (path === appBase.slice(0, -1) || path.startsWith(appBase))) return path;
    return appBase + path.replace(/^\/+/, '');
}
export function localPath(value) {
    const path = String(value);
    return appBase !== '/' && path.startsWith(appBase) ? '/' + path.slice(appBase.length) : path;
}
export function assetUrl(value) {
    if (typeof value !== 'string') return value;
    return /^\/(?:src\/assets|uploads|assets)\//.test(value) ? appUrl(value) : value;
}
export function resolveAssetTree(value) {
    if (typeof value === 'string') return assetUrl(value);
    if (Array.isArray(value)) return value.map(resolveAssetTree);
    if (!value || typeof value !== 'object') return value;
    const out = {};
    for (const [key, item] of Object.entries(value)) {
        if (!['__proto__', 'constructor', 'prototype'].includes(key)) out[key] = resolveAssetTree(item);
    }
    return out;
}
