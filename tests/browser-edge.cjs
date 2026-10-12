const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 let state=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/initial_state.json')));
 await p.addInitScript(()=>localStorage.setItem('asay_language','tr'));
 await p.route('**/api/content',r=>r.fulfill({json:state}));
 const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8080';
 try {
  await p.goto(base);await p.locator('#products-section').waitFor();
  await p.locator('#products-section').getByRole('button',{name:/^Buhar Kazanı/}).click();
  await p.locator('#products-section').getByRole('button',{name:'Bu Model İçin Teklif Al',exact:true}).click();
  await p.getByText('1. Ürün Grubu Seçin',{exact:true}).waitFor();
  await p.waitForTimeout(200);
  const selections=await p.locator('select').evaluateAll(list=>list.map(el=>({value:el.value,text:el.selectedOptions[0]?.textContent})));
  assert.equal(selections[0].value, state.entities.products.find(item=>item.categoryId==='buhar-kazani').id, 'cross-category selected model persists');
  state=structuredClone(state);state.entities.products=[];state.settings.divisions_meta=[];
  await p.goto(base);await p.getByText('Yayında aktif ürün bulunmuyor.',{exact:true}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS edge browser: cross-category quote model preserved; empty product categories render without exceptions');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
