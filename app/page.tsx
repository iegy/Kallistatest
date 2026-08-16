/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { firebaseServices, isFirebaseConfigured } from "./lib/firebase";

type Service = { id: string; titleAr: string; titleEn: string; description: string; order: number; active: boolean };
type Album = { id: string; title: string; category: string; description: string; coverUrl: string; published: boolean; eventDate?: string };
type Photo = { id: string; albumId: string; url: string; alt: string; order: number; published: boolean };
type Review = { id: string; name: string; rating: number; text: string; approved: boolean };
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
type Settings = {
  brandName: string;
  heroHeadline: string;
  heroLine: string;
  heroCopy: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  birthdayReminderDays: number;
  bookingNotice: string;
  introHeadline: string;
  introCopy: string;
  servicesHeadline: string;
  portfolioHeadline: string;
  portfolioCopy: string;
  experienceHeadline: string;
  experienceCopy: string;
  aboutHeadline: string;
  aboutCopy: string;
  contactHeadline: string;
  contactCopy: string;
  newsletterHeadline: string;
  newsletterCopy: string;
};

const defaults: Settings = {
  brandName: "KALLISTA by Ronadisa",
  heroHeadline: "نوثّق ما لا يتكرر.",
  heroLine: "Preserving what cannot be repeated.",
  heroCopy: "في اللحظات التي تحدث مرة واحدة فقط، نبحث عن التفاصيل التي تستحق أن تبقى.",
  phone: "01101220606",
  whatsapp: "201101220606",
  email: "hello@kallista.studio",
  location: "مصر",
  facebook: "#",
  instagram: "#",
  tiktok: "#",
  birthdayReminderDays: 7,
  bookingNotice: "طلب الحجز لا يُعد مؤكدًا حتى تراجعه الإدارة وتتواصل معك.",
  introHeadline: "أكثر من مجرد صورة.",
  introCopy: "الصورة الجميلة تلفت النظر. في Kallista لا نبحث فقط عن الصورة المثالية، بل عن اللحظة الصادقة التي تشبه أصحابها. نصوّر الرجال، ونقدم للسيدات المحجبات تجربة تحترم خصوصيتهن وحضورهن.",
  servicesHeadline: "ما الذي نوثّقه؟",
  portfolioHeadline: "حكايات في ألبومات.",
  portfolioCopy: "كل مناسبة تظهر كألبوم كامل؛ لحظة وراء أخرى، حتى تبقى القصة كما حدثت.",
  experienceHeadline: "التجربة تبدأ قبل أن تُفتح الكاميرا.",
  experienceCopy: "نريد أن تكون التجربة نفسها مريحة، واضحة ومدروسة؛ لأن الشعور بالأمان هو أول خطوة لصورة حقيقية.",
  aboutHeadline: "أنا روناديسا، المصورة والمؤسسة وراء Kallista.",
  aboutCopy: "أكثر ما أحبه في التصوير ليس الكاميرا نفسها، وإنما اللحظة التي تحدث أمامها. أراقب النظرة والضحكة والحركة العفوية، وأصنع مساحة يشعر فيها كل شخص بالراحة.",
  contactHeadline: "خلينا نحتفظ بلحظة تستحق أن تبقى.",
  contactCopy: "احكِ لنا عن مناسبتك أو الجلسة التي تتخيلها، وسنتواصل معك بعد مراجعة التفاصيل.",
  newsletterHeadline: "مساحة صغيرة للتحديثات الجميلة.",
  newsletterCopy: "اشترك لتصلك مواعيد الجلسات الجديدة والعروض.",
};

const defaultServices: Service[] = [
  { id: "weddings", titleAr: "حفلات الزفاف", titleEn: "Weddings", description: "توثيق يوم لا يتكرر، من اللحظات الكبيرة إلى التفاصيل التي تحدث بعيدًا عن الأنظار.", order: 1, active: true },
  { id: "children", titleAr: "تصوير الأطفال", titleEn: "Children", description: "طفولة لا تتكرر بنفس التفاصيل مرتين، بصور طبيعية ودافئة تحفظ روح المرحلة.", order: 2, active: true },
  { id: "fashion", titleAr: "تصوير الأزياء", titleEn: "Fashion", description: "صور تحريرية تجمع بين قوة الحضور وجمال التفاصيل لكل إطلالة.", order: 3, active: true },
  { id: "personal", titleAr: "جلسات شخصية", titleEn: "Portraits", description: "جلسات مريحة وموجّهة تبرز شخصية كل فرد بأسلوب راقٍ وصادق.", order: 4, active: true },
  { id: "events", titleAr: "مناسبات أخرى", titleEn: "Events", description: "توثيق المناسبات والقصص الخاصة بعناية تناسب طبيعة كل حدث.", order: 5, active: true },
];

