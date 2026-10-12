import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const INITIAL_STATE_PATH = path.join(ROOT, 'data', 'initial_state.json');
const CMS_STATE_PATH = path.join(ROOT, 'data', 'cms_state.json');
const UPLOADS_DIR = path.join(ROOT, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory + persisted storage initialization
let initialState = {};
if (fs.existsSync(INITIAL_STATE_PATH)) {
  try {
    initialState = JSON.parse(fs.readFileSync(INITIAL_STATE_PATH, 'utf-8'));
  } catch (e) {
    console.error('Failed to parse initial_state.json', e);
  }
}

let persistedData = null;
if (fs.existsSync(CMS_STATE_PATH)) {
  try {
    persistedData = JSON.parse(fs.readFileSync(CMS_STATE_PATH, 'utf-8'));
  } catch (e) {
    console.warn('Failed to parse cms_state.json, falling back to initial_state.json', e);
  }
}

let draft = persistedData?.draft || structuredClone(initialState);
let published = persistedData?.published || structuredClone(initialState);
let version = persistedData?.version || initialState.version || 1;
let revisions = persistedData?.revisions || [];
let media = persistedData?.media || [];
let quoteRequests = persistedData?.quoteRequests || [];

const adminSessions = new Map();

function saveState() {
  try {
    const data = {
      draft,
      published,
      version,
      revisions,
      media,
      quoteRequests,
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CMS_STATE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving CMS state:', err);
  }
}

function validCmsState(state) {
  if (!state || typeof state !== 'object') return false;
  if (!state.settings || !state.pages || !state.menus || !state.entities) return false;
  if (typeof state.settings !== 'object' || !state.settings.site_config || typeof state.settings.site_config !== 'object') return false;
  if (!Array.isArray(state.pages) || !Array.isArray(state.menus) || typeof state.entities !== 'object') return false;
  for (const key of ['products', 'projects', 'services', 'hotspots']) {
    if (!Array.isArray(state.entities[key])) return false;
    for (const item of state.entities[key]) {
      if (!item || typeof item !== 'object') return false;
    }
  }
  for (const page of state.pages) {
    if (!page || typeof page !== 'object' || !Array.isArray(page.sections)) return false;
    for (const section of page.sections) {
      if (!section || typeof section !== 'object' || typeof section.type !== 'string') return false;
    }
  }
  for (const menu of state.menus) {
    if (!menu || typeof menu !== 'object' || !Array.isArray(menu.items)) return false;
    for (const item of menu.items) {
      if (!item || typeof item !== 'object') return false;
    }
  }
  return true;
}

function secureText(v, max = 5000) {
  const s = String(v ?? '').replace(/<[^>]*>/g, '');
  return s.slice(0, max);
}

function safeSvg(xmlStr) {
  if (/<!DOCTYPE|<!ENTITY|<\?(?!xml\s)/i.test(xmlStr)) return false;
  if (/\b(?:on[a-z]+)\s*=/i.test(xmlStr)) return false;
  if (/<foreignObject/i.test(xmlStr)) return false;
  if (/<script/i.test(xmlStr)) return false;
  if (/javascript:|data:|@import|expression\s*\(/i.test(xmlStr)) return false;
  if (!/<svg[\s>]/i.test(xmlStr) || !/<\/svg>/i.test(xmlStr)) return false;
  return true;
}

function validateFileBuffer(mime, buf) {
  if (mime === 'image/jpeg') {
    return buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
  }
  if (mime === 'image/png') {
    return buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 &&
           buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A;
  }
  if (mime === 'image/gif') {
    return buf.length >= 4 && buf.toString('ascii', 0, 4) === 'GIF8';
  }
  if (mime === 'image/webp') {
    return buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
  }
  if (mime === 'application/pdf') {
    return buf.length >= 5 && buf.toString('ascii', 0, 5) === '%PDF-';
  }
  if (mime === 'video/mp4') {
    return buf.length >= 8 && buf.toString('ascii', 4, 8) === 'ftyp';
  }
  if (mime === 'video/webm') {
    return buf.length >= 4 && buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3;
  }
  if (mime === 'image/svg+xml') {
    return safeSvg(buf.toString('utf-8'));
  }
  return false;
}

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// JSON body parsing with large limit for media uploads
app.use(express.json({ limit: '35mb' }));

// Handle JSON parse errors cleanly
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Geçersiz JSON verisi.' });
  }
  next(err);
});

