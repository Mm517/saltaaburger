'use strict';
/* ===== قصة سلطع برجر: 240 فريم بتتحرك مع الاسكرول (GSAP ScrollTrigger) =====
   - الفريمات في /frames-1 … /frames-5 (كل فولدر 48 فريم، من f001 إلى f240)
   - لتعديل المشاهد (العنوان/الكلام/رقم الفريم اللي يبدأ منه) عدّل المصفوفة CH تحت
   - طول التمرير: ارتفاع .sq في css/story.css (1100svh) — زوّده لحركة أبطأ وانقصه لأسرع */
(()=>{
const $=(s,r=document)=>r.querySelector(s);
const N=240,SRC=i=>`/frames-${Math.floor(i/48)+1}/f${String(i+1).padStart(3,'0')}.webp`;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=(navigator.hardwareConcurrency||4)>4;

/* f = رقم الفريم اللي المشهد يبدأ منه (من 0) */
const CH=[
 {f:0,  t:'غطّس معانا',s:'اسكرول لتحت وهتقابل شخصيات سلطع برجر في قاع الهامور.'},
 {f:22, t:'سلطع برجر',s:'ده مطعمنا! أشهر برجر في الأعماق. اتفضل جوه.'},
 {f:42, t:'من جوه',s:'ترابيزات وشباك على البحر، والكل قاعد بيستمتع بالبرجر.'},
 {f:64, t:'على الشواية',s:'كل برجر بيتعمل لحظة طلبك: لحمة طازجة ومشوية صح.'},
 {f:100,t:'شمشون عينه على الوصفة',s:'بص هناك! شمشون خد ورقة الوصفة السرية وجري.'},
 {f:136,t:'مسكناه!',s:'سبونج مسك شمشون بالشبكة والوصفة رجعت مكانها. سرها لسه محفوظ.'},
 {f:168,t:'الطعم اللي ما يتنسيش',s:'جبنة دايبة، لحمة مشوية، وصوص السر… كل قضمة حكاية.'},
 {f:212,t:'جاهز تدوق السر؟',s:'اطلب برجرك دلوقتي واحنا نجهّزه لك طازج.',cta:1}
];

const sq=$('#sq'),stage=$('#sqStage'),cv=$('#sqCv'),ctx=cv.getContext('2d',{alpha:false});
const capEl=$('#sqCap'),nEl=$('#sqN'),tEl=$('#sqT'),pEl=$('#sqP'),ctaEl=$('#sqCta');
const btnUp=$('#sqUp'),btnDn=$('#sqDn'),hint=$('#sqHint'),topBtn=$('#sqTop'),bar=$('#sqBar'),dots=$('#sqDots');
const navh=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navh'))||72;

/* ---------- تحميل الفريمات ---------- */
const imgs=new Array(N),ok=new Array(N).fill(false);
let loadedN=0;const FIRST=36;
const gTxt=$('#goTxt'),gBar=$('#gLoad'),goBtn=$('#goStart');
let ready=false;
function onLoaded(){
  loadedN++;
  if(!ready){const p=Math.min(1,loadedN/FIRST);
    if(gBar)gBar.style.transform=`scaleX(${p})`;
    if(gTxt)gTxt.textContent=p<1?`جاري التحميل ${Math.round(p*100)}%`:'ابدأ الغوص';
    if(p>=1){ready=true;if(goBtn)goBtn.disabled=false;}}
  if(loadedN===FIRST){last='';render();}
}
function load(i){return new Promise(res=>{
  const im=new Image();im.decoding='async';
  im.onload=()=>{ok[i]=true;imgs[i]=im;onLoaded();res();};
  im.onerror=()=>{onLoaded();res();};
  im.src=SRC(i);});}
(async()=>{
  const order=[];for(let i=0;i<N;i++)order.push(i);
  let k=0;const worker=async()=>{while(k<order.length){const i=order[k++];await load(i);}};
  await Promise.all(Array.from({length:fine?8:5},worker));
})();

/* نافذة صور مفكوكة (ImageBitmap) حوالين الفريم الحالي عشان الرسم يبقى سلس وذاكرة الموبايل ما تتحملش 240 صورة مفكوكة */
const bm=new Map(),pending=new Set(),canBM=typeof createImageBitmap==='function';
function windowBM(c){
  if(!canBM)return;
  const lo=Math.max(0,c-10),hi=Math.min(N-1,c+16);
  for(let i=lo;i<=hi;i++){if(ok[i]&&!bm.has(i)&&!pending.has(i)){pending.add(i);
    createImageBitmap(imgs[i]).then(b=>{pending.delete(i);
      if(i<c-14||i>c+20){b.close();return;}bm.set(i,b);}).catch(()=>pending.delete(i));}}
  bm.forEach((b,i)=>{if(i<c-14||i>c+20){bm.delete(i);b.close();}});
}
function pick(i){
  if(bm.has(i))return bm.get(i);
  if(ok[i])return imgs[i];
  for(let d=1;d<N;d++){const a=i-d,b=i+d;if(a>=0&&ok[a])return imgs[a];if(b<N&&ok[b])return imgs[b];}
  return null;
}

/* ---------- الرسم (cover) مع مزج بين فريمين عشان الحركة تبقى ناعمة ---------- */
const state={f:0};let last='',cw=0,ch=0;
function size(){
  const dpr=Math.min(devicePixelRatio||1,2),w=stage.clientWidth,h=stage.clientHeight;
  const sc=Math.min(1,1600/(w*dpr));
  cw=Math.round(w*dpr*sc);ch=Math.round(h*dpr*sc);
  if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch;last='';}
}
function cover(im){
  const iw=im.width,ih=im.height,s=Math.max(cw/iw,ch/ih),w=iw*s,h=ih*s;
  ctx.drawImage(im,(cw-w)/2,(ch-h)/2,w,h);
}
function render(){
  const f=Math.max(0,Math.min(N-1,state.f));
  let i=Math.floor(f),a=f-i;if(i>=N-1){i=N-1;a=0;}
  const key=i+':'+Math.round(a*40)+':'+cw;
  if(key!==last){
    const A=pick(i);
    if(A){last=key;cover(A);
      if(a>.025){const B=pick(i+1);if(B&&B!==A){ctx.globalAlpha=a;cover(B);ctx.globalAlpha=1;}}}
  }
  windowBM(i);
  chapterFor(f);
}

/* ---------- الكابشن: عنوان كلمة كلمة + تنقل بين المشاهد ---------- */
const words=t=>t.split(' ').map(w=>`<span class="w">${w}</span>`).join(' ');
let cur=-1,tl=null;
function fill(c,i){
  nEl.textContent=`${(i+1).toLocaleString('ar-EG')} / ${CH.length.toLocaleString('ar-EG')}`;
  tEl.innerHTML=words(c.t);pEl.textContent=c.s;
}
function setChapter(i,instant){
  if(i===cur)return;const dir=i>cur?1:-1,first=cur<0;cur=i;const c=CH[i];
  dots.querySelectorAll('button').forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-current',k===i?'true':'false');});
  btnUp.disabled=i===0;btnDn.disabled=i===CH.length-1;
  topBtn.style.display=i===CH.length-1?'inline-flex':'none';capEl.classList.toggle('end',!!c.cta);
  if(tl)tl.kill();
  if(reduce||instant||first){fill(c,i);gsap.set([nEl,tEl,pEl],{clearProps:'all'});gsap.set(ctaEl,{autoAlpha:c.cta?1:0,y:0});return;}
  tl=gsap.timeline();
  tl.to([nEl,tEl,pEl,ctaEl],{autoAlpha:0,y:-14*dir,duration:.18,ease:'power1.in',stagger:.02})
    .add(()=>{fill(c,i);})
    .set([nEl,pEl,ctaEl],{y:18*dir})
    .add(()=>{
      gsap.set(tEl,{autoAlpha:1,y:0});
      gsap.fromTo(tEl.querySelectorAll('.w'),{autoAlpha:0,y:34*dir,scale:.8,filter:'blur(8px)'},{autoAlpha:1,y:0,scale:1,filter:'blur(0px)',duration:.7,ease:'back.out(1.6)',stagger:.12,clearProps:'filter'});
    })
    .to(nEl,{autoAlpha:1,y:0,duration:.35,ease:'power2.out'},'>')
    .to(pEl,{autoAlpha:1,y:0,duration:.5,ease:'power2.out'},'<.15')
    .to(ctaEl,{autoAlpha:c.cta?1:0,y:0,duration:.5,ease:'back.out(1.7)'},'<.1');
}
function chapterFor(f){let k=0;for(let i=0;i<CH.length;i++)if(f>=CH[i].f-1)k=i;setChapter(k);}

/* ---------- ScrollTrigger ---------- */
gsap.registerPlugin(ScrollTrigger,ScrollToPlugin);
CH.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`مشهد ${i+1}: ${c.t}`);b.addEventListener('click',()=>goTo(i));dots.appendChild(b);});
size();setChapter(0,true);

