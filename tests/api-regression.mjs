import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.env.ASAY_TEST_URL||'http://127.0.0.1:8080';
if (!process.env.ASAY_TEST_LOGIN_FILE) throw new Error('Set ASAY_TEST_LOGIN_FILE to a secure local credentials JSON file. Use an isolated test database.');
const login=JSON.parse(await readFile(process.env.ASAY_TEST_LOGIN_FILE));
let token='';
async function req(path,method='GET',body,auth=true){const response=await fetch(base+'/api/'+path,{method,headers:{'Content-Type':'application/json',...(token&&auth?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:response.status,data:await response.json()};}
assert.equal((await req('admin/cms')).status,401);
const signed=await req('admin/login','POST',login);assert.equal(signed.status,200);token=signed.data.token;
const original=(await req('admin/cms')).data;
const published=(await req('content')).data;
let upload;
try {
 assert.equal((await req('admin/cms','PUT',{})).status,422);
 const after=(await req('admin/cms')).data;assert.deepEqual(after,original);
 const malformed=await fetch(base+'/api/admin/cms',{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{broken'});assert.equal(malformed.status,400);
 assert.equal((await req('admin/upload','POST',{fileName:'bad.png',data:'data:image/png;base64,'+Buffer.from('<script>evil</script>').toString('base64')})).status,400);
 const svg='<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="red"/></svg>';
 const good=await req('admin/upload','POST',{fileName:'safe.svg',data:'data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64')});assert.equal(good.status,200);upload=good.data;
 for(const payload of ['<svg xmlns="http://www.w3.org/2000/svg" onfocus = "alert(1)"/>','<svg xmlns="http://www.w3.org/2000/svg"><foreignObject/></svg>','<!DOCTYPE svg [<!ENTITY a SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"/>']) assert.equal((await req('admin/upload','POST',{fileName:'unsafe.svg',data:'data:image/svg+xml;base64,'+Buffer.from(payload).toString('base64')})).status,400);
 const draft=structuredClone(original);draft.settings.site_config.images.heroGenerator=upload.url;
 assert.equal((await req('admin/cms','PUT',draft)).status,200);
 assert.equal((await req('admin/publish','POST',{})).status,200);
 assert.equal((await req('admin/cms','PUT',original)).status,200);
 assert.equal((await req('admin/media/'+upload.id,'DELETE')).status,409,'published media stays protected when removed from draft');
 const contact=await req('contact','POST',{name:'Regression contact',email:'test@example.com',phone:'+90 555 555 55 55',message:'Persisted contact regression'},false);assert.equal(contact.status,200);
 const inbox=await req('admin/quotes');const message=inbox.data.items.find(x=>x.reference===contact.data.reference);assert.equal(message.division_id,'contact');assert.equal(message.notes,'Persisted contact regression');
 assert.equal((await req('contact','POST',{name:'Incomplete'},false)).status,400);
 assert.equal((await req('quotes','POST',{divisionId:'test',name:'Test',company:'Test',phone:'123456789',email:'bad'},false)).status,400);
 console.log('PASS API regressions: authentication, state preservation, malformed JSON, safe uploads, published media protection, persisted contact, validation.');
} finally {
 // Restore public content first, then the prior draft; publication version intentionally advances.
 await req('admin/cms','PUT',published);await req('admin/publish','POST',{});await req('admin/cms','PUT',original);
 if(upload) await req('admin/media/'+upload.id,'DELETE');
 await req('admin/logout','POST',{});
 assert.equal((await req('admin/cms')).status,401,'logout revokes session');
}
