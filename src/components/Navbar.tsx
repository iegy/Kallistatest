import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, Calendar, UserRound, Languages } from 'lucide-react';
import { SiteSettings, SiteContent, PortfolioCategory } from '../types';
import { KallistaLogo } from './KallistaLogo';
import { useLanguage } from '../i18n';

interface NavbarProps {
  settings: SiteSettings;
  content: SiteContent;
  categories: PortfolioCategory[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenAccount: () => void;
  userLabel?: string;
  birthdayAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  content,
  categories,
  activeSection,
  onNavigate,
  onOpenBooking,
  onOpenAdmin,
  onOpenAccount,
  userLabel,
  birthdayAlertCount,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultNavItems = [
    { id: 'home', labelAr: 'الرئيسية', labelEn: 'Home' },
    { id: 'portfolio', labelAr: 'الأعمال', labelEn: 'Portfolio' },
    { id: 'services', labelAr: 'الخدمات', labelEn: 'Services' },
    { id: 'about', labelAr: 'عن كاليستا وروناديسا', labelEn: 'About' },
    { id: 'experience', labelAr: 'التجربة', labelEn: 'Experience' },
    { id: 'reviews', labelAr: 'الآراء', labelEn: 'Reviews' },
    { id: 'faq', labelAr: 'الأسئلة', labelEn: 'FAQ' },
    { id: 'contact', labelAr: 'التواصل', labelEn: 'Contact' },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'glass-panel border-b border-[#EAE3DA]/80 py-3 shadow-[0_4px_24px_rgba(26,23,21,0.04)] bg-[#fffefb]/95 backdrop-blur-md'
          : 'border-b border-[#EAE3DA]/60 bg-[#fffefb]/96 py-3 backdrop-blur-md sm:py-4 xl:border-transparent xl:bg-transparent xl:py-5 xl:backdrop-blur-none'
      }`}
    >
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 xl:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Official KALLISTA Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => handleItemClick('home')}
            className="flex w-[150px] shrink-0 items-center gap-3 text-right transition-transform duration-300 active:scale-95 focus:outline-none sm:w-[220px] xl:w-[230px] 2xl:w-[270px]"
            aria-label="Kallista Photography"
          >
            <KallistaLogo
              size={isScrolled ? 'sm' : 'md'}
              customImageUrl={content.brand.logoType === 'image' ? content.brand.logoImageUrl : undefined}
              showSubtitle={true}
              subtitleText={`BY ${content.brand.founderName || 'RONADISA'}`}
              subtitleClassName="hidden xl:block"
            />
            {content.brand.showPalestinianBadge && (
              <span
                title="فلسطين في القلب — هوية عربية أصيلة"
                className="hidden md:inline-flex items-center gap-1 text-[11px] bg-[#f2ede4] text-[#423d38] px-2 py-0.5 rounded-full border border-[#ded5c7]"
              >
                🇵🇸 <span className="font-light">فلسطين في القلب</span>
              </span>
            )}
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-3 xl:flex 2xl:gap-6">
            {defaultNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`relative whitespace-nowrap py-1 text-xs font-medium tracking-wide transition-all duration-300 focus:outline-none 2xl:text-sm ${
                    isActive
                      ? 'text-[#1A1715] font-semibold'
                      : 'text-[#6C635B] hover:text-[#1A1715]'
                  }`}
                >
                  <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#936942] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* CTA & Admin Control actions */}
          <div className="hidden shrink-0 items-center gap-1 xl:flex 2xl:gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#ded5c7] px-2.5 py-2 text-xs font-semibold text-[#5f554c] transition-colors hover:bg-[#efe9e0]/70"
              aria-label={t('تغيير اللغة إلى الإنجليزية', 'Switch language to Arabic')}
              title={t('English version', 'النسخة العربية')}
            >
              <Languages className="h-4 w-4" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
            <button
              onClick={onOpenAccount}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs text-[#6c635b] hover:bg-[#efe9e0]/70 hover:text-[#1a1715]"
              title={userLabel ? t('عرض وإدارة الحساب', 'View and manage account') : t('تسجيل الدخول أو إنشاء حساب', 'Sign in or create an account')}
            >
              <UserRound className="h-4 w-4" />
              <span className="hidden 2xl:inline">{t('حسابي', 'Account')}</span>
            </button>
            {/* Admin Dashboard Access */}
            <button
              id="admin-dashboard-btn"
              onClick={onOpenAdmin}
              className="relative p-2 text-[#7C7167] hover:text-[#1A1715] hover:bg-[#EFE9E0]/60 rounded-full transition-colors focus:outline-none"
              title={t('لوحة التحكم والإدارة', 'Admin dashboard')}
              aria-label={t('لوحة التحكم', 'Admin dashboard')}
            >
              <Lock className="w-4 h-4" />
              {birthdayAlertCount > 0 && (
                <span
                  title={t(`${birthdayAlertCount} تنبيهات أعياد ميلاد قادمة`, `${birthdayAlertCount} upcoming birthday alerts`)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#B95D55] text-white text-[9px] font-bold flex items-center justify-center rounded-full animate-pulse"
                >
                  {birthdayAlertCount}
                </span>
              )}
            </button>

            {/* Primary Inquiry CTA Button */}
            <button
              id="header-inquire-btn"
              onClick={onOpenBooking}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[#1A1715] px-4 py-2.5 text-xs font-medium tracking-wide text-[#FAF8F5] shadow-[0_2px_12px_rgba(26,23,21,0.12)] transition-all duration-300 hover:bg-[#38312B] active:scale-98 2xl:px-5 2xl:text-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className="2xl:hidden">{t('احجز الآن', 'Book now')}</span>
              <span className="hidden 2xl:inline">{t('احجزوا موعدكم', 'Book a session')}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2 xl:hidden">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 rounded-full border border-[#ded5c7] px-2 py-1.5 text-[11px] font-bold text-[#5f554c]"
              aria-label={t('تغيير اللغة إلى الإنجليزية', 'Switch language to Arabic')}
            >
              <Languages className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? 'EN' : 'ع'}</span>
            </button>
            <button
              onClick={onOpenAccount}
              className="p-2 text-[#7C7167] hover:text-[#1A1715] focus:outline-none"
              aria-label={t('حسابي', 'Account')}
            >
              <UserRound className="h-4 w-4" />
            </button>
            <button
              id="mobile-admin-btn"
              onClick={onOpenAdmin}
              className="relative p-2 text-[#7C7167] hover:text-[#1A1715] focus:outline-none"
              aria-label={t('لوحة التحكم', 'Admin dashboard')}
            >
              <Lock className="w-4 h-4" />
              {birthdayAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#B95D55] text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                  {birthdayAlertCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1715] hover:bg-[#EFE9E0]/70 rounded-lg focus:outline-none transition-colors"
              aria-label={t('فتح قائمة التنقل', 'Toggle navigation menu')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="absolute inset-x-0 top-full max-h-[calc(100vh-76px)] overflow-y-auto border-b border-[#E8E1D7] bg-[#FAF8F5]/98 px-4 py-5 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 sm:px-8 xl:hidden"
        >
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {defaultNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-right text-sm transition-colors ${
                    isActive
                      ? 'bg-[#EAE3DA]/70 font-semibold text-[#1A1715]'
                      : 'text-[#5C534C] hover:bg-[#EFE9E0]/40'
                  }`}
                >
                  <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                </button>
              );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-[#EAE3DA] pt-4">
              <button
                id="mobile-drawer-inquire-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full bg-[#1A1715] text-[#FAF8F5] py-3 rounded-xl text-center text-sm font-medium tracking-wide shadow-md flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#D4A373]" />
                <span>{t('احجزوا موعدكم الآن', 'Book your session')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
