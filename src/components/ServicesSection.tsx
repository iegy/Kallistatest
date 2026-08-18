import React from 'react';
import { ArrowLeft, Sparkle, MessageCircle, Calendar } from 'lucide-react';
import { SiteContent, PortfolioCategory } from '../types';
import { veiledWeddingPhoto, veiledFashionPhoto, veiledFamilyPhoto } from '../services/storage';
import { useLanguage } from '../i18n';

interface ServicesSectionProps {
  content: SiteContent;
  categories: PortfolioCategory[];
  onSelectCategory: (categorySlug: string) => void;
  onInquire: (serviceType?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  content,
  categories,
  onSelectCategory,
  onInquire,
}) => {
  const { language, t } = useLanguage();
  const { services, servicesSettings, contact } = content;
  const globalShowPricing = servicesSettings?.showPricing ?? true;
  const hidePriceText = servicesSettings?.hidePriceCustomText || t('طلب عرض السعر', 'Request a quotation');
  const whatsappNumber = (contact?.whatsapp || '').replace(/[^0-9+]/g, '');

  // Fallback image mapper
  const getImageForCategory = (catSlug: string, customImg?: string) => {
    if (customImg) return customImg;
    if (catSlug === 'weddings') return veiledWeddingPhoto;
    if (catSlug === 'fashion') return veiledFashionPhoto;
    if (catSlug === 'children') return veiledFamilyPhoto;
    return veiledWeddingPhoto;
  };

  return (
    <section id="services" className="py-24 sm:py-32 bg-[#fffefb] relative border-t border-[#e6e1d6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="font-serif text-sm tracking-[0.25em] text-[#738262] uppercase block mb-3 font-semibold">
            {t('ما نوثقه ونحفظه', 'What We Preserve')}
          </span>
          <h2
            id="services-headline"
            className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] mb-4"
          >
            {t('ما نقوم بتوثيقه وحفظه لكم', 'Stories and moments we preserve')}
          </h2>
          <p className="text-[#524941] text-base sm:text-lg font-light">
            {t('باقات وجلسات تصوير فنية مخصصة تمنحكم أعمالاً تزداد قيمة ورونقاً مع مرور السنين.', 'Tailored photography experiences designed to become more meaningful with time.')}
          </p>
        </div>

        {/* Dynamic Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv) => {
            const isPriceVisible = globalShowPricing && (srv.showPrice !== false);
            const inquiryMessage = language === 'ar'
              ? `مرحباً استوديو كاليستا، أود الاستفسار عن باقات وأسعار جلسة: ${srv.titleAr}`
              : `Hello Kallista Studio, I would like to enquire about: ${srv.titleAr}`;
            const whatsappInquiryUrl = whatsappNumber
              ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(inquiryMessage)}`
              : `mailto:${contact.email}?subject=${encodeURIComponent(t('استفسار عن باقات Kallista', 'Kallista photography enquiry'))}&body=${encodeURIComponent(inquiryMessage)}`;

            return (
              <div
                key={srv.id}
                id={`service-card-${srv.id}`}
                className="bg-[#fffefb] rounded-3xl border border-[#e6e1d6] overflow-hidden flex flex-col justify-between hover:border-[#c6a585] transition-all duration-300 hover:shadow-xl group"
              >
                <div>
                  {/* Image Frame */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e6e1d6]">
                    <img
                      src={getImageForCategory(srv.categorySlug, srv.coverImage)}
                      alt={srv.titleAr}
                      draggable={false}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-serif font-medium bg-[#24211e]/80 text-[#fffefb] backdrop-blur-md">
                        {categories.find((category) => category.slug === srv.categorySlug)?.nameAr || srv.titleEn}
                      </span>
                    </div>
                    {srv.badge && (
                      <div className="absolute bottom-4 right-4 left-4">
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#e6e1d6]/95 text-[#24211e] backdrop-blur-sm">
                          {srv.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8 text-right space-y-4">
                    <h3 className="font-arabic-editorial text-2xl font-bold text-[#24211e]">
                      {srv.titleAr}
                    </h3>

                    <p className="text-[#594f45] text-sm leading-relaxed font-light">
                      {srv.descriptionAr}
                    </p>

                    {/* Pricing or WhatsApp inquiry block */}
                    {isPriceVisible && srv.priceStarting ? (
                      <div className="text-xs font-semibold text-[#8c6742] bg-[#f8f4ee] px-3.5 py-2 rounded-xl inline-block border border-[#e6ded3]">
                        {srv.priceStarting}
                      </div>
                    ) : (
                      <a
                        href={whatsappInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#4e633d] bg-[#738262]/15 hover:bg-[#738262]/25 px-3.5 py-2 rounded-xl border border-[#738262]/30 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-[#738262]" />
                        <span>{hidePriceText}</span>
                      </a>
                    )}

                    {srv.inclusions && srv.inclusions.length > 0 && (
                      <div className="pt-3 space-y-2 border-t border-[#e6e1d6]/60">
                        {srv.inclusions.map((feat, idx) => (
                          <div key={idx} className="flex items-center justify-start gap-2 text-xs text-[#524941]">
                            <span>{feat}</span>
                            <Sparkle className="w-3 h-3 text-[#c6a585] flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons in card footer */}
                <div className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-[#e6e1d6]/40 mt-4">
                  <button
                    onClick={() => onInquire(srv.categorySlug || srv.id)}
                    className="flex-1 bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#c6a585]" />
                    <span>{t('احجزوا هذه الجلسة', 'Book this session')}</span>
                  </button>

                  <button
                    onClick={() => onSelectCategory(srv.categorySlug || 'all')}
                    className="px-4 py-2.5 rounded-xl bg-[#e6e1d6]/50 hover:bg-[#e6e1d6] text-[#24211e] text-xs font-semibold flex items-center gap-1 transition-colors"
                    title={t('عرض الألبومات', 'View albums')}
                  >
                    <span>{t('الألبومات', 'Albums')}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
