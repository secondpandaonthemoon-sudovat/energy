import { siteConfig } from './data/siteConfig.js';
export const runtimeContent = {
    version: 0, settings: {}, pages: [], menus: [], entities: { products: [], projects: [], services: [], hotspots: [] },
};
function deepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    for (const [key, value] of Object.entries(source)) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
        if (Array.isArray(value)) target[key] = value;
        else if (value && typeof value === 'object') {
            if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) target[key] = {};
            deepMerge(target[key], value);
        } else target[key] = value;
    }
    return target;
}
function shadeHex(hex, amount = -20) {
    const m = String(hex || '').trim().match(/^#([0-9a-f]{6})$/i);
    if (!m) return hex || '#d83a22';
    const n = parseInt(m[1], 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (n & 255) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
export function applyTheme(theme = {}) {
    const root = document.documentElement;
    const primary = theme.primary || '#F1482E';
    const tokens = {
        '--theme-primary': primary,
        '--theme-primary-hover': theme.primaryHover || theme.accent || shadeHex(primary, -24),
        '--theme-accent': theme.accent || primary,
        '--theme-dark': theme.dark || '#080808',
        '--theme-light': theme.light || '#F8F8F7',
        '--theme-background': theme.background || theme.white || '#FFFFFF',
        '--theme-surface': theme.surface || '#FFFFFF',
        '--theme-text': theme.text || theme.dark || '#080808',
        '--theme-muted-text': theme.mutedText || '#6B7280',
        '--theme-border': theme.border || '#E5E7EB',
        '--theme-font-body': theme.bodyFont || "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        '--theme-font-heading': theme.headingFont || "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
        '--theme-card-radius': `${Number(theme.cardRadius ?? 18)}px`,
        '--theme-button-radius': `${Number(theme.buttonRadius ?? 999)}px`,
    };
    for (const [k, v] of Object.entries(tokens)) root.style.setProperty(k, v);
    root.dataset.siteTheme = theme.presetId || 'custom';
}
function applyEntities(data) {
    const visible = items => (Array.isArray(items) ? items : []).filter(x => x && x.enabled !== false).sort((a, b) => (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0));
    const products = visible(data.entities?.products);
    const projects = visible(data.entities?.projects);
    const services = visible(data.entities?.services);
    const hotspots = visible(data.entities?.hotspots);
    siteConfig.projects = projects.map(cleanMeta);
    siteConfig.services = services.map(cleanMeta);
    siteConfig.technicalHotspots = hotspots.map(cleanMeta);
    const meta = (Array.isArray(data.settings?.divisions_meta) ? data.settings.divisions_meta : [])
        .filter(d => d && d.enabled !== false)
        .sort((a, b) => (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0));
    const grouped = new Map();
    for (const p of products) {
        const key = p.categoryId || 'jenerator';
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(cleanMeta(p));
    }
    const divisions = meta.map(d => ({ ...cleanCategoryMeta(d), products: grouped.get(d.id) || [] }));
    for (const [id, items] of grouped) if (!divisions.some(d => d.id === id)) divisions.push({ id, name: id, shortName: id, tagline: '', description: '', products: items });
    siteConfig.divisions = divisions;
    siteConfig.products = products.map(cleanMeta);
}
function cleanCategoryMeta(obj) { const out = { ...obj }; delete out.enabled; delete out.sortOrder; delete out.sort_order; return out; }
function cleanMeta(obj) { const out = { ...obj }; delete out._rowId; delete out.enabled; delete out.sortOrder; return out; }
export async function loadRuntimeContent() {
    try {
        const preview = new URLSearchParams(location.search).get('cmsPreview') === '1';
        let url = '/api/content', headers = {};
        if (preview) {
            const token = localStorage.getItem('asay_admin_token');
            if (token) { url = '/api/admin/preview'; headers.Authorization = `Bearer ${token}`; }
        }
        const res = await fetch(url, { cache: 'no-store', headers });
        if (!res.ok) return runtimeContent;
        const data = await res.json();
        runtimeContent.version = Number(data.version || 0);
        runtimeContent.settings = data.settings || {};
        runtimeContent.pages = data.pages || [];
        runtimeContent.menus = data.menus || [];
        runtimeContent.entities = data.entities || runtimeContent.entities;
        deepMerge(siteConfig, runtimeContent.settings.site_config || {});
        applyTheme((runtimeContent.settings.site_config || {}).theme || {});
        applyEntities(runtimeContent);
        applySeo();
    } catch (e) { console.error('CMS content load failed', e); }
    return runtimeContent;
}
export function hasHomePage() { return runtimeContent.pages.some(p => p.slug === '/' || p.id === 'page_home'); }
export function hasMenu(key = 'header') { return runtimeContent.menus.some(m => (m.menu_key || m.menuKey) === key); }
export function getHomeSections() {
    const page = runtimeContent.pages.find(p => p.slug === '/' || p.id === 'page_home');
    return (page?.sections || []).filter(s => s.enabled !== false).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}
export function getMenu(key = 'header') {
    return runtimeContent.menus.find(m => (m.menu_key || m.menuKey) === key)?.items?.filter(i => i.enabled !== false).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) || [];
}
export function sectionContent(type) { return getHomeSections().find(s => s.type === type)?.content || {}; }
export function cmsValue(path, fallback) {
    const root = runtimeContent.settings?.site_config || {};
    const value = path.split('.').reduce((acc, k) => acc?.[k], root);
    return (value ?? fallback);
}
export function resolveCmsHref(link) {
    const target = String(link?.target || '');
    switch (link?.type) {
        case 'phone': return target.startsWith('tel:') ? target : `tel:${target.replace(/[^0-9+]/g, '')}`;
        case 'email': return target.startsWith('mailto:') ? target : `mailto:${target}`;
        case 'anchor': return target.startsWith('#') ? target : `#${target}`;
        case 'external': return /^https?:\/\//i.test(target) ? target : '#';
        case 'file': return target.startsWith('/uploads/') || target.startsWith('/src/assets/') ? target : '#';
        default: return /^(?:\/(?!\/)|#[^\s]*$|https?:\/\/)/i.test(target) && !/[\\\u0000-\u0020]/.test(target) ? target : '#';
    }
}
export function applySeo() {
    const page = runtimeContent.pages.find(p => p.slug === '/' || p.id === 'page_home');
    const seo = page?.seo || {};
    if (seo.title) document.title = seo.title;
    const setMeta = (name, content, property = false) => { if (!content) return; const attr = property ? 'property' : 'name'; let el = document.head.querySelector(`meta[${attr}="${name}"]`); if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); } el.content = content; };
    setMeta('description', seo.description || '');
    setMeta('og:title', seo.title || '', true);
    setMeta('og:description', seo.description || '', true);
    setMeta('og:image', seo.ogImage || '', true);
    setMeta('robots', seo.index === false ? 'noindex,nofollow' : 'index,follow');
    if (seo.canonical) { let link = document.head.querySelector('link[rel="canonical"]'); if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); } link.href = seo.canonical; }
    const favicon = cmsValue('logos.favicon', '');
    if (favicon) { let link = document.head.querySelector('link[rel="icon"]'); if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); } link.href = favicon; }
}
export function runCmsLink(link, actions = {}) {
    if (!link) return false;
    if (link.type === 'action') { const fn = actions[String(link.target || '')]; if (fn) { fn(); return true; } return false; }
    if (link.type === 'product') { window.dispatchEvent(new CustomEvent('cms:open-entity', { detail: { type: 'product', id: String(link.target || '') } })); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); return true; }
    if (link.type === 'project') { window.dispatchEvent(new CustomEvent('cms:open-entity', { detail: { type: 'project', id: String(link.target || '') } })); document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' }); return true; }
    const href = resolveCmsHref(link);
    if (!href || href === '#') return false;
    if (link.type === 'anchor') { const el = document.getElementById(href.replace(/^#/, '')); if (el) { el.scrollIntoView({ behavior: 'smooth' }); return true; } }
    if (link.newTab) window.open(href, '_blank', 'noopener,noreferrer'); else window.location.href = href;
    return true;
}
export function cmsButtonClass(style = 'primary', darkContext = false) {
    switch (style) {
        case 'secondary': return 'px-6 py-3 rounded-[var(--theme-button-radius)] bg-neutral-100 text-neutral-900 border border-neutral-200 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all';
        case 'outline': return darkContext ? 'px-6 py-3 rounded-[var(--theme-button-radius)] bg-transparent text-white border border-white/30 font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all' : 'px-6 py-3 rounded-[var(--theme-button-radius)] bg-transparent text-neutral-900 border border-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-all';
        case 'text': return darkContext ? 'px-2 py-2 text-white font-bold text-xs uppercase tracking-wider underline underline-offset-4' : 'px-2 py-2 text-neutral-900 font-bold text-xs uppercase tracking-wider underline underline-offset-4';
        case 'dark': return 'px-6 py-3 rounded-[var(--theme-button-radius)] bg-[var(--theme-dark)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--theme-primary)] transition-all';
        case 'light': return 'px-6 py-3 rounded-[var(--theme-button-radius)] bg-white text-neutral-900 font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-all';
        default: return 'px-6 py-3 rounded-[var(--theme-button-radius)] bg-[var(--theme-primary)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--theme-primary-hover)] transition-all';
    }
}
