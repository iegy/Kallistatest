import React, { useState } from 'react';
import { Send, Sparkles, CheckCircle2, Gift, ExternalLink } from 'lucide-react';
import { Booking, ClientContact, SiteSettings, SiteContent, PortfolioCategory } from '../types';
import { createBookingInquiryWhatsAppLink } from '../services/storage';
import { useLanguage } from '../i18n';

interface ContactAndBookingSectionProps {
  settings: SiteSettings;
  content: SiteContent;
  categories: PortfolioCategory[];
  onSaveBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>, clientData?: Partial<ClientContact>) => Promise<boolean>;
  preselectedService?: string;
}

export const ContactAndBookingSection: React.FC<ContactAndBookingSectionProps> = ({
  settings,
  content,
  categories,
  onSaveBooking,
  preselectedService,
}) => {
  const { language, t } = useLanguage();
  const { contact } = content;

  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    whatsapp: '',
    email: '',
    serviceType: preselectedService || 'weddings',
    date: '',
    timeSlot: '04:00 PM (Sunset Golden Hour)',
    location: t('الإسكندرية', 'Alexandria'),
    storyNotes: '',
    budget: '',
    birthday: '',
    weddingAnniversary: '',
    subscribeUpdates: true,
  });

  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.clientName.trim() ||
      !formData.phone.trim() ||
      !formData.whatsapp.trim() ||
      !formData.email.trim() ||
      !formData.date ||
      !formData.location.trim() ||
      !formData.storyNotes.trim()
    ) {
      alert(t('جميع الحقول المحددة بعلامة (*) إجبارية. يرجى استكمال كافة بيانات الحجز.', 'Please complete all required booking fields marked with (*).'));
      return;
    }

    const bookingPayload = {
      clientName: formData.clientName,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      serviceType: formData.serviceType as any,
      date: formData.date,
      timeSlot: formData.timeSlot,
      location: formData.location,
      storyNotes: formData.storyNotes,
      budget: formData.budget,
    };

    const clientPayload: Partial<ClientContact> = {
      name: formData.clientName,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      birthday: formData.birthday,
      weddingAnniversary: formData.weddingAnniversary,
      subscribeUpdates: formData.subscribeUpdates,
      serviceInterests: [formData.serviceType as any],
    };

    const saved = await onSaveBooking(bookingPayload, clientPayload);
    if (!saved) return;

    setSubmittedBooking({
      ...bookingPayload,
      id: 'temp-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSubmittedBooking(null);
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-[#fffefb] relative border-t border-[#e6e1d6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="font-serif text-sm tracking-[0.25em] text-[#738262] uppercase block mb-3 font-semibold">
            {t('17 — التواصل وطلب الحجز', '17 — Contact & Booking Inquiry')}
          </span>
          <p className="font-serif text-2xl sm:text-3xl text-[#c6a585] italic mb-2">
            {t('دعونا نوثّق شيئًا جميلًا.', "Let's preserve something beautiful.")}
          </p>
          <h2
            id="contact-main-headline"
            className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] mb-4"
          >
            {contact.title || 'دعونا نوثق معاً لحظة تستحق أن تبقى.'}
          </h2>
          <p
            id="contact-copy-text"
            className="text-[#524941] text-base sm:text-lg font-light leading-relaxed"
          >
            {contact.subtitle || 'سواء كان حفل زفافكم، جلسة عائلية دافئة، أو قصة خاصة تريدون الاحتفاظ بها، يسعدنا أن نعرف المزيد عنها لنصنع لكم تجربة استثنائية.'}
          </p>
        </div>

        {/* Booking Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Info & Direct Channels */}
          <div className="lg:col-span-5 text-right space-y-8 order-2 lg:order-1">
            <div className="bg-[#e6e1d6]/30 p-8 rounded-3xl border border-[#e6e1d6] space-y-6">
              <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e] flex items-center justify-end gap-2">
                <span>{t('تواصل مباشر وسريع', 'Direct contact')}</span>
                <Sparkles className="w-5 h-5 text-[#c6a585]" />
              </h3>
              
              <p className="text-[#594f45] text-sm leading-relaxed font-light">
                {t('نرحب بجميع استفساراتكم ومشاركتكم لتفاصيل مناسبتكم في أي وقت، ويسعدنا دائماً تقديم المشورة لاختيار أفضل وقت وإضاءة لجلسة التصوير.', 'Share your plans with us and we will help you choose the right service, setting and light for your session.')}
              </p>

              <div className="space-y-4 pt-2 border-t border-[#e6e1d6]">
                {contact.whatsapp && <a
                  href={`https://wa.me/${contact.whatsapp.replace(/[^0-9+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-[#fffefb] rounded-2xl border border-[#e6e1d6] hover:border-[#738262] hover:shadow-md transition-all group"
                >
                  <span className="text-xs px-3 py-1 bg-[#738262]/20 text-[#4e633d] rounded-full font-serif font-semibold">
                    {t('محادثة واتساب', 'WhatsApp chat')}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-[#73685d] block">{t('واتساب مباشر', 'WhatsApp')}</span>
                    <span className="text-sm font-semibold text-[#24211e] font-serif">
                      {contact.whatsapp}
                    </span>
                  </div>
                </a>}

                <div className="flex items-center justify-between p-4 bg-[#fffefb] rounded-2xl border border-[#e6e1d6]">
                  <span className="text-xs px-3 py-1 bg-[#e6e1d6] text-[#5e4f40] rounded-full font-serif">
                    {t('موقع الاستوديو', 'Studio location')}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-[#73685d] block">{t('المقر والمدينة', 'Studio location')}</span>
                    <span className="text-sm font-semibold text-[#24211e]">
                      {contact.address || 'الإسكندرية، مصر'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#fffefb] rounded-2xl border border-[#e6e1d6]">
                  <span className="text-xs px-3 py-1 bg-[#c6a585]/20 text-[#8c6742] rounded-full font-serif">
                    {t('البريد', 'Email')}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-[#73685d] block">{t('البريد الإلكتروني', 'Email')}</span>
                    <span className="text-sm font-semibold text-[#24211e] font-serif">
                      {contact.email || 'hello@kallistaphoto.com'}
                    </span>
                  </div>
                </div>
              </div>

              {contact.socialLinks && contact.socialLinks.filter((link) => link.label && link.url).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contact.socialLinks.filter((link) => link.label && link.url).map((link) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[#d8cfc4] bg-[#fffefb] px-3 py-2 text-xs font-semibold text-[#5a4f44] hover:border-[#c6a585]">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              {/* VIP Perks */}
              <div className="p-5 bg-[#738262]/15 rounded-2xl border border-[#738262]/30 text-right space-y-2">
                <div className="flex items-center justify-end gap-2 text-[#445636]">
                  <span className="font-bold text-xs font-arabic-editorial">{t('ميزة كاليستا لعملائنا الكرام', 'A thoughtful Kallista touch')}</span>
                  <Gift className="w-4 h-4 text-[#738262]" />
                </div>
                <p className="text-xs text-[#4e5e40] leading-relaxed">
                  {t('عند تسجيل تاريخ ميلادكم أو ذكرى زواجكم، نرسل لكم تهنئة خاصة وهدية خصم مميزة في شهر مناسبتكم السعيدة!', 'Optionally share a birthday or anniversary to receive a personal greeting and seasonal client gift.')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7 bg-[#fffefb] p-8 sm:p-10 rounded-3xl border border-[#e6e1d6] shadow-xl order-1 lg:order-2">
            {isSuccess && submittedBooking ? (
              <div className="text-center py-10 space-y-6">
                <div className="w-16 h-16 bg-[#738262]/20 text-[#4e633d] rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-arabic-editorial text-3xl font-bold text-[#24211e]">
                    {t('تم استلام طلب حجزكم بنجاح!', 'Your enquiry has been received')}
                  </h3>
                  <p className="text-[#524941] text-base font-light max-w-md mx-auto">
                    {t('شكراً لكم', 'Thank you')}{' '}<strong className="text-[#24211e]">{submittedBooking.clientName}</strong>. {t('سنراجع الموعد ونتواصل معكم فوراً لتأكيد كافة التفاصيل.', 'We will review the requested date and contact you to confirm the details.')}
                  </p>
                </div>

                {/* Optional email follow-up */}
                <div className="p-6 bg-[#e6e1d6]/30 rounded-2xl border border-[#c6a585]/40 text-right space-y-4">
                  <p className="text-xs font-bold text-[#24211e] flex items-center justify-end gap-1.5">
                    <span>{t('يمكنكم أيضاً إرسال نسخة من التفاصيل عبر الواتساب:', 'You can also send the booking details through WhatsApp:')}</span>
                    <Sparkles className="w-4 h-4 text-[#c6a585]" />
                  </p>
                  
                  <a
                    id="confirm-booking-email-btn"
                    href={createBookingInquiryWhatsAppLink(submittedBooking)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#738262] hover:bg-[#5f6c50] text-[#fffefb] py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Send className="w-5 h-5" />
                    <span>{t('إرسال تفاصيل الحجز', 'Send booking details')}</span>
                  </a>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-[#73685d] hover:text-[#24211e] underline"
                >
                  {t('إرسال طلب حجز آخر', 'Send another enquiry')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-right">
                
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-arabic-editorial text-lg font-bold text-[#24211e] border-b border-[#e6e1d6] pb-2">
                    {t('البيانات الشخصية والاتصال', 'Personal and contact details')}
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-[#403831] mb-1.5">{t('الاسم بالكامل / اسما العروسين *', 'Full name / couple names *')}</label>
                    <input type="text" required value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} placeholder={t('مثال: ياسمين وعمر', 'e.g. Jasmine & Omar')} className="w-full px-4 py-3 rounded-xl bg-[#e6e1d6]/30 border border-[#e6e1d6] focus:border-[#c6a585] focus:bg-[#fffefb] outline-none text-sm text-[#24211e]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#403831] mb-1.5">
                        {t('رقم الهاتف الأساسي *', 'Phone number *')}
                      </label>
                      <input
                        type="tel"
                        required
                        id="booking-phone-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="01012345678"
                        className="w-full px-4 py-3 rounded-xl bg-[#e6e1d6]/30 border border-[#e6e1d6] focus:border-[#c6a585] focus:bg-[#fffefb] outline-none text-sm text-[#24211e] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#403831] mb-1.5">
                        {t('رقم الواتساب للتواصل وتأكيد الحجز *', 'WhatsApp number *')}
                      </label>
                      <input
                        type="tel"
                        required
                        id="booking-whatsapp-input"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="01012345678"
                        className="w-full px-4 py-3 rounded-xl bg-[#e6e1d6]/30 border border-[#e6e1d6] focus:border-[#c6a585] focus:bg-[#fffefb] outline-none text-sm text-[#24211e] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#403831] mb-1.5">
                        {t('البريد الإلكتروني *', 'Email address *')}
                      </label>
                      <input
                        type="email"
                        required
                        id="booking-email-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#e6e1d6]/30 border border-[#e6e1d6] focus:border-[#c6a585] focus:bg-[#fffefb] outline-none text-sm text-[#24211e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#403831] mb-1.5">
                        {t('نوع الجلسة أو الباقة *', 'Session or service *')}
                      </label>
                      <select
                        id="booking-service-select"
                        required
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#e6e1d6]/30 border border-[#e6e1d6] focus:border-[#c6a585] focus:bg-[#fffefb] outline-none text-sm text-[#24211e]"
                      >
                        {categories.filter((c) => c.slug !== 'all' && c.active !== false).map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.nameAr}{language === 'ar' ? ` • ${cat.nameEn}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Session Date & Timing */}
                <div className="space-y-4 pt-2">
                  <h4 className="font-arabic-editorial text-lg font-bold text-[#24211e] border-b border-[#e6e1d6] pb-2">
                    {t('تاريخ المناسبة والمكان', 'Event details')}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#403831] mb-1.5">
                        {t('تاريخ المناسبة المفضل *', 'Preferred date *')}
                      </label>
                      <input
                        type="date"
                        required
                        id="booking-date-input"
                        value={formData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#e6e1d6]/30 border border-[#e6e1d6] focus:border-[#c6a585] focus:bg-[#fffefb] outline-none text-sm text-[#24211e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#403831] mb-1.5">
                        {t('التوقيت المفضل *', 'Preferred time *')}
                      </label>
                      <select
                        required
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#e6e1d6]/30 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-xs text-[#24211e]"
                      >
                        <option value="04:00 PM (Sunset Golden Hour)">{t('ساعة الغروب الذهبية (04:00 م)', 'Sunset golden hour (4:00 PM)')}</option>
                        <option value="11:00 AM (Morning Natural Light)">{t('الصباح والإضاءة الطبيعية (11:00 ص)', 'Morning natural light (11:00 AM)')}</option>
                        <option value="Full Wedding Day">{t('يوم الزفاف كاملاً', 'Full wedding day')}</option>
                        <option value="Custom Flexible">{t('توقيت مرن يتم تحديده لاحقاً', 'Flexible timing')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#403831] mb-1.5">
                        {t('مكان ومحافظة الجلسة *', 'Location *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder={t('الإسكندرية، الفندق، القاعة، إلخ', 'Alexandria, hotel, venue, etc.')}
                        className="w-full px-4 py-3 rounded-xl bg-[#e6e1d6]/30 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-sm text-[#24211e]"
                      />
                    </div>
                  </div>
                </div>

                {/* Tell us about your story */}
                <div>
                  <label className="block text-xs font-semibold text-[#403831] mb-1.5">
                    {t('أخبرونا عن حكايتكم وتفاصيل يومكم *', 'Tell us about your story and plans *')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    id="booking-story-input"
                    value={formData.storyNotes}
                    onChange={(e) => setFormData({ ...formData, storyNotes: e.target.value })}
                    placeholder={t('ما هي أكثر التفاصيل التي تتمنون توثيقها؟', 'What would you most like us to preserve? Share any important details or preferences.')}
                    className="w-full px-4 py-3 rounded-xl bg-[#e6e1d6]/30 border border-[#e6e1d6] focus:border-[#c6a585] focus:bg-[#fffefb] outline-none text-sm text-[#24211e]"
                  />
                </div>

                {/* Optional VIP CRM perks (Birthday and updates) */}
                <div className="p-4 bg-[#e6e1d6]/40 rounded-2xl border border-[#e6e1d6] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#24211e] flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-[#c6a585]" />
                      <span>{t('تنبيه المناسبات وأعياد الميلاد والهدايا الحصرية (اختياري)', 'Birthday and anniversary reminders (optional)')}</span>
                    </span>
                    <span className="text-[10px] text-[#73685d]">{t('خصومات وهدايا كاليستا', 'Client gifts')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#594f45] mb-1">
                        {t('تاريخ ميلادكم', 'Birthday')}
                      </label>
                      <input
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#fffefb] border border-[#e6e1d6] text-xs text-[#24211e] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#594f45] mb-1">
                        {t('تاريخ ذكرى الزواج', 'Wedding anniversary')}
                      </label>
                      <input
                        type="date"
                        value={formData.weddingAnniversary}
                        onChange={(e) => setFormData({ ...formData, weddingAnniversary: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#fffefb] border border-[#e6e1d6] text-xs text-[#24211e] outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-[#524940] cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.subscribeUpdates}
                      onChange={(e) => setFormData({ ...formData, subscribeUpdates: e.target.checked })}
                      className="rounded accent-[#c6a585]"
                    />
                    <span>{t('نود استلام تحديثات العروض الحصرية وجديد أعمال كاليستا', 'I would like to receive occasional Kallista updates')}</span>
                  </label>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="submit-inquiry-btn"
                    className="w-full bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] py-4 rounded-full text-base font-medium tracking-wide shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Send className="w-4 h-4 text-[#c6a585]" />
                    <span>{t('إرسال طلب الحجز', 'Send enquiry')}</span>
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
