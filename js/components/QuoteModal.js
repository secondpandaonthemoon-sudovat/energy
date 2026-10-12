import { appUrl } from '../appPaths.js';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { X, CheckCircle2, ArrowRight, Calculator, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../data/siteConfig.js';
import { cmsValue } from '../runtimeContent.js';
const capacityOptions = {
    jenerator: [
        { id: '15-50', label: '15 - 50 kVA', sub: 'Ofis / Küçük İşletme' },
        { id: '50-150', label: '50 - 150 kVA', sub: 'Ticari Tesis / Atölye' },
        { id: '150-500', label: '150 - 500 kVA', sub: 'Fabrika / Depo' },
        { id: '500-2500', label: '500 - 2500 kVA', sub: 'Ağır Sanayi / Veri Merkezi' },
    ],
    'buhar-kazani': [
        { id: '0-1500', label: '0 - 1.500 kg/h', sub: 'Kompakt / Küçük İşletme' },
        { id: '1500-5000', label: '1.500 - 5.000 kg/h', sub: 'Orta Ölçekli Üretim' },
        { id: '5000-10000', label: '5.000 - 10.000 kg/h', sub: 'Büyük Sanayi' },
        { id: '10000+', label: '10.000+ kg/h', sub: 'Ağır Sanayi / Proses' },
    ],
    trafo: [
        { id: '50-630', label: '50 - 630 kVA', sub: 'Ticari / Küçük Sanayi' },
        { id: '630-2500', label: '630 - 2.500 kVA', sub: 'Fabrika / Tesis' },
        { id: '2500-10000', label: '2.5 - 10 MVA', sub: 'OSB / Büyük Tesis' },
        { id: '10000+', label: '10 MVA+', sub: 'Enerji / İletim Projesi' },
    ],
    trijenerasyon: [
        { id: '250-500', label: '250 - 500 kWe', sub: 'Orta Ölçekli Tesis' },
        { id: '500-1000', label: '500 - 1.000 kWe', sub: 'Sanayi / Otel' },
        { id: '1000-2000', label: '1 - 2 MWe', sub: 'Büyük Tesis' },
        { id: '2000+', label: '2 MWe+', sub: 'Enerji Kampüsü' },
    ],
    kojenerasyon: [
        { id: '250-500', label: '250 - 500 kWe', sub: 'Orta Ölçekli Tesis' },
        { id: '500-1000', label: '500 - 1.000 kWe', sub: 'Sanayi / Otel' },
        { id: '1000-2000', label: '1 - 2 MWe', sub: 'Büyük Tesis' },
        { id: '2000+', label: '2 MWe+', sub: 'Enerji Kampüsü' },
    ],
    'enerji-depolama': [
        { id: '100-500', label: '100 - 500 kWh', sub: 'Ticari / Pik Kesme' },
        { id: '500-1000', label: '500 kWh - 1 MWh', sub: 'Sanayi Tesisi' },
        { id: '1000-5000', label: '1 - 5 MWh', sub: 'Büyük Tesis / GES' },
        { id: '5000+', label: '5 MWh+', sub: 'Utility Scale' },
    ],
};
const capacityLabels = {
    jenerator: 'Gerekli Güç Kapasitesi',
    'buhar-kazani': 'İstenen Buhar Kapasitesi',
    trafo: 'Gerekli Trafo Gücü',
    trijenerasyon: 'Hedef Elektrik Gücü',
    kojenerasyon: 'Hedef Elektrik Gücü',
    'enerji-depolama': 'İstenen Depolama Kapasitesi',
};
export const QuoteModal = ({ isOpen, onClose, defaultProduct = '' }) => {
    const quoteSettings = cmsValue('quote', {});
    const allowed = Array.isArray(quoteSettings.enabledCategoryIds) ? quoteSettings.enabledCategoryIds : (siteConfig.divisions || []).map((d) => d.id);
    const divisions = (siteConfig.divisions || []).filter((d) => Array.isArray(d.products) && allowed.includes(d.id));
    const [divisionId, setDivisionId] = useState(divisions[0]?.id || 'jenerator');
    const [productId, setProductId] = useState('');
    const [capacity, setCapacity] = useState('');
    const [canopyType, setCanopyType] = useState('kabinli');
    const [sector, setSector] = useState('sanayi');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [notes, setNotes] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [quoteId, setQuoteId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);
    const [submitError, setSubmitError] = useState('');
    const selectedDivision = useMemo(() => divisions.find((d) => d.id === divisionId) || divisions[0], [divisions, divisionId]);
    const products = selectedDivision?.products || [];
    const selectedProduct = products.find((p) => p.id === productId);
    const capacities = capacityOptions[divisionId] || [];
    useEffect(() => {
        if (!isOpen)
            return;
        let div = divisions[0];
        let prod = null;
        if (defaultProduct) {
            for (const d of divisions) {
                const found = (d.products || []).find((p) => p.name === defaultProduct || p.id === defaultProduct);
                if (found) {
                    div = d;
                    prod = found;
                    break;
                }
            }
        }
        const nextDiv = div?.id || 'jenerator';
        setDivisionId(nextDiv);
        setProductId(prod?.id || '');
        setCapacity((capacityOptions[nextDiv] || [])[0]?.id || '');
        setNotes(prod ? `${prod.name} modeli için fiyat teklifi istiyorum.` : '');
        setSubmitted(false);
        setSubmitError('');
    }, [isOpen, defaultProduct]);
    const chooseDivision = id => {
        setDivisionId(id); setProductId(''); setCapacity((capacityOptions[id] || [])[0]?.id || '');
    };
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submittingRef.current) return;
        if (!selectedDivision) { setSubmitError('Teklif için kullanılabilir ürün grubu bulunmuyor. Lütfen iletişim formunu kullanın.'); return; }
        submittingRef.current = true;
        setSubmitting(true);
        setSubmitError('');
        try {
            const payload = { divisionId, divisionName: selectedDivision?.name || '', productId, productName: selectedProduct?.name || '', capacity, capacityLabel: capacities.find(x => x.id === capacity)?.label || capacity, canopyType: divisionId === 'jenerator' ? canopyType : '', sector: divisionId === 'jenerator' ? sector : '', name, company, phone, email, city, notes };
            const res = await fetch(appUrl('/api/quotes'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Teklif talebi gönderilemedi.');
            setQuoteId(data.reference);
            setSubmitted(true);
        }
        catch (err) {
            setSubmitError(err.message || 'Teklif talebi gönderilemedi.');
        }
        finally {
            submittingRef.current = false; setSubmitting(false);
        }
    };
    const handleReset = () => { setSubmitted(false);
        setSubmitError(''); onClose(); };
    return _jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-in fade-in duration-200", children: _jsxs("div", { className: "relative w-full max-w-3xl bg-[var(--theme-surface)] rounded-3xl shadow-2xl border border-[var(--theme-border)] overflow-hidden my-8", children: [_jsxs("div", { className: "p-6 md:p-8 bg-neutral-900 text-white flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2.5 rounded-xl bg-[var(--theme-primary)] text-white", children: _jsx(Calculator, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-[var(--theme-primary)]", children: quoteSettings.eyebrow || 'HIZLI TEKLİF & GÜÇ KEŞFİ' }), _jsx("h3", { className: "text-xl md:text-2xl font-bold font-['Space_Grotesk'] text-white", children: quoteSettings.title || 'Ürün Fiyat Teklifi Al' })] })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-full bg-[var(--theme-surface)]/10 text-white hover:bg-[var(--theme-surface)]/20 transition-colors cursor-pointer", "aria-label": "Kapat", children: _jsx(X, { className: "w-5 h-5" }) })] }), submitted ? _jsxs("div", { className: "p-8 md:p-12 text-center flex flex-col items-center", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6", children: _jsx(CheckCircle2, { className: "w-8 h-8" }) }), _jsx("h4", { className: "text-2xl font-bold text-[var(--theme-text)] font-['Space_Grotesk']", children: quoteSettings.successTitle || 'Talebiniz Başarıyla Alındı' }), _jsxs("p", { className: "text-xs font-semibold text-neutral-400 mt-1 uppercase tracking-wider", children: ["TEKL\u0130F TAK\u0130P NUMARASI: ", _jsx("strong", { className: "text-[var(--theme-text)] font-mono", children: quoteId })] }), _jsxs("p", { className: "text-sm text-neutral-600 mt-4 max-w-md", children: ["M\u00FChendislik ekibimiz talebinizi inceleyerek ", _jsx("strong", { children: "en ge\u00E7 2 saat i\u00E7inde" }), " teknik \u015Fartname ve fiyat teklifini e-posta veya telefon yoluyla iletecektir."] }), _jsxs("div", { className: "mt-8 p-4 rounded-2xl bg-neutral-50 border border-[var(--theme-border)] w-full max-w-md text-left text-xs text-neutral-600 space-y-1", children: [_jsxs("div", { children: [_jsx("strong", { children: "Firma:" }), " ", company || name] }), _jsxs("div", { children: [_jsx("strong", { children: "\u00DCr\u00FCn Grubu:" }), " ", selectedDivision?.name] }), _jsxs("div", { children: [_jsx("strong", { children: "Model:" }), " ", selectedProduct?.name || 'Model seçilmedi / Mühendislik seçimi'] }), capacity && _jsxs("div", { children: [_jsx("strong", { children: "Kapasite:" }), " ", capacities.find(x => x.id === capacity)?.label || capacity] }), _jsxs("div", { children: [_jsx("strong", { children: "\u0130leti\u015Fim:" }), " ", phone, " / ", email] })] }), _jsx("button", { onClick: handleReset, className: "mt-8 px-8 py-3.5 rounded-full bg-[var(--theme-dark)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--theme-primary)] transition-colors cursor-pointer", children: "Tamam" })] }) : _jsxs("form", { onSubmit: handleSubmit, className: "p-6 md:p-8 space-y-6 max-h-[78vh] overflow-y-auto", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-2", children: "1. \u00DCr\u00FCn Grubu Se\u00E7in" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2", children: divisions.map((d) => _jsxs("button", { type: "button", onClick: () => chooseDivision(d.id), className: `p-3 rounded-xl text-left border transition-all cursor-pointer ${divisionId === d.id ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5 ring-1 ring-[var(--theme-primary)]' : 'border-[var(--theme-border)] hover:border-neutral-300'}`, children: [_jsx("div", { className: `text-xs font-bold ${divisionId === d.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)]'}`, children: d.name }), _jsxs("div", { className: "text-[10px] text-neutral-400 mt-0.5", children: [(d.products || []).length, " Model"] })] }, d.id)) })] }), _jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-2", children: "2. \u00DCr\u00FCn / Model" }), _jsxs("select", { value: productId, onChange: e => { setProductId(e.target.value); const p = products.find((x) => x.id === e.target.value); if (p)
                                                setNotes(`${p.name} modeli için fiyat teklifi istiyorum.`); }, className: "w-full p-3 rounded-xl border border-neutral-300 bg-[var(--theme-surface)] text-xs font-medium text-neutral-800 focus:outline-none focus:border-[var(--theme-primary)]", children: [_jsx("option", { value: "", children: "Modeli m\u00FChendislik ekibi se\u00E7sin" }), products.map((p) => _jsx("option", { value: p.id, children: p.name }, p.id))] })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-2", children: ["3. ", capacityLabels[divisionId] || 'Kapasite'] }), _jsx("select", { value: capacity, onChange: e => setCapacity(e.target.value), className: "w-full p-3 rounded-xl border border-neutral-300 bg-[var(--theme-surface)] text-xs font-medium text-neutral-800 focus:outline-none focus:border-[var(--theme-primary)]", children: capacities.map(o => _jsxs("option", { value: o.id, children: [o.label, " \u2014 ", o.sub] }, o.id)) })] })] }), divisionId === 'jenerator' && _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-2", children: "4. Kabin / Muhafaza Tercihi" }), _jsxs("select", { value: canopyType, onChange: e => setCanopyType(e.target.value), className: "w-full p-3 rounded-xl border border-neutral-300 bg-[var(--theme-surface)] text-xs font-medium text-neutral-800 focus:outline-none focus:border-[var(--theme-primary)]", children: [_jsx("option", { value: "kabinli", children: "S\u00FCper Sessiz Akustik Kabinli" }), _jsx("option", { value: "acik", children: "A\u00E7\u0131k Tip \u015Easili" }), _jsx("option", { value: "konteyner", children: "Konteyner Tipi Santral" }), _jsx("option", { value: "mobil", children: "R\u00F6morklu / Mobil" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-2", children: "5. Uygulama Sekt\u00F6r\u00FC" }), _jsxs("select", { value: sector, onChange: e => setSector(e.target.value), className: "w-full p-3 rounded-xl border border-neutral-300 bg-[var(--theme-surface)] text-xs font-medium text-neutral-800 focus:outline-none focus:border-[var(--theme-primary)]", children: [_jsx("option", { value: "sanayi", children: "End\u00FCstriyel \u00DCretim & Fabrika" }), _jsx("option", { value: "datacenter", children: "Veri Merkezi / Telekom" }), _jsx("option", { value: "saglik", children: "Hastane & Sa\u011Fl\u0131k Kompleksi" }), _jsx("option", { value: "insaat", children: "\u0130n\u015Faat / \u015Eantiye / Madencilik" }), _jsx("option", { value: "ticari", children: "Otel / AVM / Plaza" }), _jsx("option", { value: "diger", children: "Di\u011Fer" })] })] })] }), _jsxs("div", { className: "pt-2 border-t border-[var(--theme-border)]", children: [_jsxs("label", { className: "text-xs font-bold uppercase tracking-wider text-neutral-700 block mb-3", children: [divisionId === 'jenerator' ? '6' : '4', ". \u0130leti\u015Fim ve Firma Bilgileri"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsx("input", { type: "text", required: true, placeholder: "Yetkili Ad\u0131 Soyad\u0131 *", value: name, onChange: e => setName(e.target.value), className: "w-full p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[var(--theme-primary)]" }), _jsx("input", { type: "text", required: true, placeholder: "Firma / Kurum Ad\u0131 *", value: company, onChange: e => setCompany(e.target.value), className: "w-full p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[var(--theme-primary)]" }), _jsx("input", { type: "tel", required: true, placeholder: "Telefon Numaras\u0131 (05XX) *", value: phone, onChange: e => setPhone(e.target.value), className: "w-full p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[var(--theme-primary)]" }), _jsx("input", { type: "email", required: true, placeholder: "E-posta Adresi *", value: email, onChange: e => setEmail(e.target.value), className: "w-full p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[var(--theme-primary)]" })] }), _jsx("input", { type: "text", placeholder: "Kurulum Yap\u0131lacak \u015Eehir / \u0130l\u00E7e", value: city, onChange: e => setCity(e.target.value), className: "w-full mt-3 p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[var(--theme-primary)]" }), _jsx("textarea", { rows: 3, placeholder: "Projeniz, \u00E7al\u0131\u015Fma \u015Fartlar\u0131 veya talep etti\u011Finiz teknik detaylar...", value: notes, onChange: e => setNotes(e.target.value), className: "w-full mt-3 p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-[var(--theme-primary)] resize-none" })] }), submitError && _jsx("div", { className: "p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold", children: submitError }), _jsxs("div", { className: "pt-4 border-t border-[var(--theme-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-neutral-500", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-600" }), _jsx("span", { children: "Bilgileriniz 6698 say\u0131l\u0131 KVKK kapsam\u0131nda korunmaktad\u0131r." })] }), _jsxs("button", { type: "submit", disabled: submitting, className: "px-7 py-3 rounded-full bg-[var(--theme-primary)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--theme-primary-hover)] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer", children: [_jsx("span", { children: submitting ? 'Gönderiliyor...' : (quoteSettings.submitLabel || 'Teklif İste') }), _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] })] })] }) });
};
