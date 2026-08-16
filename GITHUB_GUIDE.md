# نشر Kallista على GitHub Pages

المستودع المستهدف هو `iegy/Kallista` والفرع المنشور هو `main`.

عند كل تحديث للفرع، يقوم GitHub Actions تلقائياً بما يلي:

1. تثبيت الحزم.
2. تشغيل فحص TypeScript.
3. بناء نسخة Vite بمسار `/Kallista/`.
4. نشر مجلد `dist` على GitHub Pages.

إذا لم يبدأ النشر، افتح **Settings → Pages** واختر **Source: GitHub Actions**، ثم أعد تشغيل workflow باسم **Deploy Kallista to GitHub Pages**.
