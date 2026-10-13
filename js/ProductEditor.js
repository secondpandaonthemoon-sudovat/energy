import React, { useEffect, useRef, useState } from 'react';
import { assetUrl } from './appPaths.js';

const h = React.createElement;
const inputClass = 'w-full min-w-0 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F1482E]/30';
const buttonClass = 'rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-35';
const fallbackGroups = [
    { id: 'jenerator', name: 'Jeneratör' }, { id: 'buhar-kazani', name: 'Buhar Kazanı' }, { id: 'trafo', name: 'Trafo' },
    { id: 'trijenerasyon', name: 'Trijenerasyon' }, { id: 'kojenerasyon', name: 'Kojenerasyon' }, { id: 'enerji-depolama', name: 'Enerji Depolama' },
];
const technicalFields = [
    ['standbyPower', 'Yedek güç / kapasite'], ['primePower', 'Sürekli güç / kapasite'], ['engine', 'Motor / sistem'],
    ['alternator', 'Alternatör / verim'], ['fuelCapacity', 'Yakıt / kapasite'], ['noiseLevel', 'Ses seviyesi'],
    ['dimensions', 'Ölçüler'], ['weight', 'Ağırlık'], ['technicalTitle', 'Teknik bilgiler başlığı'],
];
const uid = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
const rowKey = item => item._rowId || item.id;
const ordered = list => list.map((item, index) => ({ ...item, sortOrder: index }));

