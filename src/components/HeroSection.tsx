import React from 'react';
import { Sparkles, Calendar, ChevronDown, Camera } from 'lucide-react';
import { SiteContent } from '../types';
import { veiledWeddingPhoto } from '../services/storage';
import { useLanguage } from '../i18n';

interface HeroSectionProps {
  content: SiteContent;
  onExplore: () => void;
  onInquire: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content, onExplore, onInquire }) => {
  const { t } = useLanguage();
  const { hero, brand } = content;

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffefb] pb-20 pt-28 sm:pt-32 xl:pt-36"
    >
      {/* Background Decorative Ambient Circles */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-[#e6e1d6]/50 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 -left-24 w-96 h-96 bg-[#afbb9c]/20 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Main Typography Column */}
          <div className="lg:col-span-7 text-right space-y-8">
            
            {/* Header Brand Tag */}
            <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-[#c6a585]/40 bg-[#e6e1d6]/60 px-4 py-2 text-[#24211e]">
              <Sparkles className="w-4 h-4 text-[#c6a585]" />
              <span className="text-center font-serif text-[10px] font-semibold uppercase leading-relaxed tracking-[0.12em] sm:text-xs sm:tracking-[0.2em]">
                {brand.studioName} • {hero.preTitle || 'Fine Art Photography'}
              </span>
            </div>

            {/* Editorial Headlines */}
            <div className="space-y-4">
              <h1
                id="hero-main-title"
                className="font-arabic-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[#24211e] leading-[1.25] tracking-tight"
              >
                {hero.titleMain}{' '}
                <span className="text-[#c6a585] block mt-2">
                  {hero.titleAccent}
                </span>
              </h1>

              <p
                id="hero-subtitle"
                className="font-serif text-lg sm:text-xl text-[#5c5248] italic tracking-wide"
              >
                {t(brand.taglineAr, brand.taglineEn || 'Preserving what cannot be repeated.')}
              </p>
            </div>

            {/* Inclusive Copy */}
            <p
              id="hero-body-text"
              className="text-[#453d36] text-base sm:text-lg leading-relaxed max-w-2xl font-light"
            >
              {hero.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                id="hero-inquire-btn"
                onClick={onInquire}
                className="bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] px-8 py-4 rounded-full text-sm font-medium tracking-wide shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5"
              >
                <Calendar className="w-4 h-4 text-[#c6a585]" />
                <span>{hero.secondaryCtaText || 'احجزوا موعدكم الآن'}</span>
              </button>

              <button
                id="hero-explore-btn"
                onClick={onExplore}
                className="bg-transparent hover:bg-[#e6e1d6]/50 text-[#24211e] border border-[#c6a585] px-8 py-4 rounded-full text-sm font-medium tracking-wide transition-all duration-300 flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-[#738262]" />
                <span>{hero.primaryCtaText || 'استكشاف المعرض والألبومات'}</span>
              </button>
            </div>

            {/* Quick Highlights */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#e6e1d6] max-w-xl text-right">
              {hero.stats.map((stat, idx) => (
                <div key={idx}>
                  <span className="font-serif text-2xl font-bold text-[#24211e] block">{stat.number}</span>
                  <span className="text-xs text-[#73685d]">{stat.label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Editorial Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Frame with Veiled Wedding Asset */}
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#fffefb] bg-[#e6e1d6] relative">
                <img
                  id="hero-featured-image"
                  src={hero.bgImageUrl || veiledWeddingPhoto}
                  alt={t('تصوير زفاف تحريري من كاليستا', 'Kallista editorial wedding photography')}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                
                {/* Visual Label Tag */}
                <div className="absolute bottom-4 right-4 left-4 bg-[#24211e]/85 backdrop-blur-md p-4 rounded-2xl border border-[#fffefb]/10 text-right text-[#fffefb] space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#c6a585] font-serif block">
                    {t('حكاية زفاف مميزة', 'Signature Wedding Story')}
                  </span>
                  <h3 className="font-arabic-editorial text-sm sm:text-base font-bold">
                    {t('حكاية نور وكريم — تصوير زفاف تحريري راقٍ', 'Noor & Kareem — a refined editorial wedding story')}
                  </h3>
                </div>
              </div>

              {/* Floating Aesthetic Accent Badge */}
              <div className="absolute -top-4 -left-4 bg-[#fffefb] p-4 rounded-2xl border border-[#e6e1d6] shadow-xl text-center hidden sm:block">
                <span className="font-serif text-xs uppercase tracking-widest text-[#738262] block font-semibold">
                  {t('الإسكندرية، مصر', 'Alexandria, Egypt')}
                </span>
                <span className="font-arabic-editorial text-xs text-[#24211e] font-medium">
                  {t('تصوير احترافي في جميع المحافظات', 'Available across Egypt')}
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Scroll Down Indicator */}
      <button
        onClick={onExplore}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 text-[#73685d] hover:text-[#24211e] transition-colors group cursor-pointer"
        aria-label="Scroll to content"
      >
        <span className="text-[11px] font-serif tracking-widest uppercase">{t('استكشف', 'Explore')}</span>
        <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
      </button>
    </section>
  );
};
