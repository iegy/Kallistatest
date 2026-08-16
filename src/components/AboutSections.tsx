import React from 'react';
import { Camera, Sparkles, Award, MapPin, Heart, Instagram, CheckCircle2 } from 'lucide-react';
import { SiteContent } from '../types';
import { ronadisaPhoto, veiledWeddingPhoto } from '../services/storage';
import { useLanguage } from '../i18n';

interface AboutSectionsProps {
  content: SiteContent;
  onExploreWork: () => void;
}

export const AboutSections: React.FC<AboutSectionsProps> = ({ content, onExploreWork }) => {
  const { t } = useLanguage();
  const { aboutKallista, aboutRonadisa, brand } = content;
  const instagramUrl = content.contact.socialLinks?.find((link) => link.label.toLowerCase().includes('instagram'))?.url || content.contact.instagram || 'https://instagram.com';

  return (
    <div id="about" className="space-y-0">
      
      {/* 10 — ABOUT KALLISTA */}
      <section className="py-24 sm:py-32 bg-[#fffefb] relative border-t border-[#e6e1d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Column */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border-4 border-[#fffefb] bg-[#e6e1d6]">
                <img
                  src={aboutKallista.coverImage || veiledWeddingPhoto}
                  alt="Kallista Editorial Studio"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-[#24211e] text-[#fffefb] p-6 rounded-2xl shadow-xl max-w-xs text-right space-y-1">
                <span className="text-xs uppercase tracking-widest text-[#c6a585] font-serif block">
                  {t('مساحة للفن الراقي', 'Fine Art Sanctuary')}
                </span>
                <p className="font-arabic-editorial text-sm font-bold">
                  {t('مساحة فنية مخصصة لتوثيق الجمال والوقار التحريري', 'A creative space devoted to refined, meaningful imagery')}
                </p>
              </div>
            </div>

            {/* Typography Column */}
            <div className="lg:col-span-7 text-right space-y-6">
              <span className="font-serif text-sm tracking-[0.25em] text-[#738262] uppercase block font-semibold">
                {t(`10 — عن ${brand.studioName}`, `10 — About ${brand.studioName}`)}
              </span>

              <h2 className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] leading-tight">
                {aboutKallista.title}
              </h2>

              <div className="space-y-4 text-base sm:text-lg text-[#524941] leading-relaxed font-light">
                <p>{aboutKallista.paragraph1}</p>
                <p>{aboutKallista.paragraph2}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#e6e1d6]">
                {aboutKallista.pillars.map((pil, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#faf7f2] border border-[#e8dfd5] text-right">
                    <span className="font-arabic-editorial text-sm font-bold text-[#24211e] block mb-1">
                      {pil.title}
                    </span>
                    <span className="text-xs text-[#73685d] font-light block">
                      {pil.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 11 — ABOUT RONADISA (The Founder & Photographer) */}
      <section id="about-ronadisa" className="py-24 sm:py-32 bg-[#e6e1d6]/30 relative border-t border-[#e6e1d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Story & Philosophy */}
            <div className="lg:col-span-7 text-right space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6a585]/20 text-[#8c6742] text-xs font-serif font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('11 — الفنانة خلف العدسة', '11 — The Artist Behind The Lens')}</span>
              </div>

              <h2 className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] leading-tight">
                {aboutRonadisa.title}
              </h2>

              <div className="space-y-4 text-base sm:text-lg text-[#524941] leading-relaxed font-light">
                <p>{aboutRonadisa.bioParagraph1}</p>
                <p>{aboutRonadisa.bioParagraph2}</p>
              </div>

              {aboutRonadisa.quote && (
                <div className="p-4 rounded-2xl bg-[#fffefb] border border-[#d8cfc4] text-[#3d342d] italic text-sm font-serif">
                  {aboutRonadisa.quote}
                </div>
              )}

              {/* Palestinian Tribute Tag */}
              {aboutRonadisa.palestinianTribute && (
                <div className="p-3.5 rounded-xl bg-[#f0ede6] border border-[#cfc4b4] text-[#38312b] text-xs flex items-center justify-end gap-2 font-medium">
                  <span>{aboutRonadisa.palestinianTribute}</span>
                </div>
              )}

              {/* Awards & Experience */}
              {aboutRonadisa.awards && aboutRonadisa.awards.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-serif font-semibold uppercase text-[#738262] tracking-wider block">
                    {t('الجوائز والتكريمات', 'Awards & Honors')}
                  </span>
                  {aboutRonadisa.awards.map((aw, idx) => (
                    <div key={idx} className="flex items-center justify-end gap-2 text-xs text-[#524941]">
                      <span>{aw}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8c6742]" />
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={onExploreWork}
                  className="bg-[#24211e] hover:bg-[#3d3833] text-[#fffefb] px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide shadow-md transition-all flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-[#c6a585]" />
                  <span>{t('استكشفوا أعمالي وقصص الجلسات', 'Explore my work and session stories')}</span>
                </button>

                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#24211e] hover:text-[#c6a585] inline-flex items-center gap-1.5 p-3 rounded-full bg-[#fffefb] border border-[#e6e1d6]"
                >
                  <Instagram className="w-4 h-4 text-[#c6a585]" />
                  <span>@ronadisa</span>
                </a>
              </div>
            </div>

            {/* Real Ronadisa Founder Image Frame - preserved pure and untouched */}
            <div className="lg:col-span-5 relative order-1 lg:order-2">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-8 border-[#fffefb] bg-[#e6e1d6] relative">
                <img
                  id="ronadisa-founder-portrait"
                  src={aboutRonadisa.photoUrl || ronadisaPhoto}
                  alt="Ronadisa - Founder & Photographer of Kallista"
                  className="w-full h-full object-cover object-top"
                />
                
                <div className="absolute bottom-4 inset-x-4 bg-[#24211e]/90 backdrop-blur-md p-4 rounded-2xl border border-[#fffefb]/15 text-right text-[#fffefb]">
                  <span className="text-[10px] tracking-widest uppercase text-[#c6a585] font-serif block">
                    {t('المصورة الرئيسية والمؤسسة', 'Lead Photographer & Founder')}
                  </span>
                  <h3 className="font-arabic-editorial text-base font-bold">
                    {aboutRonadisa.founderName || t('روناديسا', 'Ronadisa')}
                  </h3>
                  <p className="text-[11px] text-[#e6e1d6]/80 font-serif">
                    {t('التصوير الفني والتحريري', 'Fine Art & Editorial Photography')}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
