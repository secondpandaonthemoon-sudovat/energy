import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import App from './App.js';
import AdminApp from './AdminApp.js';
import './AdminCategoryManager.js';
import { loadRuntimeContent } from './runtimeContent.js';
import { initI18n } from './i18n.js';
async function boot() {
    initI18n();
    const root = createRoot(document.getElementById('root'));
    if (window.location.pathname.startsWith('/admin')) {
        root.render(_jsx(AdminApp, {}));
        return;
    }
    await loadRuntimeContent();
    root.render(_jsx(App, {}));
}
boot();
