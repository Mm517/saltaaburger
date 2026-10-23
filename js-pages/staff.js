'use strict';
/* ===== أدوات مشتركة لصفحتي الأدمن والكاشير ===== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic=n=>`<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const money=n=>`${Math.round(n*100)/100} جنيه`;
const fmt=t=>{try{return new Date(t).toLocaleString('ar-EG',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}catch{return''}};
const dayKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const TYPES={pickup:'استلام من المحل',delivery:'توصيل',dine:'في المحل',take:'تيك أواي'};
const toastEl=document.createElement('div');toastEl.className='toast';document.body.appendChild(toastEl);
let tT;function toast(m,err){toastEl.textContent=m;toastEl.classList.toggle('err',!!err);toastEl.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>toastEl.classList.remove('on'),2400);}
function beep(){try{const a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(.25,a.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.5);o.start();o.stop(a.currentTime+.5);setTimeout(()=>{o.frequency.value=1175;},0);}catch{}}

/* ---------- بوابة الدخول (Supabase Auth + جدول staff) ----------
   role: 'admin' | 'cashier' — الأدمن يقدر يدخل الكاشير كمان */
async function gate(role,onOk){
  const g=$('#gate'),box=$('#gBox');
  g.hidden=false;box.innerHTML='<p class="sub">ثواني...</p>';
  await KK.ready;
  const label=role==='admin'?'الإدارة':'الكاشير';
  let mode='login';
  const pass=()=>{const r=KK.staffRole();if(r==='admin'||r===role){g.hidden=true;onOk(r);return true;}return false;};
  const back=`<a class="auth-back" href="/">${ic('arrow-left')}الرجوع للموقع</a>`;
  const out=`<button class="btn ghost-d block" type="button" id="gOut">${ic('log-out')}خروج / تبديل الحساب</button>`;
  const err=m=>{const e=$('#gErr');if(e){e.hidden=!m;e.textContent=m||'';}};
  function draw(){
    const u=KK.staffUser();
    if(!u){
      const su=mode==='signup';
      box.innerHTML=`<h1 class="h3d">${su?'حساب موظف جديد':'دخول '+label}</h1>
        <p class="sub">${su?'اعمل حساب بإيميلك، وبعدها الأدمن يوافق عليك.':'ادخل بإيميل وباسورد حساب الموظف.'}</p>
        <div class="auth-err" id="gErr" hidden></div>
        <form id="gForm" novalidate><label class="afld">الإيميل<input name="e" type="email" dir="ltr" style="text-align:right" autocomplete="username" autofocus></label>
        <label class="afld">الباسورد<input name="p" type="password" autocomplete="${su?'new-password':'current-password'}"></label>
        <button class="btn yellow block" type="submit">${ic('lock')}${su?'إنشاء حساب':'دخول'}</button></form>
        <button class="btn ghost-d block" type="button" id="gMode">${su?'عندي حساب. سجّل دخول':'موظف جديد؟ اعمل حساب'}</button>${back}`;
      $('#gMode').onclick=()=>{mode=su?'login':'signup';draw();};
      $('#gForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,b=f.querySelector('button[type=submit]');b.disabled=true;
        const r=su?await KK.staffSignup(f.e.value,f.p.value):await KK.staffLogin(f.e.value,f.p.value);b.disabled=false;
        if(r.err){err(r.err);return;}if(!pass())draw();});
      return;
    }
    const r=KK.staffRole();
    let body;
    if(r&&r!=='admin'&&role==='admin'){body=`<h1 class="h3d">مالكش صلاحية هنا</h1><p class="sub">حسابك (${esc(u.email||'')}) كاشير. لوحة الإدارة للأدمن بس.</p><a class="btn yellow block" href="/cashier">افتح الكاشير</a>${out}`;}
    else if(KK.staffPending()){body=`<h1 class="h3d">مستني الموافقة</h1><p class="sub">طلبك وصل (${esc(u.email||'')}). أول ما الأدمن يوافق عليك هتقدر تدخل.</p><button class="btn yellow block" type="button" id="gRef">${ic('refresh')}حدّث</button>${out}`;}
    else{body=`<h1 class="h3d">${esc(u.email||'حسابك')}</h1><p class="sub">الحساب ده لسه معندوش صلاحية ${label}. اطلب صلاحية كاشير وهيوافق عليك الأدمن، أو لو إنت صاحب المطعم وأول مرة تفتح اللوحة فعّل نفسك أدمن.</p>
      <div class="auth-err" id="gErr" hidden></div>
      <button class="btn yellow block" type="button" id="gReq">${ic('bell')}اطلب صلاحية كاشير</button>
      <button class="btn ghost-d block" type="button" id="gClaim">${ic('shield')}أنا صاحب المطعم (أول أدمن)</button>${out}`;}
    box.innerHTML=body+back;
    $('#gOut').onclick=async()=>{await KK.staffLogout();mode='login';draw();};
    const ref=$('#gRef');if(ref)ref.onclick=()=>location.reload();
    const rq=$('#gReq');if(rq)rq.onclick=async()=>{const x=await KK.requestStaff();x.err?err(x.err):draw();};
    const cl=$('#gClaim');if(cl)cl.onclick=async()=>{const x=await KK.claimAdmin();if(x.err){err(x.err);return;}if(!pass())draw();};
  }
  if(pass())return;
  draw();
}
async function logoutStaff(){await KK.staffLogout();location.reload();}

