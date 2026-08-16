import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle, Sparkles, User, MapPin } from 'lucide-react';
import { Review } from '../types';
import { useLanguage } from '../i18n';

interface TestimonialsSectionProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'createdAt' | 'approved'>) => Promise<boolean>;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  reviews,
  onAddReview,
}) => {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    service: 'weddings' as 'weddings' | 'children' | 'fashion' | 'portrait',
    rating: 5,
    comment: '',
    eventDate: '',
    clientLocation: t('الإسكندرية', 'Alexandria'),
  });
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const approvedReviews = reviews.filter((r) => r.approved);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.comment) return;

    const saved = await onAddReview({
      clientName: formData.clientName,
      service: formData.service,
      rating: formData.rating,
      comment: formData.comment,
      eventDate: formData.eventDate || t('مؤخراً', 'Recently'),
      clientLocation: formData.clientLocation,
    });

    if (!saved) return;

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowAddModal(false);
      setFormData({
        clientName: '',
        service: 'weddings',
        rating: 5,
        comment: '',
        eventDate: '',
        clientLocation: t('الإسكندرية', 'Alexandria'),
      });
    }, 1800);
  };

  return (
    <section id="reviews" className="py-24 sm:py-32 bg-[#fffefb] relative border-t border-[#e6e1d6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="text-right space-y-3">
            <span className="font-serif text-sm tracking-[0.25em] text-[#738262] uppercase block font-semibold">
              {t('15 — تجارب وكلمات ثقة', '15 — Testimonials & Words of Trust')}
            </span>
            <h2
              id="reviews-headline"
              className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e]"
            >
              {t('كلمات من عملاء وثقوا في كاليستا', 'Words from clients who trusted Kallista')}
            </h2>
            <p className="text-[#524941] text-base font-light">
              {t('تجارب حقيقية لعرائس، أزواج، وأسر شاركونا لحظاتهم المميزة ونقلوا إحساسهم بصدق.', 'Honest reflections from couples, families and clients who invited us into meaningful moments.')}
            </p>
          </div>

          <button
            id="open-add-review-btn"
            onClick={() => setShowAddModal(true)}
            className="self-start md:self-auto bg-[#e6e1d6] hover:bg-[#c6a585] hover:text-white text-[#24211e] px-6 py-3 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 flex items-center gap-2 shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{t('شاركونا تجربتكم ورأيكم', 'Share your experience')}</span>
          </button>
        </div>

        {/* Reviews Grid */}
        {approvedReviews.length === 0 ? (
          <div className="p-12 text-center bg-[#e6e1d6]/30 rounded-3xl border border-[#e6e1d6]">
            <p className="text-[#524941] font-arabic-editorial text-lg">
              {t('سيتم نشر آراء العملاء وتجاربهم هنا قريباً.', 'Client stories and reviews will appear here soon.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {approvedReviews.map((rev) => (
              <div
                key={rev.id}
                id={`review-card-${rev.id}`}
                className="bg-[#fffefb] p-8 rounded-2xl border border-[#e6e1d6] flex flex-col justify-between hover:border-[#c6a585] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(198,165,133,0.12)] text-right space-y-6"
              >
                <div className="space-y-4">
                  {/* Rating stars & Service */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#c6a585]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#e6e1d6] text-[#5e4e3e] font-serif">
                      {rev.service === 'weddings' ? t('تصوير زفاف', 'Wedding') : rev.service === 'children' ? t('تصوير أطفال وعائلة', 'Family') : t('تصوير أزياء', 'Fashion')}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-[#403831] text-sm sm:text-base leading-relaxed font-light font-arabic-editorial">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Client info footer */}
                <div className="pt-4 border-t border-[#e6e1d6]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#738262]/20 text-[#4e633d] flex items-center justify-center font-bold text-xs">
                      {rev.clientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-arabic-editorial font-bold text-sm text-[#24211e]">
                        {rev.clientName}
                      </h4>
                      {rev.clientLocation && (
                        <span className="text-[11px] text-[#73685d] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#c6a585]" />
                          {rev.clientLocation}
                        </span>
                      )}
                    </div>
                  </div>

                  {rev.eventDate && (
                    <span className="text-[11px] text-[#8c7f73] font-serif">
                      {rev.eventDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Add Review Dialog Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24211e]/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[#fffefb] w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-[#e6e1d6] shadow-2xl text-right animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {submittedSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-14 h-14 text-[#738262] mx-auto animate-bounce" />
                <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e]">
                  {t('شكراً لمشاركتنا تجربتكم ورأيكم الغالي!', 'Thank you for sharing your experience')}
                </h3>
                <p className="text-[#524941] text-sm font-light">
                  {t('تم استلام تقييمكم وسينشر في الموقع بعد المراجعة.', 'Your review has been received and will appear after approval.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e6e1d6] pb-4">
                  <h3 className="font-arabic-editorial text-xl font-bold text-[#24211e]">
                    {t('إضافة تقييم ورأي عن تجربتكم مع كاليستا', 'Review your Kallista experience')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-[#73685d] hover:text-[#24211e] text-sm"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#403831] mb-1">
                    {t('الاسم الكريم / اسما العروسين *', 'Name / couple names *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder={t('مثال: ياسمين وعمر', 'e.g. Jasmine & Omar')}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] focus:bg-[#fffefb] outline-none text-sm text-[#24211e]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#403831] mb-1">
                      {t('نوع الجلسة', 'Session type')}
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value as any })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-xs text-[#24211e]"
                    >
                      <option value="weddings">{t('تصوير زفاف للعروسين', 'Wedding')}</option>
                      <option value="children">{t('تصوير أطفال وعائلة', 'Children & Family')}</option>
                      <option value="fashion">{t('تصوير أزياء', 'Fashion')}</option>
                      <option value="portrait">{t('بورتريه شخصي', 'Portrait')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#403831] mb-1">
                      {t('التقييم (النجوم)', 'Rating')}
                    </label>
                    <div className="flex items-center gap-1.5 pt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= formData.rating
                                ? 'text-[#c6a585] fill-current'
                                : 'text-[#e6e1d6]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#403831] mb-1">
                    {t('المدينة / المحافظة', 'City')}
                  </label>
                  <input
                    type="text"
                    value={formData.clientLocation}
                    onChange={(e) => setFormData({ ...formData, clientLocation: e.target.value })}
                    placeholder={t('الإسكندرية، القاهرة، إلخ', 'Alexandria, Cairo, etc.')}
                    className="w-full px-4 py-2 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] outline-none text-xs text-[#24211e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#403831] mb-1">
                    {t('رأيكم وتجربتكم بالتفصيل *', 'Tell us about your experience *')}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder={t('كيف كانت تجربة التصوير والنتيجة النهائية؟', 'How did the session feel, and what did you think of the final photographs?')}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#e6e1d6]/40 border border-[#e6e1d6] focus:border-[#c6a585] focus:bg-[#fffefb] outline-none text-sm text-[#24211e]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] py-3 rounded-xl text-sm font-medium tracking-wide shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#c6a585]" />
                    <span>{t('إرسال التقييم', 'Submit review')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
