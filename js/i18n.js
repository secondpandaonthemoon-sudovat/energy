import { appUrl } from './appPaths.js';
import { useEffect, useState } from 'react';
const STORAGE_KEY = 'asay_language';
const EVENT_NAME = 'asay-language-change';
let currentLanguage = typeof window === 'undefined' ? 'tr' : ((localStorage.getItem(STORAGE_KEY) === 'en' || localStorage.getItem(STORAGE_KEY) === 'tr') ? localStorage.getItem(STORAGE_KEY) : ((navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en'));
let observer = null;
let timer = null;
let generation = 0;
const originalText = new WeakMap();
const originalAttrs = new WeakMap();
const appliedText = new WeakMap();
const appliedAttrs = new WeakMap();
const translatedCache = new Map();
const dict = {
    'Teklif Al': 'Get a Quote', 'Hemen Teklif İste': 'Request a Quote', 'Teklif İste': 'Request Quote', 'Fiyat Teklifi Al': 'Get a Quote', 'Bu Modele Özel Teklif İste': 'Request a Quote for This Model', 'Bu Model İçin Teklif Al': 'Get a Quote for This Model',
    'Hakkımızda': 'About Us', 'Ürünler': 'Products', 'Teknoloji': 'Technology', 'Çözümler': 'Solutions', 'Projeler': 'Projects', 'İletişim': 'Contact', 'Servis & ATS': 'Service & ATS', 'Ürün & Çözümler': 'Products & Solutions', 'Referans Projeler': 'Reference Projects',
    'Jeneratör': 'Generator', 'Buhar Kazanı': 'Steam Boiler', 'Trafo': 'Transformer', 'Trijenerasyon': 'Trigeneration', 'Kojenerasyon': 'Cogeneration', 'Enerji Depolama': 'Energy Storage', 'Jeneratör Sistemleri': 'Generator Systems', 'Enerji Sistemleri': 'Energy Systems',
    'HIZLI TEKLİF & GÜÇ KEŞFİ': 'QUICK QUOTE & POWER DISCOVERY', 'Ürün Fiyat Teklifi Al': 'Get a Product Quote', 'Ürün Grubu Seçin': 'Select Product Group', '1. Ürün Grubu Seçin': '1. Select Product Group', '2. Ürün / Model': '2. Product / Model', 'Ürün / Model': 'Product / Model', 'Modeli mühendislik ekibi seçsin': 'Let our engineering team select the model',
    'Firma / Kurum Adı *': 'Company / Organization *', 'Yetkili Adı Soyadı *': 'Contact Person *', 'Telefon Numarası (05XX) *': 'Phone Number *', 'E-posta Adresi *': 'Email Address *', 'Kurulum Yapılacak Şehir / İlçe': 'Installation City / District', 'İletişim ve Firma Bilgileri': 'Contact & Company Information',
    'ÜRÜN GAMI VE MODELLER': 'PRODUCT RANGE & MODELS', 'Endüstriyel Güç & Enerji Portföyü': 'Industrial Power & Energy Portfolio', 'ASAY ENERGY TAM ÜRÜN KATALOĞU': 'ASAY ENERGY COMPLETE PRODUCT CATALOG', 'Tüm Güç ve Enerji Sistemleri Modelleri': 'All Power & Energy System Models',
    'TEKNİK ŞARTNAME & DATASHEET': 'TECHNICAL SPECIFICATION & DATASHEET', 'Teknik Şartnameyi İncele': 'View Technical Specification', 'Şartname': 'Specification', 'Diğer Ürünlere Git': 'View Other Products', 'Yukarı': 'Back to Top',
    'AĞIR HİZMET GÜÇ SİSTEMLERİ · 15 - 2500 kVA': 'HEAVY-DUTY POWER SYSTEMS · 15 - 2500 kVA', 'STOKTAN DERHAL TESLİM': 'IMMEDIATE DELIVERY FROM STOCK', 'AVRUPA MOTOR & ALTERNATÖR GÜVENCESİ': 'EUROPEAN ENGINE & ALTERNATOR ASSURANCE',
    'KESİNTİSİZ': 'UNINTERRUPTED', 'GÜÇ': 'POWER', 'Biz gücü kesintisiz devam ettiririz.': 'We keep power running without interruption.', 'Mühendislerimizle Görüşün': 'Talk to Our Engineers', 'Bize Yazın': 'Contact Us',
    '7/24 Teknik Servis & Bakım': '24/7 Technical Service & Maintenance', 'Mobil Müdahale Filosu': 'Mobile Response Fleet', 'Hızlı Stok Teslimatı': 'Fast Stock Delivery', 'Tam Garanti Kapsamı': 'Full Warranty Coverage', 'Uluslararası Kalite': 'International Quality',
    'Çalışma Saatleri:': 'Business Hours:', 'İletişim & Fabrika Adresi': 'Contact & Factory Address', 'Santral & Satış:': 'Switchboard & Sales:', 'Mobil': 'Mobile', 'Model': 'Model', 'Kapasite': 'Capacity', 'Ürün Grubu:': 'Product Group:', 'Model:': 'Model:', 'Kapasite:': 'Capacity:', 'İletişim:': 'Contact:',
    'Yayınla': 'Publish', 'Yayınlanıyor...': 'Publishing...', 'Taslak Kaydet': 'Save Draft', 'Önizle': 'Preview', 'Çıkış': 'Logout', 'Admin Şifresi': 'Admin Password', 'Giriş Yap': 'Sign In', 'Giriş yapılıyor...': 'Signing in...', 'Dashboard': 'Dashboard', 'Sayfalar': 'Pages', 'Hizmetler': 'Services', 'Hotspotlar': 'Hotspots', 'Medya': 'Media', 'Menüler': 'Menus', 'Global İçerikler': 'Global Content', 'Ayarlar': 'Settings', 'Teklif Talepleri': 'Quote Requests', 'Ürün Yönetimi': 'Product Management',
    'Kaydedilmemiş Değişiklikler': 'Unsaved Changes', 'Bölüm Ekle': 'Add Section', 'Aktif': 'Active', 'Pasif': 'Inactive', 'Düzenle': 'Edit', 'Sil': 'Delete', 'Kopyala': 'Duplicate', 'Sırala': 'Reorder', 'Kaydet': 'Save', 'Yenile': 'Refresh', 'Kategori ID': 'Category ID', 'Ürün Grubu': 'Product Group', 'Model Ekle': 'Add Model',
    'Talebiniz Başarıyla Alındı': 'Your Request Has Been Received', 'Gönderiliyor...': 'Sending...', 'Mesajınız Alındı': 'Your Message Has Been Received', 'Tamam': 'Done', 'Diğer': 'Other', 'Doğrudan Danışma': 'Direct Consultation', 'Gizlilik Politikası': 'Privacy Policy', 'KVKK Aydınlatma Metni': 'Data Protection Notice',
    // Public frontend — deterministic local translations (no external service required)
    'MÜHENDİSLİK DETAYI & ANATOMİ': 'ENGINEERING DETAIL & ANATOMY', 'İleri Mühendislik Bileşenleri': 'Advanced Engineering Components', 'Jeneratör üzerindeki interaktif noktalara gelerek her bir komponentin teknik verilerini inceleyebilirsiniz.': 'Hover over the interactive points on the generator to review the technical data of each component.', 'NOKTALARIN ÜZERİNE GELEREK İNCELEYİN': 'HOVER OVER THE POINTS TO EXPLORE', 'İncelenen Bileşen:': 'Component in Focus:', 'Detayları görmek için jeneratörün üzerindeki numaralı noktalara gelin.': 'Hover over the numbered points on the generator to view details.', 'Özel Mühendislik Talebi Oluştur': 'Create a Custom Engineering Request', 'Jeneratör Mühendislik Anatomisi': 'Generator Engineering Anatomy',
    'UÇTAN UCA HİZMETLER': 'END-TO-END SERVICES', 'Sadece Jeneratör Değil, Kesintisiz Enerji Güvencesi': 'More Than Generators — Uninterrupted Energy Assurance', 'Mühendislik projelendirmesinden montaja, 7/24 mobil teknik servis filomuzdan yük testlerine kadar tüm süreci tek elden yönetiyoruz.': 'We manage the entire process under one roof, from engineering design and installation to our 24/7 mobile technical service fleet and load testing.', 'Servis Talebi Oluştur': 'Create Service Request', 'Asay Energy Saha Mühendislik & Fabrika': 'Asay Energy Field Engineering & Factory',
    'Her proje gücün ve güvenilirliğin başka bir hikâyesidir.': 'Every project tells a different story of power and reliability.', 'Tüm Projeleri İncele': 'View All Projects', 'Tamamlanan Mega Proje': 'Completed Mega Project',
    'KESİNTİSİZ GÜÇ İÇİN ADIM ATIN': 'TAKE THE NEXT STEP FOR UNINTERRUPTED POWER', 'İşinizi birlikte güçlendirelim.': 'Let’s power your business together.', 'Tesisinizin yük kapasitesini uzman mühendislerimizle analiz edin. İhtiyacınıza en uygun jeneratör seti için 2 saat içinde detaylı teklif alın.': 'Let our expert engineers analyze your facility load and receive a detailed proposal for the most suitable power solution within 2 hours.', 'Projenizi Konuşalım': 'Discuss Your Project', 'Mühendislik İletişimi': 'Engineering Contact', '2 Yıl / 1000 Saat': '2 Years / 1000 Hours', '15 - 2500 kVA Hazır Stok': '15–2500 kVA Ready Stock',
    'Otomatik Transfer Panosu (ATS)': 'Automatic Transfer Switch (ATS)', 'Senkron Paralel Sistemler': 'Synchronous Parallel Systems', 'Kurumsal': 'Corporate', 'Hakkımızda & Fabrika': 'About Us & Factory', 'Tüm hakları saklıdır.': 'All rights reserved.', 'Sayfanın başına dön': 'Back to top', 'MOBİL': 'MOBILE',
    'KURUMSAL PROFİL': 'CORPORATE PROFILE', 'Asay Energy Hakkında': 'About Asay Energy', 'Yarım asra yaklaşan sanayi tecrübesiyle, kritik altyapıların kesintisiz güç güvencesi.': 'Nearly half a century of industrial experience delivering uninterrupted power assurance for critical infrastructure.', 'Asay Energy, veri merkezleri, modern hastaneler, madencilik sahaları ve ağır sanayi tesisleri için uluslararası standartlarda dizel jeneratör setleri, senkronize paralel güç santralleri ve özel akustik ses izolasyon kabinleri üretmektedir.': 'Asay Energy manufactures internationally compliant diesel generator sets, synchronized parallel power plants and custom acoustic enclosures for data centers, modern hospitals, mining sites and heavy industry.', '12.000 m² Üretim': '12,000 m² Production', 'Lazer kesim, robotik kaynak ve elektrostatik toz boya fırınlarına sahip entegre tesis.': 'Integrated facility with laser cutting, robotic welding and electrostatic powder-coating lines.', '%100 Yük Testi': '100% Load Testing', 'Her jeneratör seti fabrikadan çıkmadan önce dijital yük bankalarında (Load Bank) 4 saat test edilir.': 'Every generator set is tested for 4 hours on digital load banks before leaving the factory.', 'MÜHENDİSLİK PRENSİPLERİ': 'ENGINEERING PRINCIPLES', 'Sıfır Hata ve Kesintisiz Yük Güvenliği': 'Zero Defect & Uninterrupted Load Security', 'Fabrika Ziyareti ve Saha Keşfi Randevusu': 'Factory Visit & Site Survey Appointment',
    'MERKEZ OFİS & FABRİKA': 'HEAD OFFICE & FACTORY', 'İletişim ve Adres Bilgileri': 'Contact & Address Information', 'ASAY ENERGY GÜÇ SİSTEMLERİ': 'ASAY ENERGY POWER SYSTEMS', 'Endüstriyel Üretim Tesisleri ve Genel Müdürlük': 'Industrial Production Facilities & Headquarters', 'Pazartesi - Cuma: 08:30 - 18:00': 'Monday–Friday: 08:30–18:00', 'Müşteri temsilcimiz mesai saatleri içinde en kısa sürede sizinle iletişime geçecektir.': 'Our customer representative will contact you as soon as possible during business hours.', 'Mesajı Gönder': 'Send Message', 'Adınız Soyadınız *': 'Full Name *', 'Telefon Numaranız *': 'Phone Number *', 'Mesajınız veya sorunuz...': 'Your message or question...',
    '7/24 MOBİL SERVİS & BAKIM': '24/7 MOBILE SERVICE & MAINTENANCE', 'Teknik Destek & Servis Kaydı': 'Technical Support & Service Request', 'Servis Kaydınız Açıldı': 'Your Service Request Has Been Opened', 'SERVİS TAKİP NUMARASI:': 'SERVICE TRACKING NUMBER:', 'Mobil teknik servis ekibimiz en yakın istasyondan yönlendirildi. Destek için doğrudan mobil hattımızı arayınız:': 'Our mobile technical service team has been dispatched from the nearest station. For support, please call our mobile line directly:', 'ARIZA & ENERJİ KESİNTİSİ': 'FAULT & POWER OUTAGE', 'Talep Türü': 'Request Type', 'Periyodik Bakım': 'Periodic Maintenance', 'Arıza Müdahale': 'Fault Response', 'Yedek Parça Talebi': 'Spare Parts Request', 'Yetkili Kişi *': 'Contact Person *', 'Firma / Tesis Adı *': 'Company / Facility Name *', 'Jeneratör Markası / Seri No (Varsa)': 'Generator Brand / Serial No. (If Any)', 'Arıza açıklaması, son bakım tarihi veya talep ettiğiniz parçalar...': 'Fault description, last maintenance date or requested parts...', 'Mobil servis araçlarımız 81 ilde hizmet vermektedir.': 'Our mobile service vehicles operate across all 81 provinces.', 'Servis Talebini Gönder': 'Submit Service Request',
    'TEKLİF TAKİP NUMARASI:': 'QUOTE TRACKING NUMBER:', 'Mühendislik ekibimiz talebinizi inceleyerek': 'Our engineering team will review your request and', 'en geç 2 saat içinde': 'within 2 hours at the latest', 'teknik şartname ve fiyat teklifini e-posta veya telefon yoluyla iletecektir.': 'will send the technical specification and quotation by email or phone.', 'Firma:': 'Company:', 'Model seçilmedi / Mühendislik seçimi': 'No model selected / Engineering selection', 'Kabin / Muhafaza Tercihi': 'Enclosure Preference', 'Uygulama Sektörü': 'Application Sector', 'Süper Sessiz Akustik Kabinli': 'Super Silent Acoustic Enclosure', 'Açık Tip Şasili': 'Open Skid', 'Konteyner Tipi Santral': 'Containerized Power Plant', 'Römorklu / Mobil': 'Trailer / Mobile', 'Endüstriyel Üretim & Fabrika': 'Industrial Production & Factory', 'Veri Merkezi / Telekom': 'Data Center / Telecom', 'Hastane & Sağlık Kompleksi': 'Hospital & Healthcare Complex', 'İnşaat / Şantiye / Madencilik': 'Construction / Site / Mining', 'Otel / AVM / Plaza': 'Hotel / Mall / Office Tower', 'Bilgileriniz 6698 sayılı KVKK kapsamında korunmaktadır.': 'Your information is protected under applicable data protection legislation.', 'Projeniz, çalışma şartları veya talep ettiğiniz teknik detaylar...': 'Your project, operating conditions or requested technical details...',
    'Çözümlerimizi Keşfedin': 'Explore Our Solutions', 'Saha Test Videosunu İzle': 'Watch Field Test Video', 'AŞAĞI KAYDIR': 'SCROLL DOWN', 'Hızlı Güç Hesabı Yap →': 'Calculate Power Quickly →', 'Güç Keşfi & Mühendislik': 'Power Discovery & Engineering', 'MÜHENDİSLİK DETAYI': 'ENGINEERING DETAIL', 'Operasyonel Güvenilirlik': 'Operational Reliability', 'Yüksek Güvenilirlik': 'High Reliability', 'Milisaniyelik Geçiş': 'Millisecond Transfer', 'Çevre Dostu': 'Environmentally Friendly',
    'Endüstriyel Kesintisiz Güç & Enerji Sistemleri': 'Industrial Uninterrupted Power & Energy Systems', 'Jeneratörden buhar kazanlarına, trafolardan kojenerasyon ve bataryalı enerji depolama sistemlerine kadar uçtan uca enerji altyapısı.': 'End-to-end energy infrastructure from generators and steam boilers to transformers, cogeneration and battery energy storage systems.', 'Kabinli dizel, açık şasili, senkronize paralel ve konteyner tipi endüstriyel jeneratör setleri.': 'Industrial generator sets in acoustic enclosure, open-skid, synchronized parallel and containerized configurations.', 'Endüstriyel Buhar Kazanları': 'Industrial Steam Boilers', 'Güç & Dağıtım Transformatörleri': 'Power & Distribution Transformers', 'Kombine Isı ve Güç Sistemleri (CHP)': 'Combined Heat and Power Systems (CHP)', 'BESS - Batarya Enerji Depolama': 'BESS - Battery Energy Storage',
    'Önceki ürünler': 'Previous products', 'Sonraki ürünler': 'Next products', 'PDF Henüz Yüklenmedi': 'PDF Not Yet Uploaded', 'PDF Şartname İndir': 'Download PDF Specification', 'Bu ürün için henüz teknik şartname / datasheet PDF yüklenmemiş.': 'No technical specification / datasheet PDF has been uploaded for this product yet.',
    // Admin navigation and editing workflow.
    "Genel Bakış": "Overview",
    "Talepler ve Mesajlar": "Requests and Messages",
    "Görsel İşaretleri": "Image Hotspots",
    "Marka & İletişim": "Brand & Contact",
    "Tema & Görünüm": "Theme & Appearance",
    "Çalışma alanı": "Workspace",
    "Site içeriği": "Site Content",
    "Marka ve yayın": "Brand and Publishing",
    "Ne değiştirmek istiyorsunuz?": "What would you like to change?",
    "Bir işlem seçin; ilgili düzenleme alanına doğrudan gidin.": "Choose a task to open its editing area.",
    "Ana sayfa metinleri ve bölümler": "Home Page Content and Sections",
    "Başlık, açıklama, görsel, buton, sıralama ve görünürlük.": "Headings, descriptions, images, buttons, order and visibility.",
    "Logo ve iletişim bilgileri": "Logo and Contact Information",
    "Firma, telefon, e-posta, adres, harita ve ortak görseller.": "Company, phone, email, address, map and shared images.",
    "Renkler ve yazı tipleri": "Colors and Fonts",
    "Hazır temalar, kurumsal renkler ve tipografi.": "Theme presets, brand colors and typography.",
    "Menü ve bağlantılar": "Menus and Links",
    "Site gezinme bağlantıları ve sıralama.": "Site navigation links and order.",
    "Hakkımızda içeriği": "About Us Content",
    "Kurumsal metinler, fabrika görseli ve bilgi kartları.": "Company content, factory image and information cards.",
    "Teklif talepleri": "Quote Requests",
    "Gelen müşteri taleplerini inceleyin.": "Review incoming customer requests.",
    "Son Değişiklikler": "Recent Changes",
    "İçerik sürümü:": "Content version:",
    "Yayınlama hazırlanıyor...": "Preparing to publish...",
    "Değişiklikler taslağa kaydediliyor...": "Saving changes to draft...",
    "Site yayınlanıyor...": "Publishing site...",
    "Yayınlandı · içerik sürümü": "Published · content version",
    "Değer": "Value",
    "Etiket": "Label",
    "Alt metin": "Alternative Text",
    "Ad": "Name",
    "Başlık": "Heading",
    "Metin": "Text",
    "Açıklama": "Description",
    "Sertifikalar": "Certifications",
    "Bağlantı grupları": "Link Groups",
    "Bağlantılar": "Links",
    "Bağlantı ayarları": "Link Settings",
    "Yasal bağlantılar": "Legal Links",
    "İletişim başlığı": "Contact Heading",
    "Telefon etiketi": "Phone Label",
    "Telefon": "Phone",
    "Yukarı butonu": "Back to Top Button",
    "Telif hakkı metni": "Copyright Text",
    "Görünür": "Visible",
    "Yeni sekmede aç": "Open in New Tab",
    "Hedef (adres veya bölüm kimliği)": "Target (Address or Section ID)",
    "Firma ve sertifikalar": "Company and Certifications",
    "Site görselleri": "Site Images",
    "Logolar": "Logos",
    "Ana sayfa istatistikleri": "Home Page Statistics",
    "Misyon metinleri": "Mission Content",
    "Teknik bilgi işaretleri": "Technical Information Hotspots",
    "Alt bilgi": "Footer",
    "Tema": "Theme",
    "Katalog": "Catalog",
    "Teklif formu": "Quote Form",
    "Hizmet görünümü": "Service Appearance",
    "Ürün görünümü": "Product Appearance",
    "Ana görsel görünümü": "Hero Image Appearance",
    "Ana sayfa başlığı": "Home Page Heading",
    "Ana sayfa açılış alanı": "Hero Section",
    "Bağlantı türü": "Link Type",
    "Sayfa içi bölüm": "Page Section",
    "Pencere aç (about / contact / quote)": "Open Dialog (about / contact / quote)",
    "Web adresi": "Web Address",
    "İletişim mesajı": "Contact Message",
    "Notlar / mesaj": "Notes / Message",
    "Tüm site ayarları": "All Site Settings",
    "Yönetim paneli": "Admin Panel",
    "Gezinmeyi kapat": "Close Navigation",
    "Gezinmeyi aç": "Open Navigation",
};
function localTranslate(raw) {
    const lead = raw.match(/^\s*/)?.[0] || '';
    const trail = raw.match(/\s*$/)?.[0] || '';
    const core = raw.trim();
    const exact = dict[core] || translatedCache.get(core);
    if (exact)
        return lead + exact + trail;
    // Translate known Turkish fragments inside mixed/dynamic text nodes as well.
    let partial = core;
    const entries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);
    for (const [tr, en] of entries) {
        if (tr.length >= 4 && partial.includes(tr))
            partial = partial.split(tr).join(en);
    }
    return lead + partial + trail;
}
function meaningful(s) { return /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(s) && s.trim().length > 1; }
function skippable(n) { const p = n.parentElement; if (!p)
    return true; return !!p.closest('[data-no-i18n="true"],script,style,noscript,code,pre,textarea,input,[contenteditable="true"]'); }
export function getLanguage() { return currentLanguage; }
export function setLanguage(lang) { if (lang !== 'tr' && lang !== 'en')
    return; currentLanguage = lang; generation++; localStorage.setItem(STORAGE_KEY, lang); document.documentElement.lang = lang; window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: lang })); scheduleTranslation(true); }
