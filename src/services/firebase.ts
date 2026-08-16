import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  setPersistence,
  updateProfile,
} from 'firebase/auth';
import {
  DocumentData,
  Firestore,
  QueryConstraint,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { Album, Booking, ClientContact, PortfolioCategory, Review, SiteContent, SiteSettings } from '../types';

export const FIRESTORE_COLLECTIONS = {
  ALBUMS: 'kallista_albums',
  CATEGORIES: 'kallista_categories',
  BOOKINGS: 'kallista_bookings',
  CLIENTS: 'kallista_clients',
  REVIEWS: 'kallista_reviews',
  CONTENT: 'kallista_content',
  SETTINGS: 'kallista_settings',
  PROFILES: 'kallista_profiles',
  ADMINS: 'kallista_admins',
} as const;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export const isFirebaseConfigured = () => Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!cachedApp) cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return cachedApp;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!cachedAuth) cachedAuth = getAuth(app);
  return cachedAuth;
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!cachedDb) cachedDb = getFirestore(app);
  return cachedDb;
}

function authError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(code || '')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  }
  if (code === 'auth/email-already-in-use') return 'هذا البريد مسجل بالفعل.';
  if (code === 'auth/weak-password') return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
  if (code === 'auth/popup-closed-by-user') return 'تم إغلاق نافذة Google قبل إتمام الدخول.';
  if (code === 'auth/popup-blocked') return 'المتصفح منع نافذة Google. اسمح بالنوافذ المنبثقة لهذا الموقع ثم حاول مرة أخرى.';
  if (code === 'auth/cancelled-popup-request') return 'تم إلغاء محاولة الدخول السابقة. حاول مرة أخرى.';
  if (code === 'auth/unauthorized-domain') return 'دومين الموقع غير مضاف إلى Authorized domains في Firebase Authentication.';
  if (code === 'auth/operation-not-allowed') return 'تسجيل الدخول باستخدام Google غير مفعّل في Firebase Authentication.';
  return (error as Error)?.message || 'تعذر إتمام العملية. حاول مرة أخرى.';
}

function requireAuth(): Auth {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('إعداد Firebase غير مكتمل.');
  return auth;
}

function requireDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) throw new Error('إعداد Firebase غير مكتمل.');
  return db;
}

export async function loginWithFirebase(email: string, password: string) {
  try {
    const auth = requireAuth();
    await setPersistence(auth, browserLocalPersistence);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true as const, user: credential.user };
  } catch (error) {
    return { success: false as const, error: authError(error) };
  }
}

export async function registerWithFirebase(email: string, password: string, name: string) {
  try {
    const auth = requireAuth();
    await setPersistence(auth, browserLocalPersistence);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
    await setDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.PROFILES, credential.user.uid), {
      name: name.trim(),
      email: credential.user.email,
      createdAt: serverTimestamp(),
    });
    return { success: true as const, user: credential.user };
  } catch (error) {
    return { success: false as const, error: authError(error) };
  }
}

export async function loginWithGoogle() {
  try {
    const auth = requireAuth();
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    return { success: true as const, user: credential.user };
  } catch (error) {
    return { success: false as const, error: authError(error) };
  }
}

export async function syncUserProfile(user: User): Promise<void> {
  const provider = user.providerData.find((item) => item.providerId)?.providerId || 'password';
  await setDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.PROFILES, user.uid), {
    name: user.displayName || '',
    email: user.email || '',
    provider,
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    lastLoginAt: serverTimestamp(),
  }, { merge: true });
}

export async function resetFirebasePassword(email: string) {
  try {
    await sendPasswordResetEmail(requireAuth(), email);
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: authError(error) };
  }
}

export async function logoutFirebase(): Promise<void> {
  await signOut(requireAuth());
}

export function subscribeToFirebaseAuthState(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export async function isFirebaseAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  if (user.uid === import.meta.env.VITE_ADMIN_UID) return true;
  const token = await user.getIdTokenResult();
  if (token.claims.admin === true) return true;
  const snapshot = await getDoc(doc(requireDb(), FIRESTORE_COLLECTIONS.ADMINS, user.uid));
  return snapshot.exists() && snapshot.data().active === true;
}

