# سلطع برجر – Krusty Krab

موقع ثابت (HTML/CSS/JS) جاهز للنشر على Vercel. كل الفولدرات في الجذر (مفيش فولدر جوه فولدر)، وكل فولدر فيه أقل من 100 ملف، فتقدر ترفع كل واحد لوحده على GitHub.

```
الجذر:  index / meals / product / story / login / admin / cashier / 404 .html + vercel.json + package.json
css/            style.css · app.css · story.css
js-core/        config · data · store · script   (مشترك)
js-pages/       story · admin · cashier · staff  (خاص بكل صفحة)
images/         صور الموقع
characters/     الشخصيات
icons/          sprite.svg
fonts/          الخطوط
gsap/           GSAP + ScrollTrigger + ScrollTo
leaflet/        الخريطة
frames-1 … frames-5   240 فريم لصفحة القصة (48 في كل فولدر)
```

## تعديل صفحة القصة
- `js-pages/story.js` ← مصفوفة `CH`: نص كل مشهد ورقم الفريم اللي يبدأ منه.
- `css/story.css` ← ارتفاع `.sq` (1100svh) يتحكم في سرعة الحركة.