export function useLanguage() { const [lang, setLang] = useState(currentLanguage); useEffect(() => { const fn = (e) => setLang(e.detail); window.addEventListener(EVENT_NAME, fn); return () => window.removeEventListener(EVENT_NAME, fn); }, []); return { lang, setLanguage }; }
async function fetchUnknown(texts, gen) {
    const unique = [...new Set(texts.map(x => x.trim()).filter(x => x && !dict[x] && !translatedCache.has(x)))].slice(0, 80);
    if (!unique.length || currentLanguage !== 'en')
        return;
    try {
        const r = await fetch(appUrl('/api/translate/batch'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'en', texts: unique }) });
        if (!r.ok)
            return;
        const d = await r.json();
        if (gen !== generation || currentLanguage !== 'en')
            return;
        (d.translations || []).forEach((v, i) => { if (v && v !== unique[i])
            translatedCache.set(unique[i], v); });
        scheduleTranslation(true);
    }
    catch { }
}
function applyLanguage() {
    const gen = generation;
    document.documentElement.lang = currentLanguage;
    const root = document.body;
    if (!root)
        return;
    const unknown = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
        const t = n;
        if (skippable(t))
            continue;
        const cur = t.nodeValue || '';
        if (!originalText.has(t) || (appliedText.has(t) && cur !== appliedText.get(t)))
            originalText.set(t, cur);
        const src = originalText.get(t) || '';
        if (!meaningful(src))
            continue;
        if (currentLanguage === 'tr') {
            if (t.nodeValue !== src)
                t.nodeValue = src;
        }
        else {
            const next = localTranslate(src);
            if (t.nodeValue !== next)
                t.nodeValue = next;
            if (next.trim() === src.trim() && !dict[src.trim()])
                unknown.push(src);
        }
        appliedText.set(t, t.nodeValue || '');
    }
    const attrs = ['placeholder', 'title', 'aria-label'];
    for (const el of Array.from(root.querySelectorAll('*'))) {
        if (el.closest('[data-no-i18n="true"]'))
            continue;
        for (const a of attrs) {
            const cur = el.getAttribute(a);
            if (!cur || !meaningful(cur))
                continue;
            let m = originalAttrs.get(el);
            if (!m) {
                m = new Map();
                originalAttrs.set(el, m);
            }
            let applied = appliedAttrs.get(el);
            if (!applied) { applied = new Map(); appliedAttrs.set(el, applied); }
            if (!m.has(a) || (applied.has(a) && cur !== applied.get(a))) m.set(a, cur);
            const src = m.get(a);
            const next = currentLanguage === 'tr' ? src : localTranslate(src);
            if (cur !== next) el.setAttribute(a, next);
            applied.set(a, next);
            if (currentLanguage === 'en' && next.trim() === src.trim() && !dict[src.trim()]) unknown.push(src);
        }
    }
    if (currentLanguage === 'en')
        void fetchUnknown(unknown, gen);
}
export function scheduleTranslation(_force = false) { if (timer)
    window.clearTimeout(timer); timer = window.setTimeout(() => { timer = null; applyLanguage(); }, 30); }
export function initI18n() { document.documentElement.lang = currentLanguage; scheduleTranslation(true); observer?.disconnect(); observer = new MutationObserver(() => scheduleTranslation(false)); observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] }); }
