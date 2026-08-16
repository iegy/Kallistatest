import React, { useState } from 'react';
import { X, Calendar, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { Booking, ClientContact, SiteSettings } from '../types';
import { createBookingInquiryWhatsAppLink } from '../services/storage';
import { EGYPT_GOVERNORATES } from '../data/egyptGovernorates';
import { useLanguage } from '../i18n';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  preselectedService?: string;
  onSaveBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>, clientData?: Partial<ClientContact>) => Promise<boolean>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  settings,
  preselectedService,
  onSaveBooking,
}) => {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    whatsapp: '',
    email: '',
    serviceType: preselectedService || 'weddings',
    date: '',
    timeSlot: '04:00 PM (Golden Hour)',
    location: t('الإسكندرية', 'Alexandria'),
    governorate: '',
    city: '',
    storyNotes: '',
    birthday: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.clientName.trim() ||
      !formData.phone.trim() ||
      !formData.whatsapp.trim() ||
      !formData.email.trim() ||
      !formData.date ||
      !formData.location.trim() ||
      !formData.governorate ||
      !formData.city.trim() ||
      !formData.storyNotes.trim()
    ) {
      alert(t('يرجى استكمال جميع بيانات الحجز المطلوبة.', 'Please complete all required booking details.'));
      return;
    }

    const payload = {
      clientName: formData.clientName,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      serviceType: formData.serviceType as any,
      date: formData.date,
      timeSlot: formData.timeSlot,
      location: formData.location,
      governorate: formData.governorate,
      city: formData.city,
      storyNotes: formData.storyNotes,
    };

    const saved = await onSaveBooking(payload, {
      name: formData.clientName,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      birthday: formData.birthday,
      governorate: formData.governorate,
      city: formData.city,
      serviceInterests: [formData.serviceType as any],
    });

    if (!saved) return;

    setCreatedBooking({
      ...payload,
      id: 'modal-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    setIsSuccess(true);
  };

  return (
    <div
      id="quick-booking-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24211e]/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#fffefb] w-full max-w-lg rounded-3xl border border-[#e6e1d6] shadow-2xl p-6 sm:p-8 text-right animate-in zoom-in-95 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e6e1d6] pb-4 mb-6">
          <div>
            <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e]">
              {t('احجزوا موعدكم مع كاليستا', 'Book a session with Kallista')}
            </h3>
            <p className="text-xs text-[#7d7266] font-serif">
              {t('طلب وحجز جلسة تصوير', 'Enquire & book a photography session')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#e6e1d6]/70 hover:bg-[#e6e1d6] text-[#24211e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess && createdBooking ? (
          <div className="text-center py-8 space-y-5">
            <CheckCircle2 className="w-14 h-14 text-[#738262] mx-auto animate-bounce" />
            <h4 className="font-arabic-editorial text-2xl font-bold text-[#24211e]">
              {t('تم تسجيل طلب الحجز بنجاح!', 'Your enquiry has been received')}
            </h4>
            <p className="text-xs text-[#594f45] leading-relaxed">
              {t('سنتواصل معكم في أقرب وقت لتأكيد الموعد وكافة التفاصيل.', 'We will contact you shortly to confirm the date and details.')}
            </p>

            <a
              href={createBookingInquiryWhatsAppLink(createdBooking)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#738262] hover:bg-[#5e6b50] text-[#fffefb] py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{t('إرسال نسخة من التفاصيل', 'Send a copy of the details')}</span>
            </a>

            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="text-xs text-[#7d7266] hover:text-[#24211e] underline"
            >
              {t('إغلاق النافذة', 'Close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#403831] mb-1">
                {t('الاسم بالكامل / اسم العروسين *', 'Full name / couple names *')}
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder={t('مثال: ياسمين وعمر', 'e.g. Jasmine & Omar')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-sm text-[#24211e]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#403831] mb-1">
                  {t('رقم الهاتف *', 'Phone number *')}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-sm text-[#24211e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#403831] mb-1">
                  {t('رقم الواتساب *', 'WhatsApp number *')}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="01012345678"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-sm text-[#24211e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#403831] mb-1">
                  {t('البريد الإلكتروني *', 'Email address *')}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="yourname@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-sm text-[#24211e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#403831] mb-1">
                  {t('نوع الجلسة *', 'Session type *')}
                </label>
                <select
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-xs text-[#24211e]"
                >
                  <option value="weddings">{t('زفاف', 'Wedding')}</option>
                  <option value="children">{t('أطفال وعائلة', 'Children & Family')}</option>
                  <option value="fashion">{t('أزياء', 'Fashion')}</option>
                  <option value="other">{t('جلسة خاصة', 'Other')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#403831] mb-1">
                  {t('تاريخ المناسبة *', 'Event date *')}
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-xs text-[#24211e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#403831] mb-1">
                  {t('مكان الجلسة *', 'Venue *')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={t('الفندق أو القاعة أو المكان', 'Hotel, venue or place')}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-xs text-[#24211e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#403831] mb-1">
                  {t('المحافظة *', 'Governorate *')}
                </label>
                <select
                  required
                  value={formData.governorate}
                  onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-xs text-[#24211e]"
                >
                  <option value="" disabled>{t('اختاروا المحافظة', 'Select governorate')}</option>
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov.value} value={gov.value}>{language === 'ar' ? gov.ar : gov.en}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#403831] mb-1">
                  {t('المركز أو المدينة *', 'City / Markaz *')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={t('مثال: سموحة', 'e.g. Smouha')}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-xs text-[#24211e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#403831] mb-1">
                {t('تفاصيل ورؤيتكم للجلسة *', 'Tell us about your vision *')}
              </label>
              <textarea
                rows={3}
                required
                value={formData.storyNotes}
                onChange={(e) => setFormData({ ...formData, storyNotes: e.target.value })}
                placeholder={t('أخبرونا عن تفاصيل يومكم وتطلعاتكم الخاصة...', 'Share the important details and what you hope to preserve...')}
                className="w-full px-4 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-sm text-[#24211e]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] py-3.5 rounded-full text-sm font-semibold tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#c6a585]" />
                <span>{t('إرسال طلب الحجز', 'Send enquiry')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
