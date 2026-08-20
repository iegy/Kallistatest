import React, { useState } from 'react';
import { ArrowLeft, Sparkle, MessageCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const globalShowPricing = servicesSettings?.showPricing ?? true;
  const hidePriceText = servicesSettings?.hidePriceCustomText || t('طلب عرض السعر', 'Request a quotation');
  const whatsappNumber = (contact?.whatsapp || '').replace(/[^0-9+]/g, '');

  const getImageForCategory = (catSlug: string, customImg?: string) => {
    if (customImg) return customImg;
    if (catSlug === 'weddings') return veiledWeddingPhoto;
    if (catSlug === 'fashion') return veiledFashionPhoto;
    if (catSlug === 'children') return veiledFamilyPhoto;
    return veiledWeddingPhoto;
  };

  return (
    <section id="services" className="relative border-t border-[#e6e1d6] bg-[#fffefb] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8 xl:px-10">

        {/* Compact section header — duplicate small eyebrow intentionally removed */}
        <div className="mx-auto mb-8 max-w-4xl text-center sm:mb-10 lg:mb-12">
          <h2
            id="services-headline"
            className="mb-3 font-arabic-editorial text-3xl font-bold leading-tight text-[#24211e] sm:text-4xl lg:text-5xl"
          >
            {t('ما نقوم بتوثيقه وحفظه لكم', 'Stories and moments we preserve')}
          </h2>
          <p className="mx-auto max-w-3xl text-sm font-light leading-7 text-[#524941] sm:text-base lg:text-lg">
            {t('باقات وجلسات تصوير فنية مخصصة تمنحكم أعمالاً تزداد قيمة ورونقاً مع مرور السنين.', 'Tailored photography experiences designed to become more meaningful with time.')}
          </p>
        </div>

        {/* Wider, tighter service grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:gap-6">
          {services.map((srv) => {
            const isPriceVisible = globalShowPricing && (srv.showPrice !== false);
            const isExpanded = expandedServiceId === srv.id;
            const visibleInclusions = srv.inclusions?.slice(0, 2) || [];
            const extraInclusions = srv.inclusions?.slice(2) || [];
            const hasMore = extraInclusions.length > 0;

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
                className="group flex flex-col overflow-hidden rounded-3xl border border-[#e6e1d6] bg-[#fffefb] transition-all duration-300 hover:border-[#c6a585] hover:shadow-xl"
              >
                <div>
                  {/* Shorter visual frame keeps cards compact */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#e6e1d6]">
                    <img
                      src={getImageForCategory(srv.categorySlug, srv.coverImage)}
                      alt={srv.titleAr}
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute right-4 top-4">
                      <span className="rounded-full bg-[#24211e]/80 px-3 py-1 font-serif text-xs font-medium text-[#fffefb] backdrop-blur-md">
                        {categories.find((category) => category.slug === srv.categorySlug)?.nameAr || srv.titleEn}
                      </span>
                    </div>
                    {srv.badge && (
                      <div className="absolute bottom-4 right-4 left-4">
                        <span className="inline-block rounded-full bg-[#e6e1d6]/95 px-3 py-1 text-[11px] font-semibold text-[#24211e] backdrop-blur-sm">
                          {srv.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-5 text-right sm:p-6">
                    <h3 className="font-arabic-editorial text-xl font-bold leading-snug text-[#24211e] sm:text-2xl">
                      {srv.titleAr}
                    </h3>

                    <p className="text-sm font-light leading-relaxed text-[#594f45]">
                      {srv.descriptionAr}
                    </p>

                    {isPriceVisible && srv.priceStarting ? (
                      <div className="inline-block rounded-xl border border-[#e6ded3] bg-[#f8f4ee] px-3.5 py-2 text-xs font-semibold text-[#8c6742]">
                        {srv.priceStarting}
                      </div>
                    ) : (
                      <a
                        href={whatsappInquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#738262] bg-[#738262] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#657654]"
                      >
                        <MessageCircle className="h-4 w-4 text-white" />
                        <span>{hidePriceText}</span>
                      </a>
                    )}

                    {srv.inclusions && srv.inclusions.length > 0 && (
                      <div className="border-t border-[#e6e1d6]/60 pt-3">
                        <div className="space-y-2">
                          {visibleInclusions.map((feat, idx) => (
                            <div key={`visible-${idx}`} className="flex items-start justify-start gap-2 text-xs leading-5 text-[#524941]">
                              <span className="flex-1">{feat}</span>
                              <Sparkle className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#c6a585]" />
                            </div>
                          ))}
                        </div>

                        {hasMore && (
                          <>
                            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                              <div className="overflow-hidden">
                                <div className="space-y-2 pt-2">
                                  {extraInclusions.map((feat, idx) => (
                                    <div key={`extra-${idx}`} className="flex items-start justify-start gap-2 text-xs leading-5 text-[#524941]">
                                      <span className="flex-1">{feat}</span>
                                      <Sparkle className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#c6a585]" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setExpandedServiceId(isExpanded ? null : srv.id)}
                              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#c6a585]/45 bg-[#fffefb]/75 px-3.5 py-2 text-[11px] font-bold text-[#594f45] shadow-sm backdrop-blur-md transition-all hover:border-[#c6a585] hover:bg-[#e6e1d6]/35"
                              aria-expanded={isExpanded}
                            >
                              <span>{isExpanded ? t('إخفاء التفاصيل', 'Hide details') : t('عرض كل المميزات', 'Show all features')}</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer actions always remain visible */}
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e6e1d6]/60 p-5 pt-4 sm:p-6 sm:pt-4">
                  <button
                    onClick={() => onInquire(srv.categorySlug || srv.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#24211e] py-2.5 text-xs font-semibold text-[#fffefb] transition-colors hover:bg-[#3d3833]"
                  >
                    <Calendar className="h-3.5 w-3.5 text-[#c6a585]" />
                    <span>{t('احجزوا هذه الجلسة', 'Book this session')}</span>
                  </button>

                  <button
                    onClick={() => onSelectCategory(srv.categorySlug || 'all')}
                    className="flex items-center gap-1 rounded-xl border border-[#e6e1d6] bg-[#fffefb]/65 px-4 py-2.5 text-xs font-semibold text-[#24211e] backdrop-blur-md transition-colors hover:border-[#c6a585] hover:bg-[#e6e1d6]/45"
                    title={t('عرض الألبومات', 'View albums')}
                  >
                    <span>{t('الألبومات', 'Albums')}</span>
                    <ArrowLeft className="h-3.5 w-3.5" />
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
