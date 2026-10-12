import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { siteConfig } from './data/siteConfig.js';
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { Manifesto } from './components/Manifesto.js';
import { TechnicalBreakdown } from './components/TechnicalBreakdown.js';
import { ProductCategories } from './components/ProductCategories.js';
import { FacilityServices } from './components/FacilityServices.js';
import { FeaturedProjects } from './components/FeaturedProjects.js';
import { FinalCTA } from './components/FinalCTA.js';
import { Footer } from './components/Footer.js';
import { QuoteModal } from './components/QuoteModal.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { ProjectDetailModal } from './components/ProjectDetailModal.js';
import { AboutModal } from './components/AboutModal.js';
import { ContactModal } from './components/ContactModal.js';
import { VideoReelModal } from './components/VideoReelModal.js';
import { FullCatalogModal } from './components/FullCatalogModal.js';
import { getHomeSections, hasHomePage } from './runtimeContent.js';
export default function App() {
    // Public visitors always see the generator image published from CMS/admin.
    const activeGeneratorImage = siteConfig.images.heroGenerator;
    // Modal visibility states
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [quoteProductPreset, setQuoteProductPreset] = useState('');
    const [selectedProductForModal, setSelectedProductForModal] = useState(null);
    const [selectedProjectForModal, setSelectedProjectForModal] = useState(null);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isVideoReelOpen, setIsVideoReelOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    useEffect(() => {
        const openEntity = ({ detail }) => {
            if (detail?.type === 'product') {
                const item = siteConfig.products.find(p => p.id === detail.id);
                if (item) setSelectedProductForModal(item);
            } else if (detail?.type === 'project') {
                const item = siteConfig.projects.find(p => p.id === detail.id);
                if (item) setSelectedProjectForModal(item);
            }
        };
        window.addEventListener('cms:open-entity', openEntity);
        return () => window.removeEventListener('cms:open-entity', openEntity);
    }, []);
    // Modal open handlers
    const handleOpenQuote = (productName = '') => {
        setQuoteProductPreset(productName);
        setIsQuoteOpen(true);
    };
    const handleOpenProducts = () => {
        const el = document.getElementById('products-section');
        if (el)
            el.scrollIntoView({ behavior: 'smooth' });
    };
    const sections = getHomeSections();
    const orderedSections = hasHomePage() ? sections : [
        { id: 'hero', type: 'hero', name: 'Hero', enabled: true },
        { id: 'manifesto', type: 'manifesto', name: 'Manifesto', enabled: true },
        { id: 'technical', type: 'technical', name: 'Engineered Power', enabled: true },
        { id: 'products', type: 'products', name: 'Ürünler', enabled: true },
        { id: 'services', type: 'services', name: 'Power Solutions', enabled: true },
        { id: 'projects', type: 'projects', name: 'Projeler', enabled: true },
        { id: 'finalCta', type: 'finalCta', name: 'CTA', enabled: true },
    ];
    const renderSection = (section) => {
        const type = section.type;
        const key = section.id;
        const cmsContent = section.content || {};
        switch (type) {
            case 'hero': return _jsx(Hero, { cmsContent: cmsContent, onOpenQuote: () => handleOpenQuote('ASAY P33-PRO'), onOpenVideoReel: () => setIsVideoReelOpen(true), activeGeneratorImage: activeGeneratorImage }, key);
            case 'manifesto': return _jsx(Manifesto, { cmsContent: cmsContent, onExploreSolutions: handleOpenProducts, onOpenAbout: () => setIsAboutOpen(true), activeGeneratorImage: activeGeneratorImage }, key);
            case 'technical':
            case 'hotspot': return _jsx(TechnicalBreakdown, { cmsContent: cmsContent, activeGeneratorImage: activeGeneratorImage, onOpenQuote: () => handleOpenQuote('Özel Akustik / Senkron Proje') }, key);
            case 'products': return _jsx(ProductCategories, { cmsContent: cmsContent, onSelectProduct: (prod) => setSelectedProductForModal(prod), onOpenQuoteWithProduct: (name) => handleOpenQuote(name), onOpenAllProducts: () => setIsCatalogOpen(true) }, key);
            case 'services':
            case 'cards': return _jsx(FacilityServices, { cmsContent: cmsContent, onOpenQuote: () => handleOpenQuote('') }, key);
            case 'projects': return _jsx(FeaturedProjects, { cmsContent: cmsContent, onSelectProject: (proj) => setSelectedProjectForModal(proj), onOpenQuote: () => handleOpenQuote('') }, key);
            case 'finalCta':
            case 'cta': return _jsx(FinalCTA, { cmsContent: cmsContent, onOpenQuote: () => handleOpenQuote(''), onOpenContact: () => setIsContactOpen(true), activeGeneratorImage: activeGeneratorImage }, key);
            default: return null;
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-[var(--theme-surface)] text-[var(--theme-dark)] flex flex-col font-sans selection:bg-[var(--theme-accent)] selection:text-white", children: [_jsx(Navbar, { onOpenQuote: () => handleOpenQuote(''), onOpenAbout: () => setIsAboutOpen(true), onOpenContact: () => setIsContactOpen(true), onOpenProducts: handleOpenProducts }), _jsx("main", { className: "flex-1 w-full", children: orderedSections.filter((s) => s.enabled !== false).map((s) => _jsx("div", { className: "cms-section", style: { display: 'contents' }, "data-cms-spacing": s.content?.spacing || 'large', "data-cms-align": s.content?.align || 'left', "data-cms-background": s.content?.background || 'default', children: renderSection(s) }, s.id)) }), _jsx(Footer, { onOpenAbout: () => setIsAboutOpen(true), onOpenContact: () => setIsContactOpen(true), onOpenQuote: () => handleOpenQuote('') }), _jsx(QuoteModal, { isOpen: isQuoteOpen, onClose: () => setIsQuoteOpen(false), defaultProduct: quoteProductPreset }), _jsx(ProductDetailModal, { product: selectedProductForModal, onClose: () => setSelectedProductForModal(null), onOpenQuoteWithProduct: (name) => handleOpenQuote(name) }), _jsx(ProjectDetailModal, { project: selectedProjectForModal, onClose: () => setSelectedProjectForModal(null), onOpenQuote: () => handleOpenQuote('') }), _jsx(AboutModal, { isOpen: isAboutOpen, onClose: () => setIsAboutOpen(false), onOpenQuote: () => { setIsAboutOpen(false); handleOpenQuote(''); } }), _jsx(ContactModal, { isOpen: isContactOpen, onClose: () => setIsContactOpen(false) }), _jsx(VideoReelModal, { isOpen: isVideoReelOpen, onClose: () => setIsVideoReelOpen(false), onOpenQuote: () => { setIsVideoReelOpen(false); handleOpenQuote(''); } }), _jsx(FullCatalogModal, { isOpen: isCatalogOpen, onClose: () => setIsCatalogOpen(false), onSelectProduct: (prod) => { setIsCatalogOpen(false); setSelectedProductForModal(prod); }, onOpenQuoteWithProduct: (name) => { setIsCatalogOpen(false); handleOpenQuote(name); } })] }));
}
