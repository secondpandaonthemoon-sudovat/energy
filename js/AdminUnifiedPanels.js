import React,{useEffect,useRef,useState}from'react';
const h=React.createElement;
const get=(o,p,f='')=>String(p||'').split('.').reduce((a,k)=>a?.[k],o)??f;
const BTN=(t,fn,c='')=>h('button',{type:'button',onClick:fn,className:`px-3 py-2 rounded-xl border text-xs font-black bg-white ${c}`},t);
const Field=({label,value,onChange,area=false,type='text'})=>h('label',{className:'block'},h('span',{className:'block text-[11px] font-black uppercase text-black/45 mb-1'},label),area?h('textarea',{rows:4,value:value??'',onChange:e=>onChange(e.target.value),className:'w-full border rounded-xl p-3'}):h('input',{type,value:value??'',onChange:e=>onChange(type==='number'?Number(e.target.value):e.target.value),className:'w-full border rounded-xl p-3'}));
const Toggle=({label,value,onChange})=>h('label',{className:'inline-flex items-center gap-2 text-sm font-bold'},h('input',{type:'checkbox',checked:!!value,onChange:e=>onChange(e.target.checked),className:'accent-[#F1482E]'}),label);
const Card=({title,sub,actions,children})=>h('section',{className:'bg-white rounded-2xl border overflow-hidden mb-4'},h('div',{className:'p-5 border-b flex flex-wrap items-start justify-between gap-3'},h('div',null,h('h2',{className:'font-black text-lg'},title),sub&&h('p',{className:'text-sm text-black/45 mt-1'},sub)),actions),h('div',{className:'p-5'},children));

export function AboutPanel({site,setSite,MediaField}){
 const a=site.about||{},set=(p,v)=>setSite(`about.${p}`,v);
 return h('div',null,
  h(Card,{title:'Hakkımızda',sub:'Sitedeki Hakkımızda penceresinin temel metinleri.'},h('div',{className:'grid md:grid-cols-2 gap-4'},
   h(Field,{label:'Üst Etiket',value:a.eyebrow||'',onChange:v=>set('eyebrow',v)}),h(Field,{label:'Başlık',value:a.title||'',onChange:v=>set('title',v)}),
   h(Field,{label:'Ana Başlık',value:a.heading||'',onChange:v=>set('heading',v)}),h(Field,{label:'Açıklama',area:true,value:a.description||'',onChange:v=>set('description',v)}),
   h(Field,{label:'Prensip Etiketi',value:a.principlesEyebrow||'',onChange:v=>set('principlesEyebrow',v)}),h(Field,{label:'Prensip Başlığı',value:a.principlesTitle||'',onChange:v=>set('principlesTitle',v)}),
   h(Field,{label:'Prensip Açıklaması',area:true,value:a.principlesDescription||'',onChange:v=>set('principlesDescription',v)}),h(Field,{label:'CTA Ön Metni',value:a.ctaLead||'',onChange:v=>set('ctaLead',v)}),
   h(Field,{label:'CTA Butonu',value:a.ctaLabel||'',onChange:v=>set('ctaLabel',v)}),h(Toggle,{label:'CTA göster',value:a.ctaVisible!==false,onChange:v=>set('ctaVisible',v)}))),
  h(Card,{title:'Hakkımızda Görseli'},h(MediaField,{l:'Görsel',v:a.image||'',set:v=>set('image',v)})),
  h(Card,{title:'Öne Çıkan 3 Kart'},h('div',{className:'grid md:grid-cols-3 gap-3'},[0,1,2].map(i=>h('div',{key:i,className:'border rounded-xl p-3 space-y-3'},
   h(Field,{label:`Kart ${i+1} Başlık`,value:get(a,`highlights.${i}.title`,''),onChange:v=>setSite(`about.highlights.${i}.title`,v)}),
   h(Field,{label:'Açıklama',area:true,value:get(a,`highlights.${i}.description`,''),onChange:v=>setSite(`about.highlights.${i}.description`,v)}))))));
}

