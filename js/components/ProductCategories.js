import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from 'react';
import { siteConfig } from '../data/siteConfig.js';
import { Zap, Flame, BatteryCharging, Factory, Activity, ArrowUpRight, ArrowLeft, ArrowRight, Check, Volume2, Gauge, Sparkles } from 'lucide-react';
export const ProductCategories = ({ onSelectProduct, onOpenQuoteWithProduct, onOpenAllProducts, cmsContent = {}, }) => {
    const content = cmsContent;
    // Active Division State (Jeneratör, Buhar Kazanı, Trafo, Trijenerasyon, Kojenerasyon, Enerji Depolama)
    const [activeDivisionId, setActiveDivisionId] = useState('jenerator');
    const currentDivision = siteConfig.divisions.find((d) => d.id === activeDivisionId) || siteConfig.divisions[0] || { id: '', name: '', shortName: '', tagline: '', description: '', products: [] };
    // Active Model inside the current division
    const [selectedProductState, setSelectedProduct] = useState(currentDivision.products[0]);
    const selectedProduct = currentDivision.products.find(p => p.id === selectedProductState?.id) || currentDivision.products[0];
    const [modelPage, setModelPage] = useState(0);
    const modelsPerPage = 4;
    const visibleProducts = useMemo(() => {
        const start = modelPage * modelsPerPage;
        return currentDivision.products.slice(start, start + modelsPerPage);
    }, [currentDivision, modelPage]);
    const totalModelPages = Math.max(1, Math.ceil(currentDivision.products.length / modelsPerPage));
    useEffect(() => {
        const idx = currentDivision.products.findIndex((p) => p.id === selectedProduct?.id);
        if (idx >= 0)
            setModelPage(Math.floor(idx / modelsPerPage));
    }, [activeDivisionId]);
    const handleSelectDivision = (division) => {
        setActiveDivisionId(division.id);
        setSelectedProduct(division.products[0]);
        setModelPage(0);
    };
    const goToAdjacentModels = (direction) => {
        const divisions = siteConfig.divisions.filter((d) => d.products?.length);
        const divisionIndex = divisions.findIndex((d) => d.id === currentDivision.id);
        if (direction === 1) {
            if (modelPage < totalModelPages - 1) {
                const nextPage = modelPage + 1;
                setModelPage(nextPage);
                const nextProduct = currentDivision.products[nextPage * modelsPerPage];
                if (nextProduct)
                    setSelectedProduct(nextProduct);
                return;
            }
            const nextDivision = divisions[(divisionIndex + 1) % divisions.length];
            if (nextDivision) {
                setActiveDivisionId(nextDivision.id);
                setModelPage(0);
                setSelectedProduct(nextDivision.products[0]);
            }
            return;
        }
        if (modelPage > 0) {
            const prevPage = modelPage - 1;
            setModelPage(prevPage);
            const prevPageLast = currentDivision.products[Math.min(currentDivision.products.length - 1, prevPage * modelsPerPage + modelsPerPage - 1)];
            if (prevPageLast)
                setSelectedProduct(prevPageLast);
            return;
        }
        const prevDivision = divisions[(divisionIndex - 1 + divisions.length) % divisions.length];
        if (prevDivision) {
            const lastPage = Math.max(0, Math.ceil(prevDivision.products.length / modelsPerPage) - 1);
            setActiveDivisionId(prevDivision.id);
            setModelPage(lastPage);
            setSelectedProduct(prevDivision.products[prevDivision.products.length - 1]);
        }
    };
    const hasProducts = Boolean(currentDivision?.products?.length && selectedProduct);
    const getDivisionIcon = (id) => {
        switch (id) {
            case 'jenerator':
                return _jsx(Zap, { className: "w-4 h-4" });
            case 'buhar-kazani':
                return _jsx(Flame, { className: "w-4 h-4" });
            case 'trafo':
                return _jsx(Activity, { className: "w-4 h-4" });
            case 'trijenerasyon':
                return _jsx(Sparkles, { className: "w-4 h-4" });
            case 'kojenerasyon':
                return _jsx(Factory, { className: "w-4 h-4" });
            case 'enerji-depolama':
                return _jsx(BatteryCharging, { className: "w-4 h-4" });
            default:
                return _jsx(Zap, { className: "w-4 h-4" });
        }
    };
    if (!hasProducts) {
        return _jsx("section", { id: "products-section", className: "py-24 md:py-36 bg-[var(--theme-surface)] text-[var(--theme-text)] border-b border-[var(--theme-border)]", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 md:px-10", children: [_jsx("span", { className: "text-xs font-extrabold uppercase tracking-widest text-[var(--theme-primary)]", children: content.kicker || 'ÜRÜN GAMI VE MODELLER' }), _jsx("h2", { className: "text-3xl md:text-5xl font-black mt-2", children: content.heading || 'Endüstriyel Güç & Enerji Portföyü' }), _jsx("p", { className: "mt-4 text-neutral-500", children: "Yay\u0131nda aktif \u00FCr\u00FCn bulunmuyor." })] }) });
    }
    return (_jsx("section", { id: "products-section", className: "py-24 md:py-36 bg-[var(--theme-surface)] text-[var(--theme-text)] border-b border-[var(--theme-border)]", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 md:px-10", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-extrabold uppercase tracking-widest text-[var(--theme-primary)] mb-2 block", children: content.kicker || 'ÜRÜN GAMI VE MODELLER' }), _jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-['Space_Grotesk'] text-[var(--theme-dark)]", children: content.heading || 'Endüstriyel Güç & Enerji Portföyü' })] }), _jsx("p", { className: "text-sm text-neutral-500 max-w-md", children: content.description || 'Jeneratörden buhar kazanlarına, trafolardan kojenerasyon ve bataryalı enerji depolama sistemlerine kadar uçtan uca enerji altyapısı.' })] }), _jsx("div", { className: "grid gap-2 sm:gap-3 mb-8 w-full", style: { gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))' }, children: siteConfig.divisions.map((division) => {
                        const isActive = activeDivisionId === division.id;
                        return (_jsxs("button", { onClick: () => handleSelectDivision(division), className: `min-w-0 w-full min-h-[86px] flex flex-col items-center justify-center gap-1.5 px-3 sm:px-4 py-3 rounded-2xl text-[11px] sm:text-xs font-bold text-center transition-all duration-300 cursor-pointer border ${isActive
                                ? 'bg-[var(--theme-dark)] text-white border-[var(--theme-dark)] shadow-lg scale-[1.02]'
                                : 'bg-neutral-50 text-neutral-700 border-[var(--theme-border)] hover:bg-neutral-100 hover:border-neutral-300'}`, children: [_jsx("span", { className: isActive ? 'text-[var(--theme-primary)]' : 'text-neutral-400', children: getDivisionIcon(division.id) }), _jsx("span", { className: "min-w-0 leading-tight whitespace-nowrap", children: division.name }), _jsxs("span", { className: `text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${isActive ? 'bg-[var(--theme-surface)]/15 text-white/90' : 'bg-neutral-200/70 text-neutral-500'}`, children: [division.products.length, " Model"] })] }, division.id));
                    }) }), _jsxs("div", { className: "mb-8 flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-[var(--theme-border)]/70 text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-[var(--theme-primary)]" }), _jsx("strong", { className: "text-[var(--theme-text)] font-bold", children: currentDivision.shortName }), _jsx("span", { className: "text-neutral-400", children: "\u00B7" }), _jsx("span", { className: "text-neutral-600", children: currentDivision.tagline })] }), _jsx("span", { className: "text-neutral-400 hidden md:inline mt-1 sm:mt-0", children: currentDivision.description })] }), _jsxs("div", { className: "mb-10", children: [_jsxs("div", { className: "flex items-center justify-between gap-3 mb-4", children: [_jsxs("div", { className: "text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400", children: [currentDivision.name, " \u00B7 ", currentDivision.products.length, " Model", totalModelPages > 1 && _jsxs("span", { className: "ml-2 text-neutral-300", children: [modelPage + 1, "/", totalModelPages] })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsx("button", { type: "button", onClick: () => goToAdjacentModels(-1), "aria-label": "\u00D6nceki \u00FCr\u00FCnler", className: "w-10 h-10 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-dark)] hover:text-white hover:border-[var(--theme-dark)] transition-all flex items-center justify-center", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsxs("button", { type: "button", onClick: () => goToAdjacentModels(1), "aria-label": "Sonraki \u00FCr\u00FCnler", className: "h-10 pl-4 pr-3 rounded-full bg-[var(--theme-dark)] text-white hover:bg-[var(--theme-primary)] transition-all flex items-center gap-2 text-xs font-bold", children: ["\u0130leri", _jsx(ArrowRight, { className: "w-4 h-4" })] })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: visibleProducts.map((product) => {
                                const isSelected = selectedProduct.id === product.id;
                                return (_jsxs("button", { onClick: () => setSelectedProduct(product), className: `min-w-0 p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer border ${isSelected
                                        ? 'bg-[var(--theme-dark)] text-white border-[var(--theme-dark)] shadow-xl ring-2 ring-[var(--theme-primary)]/30'
                                        : 'bg-[var(--theme-surface)] text-neutral-800 border-[var(--theme-border)] hover:bg-neutral-50 hover:border-neutral-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("span", { className: `text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-[var(--theme-primary)]' : 'text-neutral-500'}`, children: product.standbyPower.split('/')[0].trim() }), _jsx("span", { className: isSelected ? 'text-[var(--theme-primary)]' : 'text-neutral-400', children: getDivisionIcon(currentDivision.id) })] }), _jsx("h3", { className: "font-bold text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.5rem]", children: product.name }), _jsx("p", { className: `text-xs mt-1 truncate ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`, children: product.series })] }, product.id));
                            }) })] }), _jsxs("div", { className: "bg-[var(--theme-light)] rounded-3xl border border-[var(--theme-border)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm", children: [_jsxs("div", { className: "lg:col-span-6 p-8 md:p-12 flex flex-col justify-between items-center relative overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-neutral-100 border-b lg:border-b-0 lg:border-r border-[var(--theme-border)]", children: [_jsx("div", { className: "absolute w-[340px] h-[340px] rounded-full bg-[var(--theme-primary)]/10 blur-3xl pointer-events-none" }), _jsxs("div", { className: "w-full flex items-center justify-between z-10", children: [_jsxs("span", { className: "text-xs font-bold uppercase tracking-wider text-neutral-400", children: ["MODEL: ", selectedProduct.id.toUpperCase()] }), _jsx("span", { className: "px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-900 text-white", children: "STOKTA MEVCUT" })] }), _jsx("div", { className: "my-8 relative w-full flex items-center justify-center min-h-[300px]", children: _jsx("img", { src: selectedProduct.image, alt: selectedProduct.name, className: "max-h-[320px] w-auto object-contain hover:scale-105 transition-transform duration-500" }) }), _jsxs("div", { className: "w-full flex items-center justify-between text-xs text-neutral-600 pt-4 border-t border-[var(--theme-border)]/80 z-10", children: [_jsxs("span", { className: "flex items-center gap-1.5 font-medium", children: [_jsx(Volume2, { className: "w-3.5 h-3.5 text-[var(--theme-primary)]" }), selectedProduct.noiseLevel] }), _jsxs("span", { className: "flex items-center gap-1.5 font-medium", children: [_jsx(Gauge, { className: "w-3.5 h-3.5 text-[var(--theme-primary)]" }), selectedProduct.fuelCapacity] })] })] }), _jsxs("div", { className: "lg:col-span-6 p-8 md:p-12 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "flex items-center gap-2 mb-2", children: _jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-[var(--theme-primary)]", children: selectedProduct.series }) }), _jsx("h3", { className: "text-2xl sm:text-3xl font-black font-['Space_Grotesk'] text-[var(--theme-dark)]", children: selectedProduct.name }), _jsx("p", { className: "mt-3 text-sm text-neutral-600 leading-relaxed", children: selectedProduct.description }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-[var(--theme-border)]", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[11px] font-bold text-neutral-400 uppercase tracking-wider block", children: "Kapasite / Nominal G\u00FC\u00E7" }), _jsx("span", { className: "text-base font-extrabold text-[var(--theme-text)] tabular-nums", children: selectedProduct.standbyPower })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[11px] font-bold text-neutral-400 uppercase tracking-wider block", children: "S\u00FCrekli \u0130\u015Fletme (Prime)" }), _jsx("span", { className: "text-base font-extrabold text-[var(--theme-text)] tabular-nums", children: selectedProduct.primePower })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[11px] font-bold text-neutral-400 uppercase tracking-wider block", children: "Motor / Br\u00FCl\u00F6r / H\u00FCcre Tipi" }), _jsx("span", { className: "text-xs font-bold text-neutral-800", children: selectedProduct.engine })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[11px] font-bold text-neutral-400 uppercase tracking-wider block", children: "Verimlilik / Alternat\u00F6r" }), _jsx("span", { className: "text-xs font-bold text-neutral-800", children: selectedProduct.alternator })] })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-[var(--theme-border)]", children: [_jsx("span", { className: "text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-3", children: "Standart Donan\u0131m \u00D6zellikleri:" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: (selectedProduct.features || []).map((feat, idx) => (_jsxs("div", { className: "flex items-center gap-2 text-xs font-medium text-neutral-700", children: [_jsx("div", { className: "w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0", children: _jsx(Check, { className: "w-2.5 h-2.5 text-emerald-700" }) }), _jsx("span", { children: feat })] }, idx))) })] })] }), _jsxs("div", { className: "mt-8 pt-6 border-t border-[var(--theme-border)] flex flex-wrap items-center gap-4", children: [_jsxs("button", { onClick: () => onOpenQuoteWithProduct(selectedProduct.name), className: "flex-1 min-w-[200px] bg-[var(--theme-primary)] text-white py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[var(--theme-primary-hover)] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer", children: [_jsx("span", { children: content.primaryCta || 'Bu Model İçin Teklif Al' }), _jsx(ArrowUpRight, { className: "w-4 h-4" })] }), _jsx("button", { onClick: () => onSelectProduct(selectedProduct), className: "px-6 py-3.5 rounded-full bg-[var(--theme-surface)] border border-neutral-300 text-neutral-800 font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-colors cursor-pointer", children: "Teknik \u015Eartnameyi A\u00E7" })] })] })] }), _jsxs("div", { className: "mt-12 flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 rounded-2xl bg-neutral-900 text-white gap-4 shadow-lg", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-[var(--theme-primary)] block mb-1", children: "6 FARKLI END\u00DCSTR\u0130YEL KATEGOR\u0130 \u00B7 T\u00DCM MODELLER" }), _jsx("h4", { className: "text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-white", children: "Di\u011Fer jenerat\u00F6r, buhar kazan\u0131, trafo ve kojenerasyon modellerini mi ar\u0131yorsunuz?" }), _jsx("p", { className: "text-xs text-neutral-400 mt-1", children: "T\u00FCm g\u00FC\u00E7 aral\u0131klar\u0131, teknik \u00F6zellik tablolar\u0131 ve \u015Fartnameler i\u00E7in tam \u00FCr\u00FCn katalo\u011Fumuza g\u00F6z at\u0131n." })] }), _jsxs("button", { onClick: onOpenAllProducts, className: "px-8 py-4 rounded-full bg-[var(--theme-surface)] text-[var(--theme-text)] hover:bg-[var(--theme-primary)] hover:text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group", children: [_jsx("span", { children: content.secondaryCta || 'Diğer Ürünlere Git' }), _jsx(ArrowUpRight, { className: "w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" })] })] })] }) }));
};
