import React, { FormEvent, useState } from 'react';
import { Loader2, LogIn, UserPlus, X } from 'lucide-react';
import {
  loginWithFirebase,
  loginWithGoogle,
  registerWithFirebase,
  resetFirebasePassword,
} from '../services/firebase';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
    if (!email.trim()) return setError('اكتب بريدك الإلكتروني أولاً.');
    setLoading(true);
    setError('');
    const result = await resetFirebasePassword(email.trim());
    setLoading(false);
    if (!result.success) return setError(result.error);
    setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4" dir="rtl">
      <div className="relative w-full max-w-md rounded-3xl bg-[#fffefb] p-6 shadow-2xl sm:p-8">
        <button onClick={onClose} className="absolute left-5 top-5 rounded-full p-2 hover:bg-[#efe9e0]" aria-label="إغلاق">
          <X className="h-5 w-5" />
        </button>
        <p className="mb-2 text-xs tracking-[0.25em] text-[#936942]">KALLISTA ACCOUNT</p>
        <h2 className="text-2xl font-semibold text-[#1a1715]">{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}</h2>
        <p className="mt-2 text-sm leading-6 text-[#6c635b]">الحساب يحمي بيانات الحجز ويتيح متابعة الطلبات والتقييمات.</p>

        <button onClick={google} disabled={loading} className="mt-6 w-full rounded-xl border border-[#d8cdbf] bg-white px-4 py-3 font-medium hover:bg-[#faf7f2] disabled:opacity-60">
          المتابعة باستخدام Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-[#9b9188]"><span className="h-px flex-1 bg-[#e8e1d7]" /><span>أو</span><span className="h-px flex-1 bg-[#e8e1d7]" /></div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="الاسم" className="w-full rounded-xl border border-[#ded5c7] bg-white px-4 py-3 outline-none focus:border-[#936942]" />
          )}
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="البريد الإلكتروني" className="w-full rounded-xl border border-[#ded5c7] bg-white px-4 py-3 outline-none focus:border-[#936942]" />
          <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="كلمة المرور" className="w-full rounded-xl border border-[#ded5c7] bg-white px-4 py-3 outline-none focus:border-[#936942]" />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1715] px-4 py-3 text-white disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === 'login' ? 'دخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-[#755130] underline-offset-4 hover:underline">
            {mode === 'login' ? 'إنشاء حساب جديد' : 'لدي حساب بالفعل'}
          </button>
          {mode === 'login' && <button onClick={reset} className="text-[#6c635b] hover:text-[#1a1715]">نسيت كلمة المرور؟</button>}
        </div>
      </div>
    </div>
  );
};
