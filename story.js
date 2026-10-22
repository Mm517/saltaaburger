'use strict';
/* ===== مشاهد القصة: عدّل الصور والشخصيات وكلامها من هنا (side: l يسار / r يمين) ===== */
(()=>{
const $=(s,r=document)=>r.querySelector(s),I='assets/images/',C='assets/characters/';
const S=[
 {k:'surface',t:'غطّس معانا',s:'اسكرول لتحت وهتقابل شخصيات سلطع برجر.'},
 {k:'bikini',img:'scene-bikini',o:[50,50],t:'أعماق بيكيني بوتوم',who:'squidward-cool.webp',side:'l',say:'أهلًا بيك في بيكيني بوتوم... أنا سكويدوارد. هنا في قاع البحر عايشين كلنا، وكلنا بنحب البرجر.'},
 {k:'outside',img:'scene-outside',o:[58,70],t:'سلطع برجر',who:'mr-krabs.webp',side:'r',say:'ده مطعمي أنا! أشهر برجر في الأعماق. اتفضل جوه.'},
 {k:'inside',img:'scene-inside',o:[50,50],t:'من جوه',who:'squidward-cool.webp',side:'l',say:'ترابيزات على شكل دفّة وشباك على البحر. اقعد وماتعملش دوشة.'},
 {k:'crowd',img:'scene-crowd',o:[50,50],t:'والزحمة على الكاشير',who:'patrick.webp',side:'r',say:'أنا واقف في الطابور من بدري! الريحة حلوة أوي مش قادر أستنى.'},
 {k:'kitchen',img:'scene-kitchen',o:[50,50],t:'المطبخ',who:'spongebob.webp',side:'l',say:'ده مطبخي! هنا بيتحضّر السر. بس اهدى وماتلمسش حاجة.'},
 {k:'grill',img:'scene-grill',o:[50,60],t:'على الشواية',who:'mr-krabs.webp',side:'r',say:'كل برجر بيتعمل لحظة طلبك: لحمة طازجة ومشوية صح. وبالمرة أحسب الفلوس!'},
 {k:'thief',img:'scene-thief',fit:1,t:'شمشون عينه على الوصفة',who:'squidward-cool.webp',side:'r',say:'بص هناك! شمشون خد زجاجة الوصفة وجري.'},
 {k:'secret',img:'scene-kitchen',t:'الوصفة السرية',who:'spongebob.webp',side:'c',say:'مسكت شمشون وملفّفه بالشريط! والوصفة السرية رجعت مكانها. سرها لسه محفوظ.'},
 {k:'final',img:'scene-burger',o:[50,55],t:'جاهز تدوق السر؟',who:'patrick.webp',side:'l',cta:1,say:'أنا طلبت ٣! اطلب برجرك دلوقتي واحنا نجهّزه لك طازج.'}];
const host=$('#scenes'),im=(f,c='bg',a='')=>`<img class="${c}" src="${f.includes('/')?f:I+f+'.webp'}" alt="${a}" loading="lazy">`;
const cta='<div class="row"><a class="btn yellow sm" href="meals.html">اطلب الآن</a><a class="btn wa sm" href="https://wa.me/201003465223" target="_blank" rel="noopener"><svg class="ic"><use href="#i-whatsapp"/></svg>واتساب</a></div>';
S.forEach(c=>{const d=document.createElement('section');d.className='sc sc-'+c.k+(c.k==='secret'?' sec':'');
 if(c.o)d.style.cssText=`--ox:${c.o[0]}%;--oy:${c.o[1]}%`;
 if(c.k==='surface'){d.innerHTML=`<div class="bubbles" aria-hidden="true"></div><h1 class="h3d white">${c.t}</h1><p>${c.s}</p><svg class="ic arrow" aria-hidden="true"><use href="#i-arrow-down"/></svg>`;}
 else{const who=`<div class="who ${c.side==='c'?'c':c.side}"><div class="say">${c.say}${c.cta?cta:''}</div><img src="${C+c.who}" alt=""></div>`;
  d.innerHTML=(c.fit?im(c.img,'bg blur')+im(c.img,'bg ct',c.t):im(c.img,'bg',c.t))
   +(c.k==='secret'?'<i class="spot"></i>'+im(I+'plankton-taped.webp','ch pl')+im(I+'recipe-book.webp','ch bk'):'')
   +`<h2 class="h3d tt">${c.t}</h2>`+who;}
 host.append(d);});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)x.target.classList.add('in');}),{threshold:.4});
document.querySelectorAll('.sc').forEach(s=>io.observe(s));
const gate=$('#gate');if(gate){document.body.classList.add('lock');
 const go=()=>{gate.classList.add('off');document.body.classList.remove('lock');};
 $('#goStart').onclick=go;}
})();
