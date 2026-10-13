import { siteConfig } from './data/siteConfig.js';
import { applyRuntimeData } from './runtimeContent.js';

const sourceText = new WeakMap();
const appliedText = new WeakMap();
const sourceAttributes = new WeakMap();
let overrideObserver = null;
let pending = false;
const ignored = 'script,style,noscript,input,textarea,select,[contenteditable="true"],[data-no-editor-overrides="true"]';

export function applyTextOverrides(root = document.getElementById('root')) {
    if (!root) return;
    const overrides = Array.isArray(siteConfig.editorTextOverrides) ? siteConfig.editorTextOverrides : [];
    const replacements = new Map(overrides.filter(row => row && typeof row.from === 'string' && row.from.trim() && typeof row.to === 'string').map(row => [row.from.trim(), row.to]));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        if (!node.parentElement || node.parentElement.closest(ignored)) continue;
        const current = node.nodeValue || '';
        if (!sourceText.has(node) || (appliedText.has(node) && current !== appliedText.get(node))) sourceText.set(node, current);
        const original = sourceText.get(node);
        const replacement = replacements.get(original.trim());
        const next = replacement === undefined ? original : `${original.match(/^\s*/)[0]}${replacement}${original.match(/\s*$/)[0]}`;
        appliedText.set(node, next);
        if (current !== next) node.nodeValue = next;
    }
    for (const element of root.querySelectorAll('[placeholder],[title],[alt]')) {
        const saved = sourceAttributes.get(element) || {};
        for (const attribute of ['placeholder', 'title', 'alt']) {
            if (!element.hasAttribute(attribute)) continue;
            const current = element.getAttribute(attribute);
            if (!saved[attribute] || current !== saved[attribute].applied) saved[attribute] = { original: current };
            const next = replacements.get(saved[attribute].original.trim()) ?? saved[attribute].original;
            saved[attribute].applied = next;
            if (current !== next) element.setAttribute(attribute, next);
        }
        sourceAttributes.set(element, saved);
    }
    if (!overrideObserver) {
        overrideObserver = new MutationObserver(() => {
            if (pending) return;
            pending = true;
            queueMicrotask(() => { pending = false; applyTextOverrides(root); });
        });
        overrideObserver.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder','title','alt'] });
    }
}

function selectedContent(target, event) {
    const element = target instanceof Element ? target : target?.parentElement;
    if (!element) return null;
    const image = element.closest('img');
    if (image) return { text: '', image: image.getAttribute('src') || '' };
    let selected = element;
    // Prefer the smallest readable leaf; icons can identify their containing control.
    if (selected.closest('svg')) selected = selected.closest('button,a') || selected.parentElement;
    let text = selected?.getAttribute('placeholder') || '';
    if (!text && event) {
        const range = document.caretRangeFromPoint?.(event.clientX, event.clientY);
        const node = range?.startContainer;
        if (node?.nodeType === Node.TEXT_NODE && selected?.contains(node)) text = node.nodeValue?.trim() || '';
    }
    if (!text) text = [...(selected?.childNodes || [])].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.nodeValue).join('').trim() || (selected?.innerText || selected?.textContent || '').trim();
    const background = selected ? getComputedStyle(selected).backgroundImage : '';
    const match = background?.match(/^url\(["']?(.*?)["']?\)$/);
    return { text: text.slice(0, 5000), image: match?.[1] || '' };
}

export function installVisualBridge(root, renderApp) {
    applyTextOverrides(root?.current || document.getElementById('root'));
    if (new URLSearchParams(location.search).get('visualEditor') !== '1' || parent === window) return () => {};
    let selectMode = true;
    const style = document.createElement('style');
    style.textContent = 'html[data-visual-select="true"] .hero-type-layer{z-index:25!important} html[data-visual-select="true"] :is(img,h1,h2,h3,p,span){pointer-events:auto!important} html[data-visual-select="true"] :is(img,h1,h2,h3,p,span,button,a):hover{outline:2px dashed #f1482e;outline-offset:3px;cursor:crosshair}';
    document.head.appendChild(style);
    document.documentElement.dataset.visualSelect = 'true';
    let disposed = false;
    const send = message => parent.postMessage(message, location.origin);
    const receive = event => {
        if (disposed || event.source !== parent || event.origin !== location.origin || !event.data || event.data.type !== 'asay:content') return;
        const cms = event.data.cms;
        if (!cms || typeof cms !== 'object' || !cms.settings || !Array.isArray(cms.pages) || !Array.isArray(cms.menus) || !cms.entities) return;
        selectMode = event.data.selectMode !== false;
        document.documentElement.dataset.visualSelect = String(selectMode);
        applyRuntimeData(cms);
        renderApp();
        queueMicrotask(() => applyTextOverrides(document.getElementById('root')));
    };
    const click = event => {
        const element = event.target instanceof Element ? event.target : event.target?.parentElement;
        if (selectMode) {
            const selection = selectedContent(event.target, event);
            if (!selection) return;
            event.preventDefault(); event.stopImmediatePropagation();
            send({ type: 'asay:select', ...selection });
            return;
        }
        const link = element?.closest('a[href]');
        if (link) {
            const url = new URL(link.getAttribute('href'), location.href);
            // Keep preview inside its frame: anchors are safe, other page navigations are not.
            if (!link.getAttribute('href')?.startsWith('#') && (url.origin !== location.origin || url.pathname !== location.pathname || link.target === '_blank')) {
                event.preventDefault(); event.stopImmediatePropagation();
            }
        }
    };
    const submit = event => { event.preventDefault(); event.stopImmediatePropagation(); };
    window.addEventListener('message', receive);
    document.addEventListener('click', click, true);
    document.addEventListener('submit', submit, true);
    send({ type: 'asay:ready' });
    return () => {
        disposed = true;
        style.remove();
        delete document.documentElement.dataset.visualSelect;
        window.removeEventListener('message', receive);
        document.removeEventListener('click', click, true);
        document.removeEventListener('submit', submit, true);
    };
}
