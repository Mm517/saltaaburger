'use strict';
/* ===== مصدر البيانات الوحيد: عدّل الأسماء والأسعار والصور من هنا ===== */
const IMG = 'assets/images/', CH = 'assets/characters/';
const PHONE = '01003465223', PHONE_DISP = '0100 346 5223', WA_NUM = '201003465223'; // رقم الطلبات (واتساب + اتصال)
const CATS = [
  {id:'burger', name:'البرجر', icon:'hamburger'},
  {id:'combo', name:'الوجبات الكومبو', icon:'utensils'},
  {id:'fries', name:'البطاطس', icon:'fries'},
  {id:'drinks', name:'المشروبات', icon:'cup-soda'},
  {id:'sauces', name:'الصوصات', icon:'sauce'}
];
const EXTRAS = [{id:'cheese',name:'جبنة إضافية',price:10},{id:'bacon',name:'بيكون',price:15},{id:'sauce',name:'صوص السلطع السري',price:5}];
const PRODUCTS = [
  {id:'b1',cat:'burger',name:'سلطع كلاسيك',desc:'لحم مشوي، جبنة ذائبة، خس وطماطم وبصل.',price:130,img:'cheese.webp',extras:1,pop:1},
  {id:'b2',cat:'burger',name:'برجر بيكون تشيز',desc:'بيكون مقرمش مع جبنة شيدر وصوص خاص.',price:150,img:'chicken.webp',extras:1,pop:1},
  {id:'b3',cat:'burger',name:'سلطع دبل',desc:'قطعتين لحم، جبنتين، وصوص السلطع.',price:170,img:'double.webp',extras:1,pop:1},
  {id:'b4',cat:'burger',name:'برجر دجاج',desc:'دجاج مقرمش، خس، طماطم، وصوص كريمي.',price:110,img:'chicken.webp',extras:1,pop:1},
  {id:'c1',cat:'combo',name:'كومبو سلطع',desc:'برجر كلاسيك + بطاطس + مشروب.',price:180,img:'hero-burger.webp',extras:1},
  {id:'c2',cat:'combo',name:'كومبو دبل',desc:'سلطع دبل + بطاطس كبيرة + مشروب.',price:230,img:'double.webp',extras:1},
  {id:'f1',cat:'fries',name:'بطاطس مقرمشة',desc:'بطاطس ذهبية بالملح.',price:40,icon:'fries'},
  {id:'f2',cat:'fries',name:'بطاطس بالجبنة',desc:'بطاطس مغطاة بصوص الجبنة.',price:55,icon:'fries'},
  {id:'d1',cat:'drinks',name:'مشروب غازي',desc:'مشروب بارد منعش.',price:25,icon:'cup-soda'},
  {id:'d2',cat:'drinks',name:'عصير ليمون بالنعناع',desc:'عصير طازج.',price:35,icon:'cup-soda'},
  {id:'s1',cat:'sauces',name:'صوص السلطع',desc:'الصوص السري للمطعم.',price:8,icon:'sauce'},
  {id:'s2',cat:'sauces',name:'صوص باربكيو',desc:'حلو ومدخّن.',price:8,icon:'sauce'}
];
const OFFER = {id:'o1',name:'كومبو سلطع الكبير',price:180,img:'offer.webp',desc:'برجر + بطاطس + مشروب'};
const OFFERS = [OFFER]; // أي عرض جديد يتضاف هنا ويتربط ببانر عن طريق act:{t:'offer',id:'...'}

/* ===== بانرات الإعلانات الكبيرة: عدّل / زوّد / احذف أي بانر من هنا =====
   page : فين يظهر ('home' الرئيسية، 'meals' صفحة الوجبات)
   theme: sun (أصفر) | ocean (أزرق) | coral (أحمر) | mint (أخضر)
   img  : اسم صورة من assets/images (أو مسار كامل)، price/old: السعر والسعر القديم (اختياري)، stk: ملصق صغير (اختياري)
   act  : {t:'offer',id} يضيف عرض للسلة | {t:'product',id} يفتح صفحة الوجبة | {t:'cat',id} يفتح تصنيف | {t:'link',href}
   on:false يخفي البانر مؤقتًا بدون حذفه */
const BANNERS = [
  {page:['home','meals'],theme:'sun',tag:'عرض اليوم',title:'كومبو سلطع الكبير',text:'برجر + بطاطس + مشروب بسعر واحد.',img:'hero-burger.webp',price:180,old:195,cta:'اطلب العرض',act:{t:'offer',id:'o1'}},
  {page:['home','meals'],theme:'ocean',tag:'الأكثر طلبًا',title:'سلطع دبل',text:'قطعتين لحم، جبنتين، وصوص السلطع السري.',img:'double.webp',price:170,cta:'شوف التفاصيل',act:{t:'product',id:'b3'}},
  {page:['home','meals'],theme:'coral',tag:'مقرمش',title:'برجر دجاج',text:'دجاج مقرمش، خس، طماطم، وصوص كريمي.',img:'chicken.webp',price:110,cta:'شوف التفاصيل',act:{t:'product',id:'b4'}},
  {page:['home','meals'],theme:'mint',tag:'اطلب بسهولة',title:'اختار وابعت واتساب',text:'ضيف وجبتك للسلة وطلبك يطلع جاهز على واتساب.',img:'assets/characters/spongebob.webp',cta:'تصفّح الوجبات',act:{t:'link',href:'meals.html'}}
];
const REVIEWS = [{n:'سبونج بوب',s:5,t:'أنا جاهز! أحلى برجر في أعماق البحر، وكل لقمة بتخليني أضحك.',a:'avatar-spongebob.webp'},{n:'باتريك',s:5,t:'طلبت ٣ برجر... وبعدين طلبت ٣ كمان. هو في حد بيشبع؟',a:'avatar-patrick.webp'},{n:'سكويدوارد',s:4,t:'مش هعترف إنه حلو... بس لقيت نفسي بطلب تاني.',a:'avatar-squidward-cool.webp'}];
/* ============================================================ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic=n=>`<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const money=n=>`${n} جنيه`;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Loader ---------- */
addEventListener('load',()=>setTimeout(()=>$('#loader').classList.add('done'),600));
setTimeout(()=>$('#loader').classList.add('done'),4000);

