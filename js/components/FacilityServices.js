import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../data/siteConfig.js';
import { ArrowUpRight, Activity, Layers, Wrench, ShieldCheck } from 'lucide-react';
import { runCmsLink, cmsButtonClass } from '../runtimeContent.js';
export const FacilityServices = ({ onOpenQuote, cmsContent = {}, }) => {
    const content = cmsContent;
    const services = Array.isArray(siteConfig.services) ? siteConfig.services : [];
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [entered, setEntered] = useState(false);
    const sectionRef = useRef(null);
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setEntered(true);
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some(entry => entry.isIntersecting)) {
                setEntered(true);
                observer.disconnect();
            }
        }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (activeCardIndex >= services.length) setActiveCardIndex(Math.max(0, services.length - 1));
    }, [activeCardIndex, services.length]);
    const serviceStyle = siteConfig.serviceStyle || {};
    const serviceBackground = serviceStyle.backgroundImage || siteConfig.images.facilityEngineer;
    const activeService = services[activeCardIndex] || null;
    const activeBackground = activeService?.image || serviceBackground;
    const servicePosition = `${Number(serviceStyle.positionX ?? 50)}% ${Number(serviceStyle.positionY ?? 50)}%`;
    const serviceOverlay = Math.max(0, Math.min(90, Number(serviceStyle.overlay ?? 55))) / 100;
    const getServiceIcon = (iconName) => {
        switch (iconName) {
            case 'Activity': return _jsx(Activity, { className: "w-5 h-5 text-white" });
            case 'Layers': return _jsx(Layers, { className: "w-5 h-5 text-white" });
            case 'Wrench': return _jsx(Wrench, { className: "w-5 h-5 text-white" });
            case 'ShieldCheck': return _jsx(ShieldCheck, { className: "w-5 h-5 text-white" });
            default: return _jsx(Activity, { className: "w-5 h-5 text-white" });
        }
    };
    return (_jsx("section", { ref: sectionRef, id: "services-section", className: "relative w-full py-24 md:py-36 bg-[var(--theme-surface)] overflow-hidden", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 md:px-10", children: [_jsxs("div", { className: `max-w-2xl mb-12 transition-all duration-700 ease-out ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`, children: [_jsx("span", { className: "text-xs font-extrabold uppercase tracking-widest text-[var(--theme-primary)] mb-2 block", children: content.kicker || 'UÇTAN UCA HİZMETLER' }), _jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-['Space_Grotesk'] text-[var(--theme-dark)]", children: content.heading || 'Sadece Jeneratör Değil, Kesintisiz Enerji Güvencesi' }), _jsx("p", { className: "mt-4 text-sm sm:text-base text-neutral-600 font-medium", children: content.description || 'Mühendislik projelendirmesinden montaja, 7/24 mobil teknik servis filomuzdan yük testlerine kadar tüm süreci tek elden yönetiyoruz.' })] }), _jsxs("div", { className: `relative rounded-3xl overflow-hidden shadow-2xl border border-[var(--theme-border)]/80 min-h-[580px] md:min-h-[660px] flex items-center transition-all duration-700 ease-out ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`, children: [_jsxs("div", { className: "absolute inset-0 z-0", children: [_jsx("img", { src: activeBackground, alt: activeService?.title || "ASAY Energy hizmetleri", className: "w-full h-full object-cover filter brightness-[0.92] contrast-[1.05] transition-opacity duration-300", style: { objectPosition: servicePosition } }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent lg:from-black/70 lg:via-black/25 lg:to-transparent", style: { opacity: Math.min(1, serviceOverlay / 0.55) } })] }), _jsx("div", { className: "relative z-10 p-6 sm:p-10 md:p-14 w-full max-w-xl", children: _jsx("div", { className: "flex flex-col gap-4", children: services.map((service, idx) => {
                                    const isActive = activeCardIndex === idx;
                                    const enterStyle = {
                                        opacity: entered ? 1 : 0,
                                        transform: entered ? 'translate3d(0,0,0)' : 'translate3d(0,28px,0)',
                                        transition: 'opacity 420ms ease-out, transform 420ms ease-out',
                                        transitionDelay: `${80 + idx * 90}ms`,
                                    };
                                    return (_jsx("div", { style: enterStyle, children: _jsxs("div", { onMouseEnter: () => setActiveCardIndex(idx), onClick: () => setActiveCardIndex(idx), className: `transition-all duration-300 rounded-2xl p-6 cursor-pointer border ${isActive ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)] shadow-2xl scale-[1.03] translate-x-2' : 'bg-[var(--theme-surface)]/90 backdrop-blur-md text-[var(--theme-text)] border-white/40 hover:bg-[var(--theme-surface)] hover:shadow-lg'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `text-lg font-black font-['Space_Grotesk'] tabular-nums ${isActive ? 'text-white/90' : 'text-[var(--theme-primary)]'}`, children: service.number }), _jsx("span", { className: `text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white/80' : 'text-neutral-500'}`, children: service.subtitle })] }), _jsx("div", { className: `p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-neutral-100 text-neutral-800'}`, children: getServiceIcon(service.iconName) })] }), _jsx("h3", { className: `text-lg sm:text-xl font-bold ${isActive ? 'text-white' : 'text-[var(--theme-text)]'}`, children: service.title }), _jsx("p", { className: `text-xs sm:text-sm mt-2 leading-relaxed ${isActive ? 'text-white/90' : 'text-neutral-600'}`, children: service.description }), isActive && (_jsxs("div", { className: "mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-3", children: [_jsx("div", { className: "flex flex-wrap gap-2", children: (Array.isArray(content.buttons) ? content.buttons.filter((b) => b.visible !== false) : []).map((b) => (_jsxs("button", { onClick: (e) => { e.stopPropagation(); runCmsLink(b.link, { quote: onOpenQuote }); }, className: `${cmsButtonClass(b.style || 'outline', true)} !px-3 !py-2`, children: [_jsx("span", { children: b.text }), _jsx(ArrowUpRight, { className: "w-3.5 h-3.5" })] }, b.id || b.text))) }), _jsx("span", { className: "text-[10px] uppercase font-bold tracking-widest text-white/70 shrink-0", children: "ASAY STANDARDI" })] }))] }) }, service.id || service.number || idx));
                                }) }) })] })] }) }));
};