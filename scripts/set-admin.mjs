import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
const email = process.argv[2];
if (!raw || !email) throw new Error("Usage: FIREBASE_SERVICE_ACCOUNT='...' node scripts/set-admin.mjs admin@example.com");
const serviceAccount = JSON.parse(raw);
initializeApp({ credential: cert(serviceAccount) });
const user = await getAuth().getUserByEmail(email);
await getAuth().setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
await getFirestore().doc(`admins/${user.uid}`).set({ email, active: true, createdAt: new Date() }, { merge: true });
console.log(`Admin role granted to ${email}. Sign out and sign in again.`);