function clean<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clean) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, clean(item)])
    ) as T;
  }
  return value;
}

function normalize<T>(data: DocumentData, id?: string): T {
  const normalized = Object.fromEntries(Object.entries(data).map(([key, value]) => [
    key,
    value && typeof value.toDate === 'function' ? value.toDate().toISOString() : value,
  ]));
  return { ...(id ? { id } : {}), ...normalized } as T;
}

export function watchDocument<T>(collectionName: string, documentId: string, callback: (value: T | null) => void) {
  return onSnapshot(doc(requireDb(), collectionName, documentId), (snapshot) => {
    callback(snapshot.exists() ? normalize<T>(snapshot.data()) : null);
  });
}

export function watchCollection<T>(collectionName: string, callback: (values: T[]) => void, ...constraints: QueryConstraint[]) {
  const source = constraints.length
    ? query(collection(requireDb(), collectionName), ...constraints)
    : collection(requireDb(), collectionName);
  return onSnapshot(source, (snapshot) => callback(snapshot.docs.map((item) => normalize<T>(item.data(), item.id))));
}

export async function saveDocument<T>(collectionName: string, id: string, value: T) {
  await setDoc(doc(requireDb(), collectionName, id), clean(value));
}

export async function replaceCollection<T extends { id: string }>(collectionName: string, values: T[]) {
  const db = requireDb();
  const existing = await getDocs(collection(db, collectionName));
  const batch = writeBatch(db);
  existing.docs.forEach((item) => batch.delete(item.ref));
  values.forEach((value) => batch.set(doc(db, collectionName, value.id), clean(value)));
  await batch.commit();
}

export async function syncCollection<T extends { id: string }>(
  collectionName: string,
  previousValues: T[],
  nextValues: T[],
) {
  const db = requireDb();
  const previousById = new Map(previousValues.map((value) => [value.id, value]));
  const nextById = new Map(nextValues.map((value) => [value.id, value]));
  const operations: Array<
    | { type: 'set'; value: T }
    | { type: 'delete'; id: string }
  > = [];

  nextValues.forEach((value) => {
    const previous = previousById.get(value.id);
    if (!previous || JSON.stringify(clean(previous)) !== JSON.stringify(clean(value))) {
      operations.push({ type: 'set', value });
    }
  });

  previousValues.forEach((value) => {
    if (!nextById.has(value.id)) operations.push({ type: 'delete', id: value.id });
  });

  // Keep every commit comfortably below Firestore's 500-write limit.
  for (let index = 0; index < operations.length; index += 400) {
    const batch = writeBatch(db);
    operations.slice(index, index + 400).forEach((operation) => {
      if (operation.type === 'delete') {
        batch.delete(doc(db, collectionName, operation.id));
      } else {
        batch.set(doc(db, collectionName, operation.value.id), clean(operation.value));
      }
    });
    await batch.commit();
  }
}

/**
 * Creates a booking request.
 *
 * Signing in is optional. A guest can book straight from the form (fewer
 * abandoned enquiries), and a signed-in client still gets the booking tied to
 * their account so it shows up in their profile. The matching contact record is
 * written either way, because the contact list is what drives birthday and
 * seasonal-occasion outreach.
 */
