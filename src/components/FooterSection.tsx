import React from 'react';
import { Instagram, Facebook, MessageCircle, ArrowUp, Calendar, Lock, Youtube, Linkedin, ExternalLink } from 'lucide-react';
import { SiteSettings, SiteContent, PortfolioCategory } from '../types';
import { KallistaLogo } from './KallistaLogo';
import { useLanguage } from '../i18n';

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
  const socialLinks = contact.socialLinks?.filter((link) => link.label.trim() && link.url.trim()) || [
    ...(contact.instagram ? [{ id: 'legacy-instagram', label: 'Instagram', url: contact.instagram }] : []),
    ...(contact.facebook ? [{ id: 'legacy-facebook', label: 'Facebook', url: contact.facebook }] : []),
    ...(contact.tiktok ? [{ id: 'legacy-tiktok', label: 'TikTok', url: contact.tiktok }] : []),
  ];

  const socialIcon = (label: string) => {
    const name = label.toLowerCase();
    if (name.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (name.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (name.includes('youtube')) return <Youtube className="w-4 h-4" />;
    if (name.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    return <ExternalLink className="w-4 h-4" />;
  };

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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-5 text-right space-y-4">
            <div className="flex items-center justify-end">
              <KallistaLogo
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
            
            {language === 'en' && <p className="font-serif italic text-sm text-[#e6e1d6]/80 pt-2">{brand.taglineEn}</p>}
            <p className="text-xs text-[#afbb9c] font-arabic-editorial">{brand.taglineAr}</p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-4 text-right">
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
          <div className="md:col-span-3 text-right space-y-4">
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
                  {socialIcon(link.label)}
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
              Designed & Developed by{' '}
              <a
                href="https://iegy.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c6a585] hover:text-[#fffefb] underline underline-offset-2 transition-colors font-medium"
              >
                Mohammed Hussein · iegy.net
              </a>{' '}
              ©
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
