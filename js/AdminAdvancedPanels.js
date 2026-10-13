import React from 'react';
const h=React.createElement;
const get=(o,p,f='')=>String(p||'').split('.').reduce((a,k)=>a?.[k],o)??f;
const BTN=(t,fn,c='')=>h('button',{type:'button',onClick:fn,className:`px-3 py-2 rounded-xl border text-xs font-black bg-white ${c}`},t);
const Field=({label,value,onChange,type='text',min,max,step})=>h('label',{className:'block'},h('span',{className:'block text-[11px] font-black uppercase text-black/45 mb-1'},label),h('input',{type,min,max,step,value:value??'',onChange:e=>onChange(type==='number'||type==='range'?Number(e.target.value):e.target.value),className:'w-full border rounded-xl p-3 bg-white'}));
const Card=({title,sub,actions,children})=>h('section',{className:'bg-white rounded-2xl border overflow-hidden mb-4'},h('div',{className:'p-5 border-b flex flex-wrap items-start justify-between gap-3'},h('div',null,h('h2',{className:'font-black text-lg'},title),sub&&h('p',{className:'text-sm text-black/45 mt-1'},sub)),actions),h('div',{className:'p-5'},children));

export function ProductsPanel({products,categories,setProducts,onEdit}){
 const list=Array.isArray(products)?products:[],cats=Array.isArray(categories)?categories:[];
 const catIds=new Set(cats.map(c=>c.id));
 const groups=[...cats.map(c=>({id:c.id,name:c.name||c.shortName||c.id,items:list.map((p,i)=>({p,i})).filter(x=>x.p.categoryId===c.id)}))];
 const uncategorized=list.map((p,i)=>({p,i})).filter(x=>!x.p.categoryId||!catIds.has(x.p.categoryId));
 if(uncategorized.length)groups.push({id:'__uncategorized',name:'Kategorisiz',items:uncategorized});
 const add=(categoryId='')=>setProducts([...list,{id:`product_${Date.now().toString(36)}`,categoryId:categoryId==='__uncategorized'?'':categoryId,name:'Yeni Ürün',description:'',image:'',enabled:true,sortOrder:list.length}]);
 const patch=(index,data)=>{const n=[...list];n[index]={...n[index],...data};setProducts(n)};
 const remove=index=>{if(confirm('Ürün silinsin mi?'))setProducts(list.filter((_,i)=>i!==index))};
 return h('div',{className:'space-y-4'},
  h(Card,{title:'Ürünler',sub:`${list.length} ürün · ${cats.length} kategori`,actions:BTN('+ Yeni Ürün',()=>add(cats[0]?.id||''),'bg-black text-white')},
   h('p',{className:'text-sm text-black/55'},'Ürünler kategori bazında ayrıldı. Yeni ürün eklerken ilgili kategori içindeki “+ Bu Kategoriye Ürün” düğmesini kullanabilirsiniz.')),
  ...groups.map(g=>h(Card,{key:g.id,title:g.name,sub:`${g.items.length} ürün`,actions:g.id!=='__uncategorized'?BTN('+ Bu Kategoriye Ürün',()=>add(g.id),'bg-black text-white'):null},
   g.items.length?h('div',{className:'grid xl:grid-cols-2 gap-3'},g.items.map(({p,i})=>h('div',{key:p.id||i,className:'border rounded-xl p-4 flex gap-4 items-start bg-white'},
    p.image?h('img',{src:p.image,className:'w-28 h-20 object-contain rounded-lg bg-neutral-100'}):h('div',{className:'w-28 h-20 rounded-lg bg-neutral-100 grid place-items-center text-[10px] text-black/35 font-bold'},'GÖRSEL YOK'),
    h('div',{className:'flex-1 min-w-0'},h('div',{className:'flex items-start gap-2'},h('b',{className:'flex-1 truncate'},p.name||'İsimsiz Ürün'),p.enabled===false&&h('span',{className:'text-[10px] px-2 py-1 rounded-full bg-neutral-100 text-black/45 font-bold'},'PASİF')),h('p',{className:'text-xs text-black/45 line-clamp-2 mt-1'},p.description||''),h('div',{className:'flex gap-2 mt-3 flex-wrap'},BTN('Düzenle',()=>onEdit(i,p)),BTN(p.enabled===false?'Aktif Et':'Pasif Et',()=>patch(i,{enabled:p.enabled===false})),BTN('Sil',()=>remove(i),'text-red-600')))))):h('p',{className:'text-sm text-black/40'},'Bu kategoride henüz ürün yok.'))));
}

