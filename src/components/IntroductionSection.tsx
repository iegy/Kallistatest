import React from 'react';
import { ArrowLeft, Sparkles, Heart, Eye } from 'lucide-react';
import { SiteContent } from '../types';

interface IntroductionSectionProps {
  content: SiteContent;
  onDiscover: () => void;
}

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({ content, onDiscover }) => {
  const { intro } = content;

  return (
    <section
      id="introduction"
      className="py-24 sm:py-32 bg-[#fffefb] relative border-t border-[#e6e1d6]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        
        {/* Section Header Label */}
        <div className="inline-block">
          <span className="font-serif text-sm tracking-[0.25em] text-[#738262] uppercase font-semibold">
            05 — Philosophy & Vision
          </span>
          <div className="w-12 h-[1px] bg-[#c6a585] mx-auto mt-2" />
        </div>

        {/* Brand Core Philosophy */}
        <div className="space-y-6">
          <h2
            id="intro-main-statement"
            className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] leading-snug"
          >
            {intro.heading}
          </h2>

          <div className="space-y-4 text-base sm:text-lg text-[#524941] leading-relaxed max-w-2xl mx-auto font-light">
            <p>{intro.paragraph1}</p>
            <p>{intro.paragraph2}</p>
          </div>

          {intro.quote && (
            <div className="p-6 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5] max-w-xl mx-auto italic text-[#4a4038] font-serif text-base">
              <p>"{intro.quote}"</p>
              {intro.quoteAuthor && (
                <span className="block text-xs text-[#8c7b6f] font-normal not-italic mt-2">
                  {intro.quoteAuthor}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Core Values Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-right">
          {intro.stats.map((stat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#e6e1d6]/30 border border-[#e6e1d6] space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#c6a585]/20 flex items-center justify-center text-[#8c6742] mb-3">
                {idx === 0 ? <Eye className="w-4 h-4" /> : idx === 1 ? <Sparkles className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              </div>
              <h3 className="font-arabic-editorial text-lg font-bold text-[#24211e]">
                {stat.value}
              </h3>
              <p className="text-xs text-[#5e5348] leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-6">
          <button
            onClick={onDiscover}
            className="text-sm font-semibold text-[#24211e] hover:text-[#c6a585] inline-flex items-center gap-2 border-b border-[#24211e] pb-1 hover:border-[#c6a585] transition-all"
          >
            <span>تعرفوا أكثر على قصة كاليستا وروناديسا</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
