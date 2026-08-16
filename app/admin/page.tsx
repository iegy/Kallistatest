/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, @next/next/no-img-element */
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { firebaseServices, imgbbApiKey, isFirebaseConfigured } from "../lib/firebase";

type Row = Record<string, any> & { id: string };
type Tab = "overview" | "content" | "services" | "albums" | "bookings" | "moderation" | "audience";

const settingFields: Array<[string, string, "text" | "textarea" | "number"]> = [
  ["brandName", "اسم العلامة", "text"], ["heroHeadline", "عنوان الواجهة", "text"], ["heroLine", "السطر الإنجليزي", "text"], ["heroCopy", "وصف الواجهة", "textarea"],
  ["introHeadline", "عنوان المقدمة", "text"], ["introCopy", "نص المقدمة", "textarea"], ["servicesHeadline", "عنوان الخدمات", "text"],
  ["portfolioHeadline", "عنوان الألبومات", "text"], ["portfolioCopy", "وصف الألبومات", "textarea"], ["experienceHeadline", "عنوان التجربة", "text"], ["experienceCopy", "نص التجربة", "textarea"],
  ["aboutHeadline", "عنوان روناديسا", "text"], ["aboutCopy", "نبذة روناديسا", "textarea"], ["contactHeadline", "عنوان التواصل", "text"], ["contactCopy", "نص التواصل", "textarea"],
  ["newsletterHeadline", "عنوان الاشتراك", "text"], ["newsletterCopy", "نص الاشتراك", "textarea"], ["phone", "رقم الهاتف", "text"], ["whatsapp", "واتساب بكود الدولة", "text"],
  ["email", "بريد الإدارة", "text"], ["location", "الموقع", "text"], ["facebook", "رابط Facebook", "text"], ["instagram", "رابط Instagram", "text"], ["tiktok", "رابط TikTok", "text"],
  ["birthdayReminderDays", "التذكير بعيد الميلاد قبل (أيام)", "number"], ["bookingNotice", "تنبيه نموذج الحجز", "textarea"],
];

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Record<string, Row[]>>({});
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    const f = firebaseServices();
    if (!f) { setChecked(true); return; }
    return onAuthStateChanged(f.auth, async (next) => {
      setUser(next); setAdmin(false);
      if (next) {
        const token = await next.getIdTokenResult(true);
        let allowed = token.claims.admin === true;
        if (!allowed) { try { allowed = (await getDoc(doc(f.db, "admins", next.uid))).exists(); } catch { allowed = false; } }
        setAdmin(allowed);
      }
      setChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!admin) return;
    const f = firebaseServices(); if (!f) return;
    const names = ["services", "albums", "photos", "bookings", "reviews", "comments", "subscribers", "profiles", "mailQueue"];
    const stops = names.map((name) => onSnapshot(collection(f.db, name), (snap) => setData((old) => ({ ...old, [name]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }))));
    stops.push(onSnapshot(doc(f.db, "settings", "site"), (snap) => setSettings(snap.exists() ? snap.data() : {})));
    return () => stops.forEach((stop) => stop());
  }, [admin]);

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }
  if (!checked) return <AdminShell><p>جارٍ التحقق...</p></AdminShell>;
  if (!isFirebaseConfigured) return <AdminShell><SetupNotice /></AdminShell>;
  if (!user) return <AdminShell><AdminLogin /></AdminShell>;
  if (!admin) return <AdminShell><div className="admin-login"><h1>الحساب غير مصرح له</h1><p>الحساب مسجل، لكنه لا يحمل صلاحية admin. اتبع ملف FIREBASE_SETUP.md لتعيين أول مدير.</p><button className="admin-primary" onClick={() => firebaseServices() && signOut(firebaseServices()!.auth)}>تسجيل الخروج</button></div></AdminShell>;

  const bookings = data.bookings || [];
  const pendingReviews = [...(data.reviews || []), ...(data.comments || [])].filter((x) => !x.approved);
  return (
    <div className="admin-layout" dir="rtl">
      <aside className="admin-sidebar"><Link href="/" className="admin-logo">KALLISTA<small>CONTROL ROOM</small></Link><nav>{([['overview','نظرة عامة'],['content','المحتوى والتواصل'],['services','الخدمات'],['albums','الألبومات والصور'],['bookings','الحجوزات'],['moderation','التقييمات والتعليقات'],['audience','العملاء والتنبيهات']] as [Tab,string][]).map(([id,label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</nav><div className="admin-user"><span>{user.displayName || user.email}</span><button onClick={() => firebaseServices() && signOut(firebaseServices()!.auth)}>خروج</button></div></aside>
      <main className="admin-main">
        <header><div><p>KALLISTA ADMIN</p><h1>{tabTitle(tab)}</h1></div><Link href="/" target="_blank">عرض الموقع ↗</Link></header>
        {toast && <div className="admin-toast">{toast}</div>}
        {tab === "overview" && <Overview data={data} />}
        {tab === "content" && <SettingsEditor settings={settings} flash={flash} />}
        {tab === "services" && <ServicesEditor rows={data.services || []} flash={flash} />}
        {tab === "albums" && <AlbumsEditor albums={data.albums || []} photos={data.photos || []} flash={flash} />}
        {tab === "bookings" && <Bookings rows={bookings} flash={flash} />}
        {tab === "moderation" && <Moderation reviews={data.reviews || []} comments={data.comments || []} flash={flash} />}
        {tab === "audience" && <Audience subscribers={data.subscribers || []} profiles={data.profiles || []} queue={data.mailQueue || []} pending={pendingReviews.length} flash={flash} />}
      </main>
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) { return <main className="admin-gate" dir="rtl"><Link href="/" className="admin-logo">KALLISTA<small>BY RONADISA</small></Link>{children}</main>; }

function SetupNotice() { return <div className="admin-login"><h1>لوحة التحكم جاهزة للربط</h1><p>أضف قيم Firebase إلى ملف البيئة ثم أعد التشغيل. الواجهة تعمل حاليًا في وضع العرض الآمن.</p><Link className="admin-primary" href="/">العودة للموقع</Link></div>; }

function AdminLogin() {
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const fd = new FormData(e.currentTarget); try { const f = firebaseServices(); if (!f) return; await signInWithEmailAndPassword(f.auth, String(fd.get("email")), String(fd.get("password"))); } catch { setMessage("بيانات الدخول غير صحيحة أو الحساب غير مفعل."); } }
  async function google() { try { const f = firebaseServices(); if (f) await signInWithPopup(f.auth, new GoogleAuthProvider()); } catch { setMessage("تعذر تسجيل الدخول باستخدام Google."); } }
  return <form className="admin-login" onSubmit={submit}><p>SECURE ADMIN ACCESS</p><h1>دخول الإدارة</h1><label>البريد الإلكتروني<input name="email" type="email" required /></label><label>كلمة المرور<input name="password" type="password" required /></label><button className="admin-primary">دخول</button><button type="button" className="admin-secondary" onClick={google}>الدخول باستخدام Google</button><span>{message}</span></form>;
}

function Overview({ data }: { data: Record<string, Row[]> }) {
  const bookings = data.bookings || []; const upcoming = bookings.filter((b) => b.status === "approved").slice(0, 5);
  const cards = [["طلبات جديدة", bookings.filter((b) => b.status === "pending").length], ["حجوزات مقبولة", bookings.filter((b) => b.status === "approved").length], ["ألبومات منشورة", (data.albums || []).filter((x) => x.published).length], ["مشتركون نشطون", (data.subscribers || []).filter((x) => x.active !== false).length]];
  return <><div className="admin-stats">{cards.map(([label,value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</div><section className="admin-panel"><h2>المواعيد المقبولة</h2>{upcoming.length ? <div className="admin-list">{upcoming.map((b) => <div key={b.id}><strong>{b.name}</strong><span>{b.eventDate} · {b.location}</span></div>)}</div> : <p className="admin-empty">لا توجد مواعيد مقبولة بعد.</p>}</section></>;
}

function SettingsEditor({ settings, flash }: { settings: Record<string, any>; flash: (x: string) => void }) {
  async function save(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = firebaseServices(); if (!f) return; const raw: Record<string, any> = Object.fromEntries(new FormData(e.currentTarget)); raw.birthdayReminderDays = Number(raw.birthdayReminderDays || 7); await setDoc(doc(f.db, "settings", "site"), { ...raw, updatedAt: serverTimestamp() }, { merge: true }); flash("تم حفظ المحتوى والإعدادات."); }
  return <form className="admin-panel admin-form" onSubmit={save}><div className="panel-heading"><div><h2>محرر الموقع</h2><p>كل هذه الحقول تنعكس مباشرة على الواجهة.</p></div><button className="admin-primary">حفظ كل التغييرات</button></div><div className="field-grid">{settingFields.map(([key,label,type]) => <label className={type === "textarea" ? "span-2" : ""} key={key}>{label}{type === "textarea" ? <textarea name={key} rows={3} defaultValue={settings[key] || ""} /> : <input name={key} type={type} defaultValue={settings[key] || ""} />}</label>)}</div></form>;
}

function ServicesEditor({ rows, flash }: { rows: Row[]; flash: (x: string) => void }) {
  const [editing, setEditing] = useState<Row | null>(null);
  async function save(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = firebaseServices(); if (!f) return; const fd = new FormData(e.currentTarget); const value = { titleAr: fd.get("titleAr"), titleEn: fd.get("titleEn"), description: fd.get("description"), order: Number(fd.get("order")), active: fd.get("active") === "on", updatedAt: serverTimestamp() }; if (editing) await updateDoc(doc(f.db, "services", editing.id), value); else await addDoc(collection(f.db, "services"), { ...value, createdAt: serverTimestamp() }); setEditing(null); e.currentTarget.reset(); flash("تم حفظ الخدمة."); }
  return <div className="admin-two-col"><form className="admin-panel admin-form" onSubmit={save}><h2>{editing ? "تعديل الخدمة" : "خدمة جديدة"}</h2><label>الاسم بالعربية<input name="titleAr" defaultValue={editing?.titleAr || ""} required /></label><label>الاسم بالإنجليزية<input name="titleEn" defaultValue={editing?.titleEn || ""} required /></label><label>الوصف<textarea name="description" rows={4} defaultValue={editing?.description || ""} required /></label><label>الترتيب<input name="order" type="number" defaultValue={editing?.order || rows.length + 1} /></label><label className="admin-check"><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} /> ظاهرة بالموقع</label><button className="admin-primary">حفظ</button></form><section className="admin-panel"><h2>الخدمات الحالية</h2><div className="admin-list">{rows.sort(sortOrder).map((s) => <div key={s.id}><span><strong>{s.titleAr}</strong><small>{s.titleEn}</small></span><div><button onClick={() => setEditing(s)}>تعديل</button><DeleteButton collectionName="services" id={s.id} flash={flash} /></div></div>)}</div></section></div>;
}

function AlbumsEditor({ albums, photos, flash }: { albums: Row[]; photos: Row[]; flash: (x: string) => void }) {
  const [selected, setSelected] = useState(""); const [editing, setEditing] = useState<Row | null>(null); const [uploading, setUploading] = useState(false);
  async function saveAlbum(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = firebaseServices(); if (!f) return; const fd = new FormData(e.currentTarget); const value = { title: fd.get("title"), category: fd.get("category"), description: fd.get("description"), eventDate: fd.get("eventDate"), coverUrl: fd.get("coverUrl"), published: fd.get("published") === "on", updatedAt: serverTimestamp() }; if (editing) await updateDoc(doc(f.db, "albums", editing.id), value); else { const created = await addDoc(collection(f.db, "albums"), { ...value, createdAt: serverTimestamp() }); setSelected(created.id); } setEditing(null); e.currentTarget.reset(); flash("تم حفظ الألبوم."); }
  async function upload(files: FileList | null) { if (!files?.length || !selected) return; if (!imgbbApiKey) return flash("أضف NEXT_PUBLIC_IMGBB_API_KEY أولًا."); setUploading(true); const f = firebaseServices(); if (!f) return; try { for (const [index, file] of Array.from(files).entries()) { const body = new FormData(); body.append("image", file); body.append("name", file.name); const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, { method: "POST", body }); if (!res.ok) throw new Error("فشل رفع إحدى الصور"); const json = await res.json(); const photo = { albumId: selected, url: json.data.url, displayUrl: json.data.display_url, thumbUrl: json.data.thumb?.url || json.data.url, deleteUrl: json.data.delete_url || "", alt: file.name.replace(/\.[^.]+$/, ""), order: photos.filter((p) => p.albumId === selected).length + index + 1, published: true, createdAt: serverTimestamp() }; await addDoc(collection(f.db, "photos"), photo); const album = albums.find((a) => a.id === selected); if (album && !album.coverUrl) await updateDoc(doc(f.db, "albums", selected), { coverUrl: json.data.display_url || json.data.url }); } flash("تم رفع الصور وإضافتها للألبوم."); } catch (err) { flash(err instanceof Error ? err.message : "تعذر رفع الصور"); } finally { setUploading(false); } }
  const selectedPhotos = photos.filter((p) => p.albumId === selected).sort(sortOrder);
  return <><div className="admin-two-col"><form className="admin-panel admin-form" onSubmit={saveAlbum}><h2>{editing ? "تعديل الألبوم" : "إنشاء مناسبة / ألبوم"}</h2><label>اسم الألبوم<input name="title" defaultValue={editing?.title || ""} required /></label><label>التصنيف<select name="category" defaultValue={editing?.category || "Weddings"}><option>Weddings</option><option>Children</option><option>Fashion</option><option>Portraits</option><option>Events</option></select></label><label>وصف القصة<textarea name="description" defaultValue={editing?.description || ""} rows={4} /></label><label>تاريخ المناسبة<input name="eventDate" type="date" defaultValue={editing?.eventDate || ""} /></label><label>رابط صورة الغلاف<input name="coverUrl" defaultValue={editing?.coverUrl || ""} /></label><label className="admin-check"><input name="published" type="checkbox" defaultChecked={editing?.published ?? false} /> منشور للعامة</label><button className="admin-primary">حفظ الألبوم</button></form><section className="admin-panel"><h2>الألبومات</h2><div className="admin-list">{albums.map((a) => <div key={a.id} className={selected === a.id ? "selected" : ""}><button className="album-select" onClick={() => setSelected(a.id)}><strong>{a.title}</strong><small>{a.category} · {a.published ? "منشور" : "مسودة"}</small></button><div><button onClick={() => { setEditing(a); setSelected(a.id); }}>تعديل</button><DeleteButton collectionName="albums" id={a.id} flash={flash} /></div></div>)}</div></section></div>{selected && <section className="admin-panel upload-panel"><div className="panel-heading"><div><h2>صور الألبوم</h2><p>يمكن اختيار عدة صور ورفعها دفعة واحدة إلى ImgBB.</p></div><label className="admin-primary file-button">{uploading ? "جارٍ الرفع..." : "رفع صور"}<input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => upload(e.target.files)} /></label></div><div className="photo-manager">{selectedPhotos.map((p) => <article key={p.id}><img src={p.thumbUrl || p.url} alt={p.alt} /><input aria-label="النص البديل" defaultValue={p.alt || ""} onBlur={(e) => firebaseServices() && updateDoc(doc(firebaseServices()!.db, "photos", p.id), { alt: e.target.value })} /><div><button onClick={() => firebaseServices() && updateDoc(doc(firebaseServices()!.db, "albums", selected), { coverUrl: p.displayUrl || p.url })}>غلاف</button><DeleteButton collectionName="photos" id={p.id} flash={flash} /></div></article>)}</div></section>}</>;
}

function Bookings({ rows, flash }: { rows: Row[]; flash: (x: string) => void }) {
  const [filter, setFilter] = useState("all"); const [selectedDay, setSelectedDay] = useState(""); const byStatus = filter === "all" ? rows : rows.filter((x) => x.status === filter); const visible = selectedDay ? byStatus.filter((x) => x.eventDate === selectedDay) : byStatus;
  async function status(row: Row, next: string) { const f = firebaseServices(); if (!f) return; await updateDoc(doc(f.db, "bookings", row.id), { status: next, updatedAt: serverTimestamp() }); await addDoc(collection(f.db, "mailQueue"), { type: `booking_${next}`, bookingId: row.id, recipientEmail: row.userEmail, status: "pending", createdAt: serverTimestamp() }); flash(`تم تحديث الطلب إلى: ${statusAr(next)}`); }
  return <section className="admin-panel"><div className="panel-heading"><div><h2>إدارة طلبات الحجز</h2><p>الموافقة أو الرفض يضيف رسالة تلقائية إلى قائمة الإرسال.</p></div><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">كل الحالات</option><option value="pending">قيد المراجعة</option><option value="approved">مقبول</option><option value="rejected">مرفوض</option><option value="cancelled">ملغي</option></select></div><BookingCalendar rows={byStatus} selected={selectedDay} onSelect={setSelectedDay} />{selectedDay && <button className="clear-day" onClick={() => setSelectedDay("")}>عرض كل الأيام ×</button>}<div className="booking-list">{visible.map((b) => <article key={b.id}><div><span className={`status ${b.status}`}>{statusAr(b.status)}</span><h3>{b.name}</h3><p>{b.serviceId} · {b.eventDate} · {b.location}</p><p>{b.phone} · {b.userEmail}</p><blockquote>{b.story}</blockquote></div><div className="booking-actions"><button onClick={() => status(b,"approved")}>قبول</button><button onClick={() => status(b,"rejected")}>رفض</button><button onClick={() => status(b,"cancelled")}>إلغاء</button></div></article>)}</div></section>;
}

function BookingCalendar({ rows, selected, onSelect }: { rows: Row[]; selected: string; onSelect: (day: string) => void }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const year = month.getFullYear(); const monthIndex = month.getMonth(); const first = new Date(year, monthIndex, 1); const lastDay = new Date(year, monthIndex + 1, 0).getDate(); const start = (first.getDay() + 1) % 7;
  const cells: Array<number | null> = [...Array(start).fill(null), ...Array.from({ length: lastDay }, (_, i) => i + 1)]; while (cells.length % 7) cells.push(null);
  const key = (day: number) => `${year}-${String(monthIndex + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  return <div className="booking-calendar"><div className="calendar-head"><button onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>→</button><strong>{month.toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}</strong><button onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>←</button></div><div className="calendar-grid">{["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"].map((d) => <span className="weekday" key={d}>{d}</span>)}{cells.map((day, i) => { if (!day) return <span className="calendar-day empty" key={`e-${i}`} />; const iso = key(day); const events = rows.filter((x) => x.eventDate === iso); return <button key={iso} className={`calendar-day ${events.length ? "has-events" : ""} ${selected === iso ? "selected" : ""}`} onClick={() => onSelect(iso)}><b>{day}</b><small>{events.slice(0,2).map((event) => <em className={String(event.status)} key={event.id}>{event.name}</em>)}</small>{events.length > 2 && <i>+{events.length - 2}</i>}</button>; })}</div></div>;
}

function Moderation({ reviews, comments, flash }: { reviews: Row[]; comments: Row[]; flash: (x: string) => void }) {
  async function toggle(kind: string, row: Row) { const f = firebaseServices(); if (!f) return; await updateDoc(doc(f.db, kind, row.id), { approved: !row.approved, moderatedAt: serverTimestamp() }); flash(row.approved ? "تم إخفاء العنصر." : "تم نشر العنصر."); }
  return <div className="admin-two-col"><section className="admin-panel"><h2>التقييمات</h2><div className="moderation-list">{reviews.map((r) => <article key={r.id}><span>{"★".repeat(r.rating || 0)} · {r.name}</span><p>{r.text}</p><div><button onClick={() => toggle("reviews", r)}>{r.approved ? "إخفاء" : "اعتماد"}</button><DeleteButton collectionName="reviews" id={r.id} flash={flash} /></div></article>)}</div></section><section className="admin-panel"><h2>تعليقات الألبومات</h2><div className="moderation-list">{comments.map((c) => <article key={c.id}><span>{c.name}</span><p>{c.text}</p><div><button onClick={() => toggle("comments", c)}>{c.approved ? "إخفاء" : "اعتماد"}</button><DeleteButton collectionName="comments" id={c.id} flash={flash} /></div></article>)}</div></section></div>;
}

function Audience({ subscribers, profiles, queue, pending, flash }: { subscribers: Row[]; profiles: Row[]; queue: Row[]; pending: number; flash: (x: string) => void }) {
  async function queueCampaign(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const f = firebaseServices(); if (!f) return; const fd = new FormData(e.currentTarget); await addDoc(collection(f.db, "mailQueue"), { type: "campaign", subject: fd.get("subject"), message: fd.get("message"), audience: fd.get("audience"), status: "pending", createdAt: serverTimestamp() }); e.currentTarget.reset(); flash("أضيفت الحملة إلى قائمة الإرسال."); }
  return <><div className="admin-stats"><article><span>مشتركون</span><strong>{subscribers.length}</strong></article><article><span>حسابات عملاء</span><strong>{profiles.length}</strong></article><article><span>رسائل تنتظر الإرسال</span><strong>{queue.filter((x) => x.status === "pending").length}</strong></article><article><span>عناصر تنتظر المراجعة</span><strong>{pending}</strong></article></div><div className="admin-two-col"><form className="admin-panel admin-form" onSubmit={queueCampaign}><h2>رسالة للعملاء</h2><label>الجمهور<select name="audience"><option value="subscribers">المشتركون فقط</option><option value="all_consented">كل الموافقين على التحديثات</option><option value="birthdays">أعياد الميلاد القادمة</option></select></label><label>العنوان<input name="subject" required /></label><label>نص الرسالة<textarea name="message" rows={6} required /></label><button className="admin-primary">إضافة لقائمة الإرسال</button><p className="admin-hint">الإرسال الفعلي يتم عبر مهمة GitHub Actions المجدولة بعد إضافة أسرار البريد.</p></form><section className="admin-panel"><h2>أحدث المشتركين</h2><div className="admin-list">{subscribers.slice(0,15).map((s) => <div key={s.id}><span><strong>{s.name}</strong><small>{s.email} {s.birthDate ? `· ${s.birthDate}` : ""}</small></span><button onClick={() => firebaseServices() && updateDoc(doc(firebaseServices()!.db, "subscribers", s.id), { active: s.active === false })}>{s.active === false ? "تفعيل" : "إيقاف"}</button></div>)}</div></section></div></>;
}

function DeleteButton({ collectionName, id, flash }: { collectionName: string; id: string; flash: (x: string) => void }) { async function remove() { if (!window.confirm("هل تريد حذف هذا العنصر؟")) return; const f = firebaseServices(); if (!f) return; await deleteDoc(doc(f.db, collectionName, id)); flash("تم الحذف."); } return <button className="danger" onClick={remove}>حذف</button>; }

function tabTitle(tab: Tab) { return ({ overview: "نظرة عامة", content: "المحتوى والتواصل", services: "الخدمات", albums: "الألبومات والصور", bookings: "الحجوزات", moderation: "التقييمات والتعليقات", audience: "العملاء والتنبيهات" })[tab]; }
function statusAr(status: string) { return ({ pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض", cancelled: "ملغي" } as Record<string,string>)[status] || status; }
function sortOrder(a: Row, b: Row) { return Number(a.order || 0) - Number(b.order || 0); }