/* ---------- كارت الطلب (مشترك) ---------- */
const FLOW={new:{next:'preparing',lbl:'قبول وتحضير',cls:'go',icon:'flame'},preparing:{next:'ready',lbl:'جاهز',cls:'ok',icon:'check'},ready:{next:'done',lbl:'اتسلّم',cls:'ok',icon:'check'}};
function orderCard(o){
  const f=FLOW[o.status],live=o.status==='new'||o.status==='preparing'||o.status==='ready';
  const t=TYPES[o.type]||o.method||'';
  const wa=o.phone?`https://wa.me/2${KK.normPhone(o.phone).replace(/^2/,'')}?text=${encodeURIComponent('طلبك #'+o.id+' من سلطع برجر '+(o.status==='ready'?'جاهز 🍔':KK.ST[o.status]))}`:'';
  return `<article class="o-card ${o.status==='new'?'new':''}" data-oid="${esc(o.id)}">
   <header><b>#${esc(o.id)}</b><span class="pill ${o.status}">${esc(KK.ST[o.status]||o.status)}</span><span class="pill src">${o.src==='cashier'?'كاشير':'موقع'}</span><small>${fmt(o.ts)}</small></header>
   <ul>${o.items.map(i=>`<li><span>${esc(i.name)} × ${i.qty}${i.extras&&i.extras.length?`<small>${esc(i.extras.join('، '))}</small>`:''}</span><span>${money(i.price*i.qty)}</span></li>`).join('')}</ul>
   <div class="o-meta">${t?`<span>${ic('receipt')} ${esc(t)}</span>`:''}${o.name?`<span>${ic('user')} ${esc(o.name)}${o.phone?' · <bdi dir="ltr">'+esc(o.phone)+'</bdi>':''}</span>`:''}${o.address?`<span>${ic('map-pin')} ${esc(o.address)}</span>`:''}${o.notes?`<span>${ic('pencil')} ${esc(o.notes)}</span>`:''}</div>
   <div class="o-tot"><span>الإجمالي${o.disc?' (بعد خصم '+o.disc+')':''}</span><span>${money(o.total)}</span></div>
   <div class="o-act">${f?`<button class="${f.cls}" data-st="${f.next}">${ic(f.icon)}${f.lbl}</button>`:''}${live?`<button class="no" data-st="cancelled">${ic('x')}إلغاء</button>`:''}<button class="pr" data-print>${ic('printer')}طباعة</button>${wa?`<a class="pr" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:.3rem;border-radius:12px;padding:.45rem .6rem;font:800 .88rem Cairo;flex:1;min-width:84px" href="${wa}" target="_blank" rel="noopener">${ic('whatsapp')}واتساب</a>`:''}</div></article>`;
}
function bindOrderActions(root){
  root.addEventListener('click',e=>{
    const c=e.target.closest('[data-oid]');if(!c)return;const id=c.dataset.oid;
    const st=e.target.closest('[data-st]');
    if(st){if(st.dataset.st==='cancelled'&&!confirm('تأكيد إلغاء الطلب #'+id+'؟'))return;KK.setStatus(id,st.dataset.st).then(r=>r&&r.err?toast('ماتحدّثش: '+r.err,true):toast(`طلب #${id}: ${KK.ST[st.dataset.st]}`));}
    if(e.target.closest('[data-print]')){const o=KK.getOrder(id);o&&printReceipt(o);}
  });
}

/* ---------- الإيصال ---------- */
function printReceipt(o){
  let r=$('#rcpt');if(!r){r=document.createElement('div');r.id='rcpt';document.body.appendChild(r);}
  r.innerHTML=`<h2>سلطع برجر</h2><div class="c">Krusty Krab · الصلاحات، بني عبيد</div><hr>
   <div class="r"><span>طلب #${esc(o.id)}</span><span>${fmt(o.ts)}</span></div>
   ${o.type?`<div>${esc(TYPES[o.type]||'')}</div>`:''}${o.name?`<div>${esc(o.name)} ${esc(o.phone||'')}</div>`:''}${o.address?`<div>${esc(o.address)}</div>`:''}<hr>
   ${o.items.map(i=>`<div class="r"><span>${esc(i.name)} × ${i.qty}</span><span>${i.price*i.qty}</span></div>${i.extras&&i.extras.length?`<div style="font-size:10px">+ ${esc(i.extras.join('، '))}</div>`:''}`).join('')}<hr>
   ${o.disc?`<div class="r"><span>خصم</span><span>-${o.disc}</span></div>`:''}${o.fee?`<div class="r"><span>توصيل</span><span>${o.fee}</span></div>`:''}
   <div class="r" style="font-size:15px"><span>الإجمالي</span><span>${o.total} جنيه</span></div>
   ${o.paid?`<div class="r"><span>المدفوع</span><span>${o.paid}</span></div><div class="r"><span>الباقي</span><span>${Math.max(0,o.paid-o.total)}</span></div>`:''}<hr><div class="c">شكرًا لزيارتك قاع الهامور 🍔</div>`;
  setTimeout(()=>window.print(),80);
}