/* ---------- Toast ---------- */
let tt; function toast(m,err){const t=$('#toast');t.textContent=m;t.classList.toggle('err',!!err);t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2600);}

/* ---------- Cart + Orders ---------- */
let cart=[]; try{const c=JSON.parse(localStorage.getItem('krusty_cart')||'[]');cart=Array.isArray(c)?c.filter(i=>i&&i.key&&i.price>0&&i.qty>0&&Array.isArray(i.extras)):[];}catch{}
let orders=[]; try{const o=JSON.parse(localStorage.getItem('krusty_orders')||'[]');orders=Array.isArray(o)?o.filter(x=>x&&x.id&&Array.isArray(x.items)):[];}catch{}
const store=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const total=()=>cart.reduce((s,i)=>s+i.price*i.qty,0), count=()=>cart.reduce((s,i)=>s+i.qty,0);
function addToCart(p,extras=[],qty=1){
  const key=p.id+'|'+extras.map(e=>e.id).sort().join(',');
  const price=p.price+extras.reduce((s,e)=>s+e.price,0);
  const ex=cart.find(i=>i.key===key);
  ex?ex.qty+=qty:cart.push({key,name:p.name,price,extras:extras.map(e=>e.name),qty});
  renderCart(true);toast(`تمت إضافة «${p.name}» للسلة`);
}
const emptyArt=(img,msg,btn)=>`<div class="empty-art"><img src="${CH+img}" alt="" width="219" height="368"><p>${msg}</p>${btn||''}</div>`;
function cartHTML(){
  if(!cart.length)return emptyArt('patrick.webp','السلة فاضية. اختار وجبتك من المنيو!','<a class="btn yellow sm" href="meals.html">تصفّح الوجبات</a>');
  return cart.map((i,x)=>`<div class="line"><b>${esc(i.name)}</b><span>${money(i.price*i.qty)}</span>${i.extras.length?`<small>${esc(i.extras.join('، '))}</small>`:''}
    <div class="acts"><div class="qty"><button data-q="${x}" data-d="-1" aria-label="تقليل">${ic('minus')}</button><b>${i.qty}</b><button data-q="${x}" data-d="1" aria-label="زيادة">${ic('plus')}</button></div>
    <button class="rm" data-rm="${x}" aria-label="حذف">${ic('trash-2')}</button></div></div>`).join('');
}
const fmtDate=t=>{try{return new Date(t).toLocaleString('ar-EG',{day:'numeric',month:'long',hour:'numeric',minute:'2-digit'})}catch{return ''}};
function ordersHTML(){
  if(!orders.length)return emptyArt('spongebob.webp','لسه ماطلبتش حاجة. أول طلب بيظهر هنا!','<a class="btn yellow sm" href="meals.html">اطلب الآن</a>');
  return orders.map(o=>`<article class="ord"><header><b>طلب #${esc(o.id)}</b><span class="st">${ic('check')}اتجهّز للإرسال</span>${o.method?`<span class="st mt">${esc(o.method)}</span>`:''}<small>${fmtDate(o.ts)}</small></header>
    <ul>${o.items.map(i=>`<li><span>${esc(i.name)}${i.extras.length?` (${esc(i.extras.join('، '))})`:''} × ${i.qty}</span><span>${money(i.price*i.qty)}</span></li>`).join('')}</ul>
    <div class="tot"><span>الإجمالي</span><span>${money(o.total)}</span></div>
    <div class="act"><button class="btn yellow" data-reorder="${esc(o.id)}">${ic('plus')}اطلبه تاني</button><a class="btn wa" href="${waLink(o.text)}" target="_blank" rel="noopener">${ic('whatsapp')}إعادة إرسال</a></div></article>`).join('');
}
const waLink=t=>`https://wa.me/${WA_NUM}?text=${encodeURIComponent(t||'')}`;
function renderCart(pop){
  store('krusty_cart',cart);
  const n=count();
  $$('.js-count').forEach(e=>{e.textContent=n;if(e.classList.contains('badge')){e.hidden=!n;if(pop){e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');}}});
  $$('.js-total').forEach(e=>e.textContent=money(total()));
  $$('.js-cart').forEach(e=>e.innerHTML=cartHTML());
  $$('.js-orders').forEach(e=>e.innerHTML=ordersHTML());
}
let tab='cart';
function setTab(t){tab=t;$$('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t));$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==t);$$('[data-foot]').forEach(f=>f.hidden=f.dataset.foot!==t);}
const drawer=$('#drawer'),scrim=$('#scrim');
function openCart(o,t){if(t)setTab(t);drawer.classList.toggle('on',o);scrim.classList.toggle('on',o);drawer.setAttribute('aria-hidden',!o);if(o)menu(false);}
document.addEventListener('click',e=>{
  const q=e.target.closest('[data-q]'),r=e.target.closest('[data-rm]'),tb=e.target.closest('[data-tab]'),op=e.target.closest('[data-open]'),ro=e.target.closest('[data-reorder]');
  if(q){const i=cart[+q.dataset.q];i.qty+=+q.dataset.d;if(i.qty<1)cart.splice(+q.dataset.q,1);renderCart();}
  if(r){cart.splice(+r.dataset.rm,1);renderCart();}
  if(tb)setTab(tb.dataset.tab);
  if(op)openCart(true,op.dataset.open);
  if(ro){const o=orders.find(x=>x.id===ro.dataset.reorder);if(o){o.items.forEach(it=>{const ex=cart.find(c=>c.key===it.key);ex?ex.qty+=it.qty:cart.push({...it});});renderCart(true);setTab('cart');toast('رجّعنا الطلب للسلة');}}
  if(e.target.closest('[data-checkout]'))startCheckout();
});
$('#closeCart').onclick=scrim.onclick=()=>openCart(false);
addEventListener('keydown',e=>{if(e.key==='Escape'){openCart(false);menu(false);}});

/* ---------- Options dialog ---------- */
const dlg=$('#optDlg');let cur=null,oq=1;
function openOpts(p){
  if(!p.extras){addToCart(p);return;}
  cur=p;oq=1;$('#optQty').textContent=1;$('#optTitle').textContent=p.name;
  $('#optList').innerHTML=EXTRAS.map(e=>`<label><input type="checkbox" value="${e.id}"> ${esc(e.name)} <span>+${e.price} جنيه</span></label>`).join('');
  dlg.showModal();
}
$('#optPlus').onclick=()=>$('#optQty').textContent=++oq;
$('#optMinus').onclick=()=>{oq=Math.max(1,oq-1);$('#optQty').textContent=oq};
$('#optForm').addEventListener('submit',e=>{
  if(e.submitter?.value==='ok'){const ids=$$('#optList input:checked').map(i=>i.value);addToCart(cur,EXTRAS.filter(x=>ids.includes(x.id)),oq);}
});

/* ---------- Cards ---------- */
const pic=p=>p.img?`<img src="${IMG+p.img}" alt="${esc(p.name)}" loading="lazy" width="700" height="467">`:ic(p.icon);
const pLink=p=>`product.html?id=${p.id}`;
const card=p=>`<article class="card"><a class="pic" href="${pLink(p)}" aria-label="تفاصيل ${esc(p.name)}">${pic(p)}</a><h3><a href="${pLink(p)}">${esc(p.name)}</a></h3><p>${esc(p.desc)}</p><div class="price">${money(p.price)}</div><button class="btn yellow" data-add="${p.id}">${ic('plus')}أضف للسلة</button></article>`;
const fe=$('#featured');if(fe)fe.innerHTML=PRODUCTS.filter(p=>p.pop).map(card).join('')+
 `<article class="promo"><span class="tag">عرض اليوم</span><img src="${IMG+OFFER.img}" alt="${esc(OFFER.name)}" loading="lazy" width="900" height="600"><h3>${esc(OFFER.name)}</h3><p>${esc(OFFER.desc)}</p><div class="price">${money(OFFER.price)}</div><button class="btn" data-offer="${OFFER.id}">${ic('badge-percent')}اطلب العرض</button></article>`;
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-add]');if(a)openOpts(PRODUCTS.find(p=>p.id===a.dataset.add));
  const of=e.target.closest('[data-offer]');if(of){const o=OFFERS.find(x=>x.id===of.dataset.offer)||OFFER;addToCart(o);openCart(true,'cart');}
  if(e.target.closest('[data-todo]')){e.preventDefault();toast('سيتم إضافة رابط الحساب قريبًا');}
});

/* ---------- Menu ---------- */
if($('#grid')){
let cat=new URLSearchParams(location.search).get('cat');if(!CATS.some(c=>c.id===cat))cat='burger';
$('#cats').innerHTML=CATS.map(c=>`<button data-cat="${c.id}" aria-pressed="${c.id===cat}"><span class="dot">${ic(c.icon)}</span>${c.name}</button>`).join('');
function renderMenu(){
  const q=$('#q').value.trim(),s=$('#sort').value;
  let l=PRODUCTS.filter(p=>q?(p.name+p.desc).includes(q):p.cat===cat);
  if(s!=='def')l=[...l].sort((a,b)=>s==='asc'?a.price-b.price:b.price-a.price);
  $('#grid').innerHTML=l.length?l.map(card).join(''):'<p class="empty">مفيش نتائج مطابقة. جرّب كلمة تانية.</p>';
}
$('#cats').addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;cat=b.dataset.cat;$('#q').value='';$$('#cats button').forEach(x=>x.setAttribute('aria-pressed',x===b));renderMenu();});
$('#q').oninput=renderMenu;$('#sort').onchange=renderMenu;renderMenu();
}

/* ---------- نظام البانرات (سلايدر العروض) ---------- */
function bannerHref(a){return a.t==='product'?`product.html?id=${a.id}`:a.t==='cat'?`meals.html?cat=${a.id}`:a.t==='link'?a.href:'#';}
function bannerHTML(b,i){
  const a=b.act||{},src=b.img?(b.img.includes('/')?b.img:IMG+b.img):'',save=b.old&&b.price?b.old-b.price:0,stk=b.stk||(save>0?`وفّر ${save} جنيه`:'');
  const cta=a.t==='offer'?`<button class="btn bn-cta" data-offer="${esc(a.id)}">${ic('badge-percent')}${esc(b.cta||'اطلب العرض')}</button>`
    :`<a class="btn bn-cta" href="${esc(bannerHref(a))}"${/^https?:/.test(a.href||'')?' target="_blank" rel="noopener"':''}>${esc(b.cta||'اطلب الآن')}</a>`;
  return `<article class="bn-slide th-${b.theme||'sun'}" role="group" aria-roledescription="slide" aria-label="${i+1}"><div class="bn-text">${b.tag?`<span class="bn-tag">${esc(b.tag)}</span>`:''}<h3 class="bn-title">${esc(b.title)}</h3>${b.text?`<p>${esc(b.text)}</p>`:''}
    ${b.price?`<div class="bn-price"><b>${money(b.price)}</b>${b.old?`<s>${money(b.old)}</s>`:''}</div>`:''}${cta}</div>
    <div class="bn-art">${src?`<img src="${src}" alt="${esc(b.title)}" ${i?'loading="lazy"':''}>`:''}${stk?`<span class="bn-stk">${esc(stk)}</span>`:''}</div></article>`;
}
function initBanner(el){
  const page=el.dataset.banners,list=BANNERS.filter(b=>b.on!==false&&(!b.page||b.page.includes(page)));
  if(!list.length){el.remove();return;}
  el.classList.add('bn-on');el.setAttribute('role','region');el.setAttribute('aria-roledescription','carousel');
  el.innerHTML=`<div class="bn-view"><div class="bn-track">${list.map(bannerHTML).join('')}</div></div>`+
    (list.length>1?`<button class="bn-arrow prev" aria-label="السابق">${ic('chev')}</button><button class="bn-arrow next" aria-label="التالي">${ic('chev')}</button><div class="bn-dots">${list.map((_,i)=>`<button aria-label="بانر ${i+1}"></button>`).join('')}</div>`:'');
  const track=$('.bn-track',el),slides=$$('.bn-slide',el),dots=$$('.bn-dots button',el),N=list.length;
  let i=0,drag=null,timer=null,hold=false;
  const go=(n,anim=true)=>{i=(n+N)%N;track.style.transition=anim?'':'none';track.style.transform=`translateX(${i*100}%)`;
    dots.forEach((d,k)=>{d.classList.toggle('cur',k===i);d.setAttribute('aria-current',k===i);});
    slides.forEach((s,k)=>{s.setAttribute('aria-hidden',k!==i);s.inert=k!==i;});};
  const play=()=>{clearInterval(timer);if(N<2||reduce)return;timer=setInterval(()=>{if(!hold&&!document.hidden)go(i+1);},5500);};
  go(0,false);play();
  if(N<2)return;
  $('.prev',el).onclick=()=>{go(i-1);play();};$('.next',el).onclick=()=>{go(i+1);play();};
  dots.forEach((d,k)=>d.onclick=()=>{go(k);play();});
  el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hold=true;});el.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hold=false;});
  el.addEventListener('focusin',()=>hold=true);el.addEventListener('focusout',()=>hold=false);
  el.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){go(i+1);play();}if(e.key==='ArrowRight'){go(i-1);play();}});
  // سحب بالإصبع / الماوس (الاتجاه RTL: السحب لليمين = التالي)
  const view=$('.bn-view',el);
  view.addEventListener('pointerdown',e=>{if(e.target.closest('a,button')&&e.pointerType==='mouse')return;drag={x:e.clientX,y:e.clientY,dx:0,w:view.clientWidth,id:e.pointerId,lock:null};hold=true;});
  view.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(drag.lock===null&&(Math.abs(dx)>8||Math.abs(dy)>8)){drag.lock=Math.abs(dx)>Math.abs(dy)?'x':'y';if(drag.lock==='x')try{view.setPointerCapture(e.pointerId);}catch{}}
    if(drag.lock!=='x')return;drag.dx=dx;track.style.transition='none';track.style.transform=`translateX(calc(${i*100}% + ${dx}px))`;});
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;const{dx,w,lock}=drag;drag=null;hold=false;
    if(lock==='x'){if(Math.abs(dx)>Math.min(90,w*.18))go(dx>0?i+1:i-1);else go(i);view.dataset.moved='1';setTimeout(()=>delete view.dataset.moved,50);}play();};
  view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);
  view.addEventListener('click',e=>{if(view.dataset.moved){e.preventDefault();e.stopPropagation();}},true);
}
$$('[data-banners]').forEach(initBanner);

