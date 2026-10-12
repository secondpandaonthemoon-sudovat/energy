import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { X, Search, Zap, Sparkles, Flame, Activity, Factory, BatteryCharging } from 'lucide-react';
import { siteConfig } from '../data/siteConfig.js';
import { cmsValue } from '../runtimeContent.js';
export const FullCatalogModal = ({ isOpen, onClose, onSelectProduct, onOpenQuoteWithProduct, }) => {
    const [selectedDivisionId, setSelectedDivisionId] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    if (!isOpen)
        return null;
    const catalog = cmsValue('catalog', {});
    // Flatten all products across all 6 divisions
    const allDivisionProducts = siteConfig.divisions.flatMap((division) => division.products.map((p) => ({ ...p, divisionId: division.id, divisionName: division.name })));
    const filteredItems = allDivisionProducts.filter((item) => {
        const matchesSearch = String(item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.standbyPower || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.series || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.divisionName || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch)
            return false;
        if (selectedDivisionId === 'all')
            return true;
        return item.divisionId === selectedDivisionId;
    });
    const getDivisionIcon = (id) => {
        switch (id) {
            case 'jenerator':
                return _jsx(Zap, { className: "w-3.5 h-3.5" });
            case 'buhar-kazani':
                return _jsx(Flame, { className: "w-3.5 h-3.5" });
            case 'trafo':
                return _jsx(Activity, { className: "w-3.5 h-3.5" });
            case 'trijenerasyon':
                return _jsx(Sparkles, { className: "w-3.5 h-3.5" });
            case 'kojenerasyon':
                return _jsx(Factory, { className: "w-3.5 h-3.5" });
            case 'enerji-depolama':
                return _jsx(BatteryCharging, { className: "w-3.5 h-3.5" });
            default:
                return _jsx(Zap, { className: "w-3.5 h-3.5" });
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200", children: _jsxs("div", { className: "relative w-full max-w-5xl bg-[var(--theme-surface)] rounded-3xl shadow-2xl border border-[var(--theme-border)] overflow-hidden my-8 text-[var(--theme-text)]", children: [_jsxs("div", { className: "p-6 md:p-8 bg-neutral-900 text-white flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-[var(--theme-primary)]", children: catalog.eyebrow || 'ASAY ENERGY TAM ÜRÜN KATALOĞU' }), _jsx("h3", { className: "text-xl md:text-2xl font-bold font-['Space_Grotesk']", children: catalog.title || 'Tüm Güç ve Enerji Sistemleri Modelleri' })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-full bg-[var(--theme-surface)]/10 text-white hover:bg-[var(--theme-surface)]/20 transition-colors cursor-pointer", "aria-label": "Kapat", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 bg-neutral-50 border-b border-[var(--theme-border)] flex flex-col md:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-1.5 w-full md:w-auto", children: [_jsxs("button", { onClick: () => setSelectedDivisionId('all'), className: `px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedDivisionId === 'all'
                                        ? 'bg-[var(--theme-dark)] text-white shadow-sm'
                                        : 'bg-[var(--theme-surface)] text-neutral-700 border border-[var(--theme-border)] hover:bg-neutral-100'}`, children: ["T\u00FCm Sistemler (", allDivisionProducts.length, ")"] }), siteConfig.divisions.map((div) => (_jsxs("button", { onClick: () => setSelectedDivisionId(div.id), className: `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedDivisionId === div.id
                                        ? 'bg-[var(--theme-dark)] text-white shadow-sm'
                                        : 'bg-[var(--theme-surface)] text-neutral-700 border border-[var(--theme-border)] hover:bg-neutral-100'}`, children: [_jsx("span", { children: getDivisionIcon(div.id) }), _jsx("span", { children: div.name })] }, div.id)))] }), _jsxs("div", { className: "relative w-full md:w-72", children: [_jsx(Search, { className: "w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", placeholder: catalog.searchPlaceholder || 'Model, güç veya kategori ara...', value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 text-xs bg-[var(--theme-surface)] focus:outline-none focus:border-[var(--theme-primary)]" })] })] }), _jsxs("div", { className: "p-6 md:p-8 max-h-[65vh] overflow-y-auto", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredItems.map((product) => (_jsxs("div", { className: "bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] p-5 flex flex-col justify-between hover:border-[var(--theme-primary)] hover:shadow-lg transition-all duration-300 group", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-[var(--theme-primary)] px-2 py-0.5 rounded-md bg-[var(--theme-primary)]/10", children: product.divisionName }), _jsx("span", { className: "text-[11px] font-bold text-neutral-400", children: product.standbyPower.split('/')[0] })] }), _jsx("h4", { className: "font-extrabold text-base text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors leading-snug", children: product.name }), _jsx("p", { className: "text-xs text-neutral-500 mt-0.5", children: product.series }), _jsx("div", { className: "my-4 h-36 flex items-center justify-center bg-neutral-50 rounded-xl p-2", children: _jsx("img", { src: product.image, alt: product.name, className: "max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300" }) }), _jsxs("div", { className: "space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-100", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-neutral-400", children: "Kapasite:" }), _jsx("strong", { className: "text-[var(--theme-text)] tabular-nums", children: product.standbyPower })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-neutral-400", children: "Prime:" }), _jsx("span", { className: "tabular-nums", children: product.primePower })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-neutral-400", children: "Teknoloji:" }), _jsx("span", { className: "truncate max-w-[150px]", children: product.alternator })] })] })] }), _jsxs("div", { className: "pt-4 mt-4 border-t border-neutral-100 flex items-center gap-2", children: [_jsx("button", { onClick: () => {
                                                    onClose();
                                                    onSelectProduct(product);
                                                }, className: "flex-1 py-2 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-800 transition-colors cursor-pointer text-center", children: catalog.specButtonLabel || 'Şartname' }), _jsx("button", { onClick: () => {
                                                    onClose();
                                                    onOpenQuoteWithProduct(product.name);
                                                }, className: "flex-1 py-2 px-3 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer text-center", children: catalog.quoteButtonLabel || 'Teklif Al' })] })] }, product.id))) }), filteredItems.length === 0 && (_jsx("div", { className: "text-center py-12 text-neutral-500", children: "Arad\u0131\u011F\u0131n\u0131z kriterlere uygun sistem bulunamad\u0131. L\u00FCtfen arama terimini de\u011Fi\u015Ftirin veya \u00F6zel proje ke\u015Ffi isteyin." }))] }), _jsxs("div", { className: "p-4 md:p-6 bg-neutral-50 border-t border-[var(--theme-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600", children: [_jsx("span", { children: catalog.footerText || 'Tüm sistemlerimiz mühendislik garantili ve anahtar teslim devreye alma kapsamındadır.' }), _jsx("button", { onClick: () => {
                                onClose();
                                onOpenQuoteWithProduct('Özel Enerji Altyapı Projesi');
                            }, className: "px-6 py-2.5 rounded-full bg-[var(--theme-dark)] text-white font-bold uppercase tracking-wider hover:bg-[var(--theme-primary)] transition-colors cursor-pointer", children: catalog.customQuoteLabel || 'Özel Proje Teklifi İste' })] })] }) }));
};
