import React,{useState} from 'react';
const h=React.createElement;
const get=(o,p,f='')=>String(p||'').split('.').reduce((a,k)=>a?.[k],o)??f;
const BTN=(t,fn,c='')=>h('button',{type:'button',onClick:fn,className:`px-3 py-2 rounded-xl border text-xs font-black bg-white ${c}`},t);
const Field=({label,value,onChange,type='text',area=false,min,max,step})=>h('label',{className:'block'},h('span',{className:'block text-[11px] font-black uppercase text-black/45 mb-1'},label),area?h('textarea',{rows:4,value:value??'',onChange:e=>onChange(e.target.value),className:'w-full border rounded-xl p-3 bg-white'}):h('input',{type,min,max,step,value:value??'',onChange:e=>onChange(type==='number'||type==='range'?Number(e.target.value):e.target.value),className:'w-full border rounded-xl p-3 bg-white'}));
const Card=({title,sub,actions,children})=>h('section',{className:'bg-white rounded-2xl border overflow-hidden mb-4'},h('div',{className:'p-5 border-b flex flex-wrap items-start justify-between gap-3'},h('div',null,h('h2',{className:'font-black text-lg'},title),sub&&h('p',{className:'text-sm text-black/45 mt-1'},sub)),actions),h('div',{className:'p-5'},children));

export function ProductsPanel({products,categories,setProducts,onEdit}){
 const list=Array.isArray(products)?products:[],cats=Array.isArray(categories)?categories:[];
 const catIds=new Set(cats.map(c=>c.id)),indexed=list.map((p,i)=>({p,i}));
 const groups=cats.map(c=>({id:c.id,name:c.name||c.shortName||c.id,items:indexed.filter(x=>x.p.categoryId===c.id)}));
 const uncategorized=indexed.filter(x=>!x.p.categoryId||!catIds.has(x.p.categoryId));
 if(uncategorized.length)groups.push({id:'__uncategorized',name:'Kategorisiz',items:uncategorized});
 const add=(categoryId='')=>setProducts([...list,{id:`product_${Date.now().toString(36)}`,categoryId:categoryId==='__uncategorized'?'':categoryId,name:'Yeni Ürün',description:'',image:'',enabled:true,sortOrder:list.length}]);
 const patch=(index,data)=>{const n=[...list];n[index]={...n[index],...data};setProducts(n)};
 const remove=index=>{if(confirm('Ürün silinsin mi?'))setProducts(list.filter((_,i)=>i!==index))};
 return h('div',{className:'space-y-4'},
  h(Card,{title:'Ürünler',sub:`${list.length} ürün · ${cats.length} kategori`,actions:BTN('+ Yeni Ürün',()=>add(cats[0]?.id||''),'bg-black text-white')},h('p',{className:'text-sm text-black/55'},'Ürünler kategori bazında ayrıldı. Yeni ürün eklemek için ilgili kategori içindeki düğmeyi kullanabilirsiniz.')),
  ...groups.map(g=>h(Card,{key:g.id,title:g.name,sub:`${g.items.length} ürün`,actions:g.id!=='__uncategorized'?BTN('+ Bu Kategoriye Ürün',()=>add(g.id),'bg-black text-white'):null},
   g.items.length?h('div',{className:'grid xl:grid-cols-2 gap-3'},g.items.map(({p,i})=>h('div',{key:p.id||i,className:'border rounded-xl p-4 flex gap-4 items-start bg-white'},
    p.image?h('img',{src:p.image,className:'w-28 h-20 object-contain rounded-lg bg-neutral-100'}):h('div',{className:'w-28 h-20 rounded-lg bg-neutral-100 grid place-items-center text-[10px] text-black/35 font-bold'},'GÖRSEL YOK'),
    h('div',{className:'flex-1 min-w-0'},h('div',{className:'flex items-start gap-2'},h('b',{className:'flex-1 truncate'},p.name||'İsimsiz Ürün'),p.enabled===false&&h('span',{className:'text-[10px] px-2 py-1 rounded-full bg-neutral-100 text-black/45 font-bold'},'PASİF')),h('p',{className:'text-xs text-black/45 line-clamp-2 mt-1'},p.description||''),h('div',{className:'flex gap-2 mt-3 flex-wrap'},BTN('Düzenle',()=>onEdit(i,p)),BTN(p.enabled===false?'Aktif Et':'Pasif Et',()=>patch(i,{enabled:p.enabled===false})),BTN('Sil',()=>remove(i),'text-red-600')))))):h('p',{className:'text-sm text-black/40'},'Bu kategoride henüz ürün yok.')))
 );
}