/* ---------- مكبّر الصور (Lightbox) ---------- */
const LB=(()=>{
  let el,img,st={s:1,x:0,y:0},ptrs=new Map(),pinch=null,pan=null,moved=false,last=0;
  function build(){
    if(el)return;el=document.createElement('div');el.className='lb';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','عرض الصورة');
    el.innerHTML=`<div class="lb-bar"><button class="lb-b" data-lb="close" aria-label="إغلاق">${ic('x')}</button><span class="lb-cap"></span><div class="lb-zoom"><button class="lb-b" data-lb="out" aria-label="تصغير">${ic('minus')}</button><button class="lb-b" data-lb="in" aria-label="تكبير">${ic('plus')}</button></div></div><div class="lb-stage"><img alt="" draggable="false"></div><p class="lb-hint">اضغط مرتين أو اقرص بصباعين للتكبير</p>`;
    document.body.appendChild(el);img=$('img',el);const stage=$('.lb-stage',el);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-lb]');if(b){const k=b.dataset.lb;k==='close'?close():zoomBy(k==='in'?1.6:1/1.6);}});
    stage.addEventListener('wheel',e=>{e.preventDefault();zoomBy(e.deltaY<0?1.2:1/1.2,e.clientX,e.clientY);},{passive:false});
    stage.addEventListener('pointerdown',e=>{stage.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;
      if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:st.s};pan=null;}else pan={x:e.clientX,y:e.clientY,ox:st.x,oy:st.y};});
    stage.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pinch&&ptrs.size>=2){const[a,b]=[...ptrs.values()];moved=true;setS(pinch.s*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d);}
      else if(pan){const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;if(st.s>1){st.x=pan.ox+dx;st.y=pan.oy+dy;apply();}}});
    const up=e=>{ptrs.delete(e.pointerId);pinch=null;pan=ptrs.size?{x:[...ptrs.values()][0].x,y:[...ptrs.values()][0].y,ox:st.x,oy:st.y}:null;
      if(e.type==='pointerup'&&!moved&&!ptrs.size){const now=Date.now();
        if(now-last<320){st.s>1.05?reset():zoomTo(2.6,e.clientX,e.clientY);last=0;}
        else{last=now;if(!e.target.closest('img')){setTimeout(()=>{if(last&&Date.now()-last>=300&&el&&!el.hidden&&st.s<=1.05){last=0;close();}},320);}}}};
    stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
    addEventListener('keydown',e=>{if(el.hidden)return;if(e.key==='Escape')close();if(e.key==='+'||e.key==='=')zoomBy(1.4);if(e.key==='-')zoomBy(1/1.4);});
  }
  function apply(){const stg=$('.lb-stage',el),sw=stg.clientWidth,sh=stg.clientHeight,nw=img.naturalWidth||sw,nh=img.naturalHeight||sh,f=Math.min(Math.min(sw,1100)/nw,sh/nh),bw=nw*f*st.s,bh=nh*f*st.s;
    const mx=Math.max(0,(bw-sw)/2),my=Math.max(0,(bh-sh)/2);
    if(st.s<=1){st.x=0;st.y=0;}else{st.x=Math.max(-mx-60,Math.min(mx+60,st.x));st.y=Math.max(-my-60,Math.min(my+60,st.y));}
    img.style.transform=`translate(${st.x}px,${st.y}px) scale(${st.s})`;el.classList.toggle('zoomed',st.s>1.05);}
  function setS(s){st.s=Math.max(1,Math.min(4,s));apply();}
  function zoomBy(f,cx,cy){zoomTo(st.s*f,cx,cy);}
  function zoomTo(s,cx,cy){s=Math.max(1,Math.min(4,s));const stage=$('.lb-stage',el).getBoundingClientRect(),px=(cx??stage.left+stage.width/2)-(stage.left+stage.width/2),py=(cy??stage.top+stage.height/2)-(stage.top+stage.height/2);
    const k=s/st.s;st.x=px-(px-st.x)*k;st.y=py-(py-st.y)*k;st.s=s;apply();}
  function reset(){st={s:1,x:0,y:0};if(img)apply();}
  let opener=null;
  function open(src,alt){build();opener=document.activeElement;reset();img.src=src;img.alt=alt||'';$('.lb-cap',el).textContent=alt||'';el.hidden=false;document.body.classList.add('lb-open');requestAnimationFrame(()=>{el.classList.add('on');$('[data-lb=close]',el).focus();});}
  function close(){if(!el||el.hidden)return;el.classList.remove('on');document.body.classList.remove('lb-open');setTimeout(()=>{el.hidden=true;img.removeAttribute('src');},200);opener&&opener.focus&&opener.focus();}
  return{open,close};
})();
document.addEventListener('click',e=>{const z=e.target.closest('[data-zoom]');if(z){const im=z.querySelector('img')||z;LB.open(im.currentSrc||im.src,im.alt);}});