// Route-level handler for Quotes & Contact
function handleQuote(req, res) {
  const body = req.body || {};
  for (const k of ['divisionId', 'name', 'company', 'phone', 'email']) {
    if (!String(body[k] ?? '').trim()) {
      return res.status(400).json({ error: 'Lütfen zorunlu alanları doldurun.' });
    }
  }
  const emailStr = String(body.email).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    return res.status(400).json({ error: 'Geçerli bir e-posta adresi girin.' });
  }
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const ref = `ASY-${dateStr}-${Math.floor(10 + Math.random() * 90)}`;
  const item = {
    id: quoteRequests.length + 1,
    reference: ref,
    division_id: secureText(body.divisionId, 80),
    division_name: secureText(body.divisionName || '', 120),
    product_id: secureText(body.productId || '', 150),
    product_name: secureText(body.productName || '', 200),
    capacity: secureText(body.capacity || '', 120),
    capacity_label: secureText(body.capacityLabel || '', 120),
    canopy_type: secureText(body.canopyType || '', 80),
    sector: secureText(body.sector || '', 80),
    name: secureText(body.name, 160),
    company: secureText(body.company, 200),
    phone: secureText(body.phone, 80),
    email: secureText(emailStr, 200),
    city: secureText(body.city || '', 160),
    notes: secureText(body.notes || '', 5000),
    status: 'new',
    created_at: new Date().toISOString(),
  };
  quoteRequests.unshift(item);
  saveState();
  res.json({ ok: true, reference: ref });
}

// Public API endpoints
app.get('/api/content', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json(published);
});

app.get('/api/content/version', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({ version: Number(published.version || 1) });
});

app.post('/api/translate/batch', (req, res) => {
  const body = req.body || {};
  const target = (body.target ?? 'en') === 'tr' ? 'tr' : 'en';
  const texts = Array.isArray(body.texts) ? body.texts.slice(0, 80) : [];
  const dict = {
    'Teklif Al': 'Get a Quote',
    'Hakkımızda': 'About Us',
    'Ürünler': 'Products',
    'Teknoloji': 'Technology',
    'Çözümler': 'Solutions',
    'Projeler': 'Projects',
    'İletişim': 'Contact',
    'Jeneratör': 'Generator',
    'Buhar Kazanı': 'Steam Boiler',
    'Trafo': 'Transformer',
    'Trijenerasyon': 'Trigeneration',
    'Kojenerasyon': 'Cogeneration',
    'Enerji Depolama': 'Energy Storage',
  };
  const translations = texts.map((t) => {
    const s = String(t ?? '');
    return target === 'tr' ? s : (dict[s.trim()] ?? s);
  });
  res.json({ target, translations });
});

app.post('/api/contact', (req, res) => {
  const body = req.body || {};
  for (const k of ['name', 'phone', 'email', 'message']) {
    if (!String(body[k] ?? '').trim()) {
      return res.status(400).json({ error: 'Lütfen zorunlu alanları doldurun.' });
    }
  }
  req.body = {
    divisionId: 'contact',
    divisionName: 'İletişim Mesajı',
    name: body.name,
    company: 'İletişim formu',
    phone: body.phone,
    email: body.email,
    notes: body.message,
  };
  return handleQuote(req, res);
});

app.post('/api/quotes', (req, res) => {
  handleQuote(req, res);
});

