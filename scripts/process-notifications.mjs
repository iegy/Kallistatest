import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
const resendKey = process.env.RESEND_API_KEY;
if (!serviceAccountRaw || !resendKey) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT or RESEND_API_KEY");

initializeApp({ credential: cert(JSON.parse(serviceAccountRaw)) });
const db = getFirestore();
const settings = (await db.doc("settings/site").get()).data() || {};
const from = process.env.MAIL_FROM || `Kallista <onboarding@resend.dev>`;
const adminEmail = process.env.ADMIN_EMAIL || settings.email;

async function send(to, subject, html) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], subject, html }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
}

function shell(title, body) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:620px;margin:auto;background:#fffefb;padding:40px;color:#272923"><h1 style="font-family:Georgia,serif;font-weight:400">${title}</h1><div style="line-height:1.9">${body}</div><p style="margin-top:35px;color:#777;font-size:12px">Kallista by Ronadisa · ${settings.phone || "01101220606"}</p></div>`;
}

const queue = await db.collection("mailQueue").where("status", "==", "pending").limit(40).get();
for (const item of queue.docs) {
  const job = item.data();
  try {
    if (job.type === "campaign") {
      const source = job.audience === "subscribers" ? "subscribers" : "profiles";
      const audience = await db.collection(source).get();
      const recipients = audience.docs.map((d) => d.data()).filter((x) => x.email && x.active !== false && (x.consent === "on" || x.marketingConsent === true));
      for (const recipient of recipients) await send(recipient.email, job.subject, shell(job.subject, `<p>${String(job.message).replace(/\n/g, "<br>")}</p>`));
    } else {
      const bookingSnap = await db.doc(`bookings/${job.bookingId}`).get();
      const booking = bookingSnap.data();
      if (!booking) throw new Error("Booking not found");
      if (job.type === "new_booking") await send(adminEmail, "طلب حجز جديد لدى Kallista", shell("طلب حجز جديد", `<p><b>${booking.name}</b></p><p>${booking.eventDate} · ${booking.location}</p><p>${booking.phone} · ${booking.userEmail}</p><p>${booking.story}</p>`));
      if (job.type === "booking_approved") await send(booking.userEmail, "تم قبول طلب حجزك لدى Kallista", shell("موعدك أقرب لأن يصبح ذكرى", `<p>مرحبًا ${booking.name}، تمت الموافقة المبدئية على طلبك بتاريخ ${booking.eventDate}. سنتواصل معك لاستكمال التأكيد.</p>`));
      if (job.type === "booking_rejected") await send(booking.userEmail, "تحديث بخصوص طلب حجز Kallista", shell("شكرًا لثقتك", `<p>مرحبًا ${booking.name}، للأسف لم نتمكن من قبول الموعد المطلوب. تواصل معنا لاختيار موعد بديل.</p>`));
      if (job.type === "booking_cancelled") await send(booking.userEmail, "تم إلغاء طلب الحجز", shell("تحديث الحجز", `<p>تم إلغاء طلب الحجز المسجل بتاريخ ${booking.eventDate}. يمكنك إرسال طلب جديد في أي وقت.</p>`));
    }
    await item.ref.update({ status: "sent", sentAt: FieldValue.serverTimestamp() });
  } catch (error) {
    await item.ref.update({ status: "failed", error: String(error), failedAt: FieldValue.serverTimestamp() });
  }
}

const birthdayDays = Number(settings.birthdayReminderDays || 7);
const cairoNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
const target = new Date(cairoNow); target.setDate(target.getDate() + birthdayDays);
const monthDay = `${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
const subscribers = await db.collection("subscribers").get();
for (const subscriberDoc of subscribers.docs) {
  const subscriber = subscriberDoc.data();
  if (!subscriber.birthDate || !String(subscriber.birthDate).endsWith(monthDay) || subscriber.active === false) continue;
  const logId = `${target.getFullYear()}-${subscriberDoc.id}`;
  const log = db.doc(`birthdayLogs/${logId}`);
  if ((await log.get()).exists) continue;
  try {
    await send(subscriber.email, "كل سنة وأنت طيب من Kallista", shell(`كل سنة وأنت طيب يا ${subscriber.name || "صديق Kallista"}`, "<p>نتمنى لك عامًا مليئًا باللحظات الجميلة التي تستحق أن تبقى.</p>"));
    await log.set({ subscriberId: subscriberDoc.id, sentAt: FieldValue.serverTimestamp() });
  } catch (error) { console.error(error); }
}
