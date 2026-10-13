import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useEffect, useState } from 'react';
import { ArrowUpRight, Play, ChevronDown } from 'lucide-react';
import { siteConfig } from '../data/siteConfig.js';
import { cmsValue, cmsButtonClass, runCmsLink } from '../runtimeContent.js';
export const Hero = ({ onOpenQuote, onOpenVideoReel, activeGeneratorImage, cmsContent = {}, }) => {
    const heroRef = useRef(null);
    const generatorRef = useRef(null);
    const decorativeRef = useRef(null);
    const [viewportWidth, setViewportWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1440);
    useEffect(() => {
        let raf = 0;
        let current = 0;
        let target = 0;
        let active = true;
        const clamp01 = (v) => Math.max(0, Math.min(1, v));
        const measureTarget = () => {
            const rect = heroRef.current?.getBoundingClientRect();
            const heroHeight = Math.max(1, rect?.height || window.innerHeight);
            const passed = Math.max(0, -(rect?.top || 0));
            target = clamp01(passed / Math.max(520, heroHeight * 0.92));
            if (!raf) raf = requestAnimationFrame(tick);
        };
        const tick = () => {
            raf = 0;
            if (!active) return;
            current += (target - current) * 0.18;
            if (Math.abs(target - current) < 0.001) current = target;
            const mobile = window.innerWidth < 640;
            const travel = mobile ? Math.min(420, Math.max(300, window.innerHeight * 0.48)) : Math.min(470, Math.max(360, window.innerHeight * 0.50));
            const intensity = Math.max(0, Math.min(1.5, Number(cmsValue('heroMotion.generatorIntensity', 1))));
            const y = current * travel * intensity;
            const scale = 1 - current * 0.075 * Math.min(intensity, 1);
            const discScale = 1 + current * 0.14;
            if (generatorRef.current) {
                generatorRef.current.style.transform = `translate3d(-50%, calc(-50% + ${y.toFixed(2)}px), 0) scale(${scale.toFixed(4)})`;
            }
            if (decorativeRef.current) {
                decorativeRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${discScale.toFixed(4)})`;
            }
            if (current !== target) raf = requestAnimationFrame(tick);
        };
        const onScroll = () => measureTarget();
        window.addEventListener('scroll', onScroll, { passive: true });
        measureTarget();
        return () => { active = false; window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
    }, []);
    useEffect(() => {
        let raf = 0;
        const onResize = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; setViewportWidth(window.innerWidth); }); };
        window.addEventListener('resize', onResize, { passive: true });
        return () => { window.removeEventListener('resize', onResize); if (raf) cancelAnimationFrame(raf); };
    }, []);
    const typoParallax1 = 0;
    const typoParallax2 = 0;
    const titleTopSizeMobile = Number(cmsValue('heroStyle.titleTopSizeMobile', 15.6));
    const titleTopSizeDesktop = Number(cmsValue('heroStyle.titleTopSizeDesktop', 13.4));
    const titleBottomSizeMobile = Number(cmsValue('heroStyle.titleBottomSizeMobile', 18.2));
    const titleBottomSizeDesktop = Number(cmsValue('heroStyle.titleBottomSizeDesktop', 15.2));
    const heroStats = Array.isArray(cmsValue('heroStats', siteConfig.heroStats)) && cmsValue('heroStats', siteConfig.heroStats).length ? cmsValue('heroStats', siteConfig.heroStats) : siteConfig.heroStats;
    const decorativeImage = String(cmsValue('images.heroDecorative', ''));
    const decorativeSize = Number(cmsValue('heroStyle.decorativeSize', 680));
    const decorativeWidthVw = Math.max(10, Math.min(95, Number(cmsValue('heroStyle.decorativeWidthVw', 62))));
    const decorativeOpacity = Math.max(0, Math.min(100, Number(cmsValue('heroStyle.decorativeOpacity', 90)))) / 100;
    const decorativeShape = String(cmsValue('heroStyle.decorativeShape', 'circle'));
    const decorativeColor = String(cmsValue('heroStyle.decorativeColor', 'var(--theme-primary)'));
    const shapeStyle = decorativeShape === 'ring'
        ? { border: `clamp(18px, 3vw, 48px) solid ${decorativeColor}`, background: 'transparent', borderRadius: '9999px' }
        : decorativeShape === 'square'
            ? { background: decorativeColor, borderRadius: '22%' }
            : decorativeShape === 'diamond'
                ? { background: decorativeColor, borderRadius: '18%', transform: 'rotate(45deg)' }
                : decorativeShape === 'hexagon'
                    ? { background: decorativeColor, clipPath: 'polygon(25% 6.7%,75% 6.7%,100% 50%,75% 93.3%,25% 93.3%,0% 50%)' }
                    : { background: decorativeColor, borderRadius: '9999px' };
    const configuredHeroVideos = cmsValue('media.heroVideos', null);
    const heroVideos = Array.isArray(configuredHeroVideos) && configuredHeroVideos.length
        ? configuredHeroVideos.filter((item) => item && item.visible !== false).sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
        : (cmsValue('media.videoEnabled', true) !== false ? [{ id: 'video_legacy', title: cmsContent.videoTitle || cmsValue('hero.videoTitle', 'Saha Test Videosunu İzle'), subtitle: cmsContent.videoSubtitle || cmsValue('hero.videoSubtitle', 'Fabrika Yük Testi (Load Bank Test)'), video: cmsValue('media.videoReel', ''), poster: cmsValue('media.videoPoster', ''), autoplay: cmsValue('media.videoAutoplay', false), loop: cmsValue('media.videoLoop', true), muted: cmsValue('media.videoMuted', true), visible: true, sortOrder: 0 }] : []);
    return (_jsxs("section", { ref: heroRef, className: "relative z-10 w-full min-h-screen pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden bg-[var(--theme-surface)] flex flex-col justify-between selection:bg-[var(--theme-accent)] selection:text-white", children: [_jsx("div", { className: "absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(var(--theme-dark)_1px,transparent_1px)] [background-size:24px_24px]" }), _jsxs("div", { className: "relative z-20 max-w-7xl mx-auto w-full px-6 md:px-10 flex items-center justify-between text-[11px] font-semibold tracking-wider text-neutral-400 uppercase", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-[var(--theme-primary)]" }), _jsx("span", { children: cmsContent.eyebrow || cmsValue('hero.eyebrow', 'AĞIR HİZMET GÜÇ SİSTEMLERİ · 15 - 2500 kVA') })] }), _jsxs("div", { className: "hidden sm:flex items-center gap-6", children: [_jsx("span", { children: cmsContent.metaLeft || cmsValue('hero.metaLeft', 'STOKTAN DERHAL TESLİM') }), _jsx("span", { children: "\u00B7" }), _jsx("span", { children: cmsContent.metaRight || cmsValue('hero.metaRight', 'AVRUPA MOTOR & ALTERNATÖR GÜVENCESİ') })] })] }), _jsxs("div", { className: "absolute inset-0 z-10 w-full h-full overflow-hidden", children: [_jsx("div", { className: "hero-auto-title hero-auto-title-top absolute pointer-events-none select-none z-[40]", children: _jsx("h1", { className: "hero-title-top font-black tracking-tighter text-[var(--theme-dark)] leading-[0.82] font-['Space_Grotesk'] whitespace-normal text-center break-words max-w-[94vw]", children: cmsContent.titleTop || cmsValue('hero.titleTop', 'KESİNTİSİZ') }) }), _jsx("div", { className: "hero-auto-title hero-auto-title-bottom absolute pointer-events-none select-none z-[40]", children: _jsx("h1", { className: "hero-title-bottom font-black tracking-tighter text-[var(--theme-dark)] leading-[0.82] font-['Space_Grotesk'] whitespace-normal text-center break-words max-w-[94vw]", children: cmsContent.titleBottom || cmsValue('hero.titleBottom', 'GÜÇ') }) }), _jsx("div", { ref: decorativeRef, style: { left: '50%', top: '50%', transform: `translate3d(-50%, -50%, 0) scale(1)`, width: `min(${decorativeSize}px, ${decorativeWidthVw}vw)`, aspectRatio: '1 / 1', opacity: decorativeOpacity }, className: "absolute pointer-events-none z-10 flex items-center justify-center will-change-transform", children: decorativeImage ? (_jsx("img", { src: decorativeImage, alt: "", "aria-hidden": "true", className: "hero-decorative-pulse w-full h-full object-contain select-none", draggable: false })) : (_jsx("div", { className: "hero-decorative-pulse w-full h-full", style: shapeStyle })) }), _jsx("div", { ref: generatorRef, style: { left: '50%', top: '50%', transform: `translate3d(-50%, -50%, 0) scale(1)` }, className: "absolute z-20 w-[88%] max-w-[540px] sm:max-w-[720px] md:max-w-[920px] lg:max-w-[1100px] xl:max-w-[1200px] will-change-transform flex items-center justify-center pointer-events-none", children: _jsx("img", { src: activeGeneratorImage, alt: "Asay Energy P33 Endüstriyel Dizel Jeneratör", className: "w-full h-auto object-contain max-h-[80vh] md:max-h-[88vh] select-none pointer-events-auto hover:scale-[1.01] transition-transform duration-500", loading: "eager", draggable: false }) }), cmsValue('hero.badgeVisible', true) !== false ? _jsx("div", { className: "absolute left-6 md:left-12 bottom-10 md:bottom-16 z-30 max-w-[240px] hidden sm:block", children: _jsxs("div", { className: "p-4 bg-[var(--theme-surface)]/90 backdrop-blur-md rounded-2xl border border-[var(--theme-border)]/80 shadow-lg flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), _jsx("span", { className: "text-[11px] font-bold text-[var(--theme-text)] uppercase tracking-wider", children: cmsContent.badgeTitle || cmsValue('hero.badgeTitle', 'ASAY P33-PRO') })] }), _jsx("p", { className: "text-xs text-neutral-600 font-medium leading-relaxed", children: cmsContent.badgeDescription || cmsValue('hero.badgeDescription', '33 kVA Süper Sessiz Kabinli Endüstriyel Dizel Jeneratör Seti.') }), _jsxs("button", { onClick: onOpenQuote, className: "mt-1 flex items-center gap-1 text-[11px] font-bold text-[var(--theme-primary)] hover:underline cursor-pointer", children: [_jsx("span", { children: cmsContent.badgeLink || cmsValue('hero.badgeLink', 'Teknik Şartnameyi İncele') }), _jsx(ArrowUpRight, { className: "w-3 h-3" })] })] }) }) : null, _jsx("div", { className: "absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-6 md:gap-8 hidden sm:flex", children: heroStats.map((stat, idx) => (_jsxs("div", { className: "flex flex-col text-right group p-2 rounded-xl transition-all hover:bg-neutral-50/70", children: [_jsx("span", { className: "text-3xl md:text-4xl font-extrabold text-[var(--theme-dark)] tracking-tight tabular-nums font-['Space_Grotesk'] leading-none", children: stat.value }), _jsx("span", { className: "text-xs font-bold text-neutral-700 tracking-wide mt-1", children: stat.label }), _jsx("span", { className: "text-[10px] text-neutral-400 font-medium tracking-tight", children: stat.sub })] }, idx))) }), _jsx("div", { className: "absolute left-3 right-3 bottom-[86px] z-30 grid grid-cols-3 gap-1.5 sm:hidden", children: heroStats.map((stat, idx) => (_jsxs("div", { className: "min-w-0 rounded-xl border border-black/5 bg-white/82 backdrop-blur-md px-2 py-2.5 text-center shadow-sm", children: [_jsx("span", { className: "block text-[18px] font-black text-[var(--theme-dark)] tracking-tight tabular-nums font-['Space_Grotesk'] leading-none", children: stat.value }), _jsx("span", { className: "block text-[9px] font-bold text-neutral-700 leading-tight mt-1", children: stat.label }), _jsx("span", { className: "block text-[8px] text-neutral-400 leading-tight mt-0.5 truncate", children: stat.sub })] }, idx))) })] }), _jsxs("div", { className: "relative z-20 max-w-7xl mx-auto w-full px-6 md:px-10 flex items-center justify-between pt-4", children: [_jsx("div", { className: "flex flex-col items-start gap-2 max-w-[310px]", children: heroVideos.map((item, idx) => _jsxs("button", { onClick: () => onOpenVideoReel(item), className: "flex items-center gap-3 group cursor-pointer rounded-xl bg-[var(--theme-surface)]/80 backdrop-blur-sm border border-transparent hover:border-[var(--theme-border)] px-2 py-1.5 transition-all", children: [_jsx("div", { className: "w-10 h-10 shrink-0 rounded-full bg-[var(--theme-surface)] border border-neutral-300 flex items-center justify-center text-[var(--theme-primary)] shadow-sm group-hover:scale-110 group-hover:bg-[var(--theme-primary)] group-hover:text-white transition-all duration-300", children: _jsx(Play, { className: "w-4 h-4 fill-current ml-0.5" }) }), _jsxs("div", { className: "flex flex-col text-left min-w-0", children: [_jsx("span", { className: "text-xs font-bold text-[var(--theme-text)] group-hover:text-[var(--theme-primary)] transition-colors truncate", children: item.title || `Video ${idx + 1}` }), item.subtitle ? _jsx("span", { className: "text-[10px] text-neutral-400 font-medium truncate", children: item.subtitle }) : null] })] }, item.id || idx)) }), _jsxs("a", { href: "#manifesto-section", className: "flex flex-col items-center gap-1 text-neutral-400 hover:text-black transition-colors", children: [_jsx("span", { className: "text-[10px] uppercase font-bold tracking-widest", children: cmsContent.scrollLabel || cmsValue('hero.scrollLabel', 'AŞAĞI KAYDIR') }), _jsx(ChevronDown, { className: "w-4 h-4 animate-bounce" })] }), _jsx("div", { className: "flex items-center gap-2", children: (Array.isArray(cmsContent.buttons) ? cmsContent.buttons.filter((b) => b.visible !== false) : [{ id: 'hero-default', text: cmsContent.quoteLabel || cmsValue('hero.quoteLabel', 'Hızlı Güç Hesabı Yap →'), style: 'text', link: { type: 'action', target: 'quote' } }]).map((b) => _jsx("button", { onClick: () => runCmsLink(b.link, { quote: onOpenQuote, video: onOpenVideoReel }), className: `${cmsButtonClass(b.style || 'text', false)} cursor-pointer`, children: b.text }, b.id || b.text)) })] })] }));
};
