# تفعيل Firebase لموقع Kallista

المشروع مربوط بمشروع Firebase `velora-studio-524f9`. أكمل الخطوات التالية مرة واحدة من [Firebase Console](https://console.firebase.google.com/):

## 1. Authentication

من **Build → Authentication → Sign-in method** فعّل:

- Email/Password
- Google

وأضف النطاق `iegy.net` إلى **Authorized domains** إن لم يكن موجوداً.

## 2. Firestore Database

من **Build → Firestore Database** أنشئ قاعدة البيانات بوضع Production. افتح تبويب **Rules**، وانسخ محتوى ملف `firestore.rules` بالكامل ثم اضغط **Publish**.

الـ UID الإداري المعتمد داخل القواعد هو:

```text
MhfH4HNxL6UVAUYisFghPiZvt7A3
```

لا حاجة إلى تخزين كلمة مرور أو PIN في Firestore. كلمة المرور تُدار فقط من Firebase Authentication.

## 3. أول دخول للإدارة

سجّل الدخول من زر القفل باستخدام حساب Firebase:

```text
adminmoro@kallista.com
```

بعد الدخول لأول مرة، ستنشئ لوحة الإدارة بيانات المحتوى الافتراضية في Firestore تلقائياً إذا كانت المجموعات فارغة.

## 4. ملاحظات أمان

- Firebase Web Config ليس مفتاح خادم سرياً؛ الحماية الفعلية تعتمد على Authentication وFirestore Rules.
- لا تستخدم وضع Test ولا قاعدة `allow read, write: if true`.
- مفتاح ImgBB يبقى مستخدماً للرفع من لوحة الإدارة حسب طلب مالك المشروع.