export function HeroDecorationPanel({site,setSite,MediaField}){
 const shape=get(site,'heroStyle.decorativeShape','circle'),image=get(site,'images.heroDecorative',''),opacity=Number(get(site,'heroStyle.decorativeOpacity',90)),size=Number(get(site,'heroStyle.decorativeSize',680)),width=Number(get(site,'heroStyle.decorativeWidthVw',62)),color=get(site,'heroStyle.decorativeColor','#F1482E');
 const shapes=[['circle','Daire'],['ring','Halka'],['square','Yumuşak Kare'],['diamond','Elmas'],['hexagon','Altıgen']];
 return h(Card,{title:'Hero Arka Dekoru',sub:'Girişte jeneratörün arkasındaki dekoratif alanı şekil veya görsel olarak yönetin.'},
  h('div',{className:'grid lg:grid-cols-2 gap-5'},
   h('div',{className:'space-y-4'},
    h(MediaField,{l:'Dekor Görseli (opsiyonel)',v:image,set:v=>setSite('images.heroDecorative',v)}),
    h('p',{className:'text-xs text-black/45'},image?'Dekor görseli aktif. Şekil seçimi, görsel kaldırıldığında devreye girer.':'Görsel seçilmediği için aşağıdaki şekil kullanılacak.'}),
    h('div',null,h('span',{className:'block text-[11px] font-black uppercase text-black/45 mb-2'},'Hazır Şekil'),h('div',{className:'flex flex-wrap gap-2'},shapes.map(([id,name])=>BTN(name,()=>setSite('heroStyle.decorativeShape',id),shape===id?'bg-[#F1482E] text-white border-[#F1482E]':'')))),
    h(Field,{label:'Şekil Rengi',type:'color',value:color,onChange:v=>setSite('heroStyle.decorativeColor',v)})),
   h('div',{className:'space-y-4'},
    h('div',null,h('div',{className:'flex justify-between text-xs font-bold mb-1'},h('span',null,'Opaklık'),h('span',null,`${opacity}%`)),h('input',{type:'range',min:0,max:100,step:1,value:opacity,onChange:e=>setSite('heroStyle.decorativeOpacity',Number(e.target.value)),className:'w-full accent-[#F1482E]'})),
    h('div',null,h('div',{className:'flex justify-between text-xs font-bold mb-1'},h('span',null,'Dekor Boyutu'),h('span',null,`${size}px`)),h('input',{type:'range',min:220,max:1200,step:10,value:size,onChange:e=>setSite('heroStyle.decorativeSize',Number(e.target.value)),className:'w-full accent-[#F1482E]'})),
    h('div',null,h('div',{className:'flex justify-between text-xs font-bold mb-1'},h('span',null,'Ekran Genişliği Oranı'),h('span',null,`${width}vw`)),h('input',{type:'range',min:20,max:95,step:1,value:width,onChange:e=>setSite('heroStyle.decorativeWidthVw',Number(e.target.value)),className:'w-full accent-[#F1482E]'})),
    h('div',{className:'rounded-2xl border bg-neutral-50 min-h-[260px] grid place-items-center overflow-hidden p-5'},
     image?h('img',{src:image,className:'max-w-full max-h-[240px] object-contain',style:{opacity:Math.max(0,Math.min(100,opacity))/100}}):h('div',{style:{width:'190px',height:'190px',opacity:Math.max(0,Math.min(100,opacity))/100,background:shape==='ring'?'transparent':color,border:shape==='ring'?`22px solid ${color}`:'none',borderRadius:shape==='circle'||shape==='ring'?'9999px':shape==='square'?'22%':shape==='diamond'?'18%':'0',transform:shape==='diamond'?'rotate(45deg)':'none',clipPath:shape==='hexagon'?'polygon(25% 6.7%,75% 6.7%,100% 50%,75% 93.3%,25% 93.3%,0% 50%)':'none'}}))));
}
