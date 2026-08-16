import React from 'react';
import { Eye, Heart, Sparkles, CheckCircle2, Shield, Compass, Smile, Clock } from 'lucide-react';
import { SiteContent } from '../types';
import { useLanguage } from '../i18n';

interface ExperienceSectionProps {
  content: SiteContent;
  onInquire: () => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ content, onInquire }) => {
  const { t } = useLanguage();
  const { experience } = content;

  return (
    <div id="experience-why-wrapper" className="space-y-0">
      {/* 13 — THE KALLISTA EXPERIENCE */}
      <section id="experience" className="py-24 sm:py-32 bg-[#fffefb] relative border-t border-[#e6e1d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <span className="font-serif text-sm tracking-[0.25em] text-[#c6a585] uppercase block mb-3 font-semibold">
              {t('13 — تجربة كاليستا', '13 — The Kallista Experience')}
            </span>
            <h2
              id="experience-headline"
              className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] mb-4"
            >
              {experience.title}
            </h2>
            <div className="space-y-2 text-[#524941] text-base sm:text-lg leading-relaxed font-light">
              <p>{t('التصوير بالنسبة لنا لا يبدأ عندما تفتح الكاميرا، ولا ينتهي عند تسليم الصور.', 'For us, photography begins before the camera is raised and continues beyond final delivery.')}</p>
              <p className="text-[#24211e] font-medium">
                {experience.subtitle || 'نريد أن تكون التجربة نفسها مريحة، واضحة، وممتعة لكم في كل مرحلة.'}
              </p>
            </div>
          </div>

          {/* Timeline Phases */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {experience.timelineSteps.map((step, idx) => (
              <div
                key={idx}
                id={`exp-step-${idx}`}
                className="bg-[#fffefb] rounded-2xl border border-[#e6e1d6] p-6 flex flex-col justify-between hover:border-[#c6a585] transition-all duration-300 relative hover:shadow-[0_12px_32px_rgba(198,165,133,0.12)] text-right"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-serif text-2xl font-light text-[#c6a585]">
                      0{step.step || idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-serif font-medium bg-[#e6e1d6] text-[#5e4b3c]">
                      {step.time}
                    </span>
                  </div>

                  <h3 className="font-arabic-editorial text-lg font-bold text-[#24211e] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[#594f45] text-xs leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#e6e1d6]/60 text-[10px] text-[#8c7f73] font-serif">
                  Kallista Protocol Step {idx + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Guarantees */}
          {experience.guarantees && experience.guarantees.length > 0 && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {experience.guarantees.map((g, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#faf7f2] border border-[#e6ded3] text-right">
                  <div className="flex items-center justify-end gap-2 text-sm font-arabic-editorial font-bold text-[#24211e] mb-1">
                    <span>{g.title}</span>
                    <Shield className="w-4 h-4 text-[#738262]" />
                  </div>
                  <p className="text-xs text-[#6e6359] font-light">
                    {g.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Experience Closing Statement */}
          <div className="mt-16 p-8 sm:p-10 bg-[#e6e1d6]/40 rounded-3xl border border-[#c6a585]/40 text-center max-w-4xl mx-auto space-y-3">
            <p className="font-serif text-xl sm:text-2xl text-[#24211e] italic">
              “{t('الصور الجميلة مهمة، والشعور بالراحة الكافية لصنعها له نفس الأهمية.', 'Beautiful photographs matter. Feeling comfortable enough to create them matters just as much.')}”
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};
