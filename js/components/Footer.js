import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React from 'react';
import { siteConfig } from '../data/siteConfig.js';
import { ArrowUp, Phone, Mail, MapPin } from 'lucide-react';
import { cmsValue, resolveCmsHref, runCmsLink } from '../runtimeContent.js';
export const Footer = ({ onOpenAbout, onOpenContact, onOpenQuote }) => {
    const logo = cmsValue('logos.footer', '') || cmsValue('logos.main', '');
    const social = cmsValue('social', {});
    const defaults = [
        { id: 'products', title: 'Ürün Grupları', links: [
            { id: 'generator', text: 'Jeneratör Sistemleri', link: { type: 'anchor', target: 'products-section' } },
            { id: 'ats', text: 'Otomatik Transfer Panosu (ATS)', link: { type: 'anchor', target: 'technical-section' } },
            { id: 'parallel', text: 'Senkron Paralel Sistemler', link: { type: 'anchor', target: 'products-section' } },
            { id: 'energy', text: 'Enerji Sistemleri', link: { type: 'anchor', target: 'products-section' } },
        ] },
        { id: 'corporate', title: 'Kurumsal', links: [
            { id: 'about', text: 'Hakkımızda & Fabrika', link: { type: 'action', target: 'about' } },
            { id: 'projects', text: 'Referans Projeler', link: { type: 'anchor', target: 'projects-section' } },
            { id: 'service', text: '7/24 Teknik Servis & Bakım', link: { type: 'anchor', target: 'services-section' } },
            { id: 'quote', text: 'Fiyat Teklifi Al', link: { type: 'action', target: 'quote' } },
            { id: 'contact', text: 'İletişim & Fabrika Adresi', link: { type: 'action', target: 'contact' } },
        ] },
    ];
    const columns = cmsValue('footer.columns', defaults);
    const legal = cmsValue('footer.legalLinks', [
        { id: 'privacy', text: 'Gizlilik Politikası', visible: true, link: { type: 'page', target: '#', newTab: false } }, { id: 'kvkk', text: 'KVKK Aydınlatma Metni', visible: true, link: { type: 'page', target: '#', newTab: false } },
    ]);
    const actions = { about: onOpenAbout, contact: onOpenContact, quote: onOpenQuote };
    const renderLink = (item, className = 'text-left text-xs text-neutral-600 hover:text-black') => {
        if (!item.link) return _jsx('span', { className, children: item.text }, item.id || item.text);
        if (item.link.type === 'action' || item.link.type === 'product' || item.link.type === 'project')
            return _jsx('button', { className, onClick: () => runCmsLink(item.link, actions), children: item.text }, item.id || item.text);
        return _jsx('a', { className, href: resolveCmsHref(item.link), target: item.link.newTab ? '_blank' : undefined, rel: item.link.newTab ? 'noopener noreferrer' : undefined, children: item.text }, item.id || item.text);
    };
    return _jsx('footer', { className: 'bg-[var(--theme-surface)] text-[var(--theme-text)] border-t border-[var(--theme-border)] pt-16 pb-12', children: _jsxs('div', { className: 'max-w-7xl mx-auto px-6 md:px-10', children: [
        _jsxs('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-[var(--theme-border)]', children: [
            _jsxs('div', { className: 'lg:col-span-2 flex flex-col gap-4', children: [
                logo ? _jsx('img', { src: logo, alt: siteConfig.brand.name, className: 'object-contain object-left max-h-14 max-w-[220px]' }) : _jsx('span', { className: 'font-extrabold text-xl', children: siteConfig.brand.name }),
                _jsx('p', { className: 'text-xs text-neutral-600 max-w-sm leading-relaxed', children: cmsValue('footer.description', 'Endüstriyel jeneratör üretimi, senkronize güç santralleri, süper sessiz kabinli dizel jeneratör sistemleri ve 7/24 teknik servis altyapısı.') }),
                _jsx('div', { className: 'flex flex-wrap items-center gap-2 pt-2', children: siteConfig.brand.certifications.map(cert => _jsx('span', { className: 'px-2.5 py-1 rounded-md bg-neutral-100 text-[11px] font-semibold text-neutral-700', children: cert }, cert)) }),
                _jsx('div', { className: 'flex flex-wrap gap-3 pt-2', children: Object.entries(social).filter(([, v]) => v?.enabled && v?.url).map(([key, value]) => _jsx('a', { href: resolveCmsHref({type:'external',target:value.url}), target: '_blank', rel: 'noopener noreferrer', className: 'text-xs font-bold text-neutral-500 hover:text-[var(--theme-primary)] capitalize', children: key }, key)) }),
            ] }),
            ...(Array.isArray(columns) ? columns : defaults).filter(c => c.visible !== false).map(c => _jsxs('div', { className: 'flex flex-col gap-3', children: [_jsx('span', { className: 'text-xs font-bold uppercase tracking-wider', children: c.title }), ...(c.links || []).filter(l => l.visible !== false).map(l => renderLink(l))] }, c.id || c.title)),
            _jsxs('div', { className: 'flex flex-col gap-3', children: [
                _jsx('span', { className: 'text-xs font-bold uppercase tracking-wider', children: cmsValue('footer.contactTitle', 'İletişim') }),
                _jsxs('div', { className: 'flex items-start gap-2 text-xs text-neutral-600', children: [_jsx(MapPin, {className:'w-3.5 h-3.5 text-[var(--theme-primary)] shrink-0 mt-0.5'}), _jsx('span', {children:siteConfig.brand.address})] }),
                _jsxs('a', {href:resolveCmsHref({type:'phone',target:siteConfig.brand.phone}),className:'flex items-center gap-2 text-xs text-neutral-600',children:[_jsx(Phone,{className:'w-3.5 h-3.5 text-[var(--theme-primary)]'}),siteConfig.brand.phone]}),
                _jsxs('a', {href:resolveCmsHref({type:'email',target:siteConfig.brand.email}),className:'flex items-center gap-2 text-xs text-neutral-600',children:[_jsx(Mail,{className:'w-3.5 h-3.5 text-[var(--theme-primary)]'}),siteConfig.brand.email]}),
                _jsxs('div', {className:'pt-2',children:[_jsx('span',{className:'text-[10px] uppercase font-bold text-neutral-400 block',children:cmsValue('footer.contactLabel','MOBİL')+':'}),_jsx('span',{className:'text-xs font-extrabold text-[var(--theme-primary)]',children:cmsValue('footer.contactPhone',siteConfig.brand.emergencyHotline)})]}),
            ] }),
        ] }),
        _jsxs('div', {className:'pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500',children:[
            _jsx('div',{children:cmsValue('footer.copyright',`© ${new Date().getFullYear()} ${siteConfig.brand.name}. Tüm hakları saklıdır.`)}),
            _jsx('div',{className:'flex items-center gap-6',children:(Array.isArray(legal)?legal:[]).filter(l=>l.visible!==false).map(l=>renderLink(l,'text-[11px] text-neutral-400'))}),
            _jsxs('button',{onClick:()=>window.scrollTo({top:0,behavior:'smooth'}),className:'fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-[70] flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-neutral-900/95 hover:bg-black text-white font-semibold shadow-lg transition-all focus:ring-2 focus:ring-[var(--theme-primary)]/40', 'aria-label':'Sayfanın başına dön',children:[_jsx('span',{children:cmsValue('footer.backToTopLabel','Yukarı')}),_jsx(ArrowUp,{className:'w-3.5 h-3.5'})]}),
        ]}),
    ]})});
};
