import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { siteConfig } from '../data/siteConfig.js';
import { Cpu, Gauge, Volume2, Flame, RefreshCw, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { runCmsLink, cmsValue } from '../runtimeContent.js';
export const TechnicalBreakdown = ({ activeGeneratorImage, onOpenQuote, cmsContent = {}, }) => {
    const content = cmsContent;
    // Track currently hovered hotspot
    const [hoveredHotspot, setHoveredHotspot] = useState(null);
    const stage = cmsValue('technicalStage', {});
    const technicalImage = stage.image || activeGeneratorImage;
    const imageWidth = Math.max(20, Math.min(100, Number(stage.imageWidthPercent ?? 88)));
    const imageMaxHeight = Math.max(180, Math.min(900, Number(stage.imageMaxHeight ?? 500)));
    const stageHeight = Math.max(360, Math.min(900, Number(stage.stageHeight ?? 620)));
    const imageX = Math.max(0, Math.min(100, Number(stage.imagePositionX ?? 50)));
    const imageY = Math.max(0, Math.min(100, Number(stage.imagePositionY ?? 50)));
    const imageFit = stage.imageFit === 'cover' ? 'cover' : 'contain';
    const getIconForHotspot = (id) => {
        switch (id) {
            case 'alternator':
                return _jsx(Zap, { className: "w-5 h-5 text-[var(--theme-primary)]" });
            case 'engine':
                return _jsx(Gauge, { className: "w-5 h-5 text-[var(--theme-primary)]" });
            case 'canopy':
                return _jsx(Volume2, { className: "w-5 h-5 text-[var(--theme-primary)]" });
            case 'controller':
                return _jsx(Cpu, { className: "w-5 h-5 text-[var(--theme-primary)]" });
            case 'fuel':
                return _jsx(Flame, { className: "w-5 h-5 text-[var(--theme-primary)]" });
            case 'ats':
                return _jsx(RefreshCw, { className: "w-5 h-5 text-[var(--theme-primary)]" });
            default:
                return _jsx(CheckCircle2, { className: "w-5 h-5 text-[var(--theme-primary)]" });
        }
    };
    return (_jsxs("section", { id: "technical-section", className: "relative z-20 w-full py-24 md:py-36 bg-[var(--theme-light)] text-[var(--theme-text)] overflow-hidden selection:bg-[var(--theme-accent)] selection:text-white", children: [_jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" }), _jsxs("div", { className: "relative z-10 max-w-7xl mx-auto px-6 md:px-10", children: [_jsxs("div", { className: "text-center max-w-3xl mx-auto mb-12 md:mb-16", children: [_jsx("span", { className: "text-xs font-extrabold uppercase tracking-widest text-[var(--theme-primary)] mb-2 block", children: content.kicker || 'MÜHENDİSLİK DETAYI & ANATOMİ' }), _jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-['Space_Grotesk'] text-[var(--theme-dark)]", children: content.heading || 'İleri Mühendislik Bileşenleri' }), _jsx("p", { className: "mt-3 text-sm sm:text-base text-neutral-600 font-medium", children: content.description || 'Jeneratör üzerindeki interaktif noktalara gelerek her bir komponentin teknik verilerini inceleyebilirsiniz.' })] }), _jsxs("div", { className: "relative w-full rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)]/90 shadow-xl p-6 sm:p-10 md:p-14 min-h-[620px] flex flex-col items-center justify-center", children: [_jsxs("div", { className: "w-full flex items-center justify-between pb-6 border-b border-neutral-100 text-xs font-mono text-neutral-400", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-ping" }), "CAD EXPLODED VIEW // 400V 50HZ 3-PHASE"] }), _jsx("span", { className: "hidden sm:inline", children: "NOKTALARIN \u00DCZER\u0130NE GELEREK \u0130NCELEY\u0130N" })] }), _jsxs("div", { className: "relative w-full max-w-[900px] my-8 flex items-center justify-center", style: { minHeight: `${stageHeight}px` }, children: [_jsx("div", { className: "absolute w-[420px] h-[420px] rounded-full bg-neutral-100 -z-10 blur-3xl pointer-events-none" }), _jsxs("div", { className: "relative w-full", style: { height: `${stageHeight}px` }, children: [_jsx("img", { src: technicalImage, alt: "Jenerat\u00F6r M\u00FChendislik Anatomisi", className: "absolute select-none filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.14)] pointer-events-none", style: {
                                                    width: `${imageWidth}%`,
                                                    maxHeight: `${imageMaxHeight}px`,
                                                    height: 'auto',
                                                    objectFit: imageFit,
                                                    left: `${imageX}%`,
                                                    top: `${imageY}%`,
                                                    transform: 'translate(-50%, -50%)',
                                                } }), siteConfig.technicalHotspots.map((item, index) => {
                                                const isHovered = hoveredHotspot?.id === item.id;
                                                return (_jsxs("div", { style: {
                                                        left: `${item.position.x}%`,
                                                        top: `${item.position.y}%`,
                                                    }, className: "absolute -translate-x-1/2 -translate-y-1/2 z-30", children: [_jsxs("button", { onMouseEnter: () => setHoveredHotspot(item), onMouseLeave: () => setHoveredHotspot(null), onClick: () => setHoveredHotspot(isHovered ? null : item), className: "relative p-2 group cursor-pointer focus:outline-none", "aria-label": item.title, children: [_jsx("span", { className: `absolute inset-0 rounded-full transition-all duration-300 ${isHovered
                                                                        ? 'bg-[var(--theme-primary)]/30 scale-150 animate-ping'
                                                                        : 'bg-black/10 group-hover:bg-[var(--theme-primary)]/20 scale-110'}` }), _jsxs("span", { className: `relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black font-mono shadow-lg transition-all duration-300 border-2 ${isHovered
                                                                        ? 'bg-[var(--theme-primary)] text-white border-white scale-125 ring-4 ring-[var(--theme-primary)]/20'
                                                                        : 'bg-[var(--theme-surface)] text-[var(--theme-text)] border-[var(--theme-dark)] group-hover:bg-[var(--theme-primary)] group-hover:text-white group-hover:border-white'}`, children: ["0", index + 1] })] }), isHovered && (_jsxs("div", { onMouseEnter: () => setHoveredHotspot(item), onMouseLeave: () => setHoveredHotspot(null), className: `absolute z-40 w-72 sm:w-80 p-5 rounded-2xl bg-neutral-900 text-white border border-white/15 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 pointer-events-auto ${item.side === 'left'
                                                                ? 'right-full mr-4 top-1/2 -translate-y-1/2'
                                                                : 'left-full ml-4 top-1/2 -translate-y-1/2'} ${
                                                            // Mobile fallback: clamp to center
                                                            'max-sm:fixed max-sm:inset-x-4 max-sm:top-auto max-sm:bottom-6 max-sm:w-auto max-sm:translate-y-0 max-sm:mr-0 max-sm:ml-0'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-[10px] font-bold text-[var(--theme-primary)] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20", children: item.badge }), _jsx("div", { className: "p-1 rounded-lg bg-[var(--theme-surface)]/10", children: getIconForHotspot(item.id) })] }), _jsx("h4", { className: "text-base font-bold font-['Space_Grotesk'] text-white", children: item.title }), _jsx("p", { className: "text-xs text-[var(--theme-primary)] font-medium mt-0.5", children: item.subtitle }), _jsx("p", { className: "text-xs text-neutral-300 mt-2.5 leading-relaxed", children: item.description })] }))] }, item.id));
                                            })] })] }), _jsxs("div", { className: "w-full pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs", children: [_jsxs("div", { className: "flex items-center gap-2 text-neutral-600", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[var(--theme-primary)]" }), hoveredHotspot ? (_jsxs("span", { children: ["\u0130ncelenen Bile\u015Fen: ", _jsx("strong", { className: "text-[var(--theme-text)]", children: hoveredHotspot.title }), " \u2014 ", hoveredHotspot.badge] })) : (_jsx("span", { className: "text-neutral-500 italic", children: "Detaylar\u0131 g\u00F6rmek i\u00E7in jenerat\u00F6r\u00FCn \u00FCzerindeki numaral\u0131 noktalara gelin." }))] }), (Array.isArray(content.buttons) ? content.buttons.filter((b) => b.visible !== false).slice(0, 1) : [{ id: 'tech-default', text: content.primaryCta || 'Özel Mühendislik Talebi Oluştur', link: { type: 'action', target: 'quote' } }]).map((b) => _jsxs("button", { onClick: () => runCmsLink(b.link, { quote: onOpenQuote }), className: "text-xs font-bold text-[var(--theme-primary)] hover:underline flex items-center gap-1 cursor-pointer", children: [_jsx("span", { children: b.text }), _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] }, b.id || b.text))] })] })] })] }));
};
