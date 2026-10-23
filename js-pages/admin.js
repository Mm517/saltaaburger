'use strict';
/* ===== لوحة الإدارة ===== */
const TABS=[['ov','chart','الأرقام'],['ord','receipt','الطلبات'],['menu','utensils','المنيو والأسعار'],['cus','users','العملاء'],['set','sliders','الإعدادات']];
let tab='ov',range='today',ofilter='live',oq='',started=false;
const IMGS=['cheese','chicken','double','hero-burger','offer','reef','story'].map(n=>n+'.webp');
const CAT_ICON={burger:'hamburger',combo:'utensils',fries:'fries',drinks:'cup-soda',sauces:'sauce'};

function drawTabs(){
  const n=KK.orders().filter(o=>o.status==='new').length;
  $('#tabs').innerHTML=TABS.map(([k,i,l])=>`<button role="tab" data-t="${k}" aria-selected="${k===tab}">${ic(i)}${l}${k==='ord'&&n?`<b>${n}</b>`:''}</button>`).join('');
  $$('[data-p]').forEach(p=>p.hidden=p.dataset.p!==tab);
}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;tab=b.dataset.t;drawTabs();render();});
$('#out').onclick=logoutStaff;

const inRange=o=>{if(range==='all')return true;const now=Date.now();return range==='today'?dayKey(o.ts)===dayKey(now):o.ts>=now-7*864e5;};
const valid=o=>o.status!=='cancelled';

/* ---------- 1) الأرقام ---------- */
function renderOv(){
  const all=KK.orders(),L=all.filter(inRange),V=L.filter(valid);
  const sales=V.reduce((s,o)=>s+o.total,0),cnt=V.length,avg=cnt?sales/cnt:0,pend=all.filter(o=>o.status==='new'||o.status==='preparing').length;
  const items={};V.forEach(o=>o.items.forEach(i=>items[i.name]=(items[i.name]||0)+i.qty));
  const top=Object.entries(items).sort((a,b)=>b[1]-a[1]).slice(0,6),mx=top[0]?top[0][1]:1;
  const days=[];for(let k=6;k>=0;k--){const d=new Date(Date.now()-k*864e5),key=dayKey(d),v=all.filter(o=>valid(o)&&dayKey(o.ts)===key).reduce((s,o)=>s+o.total,0);days.push([d.toLocaleDateString('ar-EG',{weekday:'short'}),v]);}
  const dm=Math.max(1,...days.map(d=>d[1])),web=V.filter(o=>o.src!=='cashier').length;
  $('[data-p=ov]').innerHTML=`
   <div class="tools-r">${[['today','النهارده'],['week','آخر 7 أيام'],['all','الكل']].map(([k,l])=>`<button class="chip" data-r="${k}" aria-pressed="${range===k}">${l}</button>`).join('')}</div>
   <div class="stat-g">
    <div class="stat y">${ic('banknote')}<small>إجمالي المبيعات</small><b>${money(sales)}</b></div>
    <div class="stat">${ic('receipt')}<small>عدد الطلبات</small><b>${cnt}</b></div>
    <div class="stat">${ic('chart')}<small>متوسط الطلب</small><b>${money(Math.round(avg))}</b></div>
    <div class="stat">${ic('flame')}<small>طلبات شغّالة دلوقتي</small><b>${pend}</b></div>
   </div>
   <div class="set-g">
    <div class="set-c"><h3>الأكثر مبيعًا</h3><div class="chart">${top.length?top.map(([n,q])=>`<div class="bar-r"><span>${esc(n)}</span><i style="width:${q/mx*100}%"></i><b>${q}</b></div>`).join(''):'<p class="empty-s">لسه مفيش طلبات في الفترة دي</p>'}</div></div>
    <div class="set-c"><h3>مبيعات آخر 7 أيام</h3><div class="chart">${days.map(([d,v])=>`<div class="bar-r"><span>${d}</span><i style="width:${v/dm*100}%"></i><b>${v}</b></div>`).join('')}</div></div>
    <div class="set-c"><h3>مصدر الطلبات</h3><div class="chart"><div class="bar-r"><span>الموقع</span><i style="width:${cnt?web/cnt*100:0}%"></i><b>${web}</b></div><div class="bar-r"><span>الكاشير</span><i style="width:${cnt?(cnt-web)/cnt*100:0}%"></i><b>${cnt-web}</b></div></div></div>
   </div>`;
}
$('[data-p=ov]').addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b){range=b.dataset.r;renderOv();}});