const tween=gsap.to(state,{f:N-1,ease:'none',onUpdate:render,
  scrollTrigger:{trigger:sq,start:()=>`top ${navh()}px`,end:()=>`+=${sq.offsetHeight-stage.offsetHeight}`,
    scrub:reduce?true:1,invalidateOnRefresh:true,
    onUpdate:self=>{
      bar.style.transform=`scaleX(${self.progress})`;
      const hide=self.progress>.012;
      if(hide!==hintHidden){hintHidden=hide;gsap.to(hint,{autoAlpha:hide?0:1,duration:.4,overwrite:true});}
      pulse(self.direction);
    }}});
let hintHidden=false,pt=0;
const st=tween.scrollTrigger;

/* الأسهم بتنوّر لما تقلّب في اتجاهها */
function pulse(d){
  const b=d>0?btnDn:btnUp,o=d>0?btnUp:btnDn;o.classList.remove('go');
  if(b.disabled)return;b.classList.add('go');clearTimeout(pt);pt=setTimeout(()=>{btnUp.classList.remove('go');btnDn.classList.remove('go');},450);
}
function target(k){const c=CH[Math.max(0,Math.min(CH.length-1,k))];return st.start+(c.f/(N-1))*(st.end-st.start)+(k>0?1:0);}
function goTo(k){
  k=Math.max(0,Math.min(CH.length-1,k));
  const y=target(k);
  if(reduce){scrollTo(0,y);return;}
  gsap.to(window,{scrollTo:{y,autoKill:true},duration:Math.min(2.4,.9+Math.abs(k-cur)*.3),ease:'power2.inOut',overwrite:true});
}
btnDn.addEventListener('click',()=>goTo(cur+1));
btnUp.addEventListener('click',()=>goTo(cur-1));
topBtn.addEventListener('click',()=>goTo(0));
/* من الكيبورد: أسهم يمين/يسار ← → بتنقل بين المشاهد */
addEventListener('keydown',e=>{
  if(document.body.classList.contains('lock')||e.target.closest('input,textarea,select,dialog,button,a'))return;
  if(e.key==='ArrowLeft'){e.preventDefault();goTo(cur+1);}
  else if(e.key==='ArrowRight'){e.preventDefault();goTo(cur-1);}
});

let rz=0;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{size();last='';render();},120);});
addEventListener('load',()=>ScrollTrigger.refresh());

/* ---------- بوابة الدخول ---------- */
const gate=$('#gate');
if(gate){document.body.classList.add('lock');
  const w=document.createElement('div');w.className='water';gate.appendChild(w);
  if(!reduce){const b=document.createElement('div');b.className='bubbles gb';b.setAttribute('aria-hidden','true');
    for(let i=0;i<10;i++){const e=document.createElement('i'),s=8+Math.random()*18;e.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-duration:${8+Math.random()*6}s;animation-delay:-${Math.random()*10}s`;b.appendChild(e);}
    gate.prepend(b);}
  const go=()=>{if(gate.classList.contains('diving')||!ready)return;scrollTo(0,0);gate.classList.add('diving');
    setTimeout(()=>{gate.classList.add('off');document.body.classList.remove('lock');ScrollTrigger.refresh();render();},reduce?0:950);};
  goBtn.onclick=go;}
render();
})();