// Admin authentication
app.post('/api/admin/login', (req, res) => {
  const { username = 'admin', password = '' } = req.body || {};
  const cleanUsername = secureText(username, 100);
  if (cleanUsername !== 'admin') {
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  adminSessions.set(hash, {
    userId: 1,
    role: 'admin',
    username: 'admin',
    expiresAt: Date.now() + 12 * 3600 * 1000,
  });
  res.json({ token, user: { username: 'admin', role: 'admin' } });
});

// Admin authorization guard middleware
app.use('/api/admin', (req, res, next) => {
  if (req.path === '/login') return next();
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1].trim() : '';
  if (!token) {
    return res.status(401).json({ error: 'Oturum geçersiz veya süresi dolmuş.' });
  }
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const session = adminSessions.get(hash);
  if (!session || session.expiresAt <= Date.now()) {
    adminSessions.delete(hash);
    return res.status(401).json({ error: 'Oturum geçersiz veya süresi dolmuş.' });
  }
  req.adminSessionHash = hash;
  req.adminUser = session;
  next();
});

app.post('/api/admin/logout', (req, res) => {
  if (req.adminSessionHash) {
    adminSessions.delete(req.adminSessionHash);
  }
  res.json({ ok: true });
});

app.get('/api/admin/cms', (req, res) => {
  res.json(draft);
});

app.get('/api/admin/preview', (req, res) => {
  res.json(draft);
});

app.put('/api/admin/cms', (req, res) => {
  const body = req.body;
  if (!validCmsState(body)) {
    return res.status(422).json({ error: 'CMS verisinin yapısı geçersiz. Sayfalar, menüler ve içerik listeleri korunmalıdır.' });
  }
  revisions.push({
    id: revisions.length + 1,
    action: 'draft-save',
    payload_json: JSON.stringify(draft),
    created_at: new Date().toISOString(),
    scope: 'site',
    scope_id: 'all',
  });
  draft = { ...body, version: Number(draft.version || 1) };
  saveState();
  res.json({ ok: true, savedAt: new Date().toISOString() });
});

app.post('/api/admin/publish', (req, res) => {
  if (!validCmsState(draft)) {
    return res.status(422).json({ error: 'Taslak verisinin yapısı geçersiz.' });
  }
  const nextVer = Number(draft.version || 1) + 1;
  draft.version = nextVer;
  published = structuredClone(draft);
  revisions.push({
    id: revisions.length + 1,
    action: 'publish',
    payload_json: JSON.stringify(published),
    created_at: new Date().toISOString(),
    scope: 'site',
    scope_id: 'all',
  });
  saveState();
  res.json({ ok: true, version: nextVer, publishedAt: new Date().toISOString() });
});

app.get('/api/admin/revisions', (req, res) => {
  const limit = Math.max(1, Math.min(200, parseInt(req.query.limit, 10) || 30));
  const list = revisions.slice(-limit).reverse().map((r) => ({
    id: r.id,
    action: r.action,
    created_at: r.created_at,
    scope: 'site',
    scope_id: 'all',
  }));
  res.json(list);
});

app.post('/api/admin/revisions/:id/restore', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const rev = revisions.find((r) => r.id === id);
  if (!rev) {
    return res.status(404).json({ error: 'Revision bulunamadı.' });
  }
  try {
    draft = JSON.parse(rev.payload_json);
    saveState();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Revision verisi okunamadı.' });
  }
});