/* ---------- صفحة المنتج ---------- */
const pdp=$('#pdp');
if(pdp){
  const id=new URLSearchParams(location.search).get('id'),p=PRODUCTS.find(x=>x.id===id),cat=p&&CATS.find(c=>c.id===p.cat);
  if(!p){
    pdp.innerHTML=`<div class="pdp-miss"><img src="${CH}patrick.webp" alt="" width="219" height="368"><h1 class="h3d">الوجبة دي مش موجودة</h1><p>يمكن اتشالت من المنيو أو الرابط غلط.</p><a class="btn yellow" href="meals.html">تصفّح الوجبات</a></div>`;
  }else{
    document.title=`${p.name} – سلطع برجر`;
    const md=document.querySelector('meta[name=description]');if(md)md.content=`${p.name}: ${p.desc} السعر ${p.price} جنيه.`;
    let q=1;const picked=new Set();
    const rel=PRODUCTS.filter(x=>x.id!==p.id&&(x.cat===p.cat||['fries','drinks'].includes(x.cat))).sort((a,b)=>(a.cat===p.cat?0:1)-(b.cat===p.cat?0:1)).slice(0,4);
    pdp.innerHTML=`<nav class="crumbs" aria-label="مسار التصفح"><a href="index.html">الرئيسية</a>${ic('chev')}<a href="meals.html?cat=${p.cat}">${esc(cat?cat.name:'الوجبات')}</a>${ic('chev')}<span>${esc(p.name)}</span></nav>
    <div class="pdp-grid">
      <div class="pdp-gal">${p.img
        ?`<button class="pdp-pic" type="button" data-zoom aria-label="تكبير صورة ${esc(p.name)}"><img src="${IMG+p.img}" alt="${esc(p.name)}" width="700" height="467" fetchpriority="high"><span class="zoom-chip">${ic('search')}اضغط للتكبير</span></button>`
        :`<div class="pdp-pic icon">${ic(p.icon)}</div>`}</div>
      <div class="pdp-info">
        <a class="pdp-cat" href="meals.html?cat=${p.cat}">${cat?ic(cat.icon):''}${esc(cat?cat.name:'')}</a>
        <h1 class="h3d">${esc(p.name)}</h1>
        <p class="pdp-desc">${esc(p.desc)}</p>
        <div class="pdp-price" id="pPrice">${money(p.price)}</div>
        ${p.extras?`<fieldset class="pdp-ex"><legend>${ic('plus')}ضيف على طلبك</legend>${EXTRAS.map(e=>`<label><input type="checkbox" value="${e.id}"><span>${esc(e.name)}</span><em>+${e.price} جنيه</em></label>`).join('')}</fieldset>`:''}
        <div class="pdp-buy"><div class="qty big"><button type="button" id="pMinus" aria-label="تقليل">${ic('minus')}</button><b id="pQty">1</b><button type="button" id="pPlus" aria-label="زيادة">${ic('plus')}</button></div>
          <button class="btn yellow" id="pAdd" type="button">${ic('shopping-cart')}أضف للسلة <span id="pTot"></span></button></div>
        <div class="pdp-sub"><button class="btn ghost-d" type="button" data-open="cart">${ic('shopping-cart')}فتح السلة</button><a class="btn wa" href="${waLink('عايز أسأل عن: '+p.name)}" target="_blank" rel="noopener">${ic('whatsapp')}اسأل واتساب</a></div>
      </div></div>
    ${rel.length?`<div class="sec-head sub"><h2 class="h3d">كمّل وجبتك</h2>${ic('sparkles')}</div><div class="grid rel">${rel.map(card).join('')}</div>`:''}`;
    const upd=()=>{const ex=EXTRAS.filter(e=>picked.has(e.id)),u=p.price+ex.reduce((s,e)=>s+e.price,0);$('#pQty').textContent=q;$('#pTot').textContent=`· ${money(u*q)}`;$('#pPrice').textContent=money(u);};
    pdp.addEventListener('change',e=>{if(e.target.matches('.pdp-ex input')){e.target.checked?picked.add(e.target.value):picked.delete(e.target.value);upd();}});
    $('#pPlus').onclick=()=>{q=Math.min(20,q+1);upd();};$('#pMinus').onclick=()=>{q=Math.max(1,q-1);upd();};
    $('#pAdd').onclick=()=>{addToCart(p,EXTRAS.filter(e=>picked.has(e.id)),q);};
    upd();
  }
}