export function ServicesPanel({services,setServices,site,setSite,MediaField}){
 const list=Array.isArray(services)?services:[];
 const [active,setActive]=useState(0);
 const activeIndex=Math.min(active,Math.max(0,list.length-1));
 const activeService=list[activeIndex]||null;
 const sharedBg=get(site,'serviceStyle.backgroundImage',get(site,'images.facilityEngineer',''));
 const previewBg=activeService?.image||sharedBg;
 const overlay=Math.max(0,Math.min(90,Number(get(site,'serviceStyle.overlay',55))));
 const posX=Math.max(0,Math.min(100,Number(get(site,'serviceStyle.positionX',50))));
 const posY=Math.max(0,Math.min(100,Number(get(site,'serviceStyle.positionY',50))));
 const patch=(i,data)=>{const n=[...list];n[i]={...n[i],...data};setServices(n)};
 const add=()=>{const n=[...list,{id:`service_${Date.now().toString(36)}`,number:String(list.length+1).padStart(2,'0'),title:'Yeni Hizmet',subtitle:'HİZMET',description:'',iconName:'Activity',image:'',enabled:true,sortOrder:list.length}];setServices(n);setActive(n.length-1)};
 const remove=i=>{if(confirm('Bu hizmet kutucuğunu silmek istediğinize emin misiniz?')){setServices(list.filter((_,x)=>x!==i).map((x,k)=>({...x,sortOrder:k})));setActive(Math.max(0,i-1))}};
 const move=(i,d)=>{const j=i+d;if(j<0||j>=list.length)return;const n=[...list];[n[i],n[j]]=[n[j],n[i]];setServices(n.map((x,k)=>({...x,sortOrder:k})));setActive(j)};
 const visible=list.map((s,i)=>({s,i})).filter(x=>x.s.enabled!==false);
 return h('div',{className:'space-y-4'},
  h(Card,{title:'Hizmetler · Kutucuk & Görsel Yönetimi',sub:`${list.length} hizmet kutucuğu · Ekle / sil / sırala / görsel ata. Index sayfasına gitmeden burada önizleyin.`,actions:BTN('+ Kutucuk Ekle',add,'bg-black text-white')},
   h('div',{className:'grid lg:grid-cols-[1.2fr_.8fr] gap-5'},
    h('div',{className:'relative min-h-[520px] rounded-2xl overflow-hidden bg-neutral-900 border'},
     previewBg&&h('img',{src:previewBg,className:'absolute inset-0 w-full h-full object-cover',style:{objectPosition:`${posX}% ${posY}%`}}),
     h('div',{className:'absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20',style:{opacity:Math.min(1,overlay/55)}}),
     h('div',{className:'relative z-10 p-6 md:p-8 max-w-xl space-y-3'},
      h('div',{className:'text-[11px] font-black tracking-[.18em] text-white/70'},'CANLI HİZMET ÖNİZLEMESİ'),
      visible.length?visible.map(({s,i})=>h('button',{key:s.id||i,type:'button',onClick:()=>setActive(i),className:`block w-full text-left rounded-2xl p-4 border transition-all ${i===activeIndex?'bg-[#F1482E] text-white border-[#F1482E] translate-x-1':'bg-white/90 text-black border-white/40'}`},
       h('div',{className:'flex items-center gap-3'},h('span',{className:'text-sm font-black'},s.number||String(i+1).padStart(2,'0')),h('span',{className:'text-[10px] font-black uppercase opacity-70'},s.subtitle||'HİZMET')),h('div',{className:'font-black mt-1'},s.title||'Hizmet'),h('p',{className:'text-xs mt-1 opacity-80 line-clamp-2'},s.description||''))):h('div',{className:'rounded-xl bg-white/90 p-5 text-sm font-bold'},'Aktif hizmet kutucuğu yok. “+ Kutucuk Ekle” ile yeni kutucuk ekleyin.')
     )
    ),
    h('div',{className:'space-y-4'},
     h(MediaField,{l:'Bölüm Ana Görseli',v:sharedBg,set:v=>setSite('serviceStyle.backgroundImage',v)}),
     slider('Görsel X Konumu',posX,0,100,1,'%',v=>setSite('serviceStyle.positionX',v)),
     slider('Görsel Y Konumu',posY,0,100,1,'%',v=>setSite('serviceStyle.positionY',v)),
     slider('Koyu Katman',overlay,0,90,1,'%',v=>setSite('serviceStyle.overlay',v)),
     h('div',{className:'rounded-xl bg-neutral-50 border p-3 text-xs text-black/55'},'Her kutucuğa ayrı görsel atayabilirsiniz. Kutucuk ziyaretçi tarafından aktif edildiğinde o görsel arka planda gösterilir. Özel görsel yoksa bölüm ana görseli kullanılır.')
    )
   )
  ),
  ...list.map((s,i)=>h(Card,{key:s.id||i,title:`${s.number||String(i+1).padStart(2,'0')} · ${s.title||'Hizmet'}`,sub:s.enabled===false?'Pasif · Sitede gösterilmez':'Aktif · Sitede gösterilir',actions:h('div',{className:'flex flex-wrap gap-2'},BTN('↑',()=>move(i,-1)),BTN('↓',()=>move(i,1)),BTN(s.enabled===false?'Aktif Et':'Pasif Et',()=>patch(i,{enabled:s.enabled===false})),BTN('Kutucuğu Sil',()=>remove(i),'text-red-600'))},
   h('div',{className:'grid lg:grid-cols-2 gap-4'},
    h('div',{className:'space-y-3'},
     h(Field,{label:'Numara',value:s.number||'',onChange:v=>patch(i,{number:v})}),
     h(Field,{label:'Başlık',value:s.title||'',onChange:v=>patch(i,{title:v})}),
     h(Field,{label:'Alt Başlık',value:s.subtitle||'',onChange:v=>patch(i,{subtitle:v})}),
     h('label',{className:'block'},h('span',{className:'block text-[11px] font-black uppercase text-black/45 mb-1'},'İkon'),h('select',{value:s.iconName||'Activity',onChange:e=>patch(i,{iconName:e.target.value}),className:'w-full border rounded-xl p-3 bg-white'},...['Activity','Layers','Wrench','ShieldCheck'].map(x=>h('option',{key:x,value:x},x)))),
     h(Field,{label:'Açıklama',value:s.description||'',area:true,onChange:v=>patch(i,{description:v})})
    ),
    h('div',{className:'space-y-3'},
     h(MediaField,{l:'Bu Hizmete Özel Görsel',v:s.image||'',set:v=>patch(i,{image:v})}),
     h('button',{type:'button',onClick:()=>setActive(i),className:'w-full rounded-xl bg-black text-white p-3 text-xs font-black'},'Bu Kutucuğu Önizle')
    )
   )
  ))
 );
}