export function HotspotPanel({site,hotspots,setHotspots}){
 const [selected,setSelected]=useState(0),stageRef=useRef(null),list=Array.isArray(hotspots)?hotspots:[];
 const active=Math.min(selected,Math.max(0,list.length-1)),item=list[active]||null,stage=site.technicalStage||{},image=stage.image||get(site,'images.heroGenerator','');
 const patch=(i,p)=>{const n=[...list];n[i]={...n[i],...p};setHotspots(n)};
 const move=(i,e)=>{const r=stageRef.current?.getBoundingClientRect();if(!r)return;const x=Math.max(0,Math.min(100,100*(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(100,100*(e.clientY-r.top)/r.height));patch(i,{position:{...(list[i].position||{}),x:+x.toFixed(1),y:+y.toFixed(1)}})};
 const beginDrag=(i,e)=>{e.preventDefault();e.stopPropagation();setSelected(i);const mm=ev=>move(i,ev),up=()=>{window.removeEventListener('pointermove',mm);window.removeEventListener('pointerup',up)};window.addEventListener('pointermove',mm);window.addEventListener('pointerup',up)};
 const add=()=>{const n=[...list,{id:`hotspot_${Date.now().toString(36)}`,title:'Yeni Hotspot',subtitle:'',badge:'',description:'',position:{x:50,y:50},enabled:true,sortOrder:list.length}];setHotspots(n);setSelected(n.length-1)};
 return h('div',null,
  h(Card,{title:'Hotspot Görsel Editörü',sub:'Numaralı noktaları görsel üzerinde sürükleyip bırakın. X/Y değerlerini elle girmenize gerek yok.',actions:BTN('+ Hotspot',add,'bg-black text-white')},
   h('div',{ref:stageRef,onClick:e=>item&&move(active,e),className:'relative w-full min-h-[360px] md:min-h-[560px] rounded-2xl overflow-hidden border bg-neutral-100 cursor-crosshair select-none'},
    image?h('img',{src:image,draggable:false,className:'absolute inset-0 w-full h-full object-contain pointer-events-none'}):h('div',{className:'absolute inset-0 grid place-items-center text-black/40 font-bold'},'Hotspot görseli bulunamadı'),
    list.map((x,i)=>x.enabled===false?null:h('button',{key:x.id||i,type:'button',onClick:e=>{e.stopPropagation();setSelected(i)},onPointerDown:e=>beginDrag(i,e),style:{left:`${x.position?.x??50}%`,top:`${x.position?.y??50}%`},className:`absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 shadow-xl font-black text-xs ${i===active?'bg-[#F1482E] text-white border-white ring-4 ring-[#F1482E]/25':'bg-white text-black border-black'}`},String(i+1).padStart(2,'0')))),
   h('p',{className:'text-xs text-black/45 mt-3'},'Bir noktayı sürükleyin veya hotspot seçiliyken görselde istediğiniz konuma tıklayın.')),
  item&&h(Card,{title:`${String(active+1).padStart(2,'0')} · ${item.title||'Hotspot'}`,actions:h('div',{className:'flex gap-2'},BTN(item.enabled===false?'Göster':'Gizle',()=>patch(active,{enabled:item.enabled===false})),BTN('Sil',()=>{if(confirm('Hotspot silinsin mi?')){setHotspots(list.filter((_,i)=>i!==active));setSelected(Math.max(0,active-1))}},'text-red-600'))},
   h('div',{className:'grid md:grid-cols-2 gap-4'},h(Field,{label:'Başlık',value:item.title||'',onChange:v=>patch(active,{title:v})}),h(Field,{label:'Alt Başlık',value:item.subtitle||'',onChange:v=>patch(active,{subtitle:v})}),h(Field,{label:'Etiket',value:item.badge||'',onChange:v=>patch(active,{badge:v})}),h(Field,{label:'Açıklama',area:true,value:item.description||'',onChange:v=>patch(active,{description:v})}),h('div',{className:'md:col-span-2 flex flex-wrap gap-2'},list.map((x,i)=>BTN(`${String(i+1).padStart(2,'0')} ${x.title||'Hotspot'}`,()=>setSelected(i),i===active?'bg-[#F1482E] text-white':''))))));
}

const THEMES=[['asay-orange','ASAY Signature','#F1482E','#080808','#FFFFFF'],['midnight-blue','Midnight Engineering','#2563EB','#08111F','#F7FAFF'],['industrial-steel','Industrial Steel','#3B82A0','#101820','#F5F7F8'],['graphite-gold','Graphite Gold','#C89B3C','#171717','#FAF8F2'],['emerald-energy','Emerald Energy','#0F9F6E','#071B16','#F5FBF8'],['burgundy-power','Burgundy Power','#8E2430','#1B090D','#FFF8F8'],['teal-grid','Teal Grid','#0F8B8D','#071B1C','#F4FBFB'],['royal-violet','Royal Violet','#6D4AFF','#120C24','#FAF8FF'],['mono-pro','Mono Pro','#111111','#050505','#FFFFFF']];
export function ThemePanel({site,setSite}){const t=site.theme||{};return h('div',null,
 h(Card,{title:'Hazır Temalar'},h('div',{className:'grid sm:grid-cols-2 lg:grid-cols-3 gap-3'},THEMES.map(([id,name,primary,dark,surface])=>h('button',{key:id,type:'button',onClick:()=>setSite('theme',{...t,presetId:id,primary,accent:primary,dark,text:dark,surface,background:surface,light:surface}),className:`border rounded-2xl p-4 text-left ${t.presetId===id?'ring-2 ring-[#F1482E]':''}`},h('span',{className:'block w-9 h-9 rounded-full mb-2',style:{background:primary}}),h('b',null,name))))),
 h(Card,{title:'Manuel Görünüm'},h('div',{className:'grid md:grid-cols-2 lg:grid-cols-3 gap-4'},[['primary','Ana Renk'],['accent','Vurgu'],['dark','Koyu'],['surface','Arka Plan'],['text','Metin'],['border','Border']].map(([k,l])=>h(Field,{key:k,label:l,type:'color',value:t[k]||({primary:'#F1482E',accent:'#F1482E',dark:'#080808',surface:'#FFFFFF',text:'#080808',border:'#E5E7EB'}[k]),onChange:v=>setSite(`theme.${k}`,v)})),h(Field,{label:'Kart Köşe px',type:'number',value:t.cardRadius??18,onChange:v=>setSite('theme.cardRadius',v)}),h(Field,{label:'Buton Köşe px',type:'number',value:t.buttonRadius??999,onChange:v=>setSite('theme.buttonRadius',v)}))));}

export function RequestsPanel({api}){const[rows,setRows]=useState([]),[error,setError]=useState(''),load=async()=>{try{const d=await api('/api/admin/quotes');setRows(Array.isArray(d)?d:(d.items||[]));setError('')}catch(e){setError(e.message)}};useEffect(()=>{load()},[]);return h(Card,{title:'Talepler & Mesajlar',sub:`${rows.length} kayıt`,actions:BTN('Yenile',load)},error?h('p',{className:'text-red-600 text-sm'},error):rows.length?h('div',{className:'overflow-auto'},h('table',{className:'w-full text-xs'},h('thead',null,h('tr',null,['Tarih','Referans','Ad / Firma','Ürün / Tür','Telefon / E-posta','Not'].map(x=>h('th',{key:x,className:'text-left p-3 border-b bg-neutral-50'},x)))),h('tbody',null,rows.map((q,i)=>h('tr',{key:q.id||i,className:'align-top'},h('td',{className:'p-3 border-b whitespace-nowrap'},String(q.created_at||'').slice(0,16).replace('T',' ')),h('td',{className:'p-3 border-b font-bold'},q.reference||'-'),h('td',{className:'p-3 border-b'},h('b',null,q.name||'-'),h('div',{className:'text-black/45'},q.company||'')),h('td',{className:'p-3 border-b'},q.product_name||q.division_name||'-'),h('td',{className:'p-3 border-b'},q.phone||'',h('div',{className:'text-black/45'},q.email||'')),h('td',{className:'p-3 border-b max-w-sm'},q.notes||'-')))))):h('p',{className:'text-sm text-black/45'},'Henüz kayıt yok.'));}

export function VideoPanel({site,setSite,MediaField}){
 const existing=Array.isArray(get(site,'media.heroVideos',null))?get(site,'media.heroVideos',[]):[];
 const legacy={id:'video_legacy',title:get(site,'hero.videoTitle','Saha Test Videosunu İzle'),subtitle:get(site,'hero.videoSubtitle','Fabrika Yük Testi (Load Bank Test)'),video:get(site,'media.videoReel',''),poster:get(site,'media.videoPoster',''),visible:get(site,'media.videoEnabled',true)!==false,autoplay:!!get(site,'media.videoAutoplay',false),loop:get(site,'media.videoLoop',true)!==false,muted:get(site,'media.videoMuted',true)!==false,sortOrder:0};
 const videos=existing.length?existing:[legacy];
 const setVideos=(next)=>setSite('media.heroVideos',next.map((x,i)=>({...x,sortOrder:i})));
 const patch=(i,data)=>{const n=[...videos];n[i]={...n[i],...data};setVideos(n)};
 const add=()=>setVideos([...videos,{id:`video_${Date.now().toString(36)}`,title:'Yeni Video',subtitle:'',video:'',poster:'',visible:false,autoplay:false,loop:true,muted:true,sortOrder:videos.length}]);
 const remove=i=>{if(confirm('Bu video kartı silinsin mi?'))setVideos(videos.filter((_,x)=>x!==i))};
 const move=(i,d)=>{const j=i+d;if(j<0||j>=videos.length)return;const n=[...videos];[n[i],n[j]]=[n[j],n[i]];setVideos(n)};
 return h('div',null,
  h(Card,{title:'Hero Görünürlük',sub:'Giriş ekranındaki P33 bilgi kartını ve hero video kartlarını yönetin.',actions:BTN('+ Yeni Video',add,'bg-black text-white')},h('div',{className:'space-y-5'},
   h('div',{className:'rounded-xl border p-4 space-y-3'},h(Toggle,{label:'“P33-PRO / YÜKSEK PERFORMANS” kartını göster',value:get(site,'hero.badgeVisible',true)!==false,onChange:v=>setSite('hero.badgeVisible',v)}),h('div',{className:'grid md:grid-cols-2 gap-3'},h(Field,{label:'P33 Kart Başlığı',value:get(site,'hero.badgeTitle','P33-PRO / YÜKSEK PERFORMANS'),onChange:v=>setSite('hero.badgeTitle',v)}),h(Field,{label:'Kart Link Yazısı',value:get(site,'hero.badgeLink','Teknik Şartnameyi İncele'),onChange:v=>setSite('hero.badgeLink',v)})),h(Field,{label:'Kart Açıklaması',area:true,value:get(site,'hero.badgeDescription',''),onChange:v=>setSite('hero.badgeDescription',v)})),
   h('div',{className:'rounded-xl bg-neutral-50 border p-3 text-xs text-black/55'},'Video kartları index sayfasında sol altta üst üste sıralanır. Her kartın kendi “Göster” kutucuğu vardır. İşaretli olmayan kart frontend’de hiç render edilmez.')
  )),
  ...videos.map((v,i)=>h(Card,{key:v.id||i,title:`Video ${i+1} · ${v.title||'Başlıksız'}`,sub:v.visible===false?'Gizli · Sitede görünmez':'Gösteriliyor · Sitede görünür',actions:h('div',{className:'flex flex-wrap gap-2'},BTN('↑',()=>move(i,-1)),BTN('↓',()=>move(i,1)),BTN('Çıkart',()=>remove(i),'text-red-600'))},
   h('div',{className:'space-y-4'},
    h('div',{className:'flex items-center justify-between gap-3 rounded-xl border bg-neutral-50 p-3'},h('div',null,h('b',{className:'text-sm'},'Kart Görünürlüğü'),h('p',{className:'text-xs text-black/45 mt-1'},'Kapalıysa hero alanında bu video kartı hiç görünmez.')),h(Toggle,{label:'Göster',value:v.visible!==false,onChange:x=>patch(i,{visible:x})})),
    h('div',{className:'grid md:grid-cols-2 gap-4'},h(Field,{label:'Video Başlığı',value:v.title||'',onChange:x=>patch(i,{title:x})}),h(Field,{label:'Video Alt Başlığı',value:v.subtitle||'',onChange:x=>patch(i,{subtitle:x})}),h(MediaField,{l:'Video Dosyası',v:v.video||'',set:x=>patch(i,{video:x}),video:true}),h(MediaField,{l:'Poster',v:v.poster||'',set:x=>patch(i,{poster:x})})),
    h('div',{className:'flex flex-wrap gap-5'},h(Toggle,{label:'Otomatik oynat',value:!!v.autoplay,onChange:x=>patch(i,{autoplay:x})}),h(Toggle,{label:'Döngü',value:v.loop!==false,onChange:x=>patch(i,{loop:x})}),h(Toggle,{label:'Sessiz başlat',value:v.muted!==false,onChange:x=>patch(i,{muted:x})}))
   )
  ))
 );
}