export async function createBookingRecord(
  booking: Omit<Booking, 'id' | 'createdAt' | 'status'>,
  client?: Partial<ClientContact>
) {
  const user = getFirebaseAuth()?.currentUser || null;
  const db = requireDb();
  const bookingRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.BOOKINGS), clean({
    ...booking,
    ...(user ? { userId: user.uid } : {}),
    status: 'pending',
    createdAt: serverTimestamp(),
  }));

  const contactPayload = {
    name: client?.name || booking.clientName,
    phone: client?.phone || booking.phone,
    whatsapp: client?.whatsapp || booking.whatsapp || booking.phone,
    email: client?.email || booking.email || user?.email || '',
    birthday: client?.birthday || '',
    weddingAnniversary: client?.weddingAnniversary || '',
    governorate: client?.governorate || booking.governorate || '',
    city: client?.city || booking.city || '',
    serviceInterests: client?.serviceInterests || [booking.serviceType],
    subscribeUpdates: client?.subscribeUpdates ?? false,
    totalBookings: 1,
    tags: ['Website Booking'],
    source: 'booking' as const,
    createdAt: serverTimestamp(),
  };

  // The booking itself is the part that must not be lost. If writing the CRM
  // contact fails, log it and still report the booking as sent rather than
  // showing an error for a request that was actually received.
  try {
    if (user) {
      // Signed-in clients get one stable contact record keyed to their account,
      // so repeat bookings update rather than duplicate them.
      const clientRef = doc(db, FIRESTORE_COLLECTIONS.CLIENTS, user.uid);
      if (!(await getDoc(clientRef)).exists()) {
        await setDoc(clientRef, clean({ id: user.uid, userId: user.uid, ...contactPayload }));
      }
    } else {
      await addDoc(collection(db, FIRESTORE_COLLECTIONS.CLIENTS), clean(contactPayload));
    }
  } catch (error) {
    console.warn('Booking saved, but the contact record could not be written:', error);
  }

  return bookingRef.id;
}

/**
 * Saves a "stay in touch" contact — someone who is not booking today but wants
 * to hear from the studio on their birthday and on seasonal occasions. This is
 * deliberately open to guests: requiring an account here would defeat the whole
 * purpose of the list.
 */
export async function createLeadRecord(lead: {
  name: string;
  phone: string;
  whatsapp?: string;
  email: string;
  birthday?: string;
  governorate?: string;
  city?: string;
  serviceInterests?: string[];
  notes?: string;
}) {
  const user = getFirebaseAuth()?.currentUser || null;
  return addDoc(collection(requireDb(), FIRESTORE_COLLECTIONS.CLIENTS), clean({
    name: lead.name,
    phone: lead.phone,
    whatsapp: lead.whatsapp || lead.phone,
    email: lead.email,
    birthday: lead.birthday || '',
    weddingAnniversary: '',
    governorate: lead.governorate || '',
    city: lead.city || '',
    serviceInterests: lead.serviceInterests || [],
    notes: lead.notes || '',
    subscribeUpdates: true,
    totalBookings: 0,
    tags: ['Stay In Touch'],
    source: 'stay-in-touch' as const,
    ...(user ? { userId: user.uid } : {}),
    createdAt: serverTimestamp(),
  }));
}

export async function createReviewRecord(review: Omit<Review, 'id' | 'createdAt' | 'approved'>) {
  const user = requireAuth().currentUser;
  if (!user) throw new Error('سجّل الدخول أولاً لإرسال التقييم.');
  return addDoc(collection(requireDb(), FIRESTORE_COLLECTIONS.REVIEWS), clean({
    ...review,
    userId: user.uid,
    approved: false,
    createdAt: serverTimestamp(),
  }));
}

export async function deleteRecord(collectionName: string, id: string) {
  await deleteDoc(doc(requireDb(), collectionName, id));
}

export async function seedDefaults(defaults: {
  content: SiteContent;
  settings: SiteSettings;
  categories: PortfolioCategory[];
  albums: Album[];
}) {
  const db = requireDb();
  const contentRef = doc(db, FIRESTORE_COLLECTIONS.CONTENT, 'main');
  if (!(await getDoc(contentRef)).exists()) await setDoc(contentRef, clean(defaults.content));
  const settingsRef = doc(db, FIRESTORE_COLLECTIONS.SETTINGS, 'public');
  if (!(await getDoc(settingsRef)).exists()) await setDoc(settingsRef, clean(defaults.settings));
  const categoriesRef = collection(db, FIRESTORE_COLLECTIONS.CATEGORIES);
  const categoryCheck = await getDocs(categoriesRef);
  if (categoryCheck.empty) await replaceCollection(FIRESTORE_COLLECTIONS.CATEGORIES, defaults.categories);
  const albumsRef = collection(db, FIRESTORE_COLLECTIONS.ALBUMS);
  const albumCheck = await getDocs(albumsRef);
  if (albumCheck.empty) await replaceCollection(FIRESTORE_COLLECTIONS.ALBUMS, defaults.albums.map((album) => ({ ...album, published: true })));
}