/* ---------- 2) الطلبات ---------- */
function renderOrd(){
  const all=KK.orders(),F={live:['new','preparing','ready'],done:['done'],cancelled:['cancelled'],all:null}[ofilter];
  let L=all.filter(o=>!F||F.includes(o.status));
  if(oq){const q=oq.toLowerCase();L=L.filter(o=>(o.id+(o.name||'')+(o.phone||'')).toLowerCase().includes(q));}
  const cnt=k=>k==='all'?all.length:all.filter(o=>({live:['new','preparing','ready'],done:['done'],cancelled:['cancelled']}[k]).includes(o.status)).length;
  $('[data-p=ord]').innerHTML=`<div class="tools-r">${[['live','شغّالة'],['done','اتسلّمت'],['cancelled','ملغية'],['all','الكل']].map(([k,l])=>`<button class="chip" data-f="${k}" aria-pressed="${ofilter===k}">${l} (${cnt(k)})</button>`).join('')}<input class="sinp" id="oq" type="search" placeholder="بحث برقم الطلب أو الاسم أو الموبايل" value="${esc(oq)}" style="flex:1;min-width:200px"></div>
   ${L.length?`<div class="ord-g">${L.map(orderCard).join('')}</div>`:'<p class="empty-s">مفيش طلبات هنا</p>'}`;
}
$('[data-p=ord]').addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(b){ofilter=b.dataset.f;renderOrd();}});
$('[data-p=ord]').addEventListener('input',e=>{if(e.target.id==='oq'){oq=e.target.value.trim();const pos=e.target.selectionStart;renderOrd();const i=$('#oq');i.focus();i.setSelectionRange(pos,pos);}});
bindOrderActions($('[data-p=ord]'));

/* ---------- 3) المنيو ---------- */
const CAT_NAME=Object.fromEntries(CATS.map(c=>[c.id,c.name]));CAT_NAME.offer='عرض';
function renderMenu(){
  const rows=[...KK.menuRows()].sort((x,y)=>x.sort-y.sort),cats=CATS;
  $('[data-p=menu]').innerHTML=`<div class="note">التعديلات هنا بتتحفظ فورًا في قاعدة البيانات وبتظهر على الموقع والكاشير. الوجبة المخفية مش بتظهر للزباين.</div>
   <div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>الاسم</th><th>التصنيف</th><th>السعر (جنيه)</th><th>إجراءات</th></tr></thead><tbody>
   ${rows.map(p=>`<tr class="${p.off?'off':''}" data-pid="${esc(p.id)}"><td><span class="thumb">${p.img?`<img src="${IMG+esc(p.img)}" alt="">`:ic(p.icon||'utensils')}</span></td>
    <td><input class="sinp" data-f="name" value="${esc(p.name)}" style="width:100%;min-width:130px"></td><td>${esc(CAT_NAME[p.cat]||'')}</td>
    <td><input type="number" min="1" step="1" data-f="price" value="${+p.price}"></td>
    <td><button class="sm-btn" data-act="toggle">${ic(p.off?'eye':'eye-off')}${p.off?'إظهار':'إخفاء'}</button> ${/^x/.test(p.id)?`<button class="sm-btn red" data-act="del">${ic('trash-2')}حذف</button>`:''}</td></tr>`).join('')}
   </tbody></table></div>
   <h2 class="h2s">${ic('plus')}إضافة وجبة جديدة</h2>
   <form class="frm" id="addP" novalidate>
    <label>الاسم<input name="name" required></label>
    <label>التصنيف<select name="cat">${cats.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></label>
    <label>السعر<input name="price" type="number" min="1" required></label>
    <label>الوصف<input name="desc"></label>
    <label>الصورة<select name="img"><option value="">بدون (أيقونة)</option>${IMGS.map(i=>`<option>${i}</option>`).join('')}</select></label>
    <label style="display:flex;align-items:center;gap:.5rem;grid-auto-flow:column;justify-content:start"><input type="checkbox" name="extras" checked style="width:auto"> تقبل إضافات</label>
    <button class="btn yellow" type="submit">${ic('plus')}إضافة</button></form>
   <h2 class="h2s">${ic('sparkles')}أسعار الإضافات</h2>
   <div class="frm" id="exP">${EXTRAS.map(e=>`<label>${esc(e.name)}<input type="number" min="0" data-ex="${e.id}" value="${e.price}"></label>`).join('')}</div>`;
}
const mp=$('[data-p=menu]');
const done=(r,okMsg)=>{if(r.err){toast('ماتحفظش: '+r.err,true);}else if(okMsg)toast(okMsg);renderMenu();};
mp.addEventListener('change',async e=>{
  const tr=e.target.closest('[data-pid]'),ex=e.target.dataset.ex;
  if(ex){done(await KK.extraSave(ex,Math.max(0,+e.target.value||0)),'اتحفظ سعر الإضافة');return;}
  if(!tr)return;const id=tr.dataset.pid,f=e.target.dataset.f;
  if(f==='price'){const v=+e.target.value;if(!(v>0)){toast('اكتب سعر صحيح',true);renderMenu();return;}done(await KK.menuSave(id,{price:v}),'اتحفظ السعر');}
  if(f==='name'){const v=e.target.value.trim();if(v.length<2){renderMenu();return;}done(await KK.menuSave(id,{name:v}),'اتحفظ الاسم');}
});
mp.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const id=b.closest('[data-pid]').dataset.pid;
  if(b.dataset.act==='toggle'){const p=KK.menuRows().find(x=>x.id===id);done(await KK.menuSave(id,{off:!p.off}));}
  if(b.dataset.act==='del'&&confirm('حذف الوجبة نهائيًا؟'))done(await KK.menuDel(id),'اتحذفت');
});
mp.addEventListener('submit',async e=>{
  if(e.target.id!=='addP')return;e.preventDefault();const f=e.target,name=f.name.value.trim(),price=+f.price.value;
  if(name.length<2||!(price>0)){toast('اكتب الاسم والسعر',true);return;}
  const cat=f.cat.value,row={cat,name,descr:f.desc.value.trim()||name,price,extras:f.extras.checked&&cat!=='sauces'};
  if(f.img.value)row.img=f.img.value;else row.icon=CAT_ICON[cat]||'utensils';
  done(await KK.menuAdd(row),'اتضافت الوجبة');
});

