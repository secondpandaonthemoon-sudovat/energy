// Requires an Apache installation under /asayenergy1/ plus a root PHP server.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const root = process.env.ROOT_TEST_URL || 'http://127.0.0.1:8092';
const nested = process.env.NESTED_TEST_URL || 'http://127.0.0.1:8090/asayenergy1';
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
 try {
  for (const base of [root, nested]) {
   const context = await browser.newContext();
   await context.addInitScript(() => localStorage.setItem('asay_language', 'tr'));
   const page = await context.newPage(); const errors = []; const badPaths = [];
   page.on('pageerror', e => errors.push(e.message));
   page.on('request', req => { const u = new URL(req.url()); if (base === nested && u.origin === new URL(nested).origin && /^\/(?:api|assets|src|uploads)\//.test(u.pathname)) badPaths.push(u.pathname); });
   for (const suffix of ['/', '/index.html']) {
    await page.goto(base + suffix);
    await page.locator('.hero-scroll-track').waitFor();
    await page.waitForFunction(() => document.querySelector('.hero-generator-image')?.naturalWidth > 0);
    assert.equal(await page.getByText('Site önizleme modunda', { exact: true }).count(), 0);
    assert.equal(await page.locator('#startup-status').count(), 0);
   }
   for (const suffix of ['/admin', '/admin/']) {
    await page.goto(base + suffix);
    await page.getByLabel('Admin Şifresi', { exact: true }).waitFor();
   }
   assert.deepEqual(badPaths, [], 'No requests escape installation folder');
   assert.deepEqual(errors, [], 'No boot exceptions');
   await context.close();
  }
  const directApi = await fetch(nested + '/api/index.php?route=content');
  assert.equal(directApi.status, 200); assert.ok((await directApi.json()).pages.length);
  for (const scenario of ['unavailable', 'malformed', 'timeout', 'missing-bundle']) {
   const context = await browser.newContext(); const page = await context.newPage();
   await page.addInitScript(() => localStorage.setItem('asay_language', 'tr'));
   if (scenario === 'missing-bundle') await page.route('**/assets/app.js?*', r => r.abort());
   else await page.route('**/api/content', r => scenario === 'timeout' ? undefined : r.fulfill(scenario === 'malformed' ? { status: 200, body: '<html>wrong route</html>', contentType: 'text/html' } : { status: 503, json: { error: 'Not configured' } }));
   await page.goto(nested + '/');
   if (scenario === 'missing-bundle') {
    await page.locator('#startup-error').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#startup-status').textContent(), 'Site başlatılamadı.');
   } else {
    await page.locator('.hero-scroll-track').waitFor({ timeout: 11000 });
    await page.getByText('Site önizleme modunda', { exact: true }).waitFor();
    assert.ok((await page.getByRole('link', { name: 'Kurulum durumunu kontrol et' }).getAttribute('href')).startsWith('/asayenergy1/'));
    await page.waitForFunction(() => document.querySelector('.hero-generator-image')?.naturalWidth > 0);
   }
   await context.close();
  }
  console.log('PASS startup: root/subfolder/index.html/admin routes, real CMS/images, direct API query,503,malformed API,timeout,missing bundle diagnostics.');
 } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
