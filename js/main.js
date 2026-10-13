import { installVisualBridge } from './visualBridge.js';
import { jsx as _jsx, jsxs as _jsxs, Fragment } from 'react/jsx-runtime';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.js';
import AdminApp from './AdminApp.js';
import { loadRuntimeContent } from './runtimeContent.js';
import { initI18n } from './i18n.js';
import { appUrl, localPath } from './appPaths.js';

class StartupBoundary extends React.Component {
    state = { error: false };
    static getDerivedStateFromError() { return { error: true }; }
    componentDidCatch(error) { console.error('ASAY render failed', error); }
    render() {
        if (this.state.error) return _jsxs('main', { style: { padding: '48px 24px', fontFamily: 'Arial, sans-serif' }, children: [
            _jsx('h1', { children: 'Site görüntülenemedi' }),
            _jsx('p', { children: 'Uygulama dosyalarını birlikte güncelleyip Ctrl+F5 ile tekrar deneyin.' }),
            _jsx('a', { href: appUrl('/'), children: 'Ana sayfayı yeniden aç' })
        ] });
        return this.props.children;
    }
}
function PreviewNotice() {
    const [open, setOpen] = React.useState(true);
    if (!open) return null;
    return _jsxs('aside', { role: 'status', 'data-no-i18n': 'true', style: { position: 'fixed', bottom: '16px', left: '16px', maxWidth: 'min(420px, calc(100vw - 32px))', padding: '16px', borderRadius: '12px', background: '#fff8e8', border: '1px solid #d5ac57', color: '#4a350b', zIndex: 100, font: '14px/1.5 Arial, sans-serif', boxShadow: '0 4px 24px #0002' }, children: [
        _jsx('strong', { children: 'Site önizleme modunda' }),
        _jsx('p', { children: 'Sunucu içeriği alınamadı; örnek içerik gösteriliyor. Yönetim paneli ve formlar için PHP/MySQL bağlantısı gerekir.' }),
        _jsxs('div', { style: { display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }, children: [
            _jsx('a', { href: appUrl('/install.php'), children: 'Kurulum durumunu kontrol et' }),
            _jsx('button', { type: 'button', onClick: () => setOpen(false), 'aria-label': 'Önizleme bildirimini kapat', children: 'Kapat' })
        ] })
    ] });
}
async function boot() {
    try {
        initI18n();
        const root = createRoot(document.getElementById('root'));
        const admin = /^\/admin(?:\/|$)/.test(localPath(location.pathname));
        const content = admin ? null : await loadRuntimeContent();
        root.render(_jsx(StartupBoundary, { children: admin ? _jsx(AdminApp, {}) : _jsxs(Fragment, { children: [_jsx(App, {}), content.loadError && _jsx(PreviewNotice, {})] }) }));
        if (!admin) installVisualBridge(root, () => root.render(_jsx(StartupBoundary, { children: _jsx(App, {}) })));
        window.asayStartup?.ready();
    } catch (error) {
        window.asayStartup?.fail(error);
        console.error('ASAY boot failed', error);
    }
}
boot();
