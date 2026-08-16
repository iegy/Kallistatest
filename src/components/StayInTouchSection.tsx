import React, { useState } from 'react';
import { CalendarHeart, CheckCircle2, Gift, MapPin, Send, Sparkles } from 'lucide-react';
import { PortfolioCategory } from '../types';
import { EGYPT_GOVERNORATES } from '../data/egyptGovernorates';
import { useLanguage } from '../i18n';

interface StayInTouchSectionProps {
  categories: PortfolioCategory[];
  onSaveLead: (lead: {
    name: string; phone: string; whatsapp?: string; email: string;
    birthday?: string; governorate?: string; city?: string;
    serviceInterests?: string[]; notes?: string;
  }) => Promise<boolean>;
}

/**
 * "Stay in touch" — lead capture for visitors who are not booking today.
 *
 * No account required and no booking needed: the point is to build the contact
 * list the studio uses to send birthday wishes and seasonal-occasion greetings,
 * so an enquiry that isn't ready yet is never lost.
 */
export const StayInTouchSection: React.FC<StayInTouchSectionProps> = ({ categories, onSaveLead }) => {
  const { language, t } = useLanguage();
  const isArabic = language === 'ar';

  const [form, setForm] = useState({
    name: '',
    birthday: '',
    governorate: '',
    city: '',
    phone: '',
    email: '',
    interest: '',
    consent: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState('');

  // Egyptian mobile format: 01 + (0|1|2|5) + 8 digits.
  const EGYPT_MOBILE = /^01[0125][0-9]{8}$/;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.birthday || !form.governorate || !form.city.trim() || !form.phone.trim() || !form.email.trim()) {
      setError(t('من فضلكم أكملوا كل الحقول المطلوبة.', 'Please complete every required field.'));
      return;
    }
    if (!EGYPT_MOBILE.test(form.phone.replace(/[\s-]/g, ''))) {
      setError(t('رقم الموبايل غير صحيح — يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 وأن يتكوّن من 11 رقمًا.', 'Please enter a valid Egyptian mobile number (e.g. 01012345678).'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError(t('البريد الإلكتروني غير صحيح.', 'Please enter a valid email address.'));
      return;
    }
    if (!form.consent) {
      setError(t('من فضلكم وافقوا على استقبال التهاني والعروض.', 'Please agree to receive greetings and offers.'));
      return;
    }

    setIsSaving(true);
    const saved = await onSaveLead({
      name: form.name.trim(),
      phone: form.phone.replace(/[\s-]/g, ''),
      email: form.email.trim(),
      birthday: form.birthday,
      governorate: form.governorate,
      city: form.city.trim(),
      serviceInterests: form.interest ? [form.interest] : [],
    });
    setIsSaving(false);
    if (saved) setIsDone(true);
  };

  const fieldClass =
    'w-full px-4 py-3 rounded-xl bg-[#fffefb] border border-[#e6e1d6] focus:border-[#c6a585] focus:ring-2 focus:ring-[#c6a585]/20 outline-none text-sm text-[#24211e] transition-all';
  const labelClass = 'block text-xs font-semibold text-[#403831] mb-1.5';

  return (
    <section id="stay-in-touch" className="py-24 sm:py-32 relative border-t border-[#e6e1d6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Editorial side — why this exists */}
          <div className="lg:col-span-5 text-start">
            <span className="font-serif text-sm tracking-[0.25em] text-[#738262] uppercase block mb-3 font-semibold">
              {t('ابقوا على تواصل', 'Stay in touch')}
            </span>
            <h2 className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] mb-5 leading-tight">
              {t('لم تقرّروا الحجز بعد؟ لا بأس.', 'Not ready to book yet? That is perfectly fine.')}
            </h2>
            <p className="text-[#524941] text-base sm:text-lg font-light leading-relaxed mb-8">
              {t(
                'اتركوا بياناتكم وسنتذكّركم في المناسبات التي تستحق أن يُحتفى بها — عيد ميلادكم، ومناسباتنا الإسلامية الجميلة — مع عروض خاصة لعائلة كاليستا وحدها.',
                'Leave your details and we will remember you on the occasions worth celebrating — your birthday and the Islamic holidays — along with offers reserved for the Kallista family.'
              )}
            </p>

            <ul className="space-y-4">
              {[
                { icon: Gift, title: t('هدية عيد الميلاد', 'A birthday gift'), body: t('خصم خاص في شهر عيد ميلادكم.', 'A private discount during your birthday month.') },
                { icon: CalendarHeart, title: t('تهاني المناسبات', 'Seasonal greetings'), body: t('تهنئة في رمضان وعيد الفطر وعيد الأضحى.', 'Warm wishes for Ramadan, Eid al-Fitr and Eid al-Adha.') },
                { icon: Sparkles, title: t('أولوية المواعيد', 'First access'), body: t('إشعار مبكر بالمواعيد المتاحة والعروض الموسمية.', 'Early notice of open dates and seasonal offers.') },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="shrink-0 w-11 h-11 rounded-full bg-[#afbb9c]/25 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#738262]" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[#24211e]">{item.title}</span>
                    <span className="block text-sm text-[#6c6258] font-light">{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs text-[#8a8075] font-light leading-relaxed border-s-2 border-[#c6a585]/40 ps-4">
              {t(
                'بياناتكم محفوظة بخصوصية تامة، ولا تُشارك مع أي طرف آخر، ويمكنكم طلب إزالتها في أي وقت.',
                'Your details stay private, are never shared with anyone else, and can be removed on request at any time.'
              )}
            </p>
          </div>

          {/* Form side */}
          <div className="lg:col-span-7">
            <div className="bg-[#e6e1d6]/40 border border-[#e6e1d6] rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-30px_rgba(36,33,30,0.35)]">
              {isDone ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-[#afbb9c]/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-[#738262]" />
                  </div>
                  <h3 className="font-arabic-editorial text-2xl sm:text-3xl font-bold text-[#24211e] mb-3">
                    {t('أهلاً بكم في عائلة كاليستا', 'Welcome to the Kallista family')}
                  </h3>
                  <p className="text-[#524941] font-light mb-8 max-w-md mx-auto leading-relaxed">
                    {t(
                      'تم حفظ بياناتكم بنجاح. سنتذكّركم في عيد ميلادكم وفي المناسبات الجميلة بإذن الله.',
                      'Your details are saved. We will be in touch on your birthday and on the occasions that matter.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDone(false);
                      setForm({ name: '', birthday: '', governorate: '', city: '', phone: '', email: '', interest: '', consent: true });
                    }}
                    className="text-xs text-[#73685d] hover:text-[#24211e] underline"
                  >
                    {t('تسجيل بيانات شخص آخر', 'Add someone else')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 text-start">
                  <h3 className="font-arabic-editorial text-xl sm:text-2xl font-bold text-[#24211e] border-b border-[#c6a585]/30 pb-3">
                    {t('سجّلوا بياناتكم', 'Leave your details')}
                  </h3>

                  <div>
                    <label htmlFor="sit-name" className={labelClass}>{t('الاسم بالكامل *', 'Full name *')}</label>
                    <input id="sit-name" type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t('مثال: نور عبد الله', 'e.g. Sara Ahmed')} className={fieldClass} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sit-birthday" className={labelClass}>{t('تاريخ الميلاد *', 'Date of birth *')}</label>
                      <input id="sit-birthday" type="date" required value={form.birthday}
                        onChange={(e) => setForm({ ...form, birthday: e.target.value })} className={fieldClass} />
                    </div>
                    <div>
                      <label htmlFor="sit-phone" className={labelClass}>{t('رقم الموبايل *', 'Mobile number *')}</label>
                      <input id="sit-phone" type="tel" required value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="01012345678" className={fieldClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sit-governorate" className={labelClass}>
                        <MapPin className="w-3.5 h-3.5 inline-block align-[-2px] me-1 text-[#c6a585]" />
                        {t('المحافظة *', 'Governorate *')}
                      </label>
                      <select id="sit-governorate" required value={form.governorate}
                        onChange={(e) => setForm({ ...form, governorate: e.target.value })} className={fieldClass}>
                        <option value="" disabled>{t('اختاروا المحافظة', 'Select your governorate')}</option>
                        {EGYPT_GOVERNORATES.map((gov) => (
                          <option key={gov.value} value={gov.value}>{isArabic ? gov.ar : gov.en}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="sit-city" className={labelClass}>{t('المركز أو المدينة *', 'City / Markaz *')}</label>
                      <input id="sit-city" type="text" required value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder={t('مثال: سموحة', 'e.g. Smouha')} className={fieldClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sit-email" className={labelClass}>{t('البريد الإلكتروني *', 'Email address *')}</label>
                      <input id="sit-email" type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="yourname@example.com" className={fieldClass} />
                    </div>
                    <div>
                      <label htmlFor="sit-interest" className={labelClass}>{t('الخدمة التي تهمكم (اختياري)', 'Service of interest (optional)')}</label>
                      <select id="sit-interest" value={form.interest}
                        onChange={(e) => setForm({ ...form, interest: e.target.value })} className={fieldClass}>
                        <option value="">{t('لم أقرر بعد', 'Not sure yet')}</option>
                        {categories.filter((c) => c.slug !== 'all' && c.active !== false).map((cat) => (
                          <option key={cat.id} value={cat.slug}>{isArabic ? cat.nameAr : (cat.nameEn || cat.nameAr)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer pt-1">
                    <input type="checkbox" checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                      className="mt-1 w-4 h-4 accent-[#738262] shrink-0" />
                    <span className="text-xs text-[#524941] font-light leading-relaxed">
                      {t(
                        'أوافق على أن تتواصل معي كاليستا عبر الواتساب أو البريد الإلكتروني للتهنئة في المناسبات ومشاركة العروض الخاصة.',
                        'I agree that Kallista may contact me by WhatsApp or email with occasion greetings and private offers.'
                      )}
                    </span>
                  </label>

                  {error && (
                    <p role="alert" className="text-sm text-[#a4553f] bg-[#a4553f]/10 border border-[#a4553f]/25 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={isSaving}
                    className="w-full bg-[#24211e] hover:bg-[#3c3630] disabled:opacity-60 disabled:cursor-not-allowed text-[#fffefb] py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all">
                    <Send className="w-4 h-4" />
                    <span>{isSaving ? t('جارٍ الحفظ...', 'Saving...') : t('سجّلوني في عائلة كاليستا', 'Keep me in the Kallista family')}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
