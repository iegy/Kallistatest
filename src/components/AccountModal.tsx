import React, { FormEvent, useState } from 'react';
import type { User } from 'firebase/auth';
import { Loader2, LogIn, LogOut, UserPlus, UserRound, X } from 'lucide-react';
import {
  loginWithFirebase,
  loginWithGoogle,
  registerWithFirebase,
  resetFirebasePassword,
} from '../services/firebase';
import { useLanguage } from '../i18n';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => Promise<void>;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, user, onLogout }) => {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  if (user) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="relative w-full max-w-md rounded-3xl bg-[#fffefb] p-6 text-center shadow-2xl sm:p-8">
          <button onClick={onClose} className="absolute left-5 top-5 rounded-full p-2 hover:bg-[#efe9e0]" aria-label={t('إغلاق', 'Close')}>
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#efe9e0] text-[#755130]">
            <UserRound className="h-8 w-8" />
          </div>
          <p className="text-xs tracking-[0.25em] text-[#936942]">KALLISTA ACCOUNT</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1a1715]">{user.displayName || t('حسابي', 'My account')}</h2>
          <p className="mt-2 text-sm text-[#6c635b]">{user.email}</p>
          <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{t('تم تسجيل الدخول بنجاح، ويمكنك الآن إرسال الحجوزات والتقييمات.', 'You are signed in and can now submit bookings and reviews.')}</p>
          <button
            onClick={async () => { await onLogout(); onClose(); }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {t('تسجيل الخروج', 'Sign out')}
          </button>
        </div>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = mode === 'login'
      ? await loginWithFirebase(email.trim(), password)
      : await registerWithFirebase(email.trim(), password, name);
    setLoading(false);
    if (!result.success) return setError(result.error);
    onClose();
  };

  const google = async () => {
    setLoading(true);
    setError('');
    const result = await loginWithGoogle();
    setLoading(false);
    if (!result.success) return setError(result.error);
    onClose();
  };

  const reset = async () => {
    if (!email.trim()) return setError(t('اكتب بريدك الإلكتروني أولاً.', 'Enter your email address first.'));
    setLoading(true);
    setError('');
    const result = await resetFirebasePassword(email.trim());
    setLoading(false);
    if (!result.success) return setError(result.error);
    setMessage(t('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.', 'A password reset link has been sent to your email.'));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-md rounded-3xl bg-[#fffefb] p-6 shadow-2xl sm:p-8">
        <button onClick={onClose} className="absolute left-5 top-5 rounded-full p-2 hover:bg-[#efe9e0]" aria-label={t('إغلاق', 'Close')}>
          <X className="h-5 w-5" />
        </button>
        <p className="mb-2 text-xs tracking-[0.25em] text-[#936942]">KALLISTA ACCOUNT</p>
        <h2 className="text-2xl font-semibold text-[#1a1715]">{mode === 'login' ? t('تسجيل الدخول', 'Sign in') : t('إنشاء حساب', 'Create an account')}</h2>
        <p className="mt-2 text-sm leading-6 text-[#6c635b]">{t('الحساب يحمي بيانات الحجز ويتيح متابعة الطلبات والتقييمات.', 'Your account protects booking details and keeps your activity connected.')}</p>

        <button onClick={google} disabled={loading} className="mt-6 w-full rounded-xl border border-[#d8cdbf] bg-white px-4 py-3 font-medium hover:bg-[#faf7f2] disabled:opacity-60">
          {t('المتابعة باستخدام Google', 'Continue with Google')}
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-[#9b9188]"><span className="h-px flex-1 bg-[#e8e1d7]" /><span>{t('أو', 'or')}</span><span className="h-px flex-1 bg-[#e8e1d7]" /></div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input required value={name} onChange={(event) => setName(event.target.value)} placeholder={t('الاسم', 'Name')} className="w-full rounded-xl border border-[#ded5c7] bg-white px-4 py-3 outline-none focus:border-[#936942]" />
          )}
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('البريد الإلكتروني', 'Email address')} className="w-full rounded-xl border border-[#ded5c7] bg-white px-4 py-3 outline-none focus:border-[#936942]" />
          <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('كلمة المرور', 'Password')} className="w-full rounded-xl border border-[#ded5c7] bg-white px-4 py-3 outline-none focus:border-[#936942]" />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1715] px-4 py-3 text-white disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === 'login' ? t('دخول', 'Sign in') : t('إنشاء الحساب', 'Create account')}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-[#755130] underline-offset-4 hover:underline">
            {mode === 'login' ? t('إنشاء حساب جديد', 'Create a new account') : t('لدي حساب بالفعل', 'I already have an account')}
          </button>
          {mode === 'login' && <button onClick={reset} className="text-[#6c635b] hover:text-[#1a1715]">{t('نسيت كلمة المرور؟', 'Forgot password?')}</button>}
        </div>
      </div>
    </div>
  );
};