/* ---------- 4) العملاء ---------- */
function renderCus(){
  const us=KK.users(),os=KK.orders().filter(valid);
  const rows=us.map(u=>{const mine=os.filter(o=>o.uid===u.id||(o.phone&&KK.normPhone(o.phone)===u.phone));return{u,n:mine.length,sum:mine.reduce((s,o)=>s+o.total,0)};}).sort((a,b)=>b.sum-a.sum);
  const guests=os.filter(o=>!us.some(u=>u.id===o.uid||KK.normPhone(o.phone||'')===u.phone)&&o.src!=='cashier').length;
  $('[data-p=cus]').innerHTML=`<div class="stat-g"><div class="stat">${ic('users')}<small>حسابات مسجّلة</small><b>${us.length}</b></div><div class="stat">${ic('bag')}<small>طلبات من ضيوف</small><b>${guests}</b></div></div>
   ${rows.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الاسم</th><th>الموبايل</th><th>اتسجّل</th><th>الطلبات</th><th>إجمالي الإنفاق</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.u.name)}</td><td dir="ltr" style="text-align:right">${esc(r.u.phone)}</td><td>${fmt(r.u.ts)}</td><td>${r.n}</td><td>${money(r.sum)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty-s">لسه مفيش حد سجّل حساب</p>'}`;
}

