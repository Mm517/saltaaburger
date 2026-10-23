'use strict';
/* ===== شاشة الكاشير (POS) ===== */
let tab='pos',cat='burger',q='',ty='dine',lines=[],ifilter='live',started=false;
const CAT_IC=Object.fromEntries(CATS.map(c=>[c.id,c.icon]));
$('#out').onclick=logoutStaff;
function drawTabs(){
  const n=KK.orders().filter(o=>o.status==='new').length;
  $('#tabs').innerHTML=`<button role="tab" data-t="pos" aria-selected="${tab==='pos'}">${ic('calculator')}نقطة البيع</button><button role="tab" data-t="inc" aria-selected="${tab==='inc'}">${ic('bell')}الطلبات الواردة${n?`<b>${n}</b>`:''}</button>`;
  $('#posV').hidden=tab!=='pos';$('#incV').hidden=tab!=='inc';
}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b){tab=b.dataset.t;drawTabs();if(tab==='inc')renderInc();}});

/* ---------- المنيو ---------- */
function drawCats(){$('#pcats').innerHTML=CATS.map(c=>`<button data-c="${c.id}" aria-pressed="${!q&&c.id===cat}">${ic(c.icon)}${c.name}</button>`).join('');}
function drawGrid(){
  const L=PRODUCTS.filter(p=>!p.off&&(q?(p.name+p.desc).includes(q):p.cat===cat));
  $('#pgrid').innerHTML=L.length?L.map(p=>`<button class="pos-p" data-p="${esc(p.id)}"><span class="th">${p.img?`<img src="${IMG+esc(p.img)}" alt="" loading="lazy">`:ic(p.icon||CAT_IC[p.cat]||'utensils')}</span><b>${esc(p.name)}</b><span>${p.price} جنيه</span></button>`).join(''):'<p class="empty-s">مفيش نتائج</p>';
}
$('#pcats').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b){cat=b.dataset.c;q='';$('#pq').value='';drawCats();drawGrid();}});
$('#pq').addEventListener('input',e=>{q=e.target.value.trim();drawCats();drawGrid();});
$('#pgrid').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;const p=PRODUCTS.find(x=>x.id===b.dataset.p);
  const ex=lines.find(l=>l.id===p.id&&!l.ex.size);ex?ex.qty++:lines.push({id:p.id,name:p.name,base:p.price,ex:new Set(),qty:1,canEx:!!p.extras});drawTicket();});

