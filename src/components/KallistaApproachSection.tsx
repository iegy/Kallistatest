import React from 'react';
import { Eye, Sparkles, Heart, Shield, Award, CheckCircle2, Camera } from 'lucide-react';
import { SiteContent } from '../types';
import { veiledWeddingPhoto } from '../services/storage';
import { useLanguage } from '../i18n';

interface ApproachAndSignatureSectionProps {
  content: SiteContent;
  onInquireWedding: () => void;
}

export const ApproachAndSignatureSection: React.FC<ApproachAndSignatureSectionProps> = ({
  content,
  onInquireWedding,
}) => {
  const { t } = useLanguage();
  const { approach, signature } = content;

  return (
    <div id="approach-signature-wrapper" className="space-y-0">
      
      {/* 07 — THE KALLISTA APPROACH */}
      <section id="approach" className="py-24 sm:py-32 bg-[#fffefb] relative border-t border-[#e6e1d6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <span className="font-serif text-sm tracking-[0.25em] text-[#738262] uppercase block mb-3 font-semibold">
              {t('07 — منهجية كاليستا', '07 — The Kallista Approach')}
            </span>
            <h2
              id="approach-headline"
              className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#24211e] mb-4"
            >
              {approach.sectionTitle}
            </h2>
            <p className="text-[#524941] text-base sm:text-lg font-light leading-relaxed">
              {approach.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.steps.map((p) => (
              <div
                key={p.number}
                id={`pillar-${p.number}`}
                className="p-8 rounded-3xl bg-[#fffefb] border border-[#e6e1d6] hover:border-[#c6a585] transition-all duration-300 flex flex-col justify-between hover:shadow-lg text-right group"
              >
                <div>
                  <span className="font-serif text-3xl font-light text-[#c6a585] block mb-4 group-hover:scale-105 transition-transform">
                    {p.number}
                  </span>
                  <span className="text-[11px] font-serif uppercase tracking-widest text-[#738262] block mb-1 font-semibold">
                    {p.subtitle}
                  </span>
                  <h3 className="font-arabic-editorial text-xl font-bold text-[#24211e] mb-3">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#594f45] leading-relaxed font-light mb-3">
                    {p.description}
                  </p>
                  {p.detail && (
                    <p className="text-[11px] text-[#8c7e72] border-t border-[#e6e1d6]/50 pt-2 font-light">
                      {p.detail}
                    </p>
                  )}
                </div>

                <div className="pt-6 mt-4 flex items-center justify-end text-xs text-[#738262]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 08 & 09 — SIGNATURE IMAGE & WEDDING FEATURE */}
      <section id="signature-wedding" className="py-24 bg-[#24211e] text-[#fffefb] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Frame */}
            <div className="lg:col-span-6 relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-[#fffefb]/10 bg-[#3d3833] relative">
                <img
                  src={signature.imageUrl || veiledWeddingPhoto}
                  alt="Kallista Signature Veiled Wedding Moment"
                  draggable={false}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#24211e]/90 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 right-6 left-6 text-right space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[#c6a585] font-serif block">
                    {signature.subtitle || 'Signature Atmosphere'}
                  </span>
                  <p className="font-arabic-editorial text-lg font-bold text-[#fffefb]">
                    {signature.quote || '"الوقار والجمال في تناغم بصري راقٍ"'}
                  </p>
                </div>
              </div>
            </div>

            {/* Editorial Content */}
            <div className="lg:col-span-6 text-right space-y-6 order-1 lg:order-2">
              <span className="font-serif text-sm tracking-[0.25em] text-[#c6a585] uppercase block font-semibold">
                {t('09 — قصة الزفاف المميزة', '09 — Wedding Feature')}
              </span>

              <h2 className="font-arabic-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#fffefb] leading-tight">
                {signature.title}
              </h2>

              <p className="text-[#e6e1d6]/80 text-base sm:text-lg leading-relaxed font-light">
                {t('حفل الزفاف ليس مجرد جلسة تصوير، بل هو بداية فصل جديد في حياتكم. نحن نتواجد معكم بهدوء لنوثق كل لحظة تفيض بالمشاعر: نظرة اللقاء الأولى، دعوات الوالدين، تفاصيل فستان العروس المحتشم وطرحتها، وأناقة العريس.', 'A wedding is more than a photography session; it is the beginning of a new chapter. We stay quietly attentive to every meaningful glance, family blessing, considered detail and honest emotion.')}
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-start gap-3 text-sm text-[#e6e1d6]">
                  <span>{t('تغطية سينمائية وفوتوغرافية متكاملة للعروسين والعائلة', 'Complete editorial coverage for the couple and family')}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#738262]" />
                </div>
                <div className="flex items-center justify-start gap-3 text-sm text-[#e6e1d6]">
                  <span>{t('معالجة لونية تحريرية دقيقة تحافظ على طبيعية الملامح ونضارة البشرة', 'Careful colour finishing that preserves natural features and skin')}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#738262]" />
                </div>
                <div className="flex items-center justify-start gap-3 text-sm text-[#e6e1d6]">
                  <span>{t('تسليم ألبومات فاخرة مطبوعة يدوياً بأرقى الخامات الإيطالية', 'Luxury hand-finished albums made with archival materials')}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#738262]" />
                </div>
              </div>

              <div className="pt-4">
                <button
                  id="signature-wedding-inquire-btn"
                  onClick={onInquireWedding}
                  className="bg-[#c6a585] hover:bg-[#b5926f] text-[#24211e] px-8 py-3.5 rounded-full text-sm font-semibold tracking-wider transition-all duration-300 shadow-xl inline-flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t('احجزوا استشارة وتغطية زفافكم', 'Book a wedding consultation')}</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