app.post('/api/admin/upload', (req, res) => {
  const body = req.body || {};
  const data = String(body.data || '');
  const orig = path.basename(String(body.fileName || 'file')).replace(/[^a-zA-Z0-9._-]/g, '_');
  const match = data.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) {
    return res.status(400).json({ error: 'Geçersiz dosya verisi.' });
  }
  const mime = match[1];
  const allowed = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'application/pdf': '.pdf',
  };
  if (!allowed[mime]) {
    return res.status(400).json({ error: 'Dosya türüne izin verilmiyor.' });
  }
  const bin = Buffer.from(match[2], 'base64');
  if (bin.length > 30 * 1024 * 1024) {
    return res.status(413).json({ error: 'Dosya en fazla 30 MB olabilir.' });
  }
  if (!validateFileBuffer(mime, bin)) {
    return res.status(400).json({ error: 'Görselin içeriği belirtilen dosya türüyle eşleşmiyor.' });
  }
  const name = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${allowed[mime]}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, name), bin);
  const id = `media_${crypto.randomBytes(8).toString('hex')}`;
  const url = `/uploads/${name}`;
  const title = secureText(body.title || orig, 500);
  const altText = secureText(body.altText || '', 500);
  const item = {
    id,
    fileName: name,
    originalName: orig,
    mimeType: mime,
    url,
    size: bin.length,
    altText,
    title,
    focalX: 50,
    focalY: 50,
    createdAt: new Date().toISOString(),
  };
  media.unshift(item);
  saveState();
  res.json(item);
});

app.get('/api/admin/media', (req, res) => {
  res.json(media);
});

app.put('/api/admin/media/:id', (req, res) => {
  const item = media.find((m) => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Dosya bulunamadı.' });
  const body = req.body || {};
  if (body.altText !== undefined) item.altText = secureText(body.altText, 500);
  if (body.title !== undefined) item.title = secureText(body.title, 500);
  if (body.focalX !== undefined) item.focalX = Math.max(0, Math.min(100, Number(body.focalX || 50)));
  if (body.focalY !== undefined) item.focalY = Math.max(0, Math.min(100, Number(body.focalY || 50)));
  saveState();
  res.json({ ok: true });
});

app.delete('/api/admin/media/:id', (req, res) => {
  const idx = media.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Dosya bulunamadı.' });
  const item = media[idx];
  const draftStr = JSON.stringify(draft);
  const pubStr = JSON.stringify(published);
  if (draftStr.includes(item.url) || pubStr.includes(item.url)) {
    return res.status(409).json({ error: 'Bu medya sitede kullanılıyor.' });
  }
  try {
    fs.unlinkSync(path.join(UPLOADS_DIR, item.fileName));
  } catch (_) {}
  media.splice(idx, 1);
  saveState();
  res.json({ ok: true });
});

app.get('/api/admin/link-check', (req, res) => {
  const type = String(req.query.type || '');
  const target = String(req.query.target || '');
  let ok = true;
  if (type === 'external') {
    ok = /^https?:\/\/.+/i.test(target);
  } else if (type === 'email') {
    ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target.replace(/^mailto:/i, ''));
  } else if (type === 'phone') {
    ok = /^[+0-9()\s-]{7,}$/.test(target.replace(/^tel:/i, ''));
  } else if (type === 'file') {
    ok = target.startsWith('/uploads/') || target.startsWith('/src/assets/');
  }
  res.json({
    ok,
    message: ok ? 'Bağlantı geçerli.' : 'Bu bağlantının hedefi bulunamadı veya biçimi geçersiz.',
  });
});

app.get('/api/admin/quotes', (req, res) => {
  res.json({ items: quoteRequests.slice(0, 500), dbFile: 'In-Memory Store: quote_requests' });
});

// 404 for unmatched API routes
app.use('/api', (req, res) => {
  const route = req.path.replace(/^\//, '');
  res.status(404).json({ error: 'API endpoint bulunamadı.', route });
});

// Security: block protected system directories
app.use((req, res, next) => {
  const p = decodeURIComponent(req.path);
  if (/^\/(config|data|scripts|tests|node_modules)(\/|$)/i.test(p)) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Static assets serving
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/assets', express.static(path.join(ROOT, 'assets')));
app.use('/src/assets', express.static(path.join(ROOT, 'src', 'assets')));
app.use(express.static(ROOT));

// SPA catch-all fallback
app.use((req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

const PORT = 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`ASAY Energy server running on http://${HOST}:${PORT}`);
});