/* ---------- الفاتورة ---------- */
const unit=l=>l.base+EXTRAS.filter(e=>l.ex.has(e.id)).reduce((s,e)=>s+e.price,0);
const subTotal=()=>lines.reduce((s,l)=>s+unit(l)*l.qty,0);
const num=id=>Math.max(0,+$(id).value||0);
const grand=()=>Math.max(0,subTotal()-num('#cd')+(ty==='delivery'?num('#cf'):0));
function drawTicket(){
  $('#tkl').innerHTML=lines.length?lines.map((l,i)=>`<div class="tk-i" data-i="${i}"><b>${esc(l.name)}</b><span>${money(unit(l)*l.qty)}</span>
    ${l.canEx?`<div class="ex-row">${EXTRAS.map(e=>`<button type="button" class="xchip ${l.ex.has(e.id)?'on':''}" data-x="${e.id}">${esc(e.name)} +${e.price}</button>`).join('')}</div>`:''}
    <div class="qty"><button type="button" data-d="-1" aria-label="تقليل">${ic('minus')}</button><b>${l.qty}</b><button type="button" data-d="1" aria-label="زيادة">${ic('plus')}</button></div><button class="sm-btn red" type="button" data-rm style="justify-self:end">${ic('trash-2')}</button></div>`).join(''):'<p class="empty-s">اضغط على وجبة لإضافتها</p>';
  totals();
}
function totals(){
  const s=subTotal(),g=grand(),r=num('#cr');
  $('#sub').textContent=s;$('#tot').textContent=money(g);
  const c=$('#chg');if(r){c.textContent=r>=g?(r-g):'ناقص '+(g-r);c.classList.toggle('low',r<g);}else{c.textContent='0';c.classList.remove('low');}
  $('#pay').disabled=!lines.length||(ty==='delivery'&&$('#ca').value.trim().length<6);
}
$('#tkl').addEventListener('click',e=>{
  const row=e.target.closest('[data-i]');if(!row)return;const l=lines[+row.dataset.i];
  const x=e.target.closest('[data-x]'),d=e.target.closest('[data-d]');
  if(x){l.ex.has(x.dataset.x)?l.ex.delete(x.dataset.x):l.ex.add(x.dataset.x);}
  if(d){l.qty+=+d.dataset.d;if(l.qty<1)lines.splice(+row.dataset.i,1);}
  if(e.target.closest('[data-rm]'))lines.splice(+row.dataset.i,1);
  drawTicket();
});
$('#types').addEventListener('click',e=>{const b=e.target.closest('[data-ty]');if(!b)return;ty=b.dataset.ty;$$('#types button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#ca').hidden=$('#cf').hidden=ty!=='delivery';totals();});
['#cd','#cf','#cr','#ca'].forEach(s=>$(s).addEventListener('input',totals));
$('#clr').onclick=()=>{if(lines.length&&confirm('مسح الفاتورة؟')){lines=[];['#cn','#cp','#ca','#cd','#cf','#cr'].forEach(s=>$(s).value='');drawTicket();}};
$('#pay').onclick=async()=>{
  if(!lines.length)return;
  const total=grand(),paid=num('#cr'),disc=num('#cd'),fee=ty==='delivery'?num('#cf'):0;
  if(paid&&paid<total&&!confirm('المبلغ المستلم أقل من الإجمالي. تكمل؟'))return;
  const btn=$('#pay');btn.disabled=true;
  const items=lines.map(l=>({key:l.id+'|'+[...l.ex].sort().join(','),name:l.name,price:unit(l),extras:EXTRAS.filter(e=>l.ex.has(e.id)).map(e=>e.name),qty:l.qty}));
  const r=await KK.placeOrder({type:ty,name:$('#cn').value.trim(),phone:$('#cp').value.trim(),address:ty==='delivery'?$('#ca').value.trim():'',notes:'',method:TYPES[ty],disc,fee,paid,items:lines.map(l=>({id:l.id,qty:l.qty,extras:[...l.ex]}))});
  if(r.err){toast(r.err,true);totals();return;}
  const o={id:r.ok.id,ts:Date.now(),items,total:+r.ok.total,disc,fee,paid,type:ty,name:$('#cn').value.trim(),phone:$('#cp').value.trim(),address:ty==='delivery'?$('#ca').value.trim():''};
  toast('اتسجّل الطلب #'+o.id);
  if($('#doPrint').checked)printReceipt(o);
  lines=[];['#cn','#cp','#ca','#cd','#cf','#cr'].forEach(s=>$(s).value='');drawTicket();
};

/* ---------- الطلبات الواردة ---------- */
function renderInc(){
  const all=KK.orders(),F={live:['new','preparing','ready'],done:['done','cancelled']}[ifilter];
  const L=all.filter(o=>F.includes(o.status));
  $('#ifl').innerHTML=[['live','شغّالة'],['done','المنتهية']].map(([k,l])=>`<button class="chip" data-f="${k}" aria-pressed="${ifilter===k}">${l}</button>`).join('');
  $('#igrid').innerHTML=L.length?L.slice(0,60).map(orderCard).join(''):'<p class="empty-s">مفيش طلبات</p>';
}
$('#ifl').addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(b){ifilter=b.dataset.f;renderInc();}});
bindOrderActions($('#incV'));

function start(r){
  if(started)return;started=true;
  if(r==='admin')$('#toAdmin').hidden=false;
  let known=new Set(),loaded=false;
  drawTabs();drawCats();drawGrid();drawTicket();
  KK.on(k=>{
    if(k==='krusty_orders_all'){if(!loaded){known=new Set(KK.orders().map(o=>o.id));drawTabs();if(tab==='inc')renderInc();return;}const fresh=KK.orders().filter(o=>!known.has(o.id)&&o.src!=='cashier');known=new Set(KK.orders().map(o=>o.id));
      if(fresh.length){beep();toast('طلب جديد من الموقع #'+fresh[0].id+' 🍔');}drawTabs();if(tab==='inc')renderInc();}
    if(k==='krusty_menu'){drawGrid();drawTicket();}
  });
  KK.loadOrders().then(()=>{loaded=true;});
  KK.liveOrders();
  setInterval(()=>{if(!document.hidden)KK.loadMenu();},60000);
}
gate('cashier',start);
