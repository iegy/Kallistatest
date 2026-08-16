import React from 'react';
import { MessageCircle, ArrowUp, Calendar, Lock } from 'lucide-react';
import { SiteSettings, SiteContent, PortfolioCategory, SocialLink } from '../types';
import { KallistaLogo } from './KallistaLogo';
import { useLanguage } from '../i18n';
import { SocialPlatformIcon } from './SocialPlatformIcon';

interface FooterSectionProps {
  settings: SiteSettings;
  content: SiteContent;
  categories: PortfolioCategory[];
  onNavigate: (sectionId: string) => void;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  settings,
  content,
  categories,
  onNavigate,
  onOpenBooking,
  onOpenAdmin,
}) => {
  const { language, t } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { footer, brand, contact } = content;
  const socialLinks: SocialLink[] = contact.socialLinks?.filter((link) => link.label.trim() && link.url.trim()) || [
    ...(contact.instagram ? [{ id: 'legacy-instagram', label: 'Instagram', icon: 'instagram', url: contact.instagram }] : []),
    ...(contact.facebook ? [{ id: 'legacy-facebook', label: 'Facebook', icon: 'facebook', url: contact.facebook }] : []),
    ...(contact.tiktok ? [{ id: 'legacy-tiktok', label: 'TikTok', icon: 'tiktok', url: contact.tiktok }] : []),
  ];

  return (
    <footer id="main-footer" className="bg-[#24211e] text-[#fffefb] relative border-t border-[#3d3833]">
      
      {/* 27 — FINAL WEBSITE MESSAGE */}
      <div className="py-20 sm:py-24 border-b border-[#3d3833] text-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="font-serif text-xl sm:text-3xl md:text-4xl font-light text-[#e6e1d6] italic">
            “{t('بعض اللحظات لا يمكن تكرارها، ونحن نحرص أن تظل قابلة للتذكر.', 'Some moments cannot be recreated. We make sure they can be remembered.')}”
          </p>
          <div className="w-12 h-[1px] bg-[#c6a585] mx-auto" />

          <div className="pt-6">
            <button
              id="footer-final-inquire-btn"
              onClick={onOpenBooking}
              className="bg-[#c6a585] hover:bg-[#b5926f] text-[#24211e] px-8 py-3.5 rounded-full text-sm font-semibold tracking-wider transition-all duration-300 shadow-xl inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('احجزوا موعدكم معنا الآن', 'Enquire about a session')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MINIMAL FOOTER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12">
          
          {/* Brand Info */}
          <div className="order-1 space-y-4 text-center md:order-2 md:col-span-4">
            <div className="flex items-center justify-center">
              <KallistaLogo
                className="w-full max-w-[290px]"
                size="md"
                customImageUrl={
                  brand.footerLogoType === 'image'
                    ? (brand.footerLogoImageUrl || brand.logoImageUrl || undefined)
                    : brand.logoType === 'image'
                    ? (brand.logoImageUrl || undefined)
                    : undefined
                }
                showSubtitle={true}
                subtitleText={`BY ${brand.founderName || 'RONADISA'}`}
                inverted={true}
              />
            </div>
            
            {language === 'en' && <p className="mx-auto max-w-sm pt-2 font-serif text-sm italic text-[#e6e1d6]/80">{brand.taglineEn}</p>}
            <p className="mx-auto max-w-sm font-arabic-editorial text-xs leading-relaxed text-[#afbb9c]">
              {footer.disclaimerText || brand.taglineAr}
            </p>
            {footer.privacyNotice && (
              <p className="mx-auto max-w-sm text-[10px] leading-relaxed text-[#e6e1d6]/55">
                {footer.privacyNotice}
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <div className="order-2 text-right md:order-1 md:col-span-4">
            <span className="font-serif text-xs uppercase tracking-widest text-[#c6a585] block mb-4">
              {t('الروابط', 'Navigation')}
            </span>
            <div className="grid grid-cols-2 gap-2 text-sm text-[#e6e1d6]/80">
              <button
                onClick={() => onNavigate('home')}
                className="text-right hover:text-[#fffefb] transition-colors"
              >
                {t('الرئيسية', 'Home')}
              </button>
              <button
                onClick={() => onNavigate('portfolio')}
                className="text-right hover:text-[#fffefb] transition-colors"
              >
                {t('الأعمال', 'Portfolio')}
              </button>
              <button
                onClick={() => onNavigate('services')}
                className="text-right hover:text-[#fffefb] transition-colors"
              >
                {t('الخدمات', 'Services')}
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="text-right hover:text-[#fffefb] transition-colors"
              >
                {t('عن كاليستا', 'About Kallista')}
              </button>
              <button
                onClick={() => onNavigate('experience')}
                className="text-right hover:text-[#fffefb] transition-colors"
              >
                {t('التجربة', 'Experience')}
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="text-right hover:text-[#fffefb] transition-colors"
              >
                {t('الحجز والتواصل', 'Contact')}
              </button>
            </div>
          </div>

          {/* Social Channels & Admin */}
          <div className="order-3 space-y-4 text-right md:col-span-4">
            <span className="font-serif text-xs uppercase tracking-widest text-[#c6a585] block">
              {t('تواصلوا معنا', 'Connect')}
            </span>

            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#3d3833] hover:bg-[#c6a585] hover:text-[#24211e] flex items-center justify-center transition-all text-[#e6e1d6]"
                  title={link.label}
                  aria-label={link.label}
                >
                  <SocialPlatformIcon platform={link.icon} label={link.label} url={link.url} />
                </a>
              ))}

              {contact.whatsapp && <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^0-9+]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#3d3833] hover:bg-[#afbb9c] hover:text-[#24211e] flex items-center justify-center transition-all text-[#e6e1d6]"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>}
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="text-xs text-[#e6e1d6]/60 hover:text-[#c6a585] inline-flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t('لوحة تحكم كاليستا', 'Kallista Admin')}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-8 border-t border-[#3d3833] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#e6e1d6]/60">
          <div className="space-y-1 text-center sm:text-right">
            <p className="font-serif">
              {footer.copyrightText || '© 2026 KALLISTA by Ronadisa. All rights reserved.'}
            </p>
            <p className="font-serif text-[11px] text-[#c6a585]/90">
              <a
                href="https://iegy.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c6a585] hover:text-[#fffefb] underline underline-offset-2 transition-colors font-medium"
              >
                {footer.developerCredit || 'Designed & Developed by Mohammed Hussein · iegy.net ©'}
              </a>
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-[#c6a585] transition-colors"
          >
            <span>{t('العودة للأعلى', 'Back to top')}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