/* ---------- 5) الإعدادات + الموظفين ---------- */
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
function renderSet(){
  const me=KK.staffUser(),st=KK.staffList();
  const rows=st.map(s=>{const self=me&&s.user_id===me.id;return `<tr data-su="${esc(s.user_id)}"><td dir="ltr" style="text-align:right">${esc(s.email||'—')}${self?' (انت)':''}</td>
    <td><select data-sf="role" ${self?'disabled':''}><option value="cashier" ${s.role==='cashier'?'selected':''}>كاشير</option><option value="admin" ${s.role==='admin'?'selected':''}>أدمن</option></select></td>
    <td>${s.approved?'<span class="pill ready">مفعّل</span>':'<span class="pill new">مستني موافقة</span>'}</td>
    <td>${self?'':`${s.approved?`<button class="sm-btn" data-sa="off">${ic('ban')}إيقاف</button>`:`<button class="sm-btn" data-sa="on">${ic('check')}موافقة</button>`} <button class="sm-btn red" data-sa="del">${ic('trash-2')}حذف</button>`}</td></tr>`;}).join('');
  $('[data-p=set]').innerHTML=`<div class="note">البيانات كلها على Supabase (أونلاين). الطلبات بتوصل لحظيًا لأي جهاز كاشير أو أدمن مفتوح.</div>
   <h2 class="h2s">${ic('users')}الموظفين</h2>
   ${st.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>الإيميل</th><th>الدور</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<p class="empty-s">لسه مفيش موظفين</p>'}
   <p class="sub" style="margin:.4rem 0 1rem">الموظف الجديد بيفتح صفحة الكاشير، يعمل حساب بإيميله، ويطلب صلاحية. بعدها توافق عليه من هنا.</p>
   <div class="set-g">
    <div class="set-c"><h3>حسابك</h3><p dir="ltr" style="text-align:right">${esc(me?me.email:'')}</p><div class="o-act"><button class="no" data-x="out">${ic('log-out')}خروج</button></div></div>
    <div class="set-c"><h3>تصدير</h3><p>نزّل الطلبات كملف Excel (CSV) أو نسخة كاملة JSON.</p><div class="o-act"><button class="go" data-x="csv">${ic('download')}CSV</button><button class="go" data-x="json">${ic('download')}نسخة احتياطية</button></div></div>
    <div class="set-c"><h3>منطقة الخطر</h3><p>مسح كل الطلبات نهائيًا من قاعدة البيانات.</p><div class="o-act"><button class="no" data-x="wipe">${ic('trash-2')}مسح الطلبات</button></div></div>
   </div>`;
}
$('[data-p=set]').addEventListener('change',async e=>{
  const tr=e.target.closest('[data-su]');if(!tr||e.target.dataset.sf!=='role')return;
  const r=await KK.staffUpdate(tr.dataset.su,{role:e.target.value});r.err?toast(r.err,true):toast('اتغيّر الدور');renderSet();
});
$('[data-p=set]').addEventListener('click',async e=>{
  const sa=e.target.closest('[data-sa]'),x=e.target.closest('[data-x]');
  if(sa){const id=sa.closest('[data-su]').dataset.su,k=sa.dataset.sa;
    if(k==='del'){if(!confirm('حذف الموظف ده؟'))return;const r=await KK.staffRemove(id);r.err?toast(r.err,true):toast('اتحذف');}
    else{const r=await KK.staffUpdate(id,{approved:k==='on'});r.err?toast(r.err,true):toast(k==='on'?'اتفعّل':'اتوقف');}
    renderSet();return;}
  if(!x)return;const k=x.dataset.x;
  if(k==='out')logoutStaff();
  if(k==='csv'){const rows=[['رقم','التاريخ','الحالة','المصدر','النوع','الاسم','الموبايل','العنوان','الأصناف','الإجمالي']];KK.orders().forEach(o=>rows.push([o.id,new Date(o.ts).toLocaleString('ar-EG'),KK.ST[o.status],o.src==='cashier'?'كاشير':'موقع',TYPES[o.type]||o.method||'',o.name||'',o.phone||'',o.address||'',o.items.map(i=>`${i.name}×${i.qty}`).join(' | '),o.total]));dl('orders.csv','\ufeff'+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'),'text/csv');}
  if(k==='json')dl('krusty-backup.json',JSON.stringify({orders:KK.orders(),menu:KK.menuRows(),users:KK.users(),staff:KK.staffList()}),'application/json');
  if(k==='wipe'&&confirm('مسح كل الطلبات نهائيًا؟ مفيش رجوع.')){const r=await KK.wipeOrders();r.err?toast(r.err,true):toast('اتمسحت الطلبات');}
});

function render(){({ov:renderOv,ord:renderOrd,menu:renderMenu,cus:renderCus,set:renderSet})[tab]();}
function start(){
  if(started)return;started=true;let known=new Set(),loaded=false;
  drawTabs();render();
  KK.on(k=>{
    if(k==='krusty_orders_all'){
      if(!loaded){known=new Set(KK.orders().map(o=>o.id));drawTabs();render();return;}
      const fresh=KK.orders().filter(o=>!known.has(o.id)&&o.src!=='cashier');known=new Set(KK.orders().map(o=>o.id));
      if(fresh.length){beep();toast('طلب جديد #'+fresh[0].id+' 🍔');}drawTabs();
      if(tab!=='menu'&&tab!=='set'&&!(document.activeElement&&document.activeElement.id==='oq'))render();}
    if(k==='krusty_users'&&tab==='cus')render();
    if(k==='krusty_staff'&&tab==='set')render();
  });
  Promise.all([KK.loadOrders(),KK.loadUsers(),KK.loadStaff()]).then(()=>{loaded=true;known=new Set(KK.orders().map(o=>o.id));render();});
  KK.liveOrders();
}
gate('admin',()=>start());
