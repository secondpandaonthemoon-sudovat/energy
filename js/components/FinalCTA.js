import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { ArrowUpRight, Phone, ShieldCheck, Clock, Zap } from 'lucide-react';
import { siteConfig } from '../data/siteConfig.js';
import { cmsButtonClass, runCmsLink } from '../runtimeContent.js';
const badgeIcon = (name) => {
    const cls = "w-5 h-5 text-[var(--theme-primary)] shrink-0";
    if (name === 'clock')
        return _jsx(Clock, { className: cls });
    if (name === 'zap')
        return _jsx(Zap, { className: cls });
    if (name === 'phone')
        return _jsx(Phone, { className: cls });
    return _jsx(ShieldCheck, { className: cls });
};
export const FinalCTA = ({ onOpenQuote, onOpenContact, activeGeneratorImage, cmsContent = {}, }) => {
    const content = cmsContent || {};
    const heading = content.heading || 'İşinizi birlikte güçlendirelim.';
    const accentWord = content.accentWord ?? 'güçlendirelim.';
    const renderHeading = () => {
        if (!accentWord || !heading.includes(accentWord))
            return heading;
        const [before, ...rest] = heading.split(accentWord);
        return _jsxs(_Fragment, { children: [before, _jsx("span", { className: "text-[var(--theme-primary)]", children: accentWord }), rest.join(accentWord)] });
    };
    const badges = Array.isArray(content.trustBadges) ? content.trustBadges.filter((x) => x.visible !== false) : [
        { id: 'warranty', icon: 'shield', title: '2 Yıl / 1000 Saat', subtitle: 'Tam Garanti Kapsamı', visible: true },
        { id: 'mobile', icon: 'clock', title: '7/24 Mobil Destek', subtitle: 'Mobil Müdahale Filosu', visible: true },
        { id: 'stock', icon: 'zap', title: 'Hızlı Stok Teslimatı', subtitle: '15 - 2500 kVA Hazır Stok', visible: true },
        { id: 'contact', icon: 'phone', title: 'Doğrudan Danışma', subtitle: siteConfig.brand.phone, visible: true },
    ];
    const imageVisible = content.imageVisible !== false;
    const bgWordVisible = content.backgroundWordVisible !== false;
    const glowVisible = content.glowVisible !== false;
    const kickerVisible = content.kickerVisible !== false;
    const descriptionVisible = content.descriptionVisible !== false;
    const buttonsVisible = content.buttonsVisible !== false;
    const badgesVisible = content.trustBadgesVisible !== false;
    const imageMaxWidth = Math.max(180, Math.min(900, Number(content.imageMaxWidth || 460)));
    const backgroundWordOpacity = Math.max(0, Math.min(100, Number(content.backgroundWordOpacity ?? 10))) / 100;
    const glowOpacity = Math.max(0, Math.min(100, Number(content.glowOpacity ?? 20))) / 100;
    const glowSize = Math.max(200, Math.min(1200, Number(content.glowSize || 600)));
    return (_jsxs("section", { className: "relative w-full py-28 md:py-40 bg-[var(--theme-dark)] text-white overflow-hidden selection:bg-[var(--theme-accent)] selection:text-white", children: [bgWordVisible && _jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden", style: { opacity: backgroundWordOpacity }, children: _jsx("span", { className: "text-[28vw] font-black tracking-tighter uppercase font-['Space_Grotesk'] text-transparent [-webkit-text-stroke:2px_white] leading-none whitespace-nowrap", children: content.backgroundWord || 'POWER' }) }), glowVisible && _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] pointer-events-none", style: { width: glowSize, height: glowSize, backgroundColor: content.glowColor || 'var(--theme-primary)', opacity: glowOpacity } }), _jsxs("div", { className: "relative z-10 max-w-7xl mx-auto px-6 md:px-10 flex flex-col items-center text-center", children: [kickerVisible && _jsxs("div", { className: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--theme-surface)]/10 border border-white/15 backdrop-blur-md mb-8", children: [_jsx(Zap, { className: "w-3.5 h-3.5 text-[var(--theme-primary)]" }), _jsx("span", { className: "text-xs font-bold tracking-widest uppercase text-white/90", children: content.kicker || 'KESİNTİSİZ GÜÇ İÇİN ADIM ATIN' })] }), _jsx("h2", { className: "text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter font-['Space_Grotesk'] leading-[0.95] max-w-5xl", children: renderHeading() }), descriptionVisible && _jsx("p", { className: "mt-6 text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl font-normal leading-relaxed", children: content.description || 'Tesisinizin yük kapasitesini uzman mühendislerimizle analiz edin. İhtiyacınıza en uygun jeneratör seti için 2 saat içinde detaylı teklif alın.' }), imageVisible && _jsx("div", { className: "my-10 w-full flex items-center justify-center", style: { maxWidth: imageMaxWidth }, children: _jsx("img", { src: content.mediaUrl || activeGeneratorImage, alt: content.altText || 'ASAY Energy CTA Görseli', className: "w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(241,72,46,0.25)] hover:scale-105 transition-transform duration-500" }) }), buttonsVisible && _jsx("div", { className: "flex flex-wrap items-center justify-center gap-4 w-full max-w-xl", children: (Array.isArray(content.buttons) && content.buttons.length > 0 ? content.buttons.filter((b) => b.visible !== false) : [
                            { id: 'cta-default-contact', text: 'İletişim', style: 'primary', link: { type: 'action', target: 'contact' } }
                        ]).map((b) => _jsxs("button", { onClick: () => runCmsLink(b.link, { quote: onOpenQuote, contact: onOpenContact }), className: `${cmsButtonClass(b.style || 'primary', true)} flex items-center justify-center gap-2 cursor-pointer`, children: [_jsx("span", { children: b.text }), _jsx(ArrowUpRight, { className: "w-4 h-4" })] }, b.id || b.text)) }), badgesVisible && badges.length > 0 && _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/10 w-full max-w-4xl text-left", children: badges.map((b) => _jsxs("div", { className: "flex items-center gap-3", children: [badgeIcon(b.icon || 'shield'), _jsxs("div", { className: "text-xs", children: [_jsx("span", { className: "font-bold text-white block", children: b.title }), _jsx("span", { className: "text-neutral-400", children: b.subtitle })] })] }, b.id || b.title)) })] })] }));
};
