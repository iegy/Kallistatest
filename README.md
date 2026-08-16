# Kallista by Ronadisa

موقع تصوير احترافي متجاوب مبني بـ React وVite، مع لوحة إدارة، ألبومات، حجوزات، تقييمات، رفع صور عبر ImgBB، وتخزين آمن في Firebase.

## التشغيل المحلي

```bash
cp .env.example .env.local
npm install
npm run dev
```

## التحقق والبناء

```bash
npm run lint
npm run build
```

يتم نشر فرع `main` تلقائياً على GitHub Pages من خلال `.github/workflows/deploy-pages.yml`، ومسار الإنتاج مضبوط على `/Kallista/`.

## الأمان

- دخول الإدارة يتم فقط عبر Firebase Authentication والتحقق من UID المدير.
- لا توجد كلمة مرور افتراضية أو PIN داخل كود الموقع.
- الحجوزات والتقييمات تتطلب حساب عميل، والتقييمات تبقى معلقة حتى موافقة المدير.
- قواعد Firestore الجاهزة موجودة في `firestore.rules` ويجب نشرها من Firebase Console.