export function HeroDecorationPanel({site,setSite,MediaField}){
 const shape=get(site,'heroStyle.decorativeShape','circle'),image=get(site,'images.heroDecorative',''),opacity=Number(get(site,'heroStyle.decorativeOpacity',90)),size=Number(get(site,'heroStyle.decorativeSize',680)),width=Number(get(site,'heroStyle.decorativeWidthVw',62)),color=get(site,'heroStyle.decorativeColor','#F1482E');
 const shapes=[['circle','Daire'],['ring','Halka'],['square','Yumuşak Kare'],['diamond','Elmas'],['hexagon','Altıgen']];
 const previewStyle={width:'190px',height:'190px',opacity:Math.max(0,Math.min(100,opacity))/100,background:shape==='ring'?'transparent':color,border:shape==='ring'?`22px solid ${color}`:'none',borderRadius:shape==='circle'||shape==='ring'?'9999px':shape==='square'?'22%':shape==='diamond'?'18%':'0',transform:shape==='diamond'?'rotate(45deg)':'none',clipPath:shape==='hexagon'?'polygon(25% 6.7%,75% 6.7%,100% 50%,75% 93.3%,25% 93.3%,0% 50%)':'none'};
 return h(Card,{title:'Hero Arka Dekoru',sub:'Girişte jeneratörün arkasındaki dekoratif alanı şekil veya görsel olarak yönetin.'},h('div',{className:'grid lg:grid-cols-2 gap-5'},
  h('div',{className:'space-y-4'},h(MediaField,{l:'Dekor Görseli (opsiyonel)',v:image,set:v=>setSite('images.heroDecorative',v)}),h('p',{className:'text-xs text-black/45'},image?'Dekor görseli aktif. Şekil seçimi, görsel kaldırıldığında devreye girer.':'Görsel seçilmediği için aşağıdaki şekil kullanılacak.'),h('div',null,h('span',{className:'block text-[11px] font-black uppercase text-black/45 mb-2'},'Hazır Şekil'),h('div',{className:'flex flex-wrap gap-2'},...shapes.map(([shapeId,name])=>BTN(name,()=>setSite('heroStyle.decorativeShape',shapeId),shape===shapeId?'bg-[#F1482E] text-white border-[#F1482E]':'')))),h(Field,{label:'Şekil Rengi',type:'color',value:color,onChange:v=>setSite('heroStyle.decorativeColor',v)})),
  h('div',{className:'space-y-4'},slider('Opaklık',opacity,0,100,1,'%',v=>setSite('heroStyle.decorativeOpacity',v)),slider('Dekor Boyutu',size,220,1200,10,'px',v=>setSite('heroStyle.decorativeSize',v)),slider('Ekran Genişliği Oranı',width,20,95,1,'vw',v=>setSite('heroStyle.decorativeWidthVw',v)),h('div',{className:'rounded-2xl border bg-neutral-50 min-h-[260px] grid place-items-center overflow-hidden p-5'},image?h('img',{src:image,className:'max-w-full max-h-[240px] object-contain',style:{opacity:Math.max(0,Math.min(100,opacity))/100}}):h('div',{style:previewStyle})))
 ));
}

function slider(label,value,min,max,step,suffix,onChange){return h('div',null,h('div',{className:'flex justify-between text-xs font-bold mb-1'},h('span',null,label),h('span',null,`${value}${suffix}`)),h('input',{type:'range',min,max,step,value,onChange:e=>onChange(Number(e.target.value)),className:'w-full accent-[#F1482E]'}) );}