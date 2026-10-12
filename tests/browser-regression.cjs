// Run against a local development server. CMS data is mocked; no production writes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8080';
(async () => {
 const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
 const context = await browser.newContext();
 const page = await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const original=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../data/initial_state.json'),'utf8'));
 let draft=structuredClone(original), published=structuredClone(original), saves=0, publishes=0;
 await page.route('**/api/**',async route=>{
  const req=route.request(), path=new URL(req.url()).pathname;
  let body={};
  if(path==='/api/admin/cms' && req.method()==='PUT'){draft={...req.postDataJSON(),version:draft.version}; saves++; body={ok:true,savedAt:new Date().toISOString()};}
  else if(path==='/api/admin/cms' || path==='/api/admin/preview') body=draft;
  else if(path==='/api/admin/publish'){published=structuredClone(draft); published.version=(draft.version||0)+1;draft.version=published.version;publishes++;body={ok:true,version:published.version};}
  else if(path==='/api/content')body=published;
  else if(path==='/api/admin/media'||path==='/api/admin/revisions')body=[];
  else if(path==='/api/admin/quotes')body={items:[]};
  else if(path==='/api/translate/batch')body={translations:[]};
  else body={ok:true};
  await route.fulfill({json:body});
 });
 await page.addInitScript(()=>{localStorage.setItem('asay_admin_token','test-token');localStorage.setItem('asay_language','tr');});
 await page.goto(base+'/admin');
 await page.locator('[data-admin-ui="true"]').waitFor({timeout:60000});
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  await page.waitForTimeout(500);
  const size=await page.evaluate(()=>({actual:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(size.actual<=size.viewport+1,`Admin overflow at ${width}: ${JSON.stringify(size)}`);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('#admin-navigation').getByRole('button',{name:'Marka & İletişim',exact:true}).click();
 await page.waitForTimeout(500);
 assert.ok((await page.locator('.admin-toolbar').innerText()).includes('Marka & İletişim'),'Toolbar must reflect current editor after translation observer');
 const brand=page.getByLabel('Firma Adı',{exact:true});
 await brand.fill('Denetim Test Markası');
 for(const width of [390,320]) {
  await page.setViewportSize({width,height:900});
  const size=await page.evaluate(()=>({actual:document.documentElement.scrollWidth,viewport:innerWidth}));
  assert.ok(size.actual<=size.viewport+1,`Dirty editor overflow at ${width}: ${JSON.stringify(size)}`);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.getByRole('button',{name:'Taslak Kaydet',exact:true}).first().click();
 await page.waitForFunction(()=>!document.body.textContent.includes('Taslak kaydediliyor'));
 assert.equal(draft.settings.site_config.brand.name,'Denetim Test Markası');
 assert.equal(published.settings.site_config.brand.name,original.settings.site_config.brand.name);
 await page.getByRole('button',{name:'Yayınla',exact:true}).first().click();
 try { await page.getByText(/Yayınlandı.*içerik sürümü/).waitFor({timeout:5000}); } catch(e) { console.log('Publish debug:', (await page.locator('body').innerText()).slice(0,900), 'publish API calls', publishes); throw e; }
 assert.equal(published.settings.site_config.brand.name,'Denetim Test Markası');
 assert.equal(saves,1);assert.equal(publishes,1);
 // Public enabled baseline makes the all-disabled assertion meaningful.
 await page.goto(base+'/');
 await page.locator('footer').waitFor();
 assert.ok(await page.locator('main section').count()>0,'Enabled public sections render');
 // Public all-disabled sections must stay hidden rather than returning defaults.
 published.pages.find(p=>p.slug==='/'||p.id==='page_home').sections.forEach(s=>s.enabled=false);
 await page.goto(base+'/');
 await page.locator('footer').waitFor();
 assert.equal(await page.locator('main section').count(),0);
 assert.deepEqual(errors,[],'Uncaught browser errors');
 console.log('PASS browser: admin 4 widths; draft/publish isolation; published brand; all-disabled sections; no uncaught errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
