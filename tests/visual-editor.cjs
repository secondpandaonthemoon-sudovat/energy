// Use only the disposable test database. Restores its original CMS after verification.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 assert.ok(process.env.TEST_LOGIN_FILE,'Set TEST_LOGIN_FILE for disposable test DB');
 const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8090/asayenergy1';
 const auth=await fetch(base+'/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:fs.readFileSync(process.env.TEST_LOGIN_FILE,'utf8')}).then(r=>r.json());assert.ok(auth.token);
 const headers={'Content-Type':'application/json',Authorization:`Bearer ${auth.token}`};
 const original=await fetch(base+'/api/admin/cms',{headers}).then(r=>r.json());
 const published=await fetch(base+'/api/content').then(r=>r.json());
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const context=await b.newContext({viewport:{width:1600,height:1000}});const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(token=>{localStorage.setItem('asay_admin_token',token);localStorage.setItem('asay_language','tr')},auth.token);
 try {
 await p.goto(base+'/admin');await p.locator('.visual-editor').waitFor();const f=p.frameLocator('.visual-editor-frame');await f.locator('.hero-title-top').waitFor();await p.waitForTimeout(500);
 await f.locator('.hero-title-top').click();let field=p.locator('.visual-editor-field textarea').first();await field.fill('CANLI TEST');await field.pressSequentially(' BAŞLIK');await f.locator('.hero-title-top').filter({hasText:'CANLI TEST BAŞLIK'}).waitFor();
 assert.equal((await fetch(base+'/api/content').then(r=>r.json())).version,published.version);
 // Real pointer selection of the hero image, without bypassing CSS hit-testing.
 await f.locator('.hero-generator-image').click();await p.locator('.visual-editor-field input[type=file]').first().waitFor();
 const imageInput=p.locator('.visual-editor-field input:not([type=file])').first();const oldImage=await imageInput.inputValue();await imageInput.fill('/src/assets/images/steam-boiler.png');await p.waitForTimeout(300);await imageInput.fill(oldImage);
 // Unsaved state survives switching to the product CRUD screen and back.
 await p.locator('#admin-navigation').getByRole('button',{name:'Ürünler',exact:true}).click();await p.getByRole('button',{name:'+ Ürün ekle',exact:true}).click();await p.getByLabel('Ürün adı',{exact:true}).fill('TEST ÜRÜNÜ');await p.getByRole('button',{name:'+ Özellik ekle',exact:true}).click();await p.getByLabel('Özellik 1',{exact:true}).fill('Test özellik');await p.getByRole('button',{name:'Kopyala',exact:true}).click();p.once('dialog',d=>d.accept());await p.getByRole('button',{name:'Ürünü sil',exact:true}).click();
 await p.locator('#admin-navigation').getByRole('button',{name:'Siteyi Düzenle',exact:true}).click();await f.locator('.hero-title-top').filter({hasText:'CANLI TEST BAŞLIK'}).waitFor();
 await p.getByRole('button',{name:'Düzenleme açık',exact:true}).click();await p.waitForTimeout(300);await f.locator('header').getByRole('button',{name:'İletişim',exact:true}).click();await p.getByRole('button',{name:'Gezinme açık',exact:true}).click();await p.waitForTimeout(300);
 const literal=f.getByText('Bize Yazın',{exact:true});{await literal.click();const override=p.getByLabel('Seçili yazı',{exact:true});await override.fill('BİZE YAZIN');await override.pressSequentially(' TEST');await f.getByText('BİZE YAZIN TEST',{exact:true}).waitFor();await f.getByText('BİZE YAZIN TEST',{exact:true}).click();await override.fill('İLETİŞİM TESTİ');await f.getByText('İLETİŞİM TESTİ',{exact:true}).waitFor();}
 await p.getByRole('button',{name:'Taslak Kaydet',exact:true}).first().click();await p.getByText(/Taslak kaydedildi/).waitFor();assert.equal((await fetch(base+'/api/content').then(r=>r.json())).version,published.version);
 await p.getByRole('button',{name:'Yayınla',exact:true}).first().click();await p.getByText(/Yayınlandı.*içerik sürümü/).waitFor();const publicPage=await context.newPage();await publicPage.goto(base+'/');await publicPage.locator('.hero-title-top').filter({hasText:'CANLI TEST BAŞLIK'}).waitFor();await publicPage.locator('header').getByRole('button',{name:'İletişim',exact:true}).click();await publicPage.getByText('İLETİŞİM TESTİ',{exact:true}).waitFor();await publicPage.close();
 for(const width of [1600,390]){await p.setViewportSize({width,height:1000});await p.waitForTimeout(200);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');await p.screenshot({path:`/workspace/runtime/visual-editor-${width}.png`});}
 assert.deepEqual(errors,[]);console.log('PASS visual editor: actual click selection, live multi-character text edits, image field, unsaved navigation, product add/feature/copy/delete, modal browsing, draft isolation, publishing, desktop/mobile overflow, no browser errors');
 }catch(error){await p.screenshot({path:'/workspace/runtime/visual-failure.png'});console.log('Preview header:',await p.frameLocator('.visual-editor-frame').locator('header').innerText().catch(()=>''));throw error;}finally{await fetch(base+'/api/admin/cms',{method:'PUT',headers,body:JSON.stringify(original)});await fetch(base+'/api/admin/publish',{method:'POST',headers,body:'{}'});await fetch(base+'/api/admin/logout',{method:'POST',headers,body:'{}'});await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
