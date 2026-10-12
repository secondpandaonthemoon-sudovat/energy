import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n.js';
export function LanguageSwitcher({ dark = false, compact = false }) {
    const { lang, setLanguage } = useLanguage();
    return _jsxs("div", { "data-no-i18n": "true", className: `inline-flex items-center rounded-full border p-1 ${dark ? 'border-white/15 bg-[var(--theme-surface)]/5' : 'border-black/10 bg-[var(--theme-surface)]/80'}`, "aria-label": "Language selector", children: [!compact && _jsx(Languages, { className: `w-3.5 h-3.5 ml-1.5 mr-1 ${dark ? 'text-white/60' : 'text-black/45'}` }), ['tr', 'en'].map(code => _jsx("button", { type: "button", onClick: () => setLanguage(code), className: `min-w-8 h-7 px-2 rounded-full text-[10px] font-black tracking-wider transition ${lang === code ? (dark ? 'bg-[var(--theme-surface)] text-black' : 'bg-black text-white') : (dark ? 'text-white/55 hover:text-white' : 'text-black/45 hover:text-black')}`, children: code.toUpperCase() }, code))] });
}