/* ---------- Reviews ---------- */
if($('#reviews'))$('#reviews').innerHTML=REVIEWS.map(r=>`<div class="rev"><header><div class="av"><img src="${CH+r.a}" alt="" width="240" height="240" loading="lazy"></div><div><b>${esc(r.n)}</b><div class="stars" aria-label="${r.s} من 5">${ic('star').repeat(r.s)}</div></div></header><p>${esc(r.t)}</p></div>`).join('');

/* ---------- Checkout (واتساب) ---------- */
const co=$('#coDlg'),form=$('#coForm');
function startCheckout(){
  if(!cart.length){toast('السلة فاضية!',true);return;}
  openCart(false);form.hidden=false;$('#coDone').hidden=true;
  try{const c=JSON.parse(localStorage.getItem('krusty_cust')||'{}');['name','phone','address'].forEach(k=>{if(c[k]&&!form.elements[k].value)form.elements[k].value=c[k];});}catch{}
  $('#summary').innerHTML=cart.map(i=>`<div><span>${esc(i.name)} × ${i.qty}</span><span>${money(i.price*i.qty)}</span></div>`).join('')+`<div class="t"><span>الإجمالي</span><span>${money(total())}</span></div>`;
  syncMethod();co.showModal();
}
$('#coCancel').onclick=$('#coX').onclick=()=>co.close();
const rules={name:v=>v.trim().length>=3||'اكتب اسمك (3 حروف على الأقل)',
 phone:v=>/^01[0125]\d{8}$/.test(v.replace(/[\s-]/g,''))||'اكتب رقم موبايل مصري صحيح (11 رقم)',
 address:v=>form.elements.recv.value==='pickup'||v.trim().length>=8||'اكتب عنوان تفصيلي (8 حروف على الأقل)'};