function useLiveContent() {
  const [settings, setSettings] = useState(defaults);
  const [services, setServices] = useState(defaultServices);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const f = firebaseServices();
    if (!f) return;
    const stops = [
      onSnapshot(doc(f.db, "settings", "site"), (snap) => snap.exists() && setSettings({ ...defaults, ...snap.data() } as Settings)),
      onSnapshot(query(collection(f.db, "services"), where("active", "==", true), orderBy("order")), (snap) => { const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service)); setServices(rows.length ? rows : defaultServices); }),
      onSnapshot(query(collection(f.db, "albums"), where("published", "==", true), orderBy("createdAt", "desc")), (snap) => setAlbums(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Album)))),
      onSnapshot(query(collection(f.db, "photos"), where("published", "==", true), orderBy("order")), (snap) => setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Photo)))),
      onSnapshot(query(collection(f.db, "reviews"), where("approved", "==", true), orderBy("createdAt", "desc")), (snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review)))),
    ];
    return () => stops.forEach((stop) => stop());
  }, []);
  return { settings, services, albums, photos, reviews };
}

export default function Home() {
  const { settings, services, albums, photos, reviews } = useLiveContent();
  const [user, setUser] = useState<User | null>(null);
  const [menu, setMenu] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState<Album | null>(null);

  useEffect(() => {
    const f = firebaseServices();
    return f ? onAuthStateChanged(f.auth, setUser) : undefined;
  }, []);

  const albumPhotos = useMemo(() => photos.filter((p) => p.albumId === albumOpen?.id), [photos, albumOpen]);
  const wa = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("مرحبًا، أريد الاستفسار عن جلسة تصوير لدى Kallista")}`;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Kallista home"><img src={`${basePath}/kallista-logo.jpg`} alt="Kallista" /></a>
        <nav className={menu ? "nav open" : "nav"} aria-label="التنقل الرئيسي">
          <a href="#home" onClick={() => setMenu(false)}>الرئيسية</a>
          <a href="#services" onClick={() => setMenu(false)}>الخدمات</a>
          <a href="#portfolio" onClick={() => setMenu(false)}>الألبومات</a>
          <a href="#experience" onClick={() => setMenu(false)}>التجربة</a>
          <a href="#about" onClick={() => setMenu(false)}>عن روناديسا</a>
          <a href="#contact" onClick={() => setMenu(false)}>تواصل</a>
        </nav>
        <div className="header-actions">
          {user ? <button className="text-button" onClick={() => firebaseServices() && signOut(firebaseServices()!.auth)}>خروج</button> : <button className="text-button" onClick={() => setAuthOpen(true)}>دخول</button>}
          <button className="button small" onClick={() => setBookingOpen(true)}>طلب حجز</button>
          <button className="menu-button" onClick={() => setMenu(!menu)} aria-label="فتح القائمة">{menu ? "×" : "☰"}</button>
        </div>
      </header>

      <section id="home" className="hero">
        <div className="hero-copy reveal">
          <p className="eyebrow">KALLISTA BY RONADISA</p>
          <h1>{settings.heroHeadline}</h1>
          <p className="hero-en">{settings.heroLine}</p>
          <p>{settings.heroCopy}</p>
          <div className="hero-actions"><a className="button" href="#portfolio">استكشف الأعمال</a><button className="button ghost" onClick={() => setBookingOpen(true)}>احجز جلستك</button></div>
        </div>
        <div className="hero-image"><img src={`${basePath}/ronadisa.jpg`} alt="روناديسا، المصورة المؤسسة لـ Kallista" /></div>
        <a className="scroll-cue" href="#intro">اكتشف <span>↓</span></a>
      </section>

      <section id="intro" className="intro section">
        <p className="eyebrow">A PHOTOGRAPH CAN HOLD A FEELING</p>
        <h2>{settings.introHeadline}</h2>
        <p>{settings.introCopy}</p>
        <a className="text-link" href="#about">اكتشف Kallista <span>↙</span></a>
      </section>

      <section id="services" className="section services">
        <div className="section-heading"><div><p className="eyebrow">WHAT WE PRESERVE</p><h2>{settings.servicesHeadline}</h2></div><p>كل مناسبة لها إيقاعها الخاص. نبدأ بفهم قصتك، ثم نصمم تجربة التصوير حولها.</p></div>
        <div className="service-list">{services.map((service, index) => <article className="service-row" key={service.id}><span>{String(index + 1).padStart(2, "0")}</span><div><p className="service-en">{service.titleEn}</p><h3>{service.titleAr}</h3></div><p>{service.description}</p><button onClick={() => setBookingOpen(true)} aria-label={`طلب ${service.titleAr}`}>↙</button></article>)}</div>
      </section>

      <section className="manifesto"><p>Some moments deserve more than a memory.</p><h2>بعض اللحظات تستحق أكثر من مجرد ذكرى.</h2></section>

      <section id="portfolio" className="section portfolio">
        <div className="section-heading"><div><p className="eyebrow">THE WORK</p><h2>{settings.portfolioHeadline}</h2></div><p>{settings.portfolioCopy}</p></div>
        {albums.length ? <div className="album-grid">{albums.map((album, index) => <button className={`album-card album-${index % 3}`} key={album.id} onClick={() => setAlbumOpen(album)}><img src={album.coverUrl} alt={album.title} loading="lazy" /><span><small>{album.category}</small><strong>{album.title}</strong><em>عرض الألبوم ↙</em></span></button>)}</div> : <div className="empty-gallery"><div className="empty-frame" style={{ backgroundImage: `linear-gradient(135deg, rgba(175,187,156,.65), rgba(198,165,133,.5)), url("${basePath}/ronadisa.jpg")` }} /><div><p className="eyebrow">YOUR STORIES LIVE HERE</p><h3>الألبومات جاهزة لاستقبال أعمال Kallista.</h3><p>من لوحة التحكم يمكنك إنشاء المناسبة، رفع صورها كاملة، اختيار صورة الغلاف، وترتيب ظهورها.</p></div></div>}
      </section>

      <section id="experience" className="section experience">
        <div className="experience-intro"><p className="eyebrow">THE KALLISTA EXPERIENCE</p><h2>{settings.experienceHeadline}</h2><p>{settings.experienceCopy}</p></div>
        <div className="steps"><article><span>01 / BEFORE</span><h3>قبل الجلسة</h3><p>نتعرف عليك، نفهم ما تريده وطبيعة المناسبة والمشاعر التي تريد الاحتفاظ بها.</p></article><article><span>02 / DURING</span><h3>أثناء التصوير</h3><p>توجيه واضح عندما تحتاج إليه، ومساحة للعفوية عندما تبدأ اللحظات الحقيقية.</p></article><article><span>03 / AFTER</span><h3>بعد الجلسة</h3><p>اختيار ومعالجة الصور بعناية، مع اهتمام بالتفاصيل النهائية وطريقة التسليم.</p></article></div>
      </section>

      <section id="about" className="section about"><div className="about-photo"><img src={`${basePath}/ronadisa.jpg`} alt="Ronadisa behind Kallista" loading="lazy" /></div><div className="about-copy"><p className="eyebrow">MEET THE EYE BEHIND KALLISTA</p><h2>{settings.aboutHeadline}</h2><p>{settings.aboutCopy}</p><blockquote>I don&apos;t just photograph what I see.<br />I photograph what I feel is worth remembering.</blockquote></div></section>

      <section className="section reviews"><div className="section-heading"><div><p className="eyebrow">WORDS FROM THOSE WHO TRUSTED US</p><h2>قالوا عن التجربة.</h2></div><button className="text-link" onClick={() => user ? document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" }) : setAuthOpen(true)}>أضف تقييمك ↙</button></div>{reviews.length ? <div className="review-grid">{reviews.map((r) => <article key={r.id}><div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div><p>“{r.text}”</p><strong>{r.name}</strong></article>)}</div> : <p className="soft-note">يظهر هذا القسم تلقائيًا بعد اعتماد أول تقييم حقيقي من لوحة التحكم.</p>}<ReviewForm user={user} onNeedAuth={() => setAuthOpen(true)} /></section>

      <section className="section faq"><div><p className="eyebrow">FREQUENTLY ASKED</p><h2>قبل أن نبدأ.</h2></div><div className="faq-list"><details><summary>من يمكنه الحجز لدى Kallista؟</summary><p>نقدم التصوير للرجال والسيدات بالتساوي، مع تخصص تجربة تصوير السيدات للمحجبات فقط بما يحفظ الخصوصية والراحة.</p></details><details><summary>هل تقدمون تصوير حفلات الزفاف فقط؟</summary><p>لا. تشمل الخدمات الزفاف، الأطفال، الأزياء، الجلسات الشخصية ومناسبات أخرى.</p></details><details><summary>هل أحتاج أن أعرف كيف أقف أمام الكاميرا؟</summary><p>إطلاقًا. تحصل على توجيه بسيط وواضح، مع مساحة كافية للقطات الطبيعية.</p></details><details><summary>كيف أعرف الأسعار وأؤكد الحجز؟</summary><p>أرسل طلب الحجز بالتفاصيل. تراجعه الإدارة ثم تتواصل معك لتأكيد التوفر والسعر والخطوات التالية.</p></details></div></section>

      <section id="contact" className="contact section"><div><p className="eyebrow">LET&apos;S PRESERVE SOMETHING BEAUTIFUL</p><h2>{settings.contactHeadline}</h2><p>{settings.contactCopy}</p><div className="contact-links"><a href={`tel:${settings.phone}`}>{settings.phone}</a><a href={wa} target="_blank">WhatsApp ↗</a><a href={`mailto:${settings.email}`}>{settings.email}</a></div></div><button className="button light" onClick={() => setBookingOpen(true)}>ابدأ طلب الحجز</button></section>

      <Newsletter settings={settings} />

      <footer><div className="footer-brand"><img src={`${basePath}/kallista-logo.jpg`} alt="Kallista" /><p>{settings.heroLine}</p></div><div className="footer-links"><a href={settings.instagram}>Instagram</a><a href={settings.facebook}>Facebook</a><a href={settings.tiktok}>TikTok</a><a href={wa}>WhatsApp</a></div><div className="footer-bottom"><span>© 2026 Kallista by Ronadisa. All rights reserved.</span><a href="https://iegy.net" target="_blank">Designed &amp; Developed by Mohammed Hussein · iegy.net ©</a><Link href="/admin">الإدارة</Link></div></footer>

      <a className="whatsapp-float" href={wa} target="_blank" aria-label="تواصل عبر واتساب">WA</a>
      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} />}
      {bookingOpen && <BookingDialog user={user} services={services} settings={settings} onClose={() => setBookingOpen(false)} onNeedAuth={() => { setBookingOpen(false); setAuthOpen(true); }} />}
      {albumOpen && <AlbumDialog album={albumOpen} photos={albumPhotos} user={user} onClose={() => setAlbumOpen(null)} onNeedAuth={() => setAuthOpen(true)} />}
    </main>
  );
}

function AuthDialog({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function emailAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage("");
    const fd = new FormData(e.currentTarget); const email = String(fd.get("email")); const password = String(fd.get("password")); const name = String(fd.get("name") || "");
    try {
      const f = firebaseServices(); if (!f) throw new Error("أكمل إعداد Firebase أولًا.");
      if (mode === "signup") { const result = await createUserWithEmailAndPassword(f.auth, email, password); await updateProfile(result.user, { displayName: name }); await setDoc(doc(f.db, "profiles", result.user.uid), { name, email, createdAt: serverTimestamp(), marketingConsent: false }); }
      else await signInWithEmailAndPassword(f.auth, email, password);
      onClose();
    } catch (err) { setMessage(errorText(err)); } finally { setBusy(false); }
  }
  async function google() { try { const f = firebaseServices(); if (!f) throw new Error("أكمل إعداد Firebase أولًا."); const result = await signInWithPopup(f.auth, new GoogleAuthProvider()); const ref = doc(f.db, "profiles", result.user.uid); if (!(await getDoc(ref)).exists()) await setDoc(ref, { name: result.user.displayName, email: result.user.email, createdAt: serverTimestamp(), marketingConsent: false }); onClose(); } catch (err) { setMessage(errorText(err)); } }
  async function reset(email: string) { try { const f = firebaseServices(); if (!f || !email) throw new Error("اكتب بريدك أولًا."); await sendPasswordResetEmail(f.auth, email); setMessage("أرسلنا رابط استعادة كلمة المرور."); } catch (err) { setMessage(errorText(err)); } }
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal auth-modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={onClose}>×</button><p className="eyebrow">YOUR KALLISTA ACCOUNT</p><h2>{mode === "login" ? "مرحبًا بعودتك" : "أنشئ حسابك"}</h2><button className="google-button" onClick={google}>المتابعة باستخدام Google</button><div className="divider"><span>أو</span></div><form onSubmit={emailAuth}>{mode === "signup" && <label>الاسم<input name="name" required /></label>}<label>البريد الإلكتروني<input name="email" id="auth-email" type="email" required /></label><label>كلمة المرور<input name="password" type="password" minLength={6} required /></label><button className="button" disabled={busy}>{busy ? "جارٍ المتابعة..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}</button></form><button className="text-button wide" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "ليس لديك حساب؟ أنشئه الآن" : "لديك حساب؟ سجّل الدخول"}</button>{mode === "login" && <button className="text-button wide" onClick={() => reset((document.getElementById("auth-email") as HTMLInputElement)?.value)}>نسيت كلمة المرور؟</button>}<p className="form-message">{message || (!isFirebaseConfigured ? "وضع العرض مفعل. أضف إعدادات Firebase لتفعيل الحسابات." : "")}</p></div></div>;
}

function BookingDialog({ user, services, settings, onClose, onNeedAuth }: { user: User | null; services: Service[]; settings: Settings; onClose: () => void; onNeedAuth: () => void }) {
  const [done, setDone] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (!user) return onNeedAuth(); setBusy(true); try { const f = firebaseServices(); if (!f) throw new Error("أكمل إعداد Firebase أولًا."); const data = Object.fromEntries(new FormData(e.currentTarget)); const booking = await addDoc(collection(f.db, "bookings"), { ...data, userId: user.uid, userEmail: user.email, status: "pending", createdAt: serverTimestamp() }); await addDoc(collection(f.db, "mailQueue"), { type: "new_booking", bookingId: booking.id, status: "pending", createdAt: serverTimestamp() }); if (data.birthDate) await setDoc(doc(f.db, "profiles", user.uid), { birthDate: data.birthDate, marketingConsent: data.marketingConsent === "on" }, { merge: true }); setDone(true); } catch (err) { setMessage(errorText(err)); } finally { setBusy(false); } }
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal booking-modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={onClose}>×</button>{done ? <div className="success"><span>✓</span><h2>وصل طلبك.</h2><p>ستراجعه الإدارة وتتواصل معك لتأكيد الموعد والتفاصيل.</p><button className="button" onClick={onClose}>تم</button></div> : <><p className="eyebrow">BOOKING INQUIRY</p><h2>احكِ لنا عن مناسبتك.</h2><p className="soft-note">{settings.bookingNotice}</p><form className="booking-form" onSubmit={submit}><label>الاسم الكامل<input name="name" defaultValue={user?.displayName || ""} required /></label><label>رقم الهاتف / واتساب<input name="phone" type="tel" required /></label><label>الخدمة<select name="serviceId" required><option value="">اختر الخدمة</option>{services.map((s) => <option value={s.id} key={s.id}>{s.titleAr}</option>)}</select></label><label>التاريخ المطلوب<input name="eventDate" type="date" required /></label><label>الموقع<input name="location" placeholder="المدينة / القاعة" required /></label><label>تاريخ الميلاد <small>اختياري للتذكير بالعروض</small><input name="birthDate" type="date" /></label><label className="full">احكِ لنا عن المناسبة<textarea name="story" rows={4} required /></label><label className="check full"><input name="marketingConsent" type="checkbox" /> أوافق على استقبال تحديثات وعروض Kallista ويمكنني إلغاء الاشتراك لاحقًا.</label><button className="button full" disabled={busy}>{busy ? "جارٍ إرسال الطلب..." : user ? "إرسال طلب الحجز" : "سجّل الدخول لإرسال الطلب"}</button></form><p className="form-message">{message}</p></>}</div></div>;
}

function AlbumDialog({ album, photos, user, onClose, onNeedAuth }: { album: Album; photos: Photo[]; user: User | null; onClose: () => void; onNeedAuth: () => void }) {
  const [comment, setComment] = useState(""); const [message, setMessage] = useState("");
  async function addComment() { if (!user) return onNeedAuth(); try { const f = firebaseServices(); if (!f) throw new Error("أكمل إعداد Firebase."); await addDoc(collection(f.db, "comments"), { albumId: album.id, userId: user.uid, name: user.displayName || "عميل Kallista", text: comment, approved: false, createdAt: serverTimestamp() }); setComment(""); setMessage("تم إرسال تعليقك للمراجعة."); } catch (err) { setMessage(errorText(err)); } }
  return <div className="modal-backdrop album-backdrop"><div className="album-modal"><button className="close light-close" onClick={onClose}>×</button><div className="album-title"><p>{album.category}</p><h2>{album.title}</h2><span>{album.description}</span></div><div className="album-photos">{photos.map((p) => <img key={p.id} src={p.url} alt={p.alt || album.title} loading="lazy" />)}</div><div className="album-comment"><h3>اترك كلمة لهذه القصة</h3><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تعليقك..." /><button className="button" onClick={addComment} disabled={!comment.trim()}>إرسال</button><p>{message}</p></div></div></div>;
}

function ReviewForm({ user, onNeedAuth }: { user: User | null; onNeedAuth: () => void }) {
  const [open, setOpen] = useState(false); const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (!user) return onNeedAuth(); try { const f = firebaseServices(); if (!f) throw new Error("أكمل إعداد Firebase."); const fd = new FormData(e.currentTarget); await addDoc(collection(f.db, "reviews"), { userId: user.uid, name: user.displayName || "عميل Kallista", rating: Number(fd.get("rating")), text: fd.get("text"), approved: false, createdAt: serverTimestamp() }); setMessage("شكرًا لك. سيظهر تقييمك بعد المراجعة."); } catch (err) { setMessage(errorText(err)); } }
  return <div id="review-form" className="review-form">{!open ? <button className="button ghost" onClick={() => user ? setOpen(true) : onNeedAuth()}>اكتب تقييمًا</button> : <form onSubmit={submit}><select name="rating" aria-label="التقييم"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select><textarea name="text" placeholder="صف تجربتك باختصار" required /><button className="button">إرسال للمراجعة</button></form>}<p>{message}</p></div>;
}

function Newsletter({ settings }: { settings: Settings }) {
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); try { const f = firebaseServices(); if (!f) throw new Error("أكمل إعداد Firebase."); const data = Object.fromEntries(new FormData(e.currentTarget)); await addDoc(collection(f.db, "subscribers"), { ...data, active: true, source: "website_footer", createdAt: serverTimestamp() }); setMessage("تم الاشتراك بنجاح."); e.currentTarget.reset(); } catch (err) { setMessage(errorText(err)); } }
  return <section className="newsletter"><div><p className="eyebrow">STAY IN THE STORY</p><h2>{settings.newsletterHeadline}</h2><p>{settings.newsletterCopy} تذكير أعياد الميلاد يرسل قبل {settings.birthdayReminderDays} أيام حسب إعدادات الإدارة.</p></div><form onSubmit={submit}><input name="name" placeholder="الاسم" required /><input name="email" type="email" placeholder="البريد الإلكتروني" required /><input name="birthDate" type="date" aria-label="تاريخ الميلاد" /><label className="check"><input type="checkbox" name="consent" required /> أوافق على استقبال التحديثات.</label><button className="button">اشتراك</button><span>{message}</span></form></section>;
}

function errorText(err: unknown) { const value = err instanceof Error ? err.message : "حدث خطأ غير متوقع."; return value.replace("Firebase: ", "").replace(/\(auth\/.+\)\.?/, ""); }
