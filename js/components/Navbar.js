import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Phone, Shield } from 'lucide-react';
import { siteConfig } from '../data/siteConfig.js';
import { cmsValue, getMenu, hasMenu, resolveCmsHref, runCmsLink, cmsButtonClass } from '../runtimeContent.js';
import { LanguageSwitcher } from './LanguageSwitcher.js';
export const Navbar = ({ onOpenQuote, onOpenAbout, onOpenContact, onOpenProducts }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn); }, []);
    const items = getMenu('header');
    const fallback = [
        { id: 'a', label: 'Hakkımızda', link: { type: 'action', target: 'about' }, enabled: true }, { id: 'p', label: 'Ürünler', link: { type: 'anchor', target: 'products-section' }, enabled: true },
        { id: 't', label: 'Teknoloji', link: { type: 'anchor', target: 'technical-section' }, enabled: true }, { id: 's', label: 'Çözümler', link: { type: 'anchor', target: 'services-section' }, enabled: true },
        { id: 'pr', label: 'Projeler', link: { type: 'anchor', target: 'projects-section' }, enabled: true }, { id: 'sv', label: 'Servis & ATS', link: { type: 'anchor', target: 'services-section' }, enabled: true }, { id: 'c', label: 'İletişim', link: { type: 'action', target: 'contact' }, enabled: true },
    ];
    const navItems = hasMenu('header') ? items : fallback;
    const action = (it) => { setMobileMenuOpen(false); const l = it.link || {}; if (l.type === 'action') {
        if (l.target === 'about')
            onOpenAbout();
        else if (l.target === 'service') {
            document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
        }
        else if (l.target === 'contact')
            onOpenContact();
        else if (l.target === 'quote')
            onOpenQuote();
        else if (l.target === 'products')
            onOpenProducts();
        return;
    } if (l.type === 'product' || l.type === 'project') { runCmsLink(l); return; } if (l.type === 'anchor') {
        const id = String(l.target || '').replace(/^#/, '');
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        return;
    } const href = resolveCmsHref(l); if (l.newTab)
        window.open(href, '_blank', 'noopener');
    else
        window.location.href = href; };
    const logo = cmsValue('logos.main', '');
    const logoWidth = Number(cmsValue('logos.width', 180));
    const logoMax = Number(cmsValue('logos.maxHeight', 56));
    const cta = cmsValue('navbar.cta', { text: cmsValue('navbar.ctaLabel', 'Teklif Al'), visible: true, style: 'dark', link: { type: 'action', target: 'quote', newTab: false } });
    const runCta = () => action({ link: cta.link || { type: 'action', target: 'quote' } });
    return _jsxs(_Fragment, { children: [_jsx("header", { className: `site-navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[var(--theme-surface)]/95 backdrop-blur-md border-b border-black/5 shadow-xs py-3' : 'bg-[var(--theme-surface)]/80 backdrop-blur-xs py-5'}`, children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between gap-8", children: [_jsx("a", { href: "#", className: "flex items-center gap-2.5 text-slate-900 group whitespace-nowrap shrink-0", children: logo ? _jsx("img", { src: logo, alt: siteConfig.brand.name, style: { width: logoWidth, maxHeight: logoMax }, className: "object-contain" }) : _jsxs(_Fragment, { children: [_jsx("div", { className: "w-8 h-8 rounded-sm bg-[var(--theme-primary)] flex items-center justify-center text-white font-black text-sm", children: "AE" }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: "font-extrabold text-lg md:text-xl tracking-tight leading-none text-black", children: [siteConfig.brand.name] }), _jsx("span", { className: "text-[10px] tracking-widest uppercase font-semibold text-neutral-400", children: cmsValue('navbar.logoSubtitle', 'POWER SYSTEMS') })] })] }) }), _jsx("nav", { className: "hidden lg:flex items-center gap-8 text-[13px] font-semibold tracking-wide text-neutral-700", children: navItems.map((it) => _jsx("button", { onClick: () => action(it), className: "hover:text-black transition-colors whitespace-nowrap cursor-pointer", children: it.label }, it.id)) }), _jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [_jsx(LanguageSwitcher, { compact: true }), _jsxs("a", { href: `tel:${siteConfig.brand.phone.replace(/[^0-9+]/g, '')}`, className: "hidden sm:flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black px-2 py-1", children: [_jsx(Phone, { className: "w-3.5 h-3.5 text-[var(--theme-primary)]" }), _jsx("span", { children: siteConfig.brand.phone })] }), cta.visible !== false && _jsxs("button", { onClick: runCta, className: `${cmsButtonClass(cta.style || 'dark')} group px-5 py-2.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5`, children: [_jsx("span", { children: cta.text || cmsValue('navbar.ctaLabel', 'Teklif Al') }), _jsx(ArrowUpRight, { className: "w-3.5 h-3.5" })] }), _jsx("button", { onClick: () => setMobileMenuOpen(!mobileMenuOpen), className: "lg:hidden p-2 rounded-lg hover:bg-neutral-100", "aria-label": "Men\u00FCy\u00FC A\u00E7", children: mobileMenuOpen ? _jsx(X, { className: "w-5 h-5" }) : _jsx(Menu, { className: "w-5 h-5" }) })] })] }) }), mobileMenuOpen && _jsxs("div", { className: "fixed inset-0 z-40 bg-[var(--theme-surface)]/97 backdrop-blur-xl pt-24 px-6 pb-8 lg:hidden flex flex-col justify-between", children: [_jsx("div", { className: "flex flex-col gap-2 text-xl font-bold", children: navItems.map((it) => _jsx("button", { onClick: () => action(it), className: "text-left py-3 border-b border-neutral-100", children: it.label }, it.id)) }), _jsxs("div", { className: "pt-6 border-t border-[var(--theme-border)]", children: [_jsx("div", { className: "mb-4", children: _jsx(LanguageSwitcher, {}) }), cta.visible !== false && _jsx("button", { onClick: () => { setMobileMenuOpen(false); runCta(); }, className: `${cmsButtonClass(cta.style || 'primary')} w-full py-3.5 rounded-xl font-bold`, children: cta.text || cmsValue('navbar.ctaLabel', 'Hemen Teklif İste') }), _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-neutral-500 mt-4", children: [_jsx(Shield, { className: "w-3.5 h-3.5" }), "ISO 9001:2015 & CE"] })] })] })] });
};
