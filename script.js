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
  return orders.map(o=>`<article class="ord"><header><b>طلب #${esc(o.id)}</b><span class="st">${ic('check')}اتجهّز للإرسال</span><small>${fmtDate(o.ts)}</small></header>
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
const card=p=>`<article class="card"><div class="pic">${pic(p)}</div><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="price">${money(p.price)}</div><button class="btn yellow" data-add="${p.id}">${ic('plus')}أضف للسلة</button></article>`;
const fe=$('#featured');if(fe)fe.innerHTML=PRODUCTS.filter(p=>p.pop).map(card).join('')+
 `<article class="promo"><span class="tag">عرض اليوم</span><img src="${IMG+OFFER.img}" alt="${esc(OFFER.name)}" loading="lazy" width="900" height="600"><h3>${esc(OFFER.name)}</h3><p>${esc(OFFER.desc)}</p><div class="price">${money(OFFER.price)}</div><button class="btn" data-offer>${ic('badge-percent')}اطلب العرض</button></article>`;
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-add]');if(a)openOpts(PRODUCTS.find(p=>p.id===a.dataset.add));
  if(e.target.closest('[data-offer]')){addToCart(OFFER);openCart(true,'cart');}
  if(e.target.closest('[data-todo]')){e.preventDefault();toast('سيتم إضافة رابط الحساب قريبًا');}
});

/* ---------- Menu ---------- */
if($('#grid')){
let cat='burger';
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

/* ---------- Reviews ---------- */
if($('#reviews'))$('#reviews').innerHTML=REVIEWS.map(r=>`<div class="rev"><header><div class="av"><img src="${CH+r.a}" alt="" width="240" height="240" loading="lazy"></div><div><b>${esc(r.n)}</b><div class="stars" aria-label="${r.s} من 5">${ic('star').repeat(r.s)}</div></div></header><p>${esc(r.t)}</p></div>`).join('');

/* ---------- Checkout (واتساب) ---------- */
const co=$('#coDlg'),form=$('#coForm');
function startCheckout(){
  if(!cart.length){toast('السلة فاضية!',true);return;}
  openCart(false);form.hidden=false;$('#coDone').hidden=true;
  try{const c=JSON.parse(localStorage.getItem('krusty_cust')||'{}');['name','phone','address'].forEach(k=>{if(c[k]&&!form.elements[k].value)form.elements[k].value=c[k];});}catch{}
  $('#summary').innerHTML=cart.map(i=>`<div><span>${esc(i.name)} × ${i.qty}</span><span>${money(i.price*i.qty)}</span></div>`).join('')+`<div class="t"><span>الإجمالي</span><span>${money(total())}</span></div>`;
  co.showModal();
}
$('#coCancel').onclick=$('#coX').onclick=()=>co.close();
const rules={name:v=>v.trim().length>=3||'اكتب اسمك (3 حروف على الأقل)',
 phone:v=>/^01[0125]\d{8}$/.test(v.replace(/[\s-]/g,''))||'اكتب رقم موبايل مصري صحيح (11 رقم)',
 address:v=>v.trim().length>=8||'اكتب عنوان تفصيلي (8 حروف على الأقل)'};
form.addEventListener('submit',e=>{
  e.preventDefault();let ok=true;
  for(const k in rules){const inp=form.elements[k],r=rules[k](inp.value);inp.classList.toggle('bad',r!==true);inp.closest('label').querySelector('small').textContent=r===true?'':r;if(r!==true)ok=false;}
  if(!ok){toast('راجع البيانات المطلوبة',true);return;}
  const d=Object.fromEntries(new FormData(form)),n=Date.now().toString().slice(-6),sum=total();
  const txt=`🍔 طلب جديد من موقع سلطع برجر\nرقم الطلب: #${n}\nالاسم: ${d.name.trim()}\nالهاتف: ${d.phone.trim()}\nالعنوان: ${d.address.trim()}\n${d.notes.trim()?'ملاحظات: '+d.notes.trim()+'\n':''}──────────\n`+cart.map(i=>`• ${i.name}${i.extras.length?' ('+i.extras.join('، ')+')':''} × ${i.qty} = ${money(i.price*i.qty)}`).join('\n')+`\n──────────\nالإجمالي: ${money(sum)}`;
  orders.unshift({id:n,ts:Date.now(),items:cart.map(i=>({...i})),total:sum,text:txt});orders=orders.slice(0,20);store('krusty_orders',orders);
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

/* ---------- البرجر بيتكوّن طبقة طبقة (عدّل النصوص من هنا) ---------- */
const LAYERS=[ // من فوق لتحت
 {k:'bun',y0:40,y1:383,t:'الخبز العلوي',s:'خبز ذهبي بسمسم لامع، آخر لمسة قبل ما البرجر يتقفل.'},
 {k:'veg',y0:383,y1:840,t:'الخضار الطازجة',s:'خس مقرمش وطماطم وبصل ومخلل: الطزاجة اللي بتوازن كل لقمة.'},
 {k:'patty1',y0:840,y1:1046,t:'الجبنة واللحمة',s:'جبنة دايبة فوق لحمة مشوية على نار عالية.'},
 {k:'patty2',y0:1046,y1:1298,t:'صوص السلطع السري',s:'صوص مخصوص وطبقة لحمة وجبنة تانية... وسره محفوظ.'},
 {k:'base',y0:1298,y1:1470,t:'الخبز السفلي',s:'القاعدة اللي بتشيل كل الأسرار وما بتسيبش حاجة تقع.'}];
const stage=$('#stage');
if(stage){
  const N=LAYERS.length,TOP=40,TOTAL=1430,BOT=1470,F=.8,build=$('#build');
  const els=LAYERS.map((l,i)=>{const d=document.createElement('div');d.className='lay';d.dataset.k=l.k;
    d.style.cssText=`top:${(l.y0-TOP)/TOTAL*100}%;height:${(l.y1-l.y0)/TOTAL*100}%;z-index:${N-i}`;
    d.innerHTML=`<img src="${IMG}layer-${l.k}.webp" alt="${esc(l.t)}" width="676" height="${l.y1-l.y0}">`+
      (l.k.startsWith('patty')?'<i class="steam"></i><i class="steam s2"></i><i class="steam s3"></i>':'')+(l.k==='bun'?'<i class="spark"></i><i class="spark s2"></i><i class="spark s3"></i>':'');
    stage.appendChild(d);return d;});
  const dots=$('#sDots');dots.innerHTML=LAYERS.map((l,i)=>`<button data-i="${i}" aria-label="${esc(l.t)}"></button>`).join('');
  const card=$('#secret');let shown=null;
  function setText(key,num,t,s,fin){
    if(shown===key)return;shown=key;
    $('#sNum').textContent=num;$('#sTitle').textContent=t;$('#sText').textContent=s;$('#sCta').hidden=!fin;
    $$('button',dots).forEach((b,i)=>b.classList.toggle('cur',String(i)===String(key)));
    card.classList.remove('swap');void card.offsetWidth;card.classList.add('swap');
  }
  function update(p){
    const H=stage.clientHeight/TOTAL,u=Math.max(0,Math.min(1,(p-.8)/.2)),ue=u*u*(3-2*u);let top=-1;
    els.forEach((el,i)=>{const k=N-1-i,t=Math.max(0,Math.min(1,(p-k*.16)/.16)),e=1-Math.pow(1-t,3);
      const shift=ue*(1-F)*(BOT-LAYERS[i].y0)*H;
      el.style.opacity=e;el.style.transform=`translateY(${(-(1-e)*TOTAL*.5*H+shift).toFixed(1)}px) rotate(${((1-e)*(i%2?-8:8)).toFixed(1)}deg) scale(${(.85+.15*e).toFixed(3)})`;
      if(t>0)top=Math.max(top,k);});
    const fin=p>=.92;$('.build-pin').classList.toggle('fin',fin);
    els.forEach((el,i)=>el.classList.toggle('on',fin||(top>=0&&i===N-1-top)));
    if(fin)setText('fin','✓','والبرجر جاهز!','كده كل أسراره اتكشفت. جاهز تجرّبه؟',true);
    else{const i=top<0?N-1:N-1-top;setText(i,`${top<0?1:top+1} / ${N}`,LAYERS[i].t,LAYERS[i].s,false);}
    $('#hint').style.opacity=fin?0:.85;
  }
  if(reduce){build.classList.add('static');update(.85);$('.build-pin').classList.add('fin');
    dots.onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=+b.dataset.i;shown=null;setText(i,`${N-i} / ${N}`,LAYERS[i].t,LAYERS[i].s,false);};}
  else{
    let tick=false;const calc=()=>{const r=build.getBoundingClientRect(),max=build.offsetHeight-innerHeight+72;update(Math.max(0,Math.min(1,-(r.top-72)/max)));tick=false;};
    const req=()=>{if(!tick){tick=true;requestAnimationFrame(calc);}};
    addEventListener('scroll',req,{passive:true});addEventListener('resize',req);calc();
    dots.onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=N-1-+b.dataset.i,max=build.offsetHeight-innerHeight+72;
      scrollTo({top:build.offsetTop-72+(k*.16+.12)*max,behavior:'smooth'});};
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

/* ---------- صوت المياه (يعمل بعد ضغطة من الزائر) ----------
   لو حطيت ملف assets/audio/underwater.mp3 هيتشغّل هو، وإلا بنولّد صوت مياه وفقاعات بالمتصفح. */
window.Snd=(()=>{
  let ctx,g,lp,el,timer,on=false,synthOn=false;const AC=window.AudioContext||window.webkitAudioContext;
  function bub(){if(!on||!ctx)return;const o=ctx.createOscillator(),e=ctx.createGain(),t=ctx.currentTime,f=380+Math.random()*700;
    o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*2.1,t+.09);
    e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.18,t+.01);e.gain.exponentialRampToValueAtTime(.0001,t+.14);
    o.connect(e);e.connect(g);o.start(t);o.stop(t+.16);timer=setTimeout(bub,250+Math.random()*1400);}
  function synth(){if(!AC||synthOn)return;synthOn=true;ctx=new AC();g=ctx.createGain();g.gain.value=0;g.connect(ctx.destination);
    const len=ctx.sampleRate*4,buf=ctx.createBuffer(2,len,ctx.sampleRate);
    for(let c=0;c<2;c++){const d=buf.getChannelData(c);let l=0;for(let i=0;i<len;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5;}}
    const n=ctx.createBufferSource();n.buffer=buf;n.loop=true;lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.Q.value=.8;
    const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.12;lg.gain.value=140;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
    n.connect(lp);lp.connect(g);n.start();g.gain.setTargetAtTime(.55,ctx.currentTime,.8);bub();}
  function set(v){on=!!v;document.querySelectorAll('[data-sound]').forEach(b=>b.setAttribute('aria-pressed',on));
    if(on){if(el&&!el.error){el.play().catch(()=>{});return;}
      if(ctx){ctx.resume();g.gain.setTargetAtTime(.55,ctx.currentTime,.4);clearTimeout(timer);bub();return;}
      if(!el){el=new Audio('assets/audio/underwater.mp3');el.loop=true;el.volume=.6;el.addEventListener('error',()=>{el=null;on&&synth();},{once:true});}
      el.play().catch(()=>{if(on&&(!el||el.error))synth();});}
    else{el&&el.pause();if(ctx){g.gain.setTargetAtTime(0,ctx.currentTime,.3);clearTimeout(timer);}}}
  function depth(p){if(lp)lp.frequency.setTargetAtTime(560-p*340,ctx.currentTime,.3);}
  document.addEventListener('click',e=>{if(e.target.closest('[data-sound]'))set(!on);});
  return{set,depth};})();
