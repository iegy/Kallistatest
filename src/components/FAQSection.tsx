import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { SiteContent } from '../types';
import { useLanguage } from '../i18n';

interface FAQSectionProps {
  content: SiteContent;
  onContactClick: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ content, onContactClick }) => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { faq } = content;

  const helperText = content.faqSettings?.helperText
    || t('لديكم أي استفسار آخر لم نذكره هنا؟ يسعدنا دائماً الإجابة على جميع أسئلتكم.', 'Have another question? We would be delighted to help.');
  const helperCta = content.faqSettings?.helperCta
    || t('تواصلوا معنا مباشرة عبر الواتساب أو نموذج الحجز', 'Contact us on WhatsApp or through the enquiry form');

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 sm:py-32 bg-[#fffefb] relative border-t border-[#e6e1d6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="font-serif text-sm tracking-[0.25em] text-[#738262] uppercase block mb-3 font-semibold">
            {t('الأسئلة الشائعة', 'Frequently Asked Questions')}
          </span>
          <h2
            id="faq-headline"
            className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] mb-4"
          >
            {t('الأسئلة الشائعة', 'Frequently asked questions')}
          </h2>
          <p className="text-[#524941] text-base font-light">
            {t('إجابات واضحة وشاملة حول أسلوب التصوير، الخصوصية، الباقات، ومواعيد التسليم.', 'Clear answers about our approach, privacy, collections and delivery.')}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.id || index}
                id={`faq-item-${index}`}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#e6e1d6]/30 border-[#c6a585] shadow-sm'
                    : 'bg-[#fffefb] border-[#e6e1d6] hover:border-[#738262]'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-right flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-arabic-editorial text-lg sm:text-xl font-bold text-[#24211e]">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 flex-shrink-0 ${
                      isOpen
                        ? 'bg-[#c6a585] text-white rotate-180'
                        : 'bg-[#e6e1d6] text-[#24211e]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-[#4d443b] text-base leading-relaxed font-light border-t border-[#e6e1d6]/50">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Helper — same visual family as the FAQ cards */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#e6e1d6] bg-[#fffefb] shadow-sm">
          <div className="p-6 text-center">
            <p className="text-sm text-[#4d443b] font-arabic-editorial leading-7">
              {helperText}
            </p>
            <button
              onClick={onContactClick}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#c6a585]/45 bg-[#fffefb]/70 px-5 py-2.5 text-xs font-bold text-[#24211e] shadow-sm backdrop-blur-md transition-all hover:border-[#c6a585] hover:bg-[#e6e1d6]/40"
            >
              <span>{helperCta}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#c6a585]" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
