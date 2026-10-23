
'use strict';
/* ===== المخزن المشترك — شغّال على Supabase =====
   - الزباين: Supabase Auth (الموبايل بيتحوّل لإيميل داخلي) + طلبات عن طريق دالة place_order
   - الموظفين (أدمن/كاشير): Supabase Auth بإيميل وباسورد + جدول staff بموافقة الأدمن
   - المنيو والأسعار: جدولي menu_items و menu_extras
   - الطلبات اللحظية للكاشير والأدمن: Realtime
   الواجهة (KK.*) فضلت بنفس الأسماء القديمة عشان باقي الكود يشتغل زي ما هو. */
const KK=(()=>{
  const CFG=window.KK_CFG||{},STAFF=!!window.KK_STAFF,LS=window.localStorage;
  const get=(k,d)=>{try{const v=JSON.parse(LS.getItem(k));return v==null?d:v;}catch{return d;}};
  const set=(k,v)=>{try{LS.setItem(k,JSON.stringify(v));}catch{}};
  const subs=new Set();
  const emit=t=>subs.forEach(f=>{try{f(t)}catch{}});
  const on=f=>{subs.add(f);return()=>subs.delete(f);};
  addEventListener('storage',e=>{if(e.key==='krusty_session')emit('krusty_session');});

  const sb=(window.supabase&&CFG.url)?window.supabase.createClient(CFG.url,CFG.key,{auth:{storageKey:STAFF?'kk-staff-auth':'kk-cust-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null;
  const NOSB={err:'مشكلة في الاتصال بالسيرفر. حدّث الصفحة وجرّب تاني.'};
  const normPhone=p=>String(p||'').replace(/[\s-]/g,'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const okPhone=p=>/^01[0125]\d{8}$/.test(normPhone(p));
  const num=v=>v==null?0:+v;
  const ST={new:'جديد',preparing:'بيتحضّر',ready:'جاهز',done:'اتسلّم',cancelled:'ملغي'};

  /* ---------- المنيو ---------- */
  let _rows=[];
  const rowToProduct=r=>{const p={id:r.id,cat:r.cat,name:r.name,desc:r.descr||'',price:num(r.price),extras:r.extras?1:0,off:!!r.off};if(r.img)p.img=r.img;if(r.icon)p.icon=r.icon;if(r.pop)p.pop=1;return p;};
  const menuSig=()=>JSON.stringify([typeof PRODUCTS!=='undefined'?PRODUCTS:[],typeof EXTRAS!=='undefined'?EXTRAS:[],typeof OFFERS!=='undefined'?OFFERS.map(o=>[o.id,o.name,o.price]):[]]);
  function applyMenu(rows,extras){
    if(typeof PRODUCTS==='undefined'||!rows||!rows.length)return;
    _rows=rows;
    const list=rows.filter(r=>r.cat!=='offer'&&(STAFF||!r.off)).sort((a,b)=>a.sort-b.sort).map(rowToProduct);
    PRODUCTS.length=0;list.forEach(p=>PRODUCTS.push(p));
    rows.filter(r=>r.cat==='offer').forEach(r=>{const o=(typeof OFFERS!=='undefined'?OFFERS:[]).find(x=>x.id===r.id);if(o){o.name=r.name;o.price=num(r.price);if(r.descr)o.desc=r.descr;}});
    if(typeof BANNERS!=='undefined'&&typeof OFFERS!=='undefined')BANNERS.forEach(b=>{if(b.act&&b.act.t==='offer'){const o=OFFERS.find(x=>x.id===b.act.id);if(o)b.price=o.price;}});
    if(extras&&extras.length&&typeof EXTRAS!=='undefined'){EXTRAS.length=0;extras.forEach(e=>EXTRAS.push({id:e.id,name:e.name,price:num(e.price)}));}
  }
  async function loadMenu(){
    if(!sb)return;
    const [m,x]=await Promise.all([sb.from('menu_items').select('*').order('sort'),sb.from('menu_extras').select('*').order('id')]);
    if(m.error||x.error||!m.data||!m.data.length)return;
    const before=menuSig();
    applyMenu(m.data,x.data);set('krusty_menu_cache',{rows:m.data,extras:x.data});
    if(menuSig()!==before){
      if(STAFF){emit('krusty_menu');}
      else{const sig=menuSig();try{if(sessionStorage.getItem('kk_rl')!==sig){sessionStorage.setItem('kk_rl',sig);location.reload();}}catch{emit('krusty_menu');}}
    }
  }
  const menuRows=()=>_rows;
  async function menuSave(id,patch){
    if(!sb)return NOSB;const p={};
    if('name'in patch)p.name=patch.name;if('price'in patch)p.price=patch.price;if('off'in patch)p.off=patch.off;if('descr'in patch)p.descr=patch.descr;
    const {error}=await sb.from('menu_items').update(p).eq('id',id);if(error)return{err:error.message};await loadMenu();emit('krusty_menu');return{ok:1};
  }
  async function menuAdd(r){
    if(!sb)return NOSB;const mx=_rows.reduce((m,x)=>x.cat==='offer'?m:Math.max(m,x.sort||0),0);
    const row={id:'x'+Date.now().toString(36),cat:r.cat,name:r.name,descr:r.descr||r.name,price:r.price,img:r.img||null,icon:r.icon||null,extras:!!r.extras,sort:mx+1};
    const {error}=await sb.from('menu_items').insert(row);if(error)return{err:error.message};await loadMenu();emit('krusty_menu');return{ok:row};
  }
  async function menuDel(id){if(!sb)return NOSB;const {error}=await sb.from('menu_items').delete().eq('id',id);if(error)return{err:error.message};await loadMenu();emit('krusty_menu');return{ok:1};}
  async function extraSave(id,price){if(!sb)return NOSB;const {error}=await sb.from('menu_extras').update({price}).eq('id',id);if(error)return{err:error.message};await loadMenu();emit('krusty_menu');return{ok:1};}
  /* تطبيق آخر نسخة محفوظة فورًا عشان الصفحة تتعرض بالأسعار الصح من غير وميض */
  {const c=get('krusty_menu_cache',null);if(c&&c.rows)applyMenu(c.rows,c.extras);}

  /* ---------- الطلبات ---------- */
  const mapOrder=r=>({id:r.id,ts:Date.parse(r.created_at),status:r.status,src:r.src,type:r.type,method:r.method||'',uid:r.uid||'',name:r.name||'',phone:r.phone||'',address:r.address||'',notes:r.notes||'',items:Array.isArray(r.items)?r.items:[],total:num(r.total),disc:num(r.disc),fee:num(r.fee),paid:num(r.paid),pay:r.pay||'cash',log:Array.isArray(r.log)?r.log:[]});
  let _orders=[],_status=get('krusty_status',{});
  const orders=()=>_orders;
  const getOrder=id=>STAFF?_orders.find(x=>x.id===id):(_status[id]?{id,status:_status[id]}:null);
  /* السلة بتحمل key بالشكل: id|extra1,extra2 — السيرفر هو اللي بيحسب الأسعار */
  const cartToItems=cart=>cart.map(i=>{const [id,ex]=String(i.key).split('|');return{id,qty:i.qty,extras:ex?ex.split(','):[]};});
  async function placeOrder(p){
    if(!sb)return NOSB;
    const {data,error}=await sb.rpc('place_order',{p});
    if(error){const m=error.message||'';
      if(/item unavailable/.test(m))return{err:'في وجبة في السلة مش متاحة دلوقتي. حدّث الصفحة وراجع السلة.',code:'unavailable'};
      if(/invalid (name|phone|address)/.test(m))return{err:'راجع الاسم والموبايل والعنوان.',code:'invalid'};
      return{err:'ماقدرناش نسجّل الطلب على السيرفر.',code:'net'};}
    return{ok:data};
  }
  async function loadOrders(){
    if(!sb||!STAFF)return;
    const {data,error}=await sb.from('orders').select('*').order('created_at',{ascending:false}).limit(600);
    if(error||!data)return;_orders=data.map(mapOrder);emit('krusty_orders_all');
  }
  function liveOrders(){
    if(!sb)return;
    sb.channel('orders-live').on('postgres_changes',{event:'*',schema:'public',table:'orders'},pl=>{
      if(pl.eventType==='DELETE'){_orders=_orders.filter(o=>o.id!==pl.old.id);}
      else{const o=mapOrder(pl.new),i=_orders.findIndex(x=>x.id===o.id);i>=0?_orders[i]=o:_orders.unshift(o);_orders.sort((a,b)=>b.ts-a.ts);}
      emit('krusty_orders_all');
    }).subscribe();
    setInterval(()=>{if(!document.hidden)loadOrders();},30000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadOrders();});
  }
  async function setStatus(id,s){
    if(!sb||!ST[s])return;const o=_orders.find(x=>x.id===id);if(!o)return;
    const log=[...(o.log||[]),{s,t:Date.now()}],old={status:o.status,log:o.log};
    o.status=s;o.log=log;emit('krusty_orders_all');
    const {error}=await sb.from('orders').update({status:s,log}).eq('id',id);
    if(error){o.status=old.status;o.log=old.log;emit('krusty_orders_all');return{err:error.message};}
    return{ok:1};
  }
  async function wipeOrders(){if(!sb)return NOSB;const {error}=await sb.from('orders').delete().neq('id','');if(error)return{err:error.message};_orders=[];emit('krusty_orders_all');return{ok:1};}
  /* متابعة حالة طلبات الزبون (من غير ما يكون عنده صلاحية يقرأ الجدول) */
  async function refreshStatus(ids){
    if(!sb||STAFF)return;
    const list=(ids||[]).filter(id=>!['done','cancelled'].includes(_status[id])).slice(0,30);if(!list.length)return;
    const {data,error}=await sb.rpc('get_order_status',{ids:list});if(error||!data)return;
    let ch=false;data.forEach(r=>{if(_status[r.id]!==r.status){_status[r.id]=r.status;ch=true;}});
    if(ch){set('krusty_status',_status);emit('krusty_orders_all');}
  }
  let _track=()=>[];
  function trackOrders(fn){
    _track=fn;const run=()=>{if(!document.hidden)refreshStatus(_track());};
    run();setInterval(run,20000);document.addEventListener('visibilitychange',run);
  }

  /* ---------- حسابات الزباين ---------- */
  const session=()=>get('krusty_session',null);
  const emailOf=p=>normPhone(p)+'@'+(CFG.emailDomain||'krusty.vercel.app');
  const toSession=u=>({id:u.id,name:(u.user_metadata&&u.user_metadata.name)||'عميل',phone:(u.user_metadata&&u.user_metadata.phone)||'',guest:false});
  async function signup(name,phone,pass){
    name=String(name||'').trim();phone=normPhone(phone);
    if(name.length<3)return{err:'اكتب اسمك (3 حروف على الأقل)'};
    if(!okPhone(phone))return{err:'اكتب رقم موبايل مصري صحيح (11 رقم)'};
    if(String(pass||'').length<6)return{err:'كلمة السر لازم تكون 6 حروف أو أكتر'};
    if(!sb)return NOSB;
    const {data,error}=await sb.auth.signUp({email:emailOf(phone),password:pass,options:{data:{name,phone}}});
    if(error){return{err:/already|registered/i.test(error.message)?'الرقم ده عنده حساب بالفعل. سجّل دخول.':/invalid/i.test(error.message)?'ماقدرناش نعمل الحساب (إعدادات التسجيل). كمّل كضيف دلوقتي.':error.message};}
    if(!data.session)return{err:'الحساب اتعمل بس محتاج تفعيل. (صاحب الموقع لازم يقفل Confirm email من Supabase).'};
    const s=toSession(data.user);s.name=name;s.phone=phone;set('krusty_session',s);emit('krusty_session');return{ok:s};
  }
  async function login(phone,pass){
    if(!sb)return NOSB;
    const {data,error}=await sb.auth.signInWithPassword({email:emailOf(phone),password:String(pass||'')});
    if(error)return{err:'الرقم أو كلمة السر غلط'};
    const s=toSession(data.user);set('krusty_session',s);emit('krusty_session');return{ok:s};
  }
  function guest(name){const s={id:'g'+Date.now().toString(36),name:String(name||'').trim()||'ضيف',phone:'',guest:true};set('krusty_session',s);emit('krusty_session');return{ok:s};}
  function logout(){try{LS.removeItem('krusty_session');}catch{}if(sb)sb.auth.signOut().catch(()=>{});emit('krusty_session');}
  async function custInit(){
    if(!sb)return;const {data}=await sb.auth.getSession(),cur=session();
    if(data.session){const s=toSession(data.session.user);if(!cur||cur.id!==s.id||cur.guest){set('krusty_session',s);emit('krusty_session');}}
    else if(cur&&!cur.guest){try{LS.removeItem('krusty_session');}catch{}emit('krusty_session');}
  }

  /* ---------- الموظفين (أدمن / كاشير) ---------- */
  let _me=null,_staffRow=null,_staff=[],_users=[];
  async function staffInit(){
    if(!sb)return;const {data}=await sb.auth.getSession();_me=data.session?data.session.user:null;await loadMyStaff();
  }
  async function loadMyStaff(){
    _staffRow=null;if(!sb||!_me)return;
    const {data}=await sb.from('staff').select('*').eq('user_id',_me.id).maybeSingle();_staffRow=data||null;
  }
  const staffUser=()=>_me;
  const staffRole=()=>_staffRow&&_staffRow.approved?_staffRow.role:'';
  const staffPending=()=>!!(_staffRow&&!_staffRow.approved);
  async function staffLogin(email,pass){
    if(!sb)return NOSB;
    const {data,error}=await sb.auth.signInWithPassword({email:String(email||'').trim(),password:String(pass||'')});
    if(error)return{err:'الإيميل أو الباسورد غلط'};_me=data.user;await loadMyStaff();return{ok:1};
  }
  async function staffSignup(email,pass){
    email=String(email||'').trim();
    if(!/^\S+@\S+\.\S+$/.test(email))return{err:'اكتب إيميل صحيح'};
    if(String(pass||'').length<6)return{err:'الباسورد لازم 6 خانات على الأقل'};
    if(!sb)return NOSB;
    const {data,error}=await sb.auth.signUp({email,password:pass});
    if(error)return{err:/already|registered/i.test(error.message)?'الإيميل ده متسجّل. سجّل دخول.':error.message};
    if(!data.session)return{err:'اتبعتلك إيميل تفعيل. فعّله وبعدين سجّل دخول.'};
    _me=data.user;await loadMyStaff();return{ok:1};
  }
  async function staffLogout(){if(sb)await sb.auth.signOut().catch(()=>{});_me=null;_staffRow=null;}
  async function claimAdmin(){if(!sb)return NOSB;const {data,error}=await sb.rpc('claim_admin');if(error)return{err:error.message};await loadMyStaff();return data?{ok:1}:{err:'فيه أدمن متسجّل بالفعل. اطلب صلاحية كاشير وهو يوافق عليك.'};}
  async function requestStaff(){if(!sb)return NOSB;const {error}=await sb.rpc('request_staff');if(error)return{err:error.message};await loadMyStaff();return{ok:1};}
  async function loadStaff(){
    if(!sb)return;const {data}=await sb.from('staff').select('*').order('created_at');_staff=data||[];emit('krusty_staff');
  }
  const staffList=()=>_staff;
  async function staffUpdate(uid,patch){if(!sb)return NOSB;const {error}=await sb.from('staff').update(patch).eq('user_id',uid);if(error)return{err:error.message};await loadStaff();return{ok:1};}
  async function staffRemove(uid){if(!sb)return NOSB;const {error}=await sb.from('staff').delete().eq('user_id',uid);if(error)return{err:error.message};await loadStaff();return{ok:1};}
  async function loadUsers(){
    if(!sb)return;const {data}=await sb.from('profiles').select('*').order('created_at',{ascending:false});
    _users=(data||[]).map(p=>({id:p.id,name:p.name,phone:p.phone||'',ts:Date.parse(p.created_at)}));emit('krusty_users');
  }
  const users=()=>_users;

  /* ---------- تشغيل ---------- */
  const ready=(async()=>{
    const jobs=[loadMenu()];
    jobs.push(STAFF?staffInit():custInit());
    await Promise.allSettled(jobs);
  })();

  /* ---------- أيقونات إضافية بتتحقن في أي صفحة ---------- */
  const SYM={
   user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
   'log-out':'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
   shield:'<path d="M12 3 4 6v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
   calculator:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18.5h.01M12 18.5h.01M16 18.5h.01"/>',
   printer:'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
   chart:'<path d="M3 3v18h18"/><path d="M8 17v-6M13 17V7M18 17v-9"/>',
   pencil:'<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
   eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
   'eye-off':'<path d="M3 3l18 18"/><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6A17 17 0 0 0 2 12s3.6 6 10 6a9.7 9.7 0 0 0 4-.9"/>',
   lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
   users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.6 3.1-6 7-6s7 2.4 7 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 15.3c2.4.7 4 2.6 4 5.7"/>',
   sliders:'<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
   download:'<path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v3h16v-3"/>',
   banknote:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
   refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 3v5h-5"/>',
   bag:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
   'arrow-down':'<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
   'arrow-left':'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
   bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
   ban:'<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>'
  };
  const BASE={"sparkles": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" />  <path d=\"M20 2v4\" />  <path d=\"M22 4h-4\" />  <circle cx=\"4\" cy=\"20\" r=\"2\" />", "plus": "<path d=\"M5 12h14\" />  <path d=\"M12 5v14\" />", "minus": "<path d=\"M5 12h14\" />", "check": "<path d=\"M20 6 9 17l-5-5\" />", "x": "<path d=\"M18 6 6 18\" />  <path d=\"m6 6 12 12\" />", "trash-2": "<path d=\"M10 11v6\" />  <path d=\"M14 11v6\" />  <path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\" />  <path d=\"M3 6h18\" />  <path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\" />", "receipt": "<path d=\"M5 2h14v20l-2.33-1.5L14.33 22 12 20.5 9.67 22 7.33 20.5 5 22z\"/><path d=\"M8.5 7.5h7M8.5 11.5h7M8.5 15.5h4\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\" />  <path d=\"M12 6v6l4 2\" />", "search": "<path d=\"m21 21-4.34-4.34\" />  <circle cx=\"11\" cy=\"11\" r=\"8\" />", "hamburger": "<path d=\"M12 16H4a2 2 0 1 1 0-4h16a2 2 0 1 1 0 4h-4.25\" />  <path d=\"M5 12a2 2 0 0 1-2-2 9 7 0 0 1 18 0 2 2 0 0 1-2 2\" />  <path d=\"M5 16a2 2 0 0 0-2 2 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 2 2 0 0 0-2-2q0 0 0 0\" />  <path d=\"m6.67 12 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2\" />", "fries": "<path d=\"M5 10h14l-1.5 11h-11z\"/><path d=\"M8 10V4M11 10V2.5M14 10V3.5M17 10V5\"/>", "sauce": "<path d=\"M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z\"/><path d=\"M7 12h10M12 15v3\"/>", "cup-soda": "<path d=\"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8\" />  <path d=\"M5 8h14\" />  <path d=\"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0\" />  <path d=\"m12 8 1-6h2\" />", "utensils": "<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\" />  <path d=\"M7 2v20\" />  <path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\" />", "bike": "<circle cx=\"18.5\" cy=\"17.5\" r=\"3.5\" />  <circle cx=\"5.5\" cy=\"17.5\" r=\"3.5\" />  <circle cx=\"15\" cy=\"5\" r=\"1\" />  <path d=\"M12 17.5V14l-3-3 4-3 2 3h2\" />", "house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" />  <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />", "phone": "<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />", "map-pin": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" />  <circle cx=\"12\" cy=\"10\" r=\"3\" />", "star": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\" />", "tag": "<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\" />  <circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\" />", "whatsapp": "<path d=\"M3 21l1.65-4.9A9 9 0 1 1 8 19.4z\"/><path d=\"M9.2 8.6c0 3.3 2.9 6.2 6.2 6.2l1-1.5-2.1-1-.9.9c-.9-.4-1.8-1.3-2.2-2.2l.9-.9-1-2.1z\"/>", "shopping-cart": "<path d=\"m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18\" />  <path d=\"M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25\" />  <circle cx=\"18\" cy=\"20\" r=\"2\" />  <circle cx=\"8\" cy=\"20\" r=\"2\" />", "chev": "<path d=\"m15 18-6-6 6-6\"/>", "badge-percent": "<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" />  <path d=\"m15 9-6 6\" />  <path d=\"M9 9h.01\" />  <path d=\"M15 15h.01\" />", "flame": "<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\" />", "anchor": "<path d=\"M12 6v16\" />  <path d=\"m19 13 2-1a9 9 0 0 1-18 0l2 1\" />  <path d=\"M9 11h6\" />  <circle cx=\"12\" cy=\"4\" r=\"2\" />", "arrow-down-up": "<path d=\"m3 16 4 4 4-4\" />  <path d=\"M7 20V4\" />  <path d=\"m21 8-4-4-4 4\" />  <path d=\"M17 4v16\" />", "circle-alert": "<circle cx=\"12\" cy=\"12\" r=\"10\" />  <line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" />  <line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />"};
  Object.assign(SYM,Object.fromEntries(Object.entries(BASE).filter(([k])=>!(k in SYM))));
  function injectIcons(){
    if(document.getElementById('kk-sym'))return;
    const have=id=>document.getElementById('i-'+id);
    const s=Object.keys(SYM).filter(k=>!have(k)).map(k=>`<symbol id="i-${k}" viewBox="0 0 24 24">${SYM[k]}</symbol>`).join('');
    document.body.insertAdjacentHTML('afterbegin',`<svg id="kk-sym" xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${s}</svg>`);
  }

  /* ---------- زر الحساب في الشريط العلوي (صفحات الموقع العامة) ---------- */
  const escH=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mountAccount(){
    const box=document.querySelector('.nav-actions');if(!box)return;
    let btn=document.getElementById('acctBtn'),pop=document.getElementById('acctPop');
    if(!btn){
      btn=document.createElement('button');btn.id='acctBtn';btn.type='button';btn.className='icon-btn acct-btn';btn.setAttribute('aria-haspopup','true');
      box.insertBefore(btn,box.querySelector('.cart-btn')||null);
      pop=document.createElement('div');pop.id='acctPop';pop.className='acct-pop';pop.hidden=true;document.body.appendChild(pop);
      btn.addEventListener('click',e=>{e.stopPropagation();const s=session();if(!s){location.href='/login?next='+encodeURIComponent(location.pathname+location.search);return;}pop.hidden=!pop.hidden;});
      document.addEventListener('click',e=>{if(!e.target.closest('#acctPop,#acctBtn'))pop.hidden=true;});
      pop.addEventListener('click',e=>{if(e.target.closest('[data-logout]')){logout();pop.hidden=true;}});
    }
    const s=session();
    btn.innerHTML=`<svg class="ic" aria-hidden="true"><use href="#i-user"/></svg>${s&&!s.guest?'<i class="acct-dot"></i>':''}`;
    btn.setAttribute('aria-label',s?'حسابي':'تسجيل الدخول');btn.title=s?s.name:'تسجيل الدخول';
    pop.innerHTML=s?`<div class="ap-head"><span class="ap-av"><svg class="ic"><use href="#i-user"/></svg></span><div><b>${escH(s.name)}</b><small>${s.guest?'داخل كضيف':escH(s.phone)}</small></div></div>
      <button type="button" data-open="orders"><svg class="ic"><use href="#i-receipt"/></svg>طلباتي</button>
      ${s.guest?'<a href="/login"><svg class="ic"><use href="#i-user"/></svg>سجّل حساب</a>':''}
      <button type="button" data-logout><svg class="ic"><use href="#i-log-out"/></svg>خروج</button>`:'';
  }
  function mountFooterLinks(){
    const col=document.querySelector('.f-col[aria-label="روابط سريعة"]');if(!col||col.querySelector('[data-staff-link]'))return;
    col.insertAdjacentHTML('beforeend','<a href="/cashier" data-staff-link>الكاشير</a><a href="/admin" data-staff-link>لوحة الإدارة</a>');
  }
  function boot(){injectIcons();mountAccount();mountFooterLinks();}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
  on(t=>{if(t==='krusty_session')mountAccount();});

  return{get,set,on,emit,ready,sb,normPhone,okPhone,ST,
    session,signup,login,guest,logout,users,loadUsers,
    staffUser,staffRole,staffPending,staffLogin,staffSignup,staffLogout,claimAdmin,requestStaff,loadStaff,staffList,staffUpdate,staffRemove,
    orders,getOrder,loadOrders,liveOrders,setStatus,wipeOrders,placeOrder,cartToItems,trackOrders,
    menuRows,loadMenu,menuSave,menuAdd,menuDel,extraSave,injectIcons,mountAccount};
})();
window.KK=KK; /* const على مستوى السكربت مش بيبقى window.KK، فبنعرّضه صراحةً */