const syncMethod=()=>{const pk=form.elements.recv.value==='pickup';$('#adrFld').hidden=pk;$('#presFld').hidden=!pk;};
form.addEventListener('change',e=>{if(e.target.name==="recv")syncMethod();});
form.addEventListener('reset',()=>setTimeout(syncMethod));
form.addEventListener('submit',e=>{
  e.preventDefault();let ok=true;
  for(const k in rules){const inp=form.elements[k],r=rules[k](inp.value);inp.classList.toggle('bad',r!==true);inp.closest('label').querySelector('small').textContent=r===true?'':r;if(r!==true)ok=false;}
  if(!ok){toast('راجع البيانات المطلوبة',true);return;}
  const d=Object.fromEntries(new FormData(form)),n=Date.now().toString().slice(-6),sum=total();
  const pk=d.recv==='pickup',mLabel=pk?'استلام من المحل':'توصيل للمنزل',pLabel=pk?(d.presence==='coming'?'لسه في الطريق 🚗':'موجود في المحل دلوقتي ✅'):'';
  const txt=`🍔 طلب جديد من موقع سلطع برجر\nرقم الطلب: #${n}\nالاسم: ${d.name.trim()}\nالهاتف: ${d.phone.trim()}\nطريقة الاستلام: ${mLabel}\n${pk?'الحضور: '+pLabel+'\n':'العنوان: '+d.address.trim()+'\n'}${d.notes.trim()?'ملاحظات: '+d.notes.trim()+'\n':''}──────────\n`+cart.map(i=>`• ${i.name}${i.extras.length?' ('+i.extras.join('، ')+')':''} × ${i.qty} = ${money(i.price*i.qty)}`).join('\n')+`\n──────────\nالإجمالي: ${money(sum)}`;
  orders.unshift({id:n,ts:Date.now(),items:cart.map(i=>({...i})),total:sum,text:txt,method:mLabel});orders=orders.slice(0,20);store('krusty_orders',orders);
  store('krusty_cust',{name:d.name.trim(),phone:d.phone.trim(),address:d.address.trim()});
  cart=[];renderCart();form.reset();
  const url=waLink(txt);window.open(url,'_blank','noopener');
  form.hidden=true;const done=$('#coDone');done.hidden=false;
  done.innerHTML=`<div class="done-art"><img src="${CH}spongebob.webp" alt="" width="401" height="421"><h3 class="ok">تم تجهيز طلبك #${n}</h3></div><p>اتفتحلك محادثة واتساب مع المطعم والطلب مكتوب جاهز. <b>اضغط «إرسال» جوه واتساب</b> عشان الطلب يوصلنا فعليًا.</p><pre class="summary" style="white-space:pre-wrap;font-family:inherit;margin-top:.6rem">${esc(txt)}</pre><div class="dlg-act"><a class="btn wa" href="${url}" target="_blank" rel="noopener">${ic('whatsapp')}افتح واتساب</a><a class="btn yellow" href="tel:+${WA_NUM}">${ic('phone')}اتصل بالمطعم</a><button class="btn ghost-d" id="doneC" type="button">إغلاق</button></div>`;
  $('#doneC').onclick=()=>co.close();
});