function Field({ label, value, onChange, multiline = false }) {
    return h('label', { className: 'block min-w-0' },
        h('span', { className: 'mb-1.5 block text-sm font-semibold' }, label),
        h(multiline ? 'textarea' : 'input', { className: inputClass, value: value ?? '', onChange: event => onChange(event.target.value), ...(multiline ? { rows: 3 } : { type: 'text' }) }));
}
function Section({ title, children, open = false }) {
    return h('details', { className: 'rounded-xl border border-black/10 bg-white', open: open || undefined },
        h('summary', { className: 'cursor-pointer px-4 py-3 text-sm font-bold' }, title),
        h('div', { className: 'space-y-4 border-t border-black/10 p-4' }, children));
}
function UploadField({ label, value, onChange, upload, pdf = false }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    async function choose(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || loading) return;
        setError(''); setLoading(true);
        let completed = false;
        try {
            await upload(file, media => { completed = true; onChange(media.url); });
            if (!completed) setError('Dosya yüklenemedi. Lütfen yönetim panelindeki hata mesajını kontrol edin.');
        } catch (err) { setError(err.message || 'Dosya yüklenemedi.'); }
        finally { setLoading(false); }
    }
    return h('div', { className: 'space-y-3 rounded-xl border border-black/10 p-4' },
        h('h3', { className: 'text-sm font-bold' }, label),
        !pdf && value && h('img', { src: assetUrl(value), alt: 'Seçili ürün görseli', className: 'h-40 w-full rounded-lg bg-neutral-50 object-contain' }),
        pdf && value && h('a', { href: assetUrl(value), target: '_blank', rel: 'noopener noreferrer', className: 'inline-block text-sm font-semibold underline' }, 'PDF dosyasını aç'),
        h('div', { className: 'flex flex-wrap items-center gap-2' },
            h('label', { className: `${buttonClass} cursor-pointer ${loading ? 'opacity-50' : ''}` }, loading ? 'Yükleniyor…' : pdf ? 'PDF yükle' : 'Görsel yükle',
                h('input', { type: 'file', className: 'sr-only', accept: pdf ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml', disabled: loading || !upload, onChange: choose })),
            value && h('button', { type: 'button', className: buttonClass, onClick: () => onChange(''), disabled: loading }, 'Üründen kaldır')),
        h(Field, { label: pdf ? 'PDF adresi' : 'Görsel adresi', value, onChange }),
        error && h('p', { role: 'alert', className: 'text-sm text-red-700' }, error));
}

export default function ProductEditor({ items = [], setItems, divisions = [], setDivisions, upload, site = {}, updateSite }) {
    const sourceGroups = divisions.length ? divisions : fallbackGroups;
    // Include existing products' groups rather than hiding products when metadata is incomplete.
    const groups = [...sourceGroups];
    for (const product of items) if (product.categoryId && !groups.some(group => group.id === product.categoryId)) groups.push({ id: product.categoryId, name: product.categoryId });
    const firstGroup = groups[0]?.id || 'jenerator';
    const [category, setCategory] = useState(firstGroup);
    const [query, setQuery] = useState('');
    const [selection, setSelection] = useState(rowKey(items.find(item => (item.categoryId || firstGroup) === firstGroup) || {}));
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const groupItems = items.filter(item => (item.categoryId || firstGroup) === category);
    const shown = groupItems.filter(item => `${item.name || ''} ${item.series || ''} ${item.id || ''}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')));
    const current = groupItems.find(item => rowKey(item) === selection);
    const selectedIndex = groupItems.findIndex(item => rowKey(item) === selection);
    useEffect(() => {
        if (!groups.some(group => group.id === category)) setCategory(firstGroup);
        if (!groupItems.some(item => rowKey(item) === selection)) setSelection(rowKey(groupItems[0] || {}));
    }, [items, divisions, category, selection]);
    function commit(next) { const result = ordered(next); itemsRef.current = result; setItems(result); }
    function updateItem(key, field, value) {
        commit(itemsRef.current.map(item => rowKey(item) === key ? { ...item, [field]: value } : item));
    }
    function update(field, value) {
        if (!current) return;
        updateItem(rowKey(current), field, value);
        if (field === 'categoryId') { setCategory(value); setQuery(''); }
    }
    function add() {
        const product = { id: uid('model'), _rowId: uid('product'), categoryId: category, name: 'Yeni ürün', series: '', description: '', image: '', enabled: true, features: [], datasheetUrl: '', datasheetTitle: '' };
        for (const [key] of technicalFields) product[key] = '';
        const next = [...itemsRef.current];
        let after = next.length;
        for (let index = 0; index < next.length; index++) if ((next[index].categoryId || firstGroup) === category) after = index + 1;
        next.splice(after, 0, product); commit(next); setQuery(''); setSelection(rowKey(product));
    }
    function duplicate() {
        if (!current) return;
        const product = { ...structuredClone(current), id: uid('model'), _rowId: uid('product'), name: `${current.name || 'Ürün'} — kopya` };
        const next = [...itemsRef.current]; next.splice(next.findIndex(item => rowKey(item) === selection) + 1, 0, product);
        commit(next); setQuery(''); setSelection(rowKey(product));
    }
    function remove() {
        if (!current || !window.confirm(`“${current.name || 'Bu ürün'}” silinsin mi?`)) return;
        commit(itemsRef.current.filter(item => rowKey(item) !== selection));
    }
    function move(direction) {
        const categoryList = itemsRef.current.filter(item => (item.categoryId || firstGroup) === category);
        const index = categoryList.findIndex(item => rowKey(item) === selection);
        const target = categoryList[index + direction];
        if (!target || index < 0) return;
        const next = [...itemsRef.current];
        const from = next.findIndex(item => rowKey(item) === selection), to = next.findIndex(item => rowKey(item) === rowKey(target));
        [next[from], next[to]] = [next[to], next[from]]; commit(next);
    }
    const features = Array.isArray(current?.features) ? current.features : [];
    const quote = site.quote || {};
    const quoteGroups = Array.isArray(quote.enabledCategoryIds) ? quote.enabledCategoryIds : groups.map(group => group.id);
    const groupName = groups.find(group => group.id === category)?.name || category;
    return h('div', { className: 'space-y-5', 'data-product-editor': 'true' },
        h('section', { className: 'rounded-2xl border border-black/10 bg-white p-4 md:p-5' },
            h('div', { className: 'flex flex-wrap items-end justify-between gap-4' },
                h('label', { className: 'block w-full min-w-0 sm:w-auto sm:min-w-[220px]' }, h('span', { className: 'mb-1.5 block text-sm font-semibold' }, 'Ürün grubu'),
                    h('select', { className: inputClass, value: category, onChange: event => { setCategory(event.target.value); setQuery(''); } }, groups.map(group => h('option', { key: group.id, value: group.id }, `${group.name || group.id} (${items.filter(item => (item.categoryId || firstGroup) === group.id).length})`)))),
                h('button', { type: 'button', className: 'rounded-xl bg-black px-4 py-3 text-sm font-bold text-white', onClick: add }, '+ Ürün ekle')),
            h('p', { className: 'mt-3 text-sm text-neutral-500' }, 'Soldan ürün seçin; sağdan metinlerini, görselini ve teknik detaylarını düzenleyin.')),
        h('div', { className: 'grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]' },
            h('section', { className: 'min-w-0 rounded-2xl border border-black/10 bg-white p-4', 'aria-label': 'Ürün listesi' },
                h(Field, { label: 'Ürün ara', value: query, onChange: setQuery }),
                h('p', { className: 'my-3 text-xs text-neutral-500' }, `${groupName} · ${shown.length} ürün`),
                h('div', { className: 'max-h-[640px] space-y-2 overflow-y-auto' }, shown.map((product, index) => h('button', {
                    key: rowKey(product), type: 'button', className: `w-full rounded-xl border p-3 text-left ${selection === rowKey(product) ? 'border-[#F1482E] bg-[#F1482E]/5' : 'border-black/10 hover:bg-neutral-50'}`,
                    'aria-pressed': selection === rowKey(product), onClick: () => setSelection(rowKey(product)),
                }, h('span', { className: 'block break-words text-sm font-bold' }, product.name || `Ürün ${index + 1}`),
                h('span', { className: 'mt-1 block break-words text-xs text-neutral-500' }, product.series || product.standbyPower || 'Detay eklenmedi'),
                h('span', { className: `mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${product.enabled !== false ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-500'}` }, product.enabled !== false ? 'Görünür' : 'Gizli')))),
                !shown.length && h('p', { className: 'rounded-xl border border-dashed p-5 text-sm text-neutral-500' }, query ? 'Aramaya uygun ürün bulunamadı.' : 'Bu grupta ürün yok. “Ürün ekle” ile başlayın.')),
            current ? h('section', { className: 'min-w-0 rounded-2xl border border-black/10 bg-white p-4 md:p-5', key: rowKey(current), 'aria-label': 'Ürün detayları' },
                h('div', { className: 'mb-5 flex flex-wrap items-center justify-between gap-3' },
                    h('h2', { className: 'break-words text-lg font-bold' }, current.name || 'Ürün detayları'),
                    h('div', { className: 'flex flex-wrap gap-2' },
                        h('button', { type: 'button', className: buttonClass, onClick: () => move(-1), disabled: selectedIndex <= 0, 'aria-label': 'Ürünü yukarı taşı' }, '↑'),
                        h('button', { type: 'button', className: buttonClass, onClick: () => move(1), disabled: selectedIndex < 0 || selectedIndex >= groupItems.length - 1, 'aria-label': 'Ürünü aşağı taşı' }, '↓'),
                        h('button', { type: 'button', className: buttonClass, onClick: duplicate }, 'Kopyala'),
                        h('button', { type: 'button', className: `${buttonClass} border-red-200 text-red-700`, onClick: remove }, 'Ürünü sil'))),
                h('label', { className: 'mb-5 flex items-center gap-3 text-sm font-semibold' }, h('input', { type: 'checkbox', checked: current.enabled !== false, onChange: event => update('enabled', event.target.checked) }), 'Sitede göster'),
                h('div', { className: 'space-y-5' },
                    h('div', { className: 'grid gap-4 md:grid-cols-2' }, h(Field, { label: 'Ürün adı', value: current.name, onChange: value => update('name', value) }), h(Field, { label: 'Seri / alt başlık', value: current.series, onChange: value => update('series', value) })),
                    h(Field, { label: 'Ürün açıklaması', multiline: true, value: current.description, onChange: value => update('description', value) }),
                    h(UploadField, { label: 'Ürün görseli', value: current.image || '', upload, onChange: value => updateItem(rowKey(current), 'image', value) }),
                    h(Section, { title: 'Teknik bilgiler' }, h('div', { className: 'grid gap-4 md:grid-cols-2' }, technicalFields.map(([key, label]) => h(Field, { key, label, value: current[key], onChange: value => update(key, value) })))),
                    h(Section, { title: `Ürün özellikleri (${features.length})`, open: true },
                        h('p', { className: 'text-sm text-neutral-500' }, 'Her özellik sitede ayrı bir satır olarak gösterilir.'),
                        features.map((feature, index) => h('div', { key: index, className: 'flex items-end gap-2' }, h('div', { className: 'min-w-0 flex-1' }, h(Field, { label: `Özellik ${index + 1}`, value: feature, onChange: value => update('features', features.map((entry, position) => position === index ? value : entry)) })), h('button', { type: 'button', className: `${buttonClass} text-red-700`, onClick: () => update('features', features.filter((_, position) => position !== index)), 'aria-label': `Özellik ${index + 1} sil` }, 'Sil'))),
                        h('button', { type: 'button', className: buttonClass, onClick: () => update('features', [...features, '']) }, '+ Özellik ekle')),
                    h(Section, { title: 'PDF teknik dosyası' }, h(UploadField, { label: 'Şartname / datasheet', pdf: true, value: current.datasheetUrl || '', upload, onChange: value => updateItem(rowKey(current), 'datasheetUrl', value) }), h(Field, { label: 'PDF dosya adı', value: current.datasheetTitle || '', onChange: value => update('datasheetTitle', value) })),
                    h(Section, { title: 'Ürünü başka gruba taşı' }, h('label', { className: 'block text-sm font-semibold' }, 'Ürün grubu', h('select', { className: `${inputClass} mt-2`, value: current.categoryId || category, onChange: event => update('categoryId', event.target.value) }, groups.map(group => h('option', { key: group.id, value: group.id }, group.name || group.id)))), h('p', { className: 'text-sm text-neutral-500' }, 'Grup değiştiğinde ürün yeni grubun listesine taşınır.'))))
                : h('section', { className: 'rounded-2xl border border-dashed border-black/15 bg-white p-8 text-sm text-neutral-500' }, 'Düzenlemek için bir ürün seçin veya yeni ürün ekleyin.')),
        h(Section, { title: 'Ürün grubu başlıkları ve açıklamaları' }, groups.map(group => h(Section, { key: group.id, title: group.name || group.id },
            h('div', { className: 'grid gap-4 md:grid-cols-2' }, [['name', 'Grup adı'], ['shortName', 'Kısa ad'], ['tagline', 'Slogan'], ['description', 'Açıklama']].map(([key, label]) => h(Field, { key, label, multiline: key === 'description', value: group[key] || '', onChange: value => setDivisions?.(groups.map(entry => entry.id === group.id ? { ...entry, [key]: value } : entry)) })))))),
        h(Section, { title: 'Katalog penceresi metinleri' }, h('div', { className: 'grid gap-4 md:grid-cols-2' }, [
            ['eyebrow', 'Üst başlık', 'ASAY ENERGY TAM ÜRÜN KATALOĞU'], ['title', 'Ana başlık', 'Tüm Güç ve Enerji Sistemleri Modelleri'], ['searchPlaceholder', 'Arama kutusu metni', 'Model, güç veya kategori ara...'],
            ['customQuoteLabel', 'Özel proje butonu', 'Özel Proje Teklifi İste'], ['specButtonLabel', 'Şartname butonu', 'Şartname'], ['quoteButtonLabel', 'Teklif butonu', 'Teklif Al'], ['footerText', 'Alt açıklama', 'Tüm sistemlerimiz mühendislik garantili ve anahtar teslim devreye alma kapsamındadır.'],
        ].map(([key, label, fallback]) => h(Field, { key, label, multiline: key === 'footerText', value: site.catalog?.[key] ?? fallback, onChange: value => updateSite(`catalog.${key}`, value) })))),
        h(Section, { title: 'Teklif formu ayarları' },
            h('div', { className: 'grid gap-4 md:grid-cols-2' }, [['eyebrow', 'Üst başlık', 'HIZLI TEKLİF & GÜÇ KEŞFİ'], ['title', 'Form başlığı', 'Ürün Fiyat Teklifi Al'], ['submitLabel', 'Gönder butonu', 'Teklif İste'], ['successTitle', 'Başarı mesajı başlığı', 'Talebiniz Başarıyla Alındı']].map(([key, label, fallback]) => h(Field, { key, label, value: quote[key] ?? fallback, onChange: value => updateSite(`quote.${key}`, value) }))),
            h('p', { className: 'text-sm font-semibold' }, 'Teklif istenebilen ürün grupları'),
            h('div', { className: 'grid gap-3 sm:grid-cols-2' }, groups.map(group => h('label', { key: group.id, className: 'flex items-center gap-3 rounded-lg border border-black/10 p-3 text-sm' }, h('input', { type: 'checkbox', checked: quoteGroups.includes(group.id), onChange: event => updateSite('quote.enabledCategoryIds', event.target.checked ? [...quoteGroups, group.id] : quoteGroups.filter(id => id !== group.id)) }), group.name || group.id)))));
}
