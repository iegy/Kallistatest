# إعداد Kallista مع Firebase وGitHub Pages

المشروع يعمل في وضع عرض بدون Firebase. لتفعيل الحسابات، قاعدة البيانات، الحجز، لوحة الإدارة والتنبيهات اتبع الخطوات التالية.

## 1. إنشاء مشروع Firebase

1. افتح Firebase Console وأنشئ مشروعًا جديدًا.
2. من **Project settings > Your apps** أضف Web app.
3. انسخ قيم `firebaseConfig` إلى ملف `.env.local` بنفس أسماء المتغيرات الموجودة في `.env.example`.
4. لا تضع ملف Service Account داخل المشروع أو GitHub مطلقًا.

## 2. تفعيل تسجيل الدخول

من **Authentication > Sign-in method** فعّل:

- Email/Password.
- Google.

ومن **Authentication > Settings > Authorized domains** أضف دومين الموقع، مثل `USERNAME.github.io` والدومين المخصص إن وجد. لا تستخدم كلمة مرور الإدارة في أي ملف داخل المستودع.

## 3. إنشاء Firestore ونشر القواعد

1. من **Firestore Database** أنشئ قاعدة Production في أقرب منطقة مناسبة.
2. ثبّت Firebase CLI ثم سجل الدخول:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

قواعد الأمان في `firestore.rules` تطبق الآتي:

- المحتوى المنشور فقط متاح للقراءة العامة.
- الحجز والتقييم والتعليق يحتاجون حسابًا مسجلًا.
- المستخدم يستطيع قراءة حجوزاته وملفه فقط.
- التقييمات والتعليقات لا تظهر قبل اعتماد الإدارة.
- الكتابة على المحتوى والحجوزات وقوائم العملاء محصورة في حساب يحمل `admin: true`.
- كل ما لم يُسمح به صراحة مرفوض افتراضيًا.

الفهارس المطلوبة موجودة في `firestore.indexes.json`.

## 4. تعيين أول مدير

1. أنشئ حساب الإدارة من Firebase Authentication أو سجّل به مرة في الموقع.
2. من **Project settings > Service accounts** أنشئ مفتاح JSON جديدًا.
3. شغّل الأمر محليًا فقط، مع استبدال البريد:

```bash
FIREBASE_SERVICE_ACCOUNT='ضع محتوى JSON كاملًا هنا' npm run firebase:set-admin -- admin@example.com
```

4. سجّل الخروج من الموقع ثم ادخل من جديد لتجديد صلاحيات الحساب.

الحساب الإداري يستخدم Firebase Authentication بالبريد وكلمة المرور أو Google، بينما الصلاحية نفسها تتحقق من Custom Claim وقواعد Firestore.

## 5. ImgBB

أنشئ مفتاحًا جديدًا لأن المفتاح السابق ظهر في المحادثة، ثم ضعه في:

```env
NEXT_PUBLIC_IMGBB_API_KEY=NEW_KEY
```

بناءً على القرار الحالي، المفتاح يرسل من المتصفح ويمكن لأي زائر تقني استخراجه. لا تمنحه أي صلاحيات أخرى، وغيّره فور ملاحظة استهلاك غير طبيعي. الصور تُرفع من تبويب **الألبومات والصور**، وتُحفظ روابطها وبياناتها في Firestore.

## 6. التنبيهات والبريد وأعياد الميلاد

الموقع يضيف الرسائل إلى `mailQueue`. ملف GitHub Actions يشغّل `scripts/process-notifications.mjs` كل 15 دقيقة ويرسل:

- إشعارًا للإدارة عند وصول حجز.
- رسالة للعميل بعد قبول أو رفض أو إلغاء الحجز.
- الحملات التي تنشئها الإدارة.
- تهنئة عيد الميلاد قبل عدد الأيام المحدد في لوحة التحكم.

أضف GitHub Repository Secrets التالية:

- `FIREBASE_SERVICE_ACCOUNT`: محتوى ملف Service Account JSON كاملًا.
- `RESEND_API_KEY`: مفتاح خدمة Resend.
- `ADMIN_EMAIL`: بريد استقبال الحجوزات.
- `MAIL_FROM`: اسم وبريد المرسل بعد توثيق الدومين، مثل `Kallista <hello@yourdomain.com>`.

لا تعرض هذه القيم في لوحة التحكم لأنها أسرار خادمية. لوحة التحكم تدير النصوص والمستلمين والتوقيت، بينما الأسرار تبقى في GitHub Secrets.

## 7. رفع الموقع إلى GitHub Pages

أضف القيم العامة التالية كـRepository Secrets أيضًا:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_IMGBB_API_KEY`

وأضف `NEXT_PUBLIC_SITE_URL` كـRepository Variable. من **Settings > Pages** اختر **GitHub Actions** كمصدر النشر. كل Push إلى فرع `main` يبني الموقع وينشره تلقائيًا.

يفضل استخدام مستودع `USERNAME.github.io` أو دومين مخصص حتى يعمل الموقع من جذر الدومين دون Base Path إضافي.

## 8. أول تشغيل

```bash
cp .env.example .env.local
npm install
npm run dev
```

بعد إضافة إعدادات Firebase وتعيين المدير:

1. افتح `/admin`.
2. احفظ نصوص الموقع وبيانات التواصل.
3. أضف الخدمات الخمس.
4. أنشئ أول ألبوم وارفع صوره ثم فعّل **منشور للعامة**.
5. اختبر حساب مستخدم جديد وطلب حجز.
6. نفّذ Workflow البريد يدويًا أول مرة للتأكد من الإرسال.