/* ---------- Nav (قائمة جانبية) ---------- */
const links=$('#links'),menuBtn=$('#menuBtn');
function menu(o){links.classList.toggle('on',o);menuBtn.setAttribute('aria-expanded',o);}
menuBtn.onclick=()=>menu(!links.classList.contains('on'));
$('#menuClose').onclick=()=>menu(false);
links.addEventListener('click',e=>{if(e.target.closest('a'))menu(false);});
document.addEventListener('click',e=>{if(links.classList.contains('on')&&!e.target.closest('#links,#menuBtn'))menu(false);});
if($('#home')){ // تمييز القسم الحالي أثناء التمرير
  const map={home:'home',offers:'offers',build:'offers',order:'order',story:'story',contact:'contact'};
  const so=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){const k=map[x.target.id];$$('.links>a').forEach(a=>a.classList.toggle('cur',a.dataset.k===k));}}),{rootMargin:'-45% 0px -50% 0px'});
  Object.keys(map).forEach(id=>{const el=document.getElementById(id);el&&so.observe(el);});
}

/* ---------- Animations ---------- */
function bubbles(el,n){for(let i=0;i<n;i++){const b=document.createElement('i'),s=6+Math.random()*22;b.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-duration:${9+Math.random()*10}s;animation-delay:-${Math.random()*14}s`;el.appendChild(b);}}
if(!reduce){const low=(navigator.hardwareConcurrency||4)<=4;$$('.bubbles').forEach(b=>bubbles(b,low?8:16));}
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));
if(!reduce){const bg=$('.hero-bg');bg&&addEventListener('scroll',()=>requestAnimationFrame(()=>bg.style.transform=`translateY(${scrollY*.15}px)`),{passive:true});}

/* ---------- البرجر بيتكوّن طبقة طبقة ----------
   عشان تضيف برجر جديد: ضيف عنصر في BURGERS وكل طبقة فيها:
   img = اسم صورة الطبقة (webp شفافة، عرضها 676) · h = ارتفاعها بالبكسل · fx = نوع الحركة (bun/veg/patty/base) · t/s = العنوان والوصف
   الطبقات من فوق لتحت. ولو الطبقة لسه مجهزتش سيب ready:false وهتتخفي من الاختيار. */
const LY={
 bun:{img:'layer-bun',h:343,fx:'bun',t:'الخبز العلوي',s:'خبز ذهبي بسمسم لامع، آخر لمسة قبل ما البرجر يتقفل.'},
 veg:{img:'layer-veg',h:457,fx:'veg',t:'الخضار الطازجة',s:'خس مقرمش وطماطم وبصل ومخلل: الطزاجة اللي بتوازن كل لقمة.'},
 patty1:{img:'layer-patty1',h:206,fx:'patty',t:'الجبنة واللحمة',s:'جبنة دايبة فوق لحمة مشوية على نار عالية.'},
 patty2:{img:'layer-patty2',h:252,fx:'patty',t:'صوص السلطع السري',s:'صوص مخصوص وطبقة لحمة وجبنة تانية... وسره محفوظ.'},
 base:{img:'layer-base',h:172,fx:'base',t:'الخبز السفلي',s:'القاعدة اللي بتشيل كل الأسرار وما بتسيبش حاجة تقع.'}};
const BURGERS=[
 {id:'double',name:'سلطع دبل',pid:'b3',thumb:'double.webp',ready:true,layers:[LY.bun,LY.veg,LY.patty1,LY.patty2,LY.base]},
 {id:'classic',name:'سلطع كلاسيك',pid:'b1',thumb:'cheese.webp',ready:true,layers:[LY.bun,LY.veg,LY.patty1,LY.base]},
 {id:'bacon',name:'بيكون تشيز',pid:'b2',thumb:'chicken.webp',ready:false,layers:[]},
 {id:'chicken',name:'برجر دجاج',pid:'b4',thumb:'chicken.webp',ready:false,layers:[]}
].filter(b=>b.ready&&b.layers.length);
const stage=$('#stage');
if(stage&&BURGERS.length){
  const build=$('#build'),pin=$('.build-pin'),dots=$('#sDots'),card=$('#secret'),pick=$('#pick');
  let cur=BURGERS[0],els=[],N=0,TOTAL=1,w=.16,shown=null,auto=0;
  const maxScroll=()=>build.offsetHeight-innerHeight+72;
  const setText=(key,num,t,s,fin)=>{
    if(shown===key)return;shown=key;
    $('#sNum').textContent=num;$('#sTitle').textContent=t;$('#sText').textContent=s;$('#sCta').hidden=!fin;
    $$('button',dots).forEach((b,i)=>b.classList.toggle('cur',String(i)===String(key)));
    card.classList.remove('swap');void card.offsetWidth;card.classList.add('swap');};
  function render(b){ // يبني طبقات البرجر المختار
    cur=b;const ls=b.layers;N=ls.length;TOTAL=ls.reduce((a,l)=>a+l.h,0);w=.8/N;shown=null;
    stage.innerHTML='';stage.style.setProperty('--k',(TOTAL/1430).toFixed(4));stage.style.aspectRatio=`676/${TOTAL}`;
    let y=0;els=ls.map((l,i)=>{const d=document.createElement('div');d.className='lay';d.dataset.k=l.fx;
      d.style.cssText=`top:${y/TOTAL*100}%;height:${l.h/TOTAL*100}%;z-index:${N-i}`;y+=l.h;
      d.innerHTML=`<img src="${IMG}${l.img}.webp" alt="${esc(l.t)}" width="676" height="${l.h}">`+
        (l.fx==='patty'?'<i class="steam"></i><i class="steam s2"></i><i class="steam s3"></i>':'')+(l.fx==='bun'&&i===0?'<i class="spark"></i><i class="spark s2"></i><i class="spark s3"></i>':'');
      stage.appendChild(d);return d;});
    dots.innerHTML=ls.map((l,i)=>`<button data-i="${i}" aria-label="${esc(l.t)}"></button>`).join('');
    $('#sCta').href=`product.html?id=${b.pid}`;$('#sCta').textContent=`اطلب ${b.name}`;
    $$('button',pick).forEach(x=>{const on=x.dataset.id===b.id;x.classList.toggle('cur',on);x.setAttribute('aria-pressed',on);});
    pin.classList.remove('fin');
    reduce?(update(.85),pin.classList.add('fin')):calc();}
  function update(p){
    const H=stage.clientHeight/TOTAL,u=Math.max(0,Math.min(1,(p-.8)/.2)),ue=u*u*(3-2*u);let top=-1;
    els.forEach((el,i)=>{const k=N-1-i,t=Math.max(0,Math.min(1,(p-k*w)/w)),e=1-Math.pow(1-t,3);
      const shift=ue*.2*(TOTAL-cur.layers.slice(0,i).reduce((a,l)=>a+l.h,0))*H;
      el.style.opacity=e;el.style.transform=`translateY(${(-(1-e)*TOTAL*.5*H+shift).toFixed(1)}px) rotate(${((1-e)*(i%2?-8:8)).toFixed(1)}deg) scale(${(.85+.15*e).toFixed(3)})`;
      if(t>0)top=Math.max(top,k);});
    const fin=p>=.92;pin.classList.toggle('fin',fin);
    els.forEach((el,i)=>el.classList.toggle('on',fin||(top>=0&&i===N-1-top)));
    const ls=cur.layers;
    if(fin)setText('fin','✓',`${cur.name} جاهز!`,'كده كل أسراره اتكشفت. جاهز تجرّبه؟',true);
    else{const i=top<0?N-1:N-1-top;setText(i,`${top<0?1:top+1} / ${N}`,ls[i].t,ls[i].s,false);}
    $('#hint').style.opacity=fin?0:.85;}
  let tick=false;
  const calc=()=>{const r=build.getBoundingClientRect();update(Math.max(0,Math.min(1,-(r.top-72)/maxScroll())));tick=false;};
  const req=()=>{if(!tick){tick=true;requestAnimationFrame(calc);}};
  const stop=()=>{auto=0;};
  /* تشغيل تلقائي: لما الزائر يختار برجر نرجّع للبداية ونسكرول لوحدنا وهو بيتكوّن (أي لمسة أو عجلة بتوقفه) */
  function play(){
    const from=build.offsetTop-72,to=from+maxScroll()*1.0,dur=1500+N*900,t0=performance.now(),id=++auto;
    scrollTo({top:from,behavior:'instant'});
    const step=now=>{if(auto!==id)return;const t=Math.min(1,(now-t0)/dur),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      scrollTo({top:from+(to-from)*e,behavior:'instant'});if(t<1)requestAnimationFrame(step);else auto=0;};
    requestAnimationFrame(step);}
  pick.innerHTML=BURGERS.map(b=>`<button type="button" data-id="${b.id}" aria-pressed="false"><img src="${IMG}${b.thumb}" alt="" width="700" height="467" loading="lazy"><span>${esc(b.name)}</span></button>`).join('');
  pick.hidden=BURGERS.length<2;
  pick.onclick=e=>{const x=e.target.closest('button');if(!x||x.dataset.id===cur.id)return;
    const b=BURGERS.find(v=>v.id===x.dataset.id);render(b);
    if(reduce){build.scrollIntoView({block:'start'});return;}
    const inView=build.getBoundingClientRect().top<innerHeight&&build.getBoundingClientRect().bottom>0;
    inView?play():(scrollTo({top:build.offsetTop-72,behavior:'smooth'}));};
  render(BURGERS[0]);
  if(reduce){build.classList.add('static');
    dots.onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=+b.dataset.i;shown=null;setText(i,`${N-i} / ${N}`,cur.layers[i].t,cur.layers[i].s,false);};}
  else{
    addEventListener('scroll',req,{passive:true});addEventListener('resize',req);
    ['wheel','touchstart','keydown'].forEach(ev=>addEventListener(ev,stop,{passive:true}));
    dots.onclick=e=>{const b=e.target.closest('button');if(!b)return;stop();const k=N-1-+b.dataset.i;
      scrollTo({top:build.offsetTop-72+(k*w+w*.75)*maxScroll(),behavior:'smooth'});};
  }
}

/* ---------- خريطة الأعماق (مرساة بدل الدبوس) ---------- */
const mapEl=$('#map');
if(mapEl&&window.L){
  const pos=[31.0033946,31.6264255]; // الصلاحات - بني عبيد (مركز القرية تقريبًا، عدّله لعنوان المطعم بالظبط)
  const map=L.map(mapEl,{center:pos,zoom:15,scrollWheelZoom:false});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  const icon=L.divIcon({className:'',html:'<div class="anchor-pin"><span class="ring"></span><svg class="ic"><use href="#i-anchor"/></svg></div>',iconSize:[52,66],iconAnchor:[26,66]});
  L.marker(pos,{icon,title:'سلطع برجر'}).addTo(map).bindPopup('<b>سلطع برجر</b><br>الصلاحات، بني عبيد');
  map.on('click',()=>map.scrollWheelZoom.enable());
  addEventListener('load',()=>setTimeout(()=>map.invalidateSize(),800));
}
renderCart();setTab('cart');
