'use strict';
/* ===== مصدر البيانات الوحيد: عدّل الأسماء والأسعار والصور من هنا ===== */
const IMG = '/images/', CH = '/characters/';
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
   img  : اسم صورة من فولدر images (أو مسار كامل)، price/old: السعر والسعر القديم (اختياري)، stk: ملصق صغير (اختياري)
   act  : {t:'offer',id} يضيف عرض للسلة | {t:'product',id} يفتح صفحة الوجبة | {t:'cat',id} يفتح تصنيف | {t:'link',href}
   on:false يخفي البانر مؤقتًا بدون حذفه */
const BANNERS = [
  {page:['home','meals'],theme:'sun',tag:'عرض اليوم',title:'كومبو سلطع الكبير',text:'برجر + بطاطس + مشروب بسعر واحد.',img:'hero-burger.webp',price:180,old:195,cta:'اطلب العرض',act:{t:'offer',id:'o1'}},
  {page:['home','meals'],theme:'ocean',tag:'الأكثر طلبًا',title:'سلطع دبل',text:'قطعتين لحم، جبنتين، وصوص السلطع السري.',img:'double.webp',price:170,cta:'شوف التفاصيل',act:{t:'product',id:'b3'}},
  {page:['home','meals'],theme:'coral',tag:'مقرمش',title:'برجر دجاج',text:'دجاج مقرمش، خس، طماطم، وصوص كريمي.',img:'chicken.webp',price:110,cta:'شوف التفاصيل',act:{t:'product',id:'b4'}},
  {page:['home','meals'],theme:'mint',tag:'اطلب بسهولة',title:'اختار وابعت واتساب',text:'ضيف وجبتك للسلة وطلبك يطلع جاهز على واتساب.',img:'/characters/spongebob.webp',cta:'تصفّح الوجبات',act:{t:'link',href:'/meals'}}
];
const REVIEWS = [{n:'سبونج بوب',s:5,t:'أنا جاهز! أحلى برجر في أعماق البحر، وكل لقمة بتخليني أضحك.',a:'avatar-spongebob.webp'},{n:'باتريك',s:5,t:'طلبت ٣ برجر... وبعدين طلبت ٣ كمان. هو في حد بيشبع؟',a:'avatar-patrick.webp'},{n:'سكويدوارد',s:4,t:'مش هعترف إنه حلو... بس لقيت نفسي بطلب تاني.',a:'avatar-squidward-cool.webp'}];
/* ============================================================ */
