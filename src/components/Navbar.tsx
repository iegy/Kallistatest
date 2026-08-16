import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, Calendar, UserRound, LogOut } from 'lucide-react';
import { SiteSettings, SiteContent, PortfolioCategory } from '../types';
import { KallistaLogo } from './KallistaLogo';

interface NavbarProps {
  settings: SiteSettings;
  content: SiteContent;
  categories: PortfolioCategory[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenAccount: () => void;
  onLogout: () => void;
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
  onLogout,
  userLabel,
  birthdayAlertCount,
}) => {
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
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Official KALLISTA Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => handleItemClick('home')}
            className="flex items-center gap-3 focus:outline-none transition-transform duration-300 active:scale-95 text-right"
            aria-label="Kallista Photography"
          >
            <KallistaLogo
              size={isScrolled ? 'sm' : 'md'}
              customImageUrl={content.brand.logoType === 'image' ? content.brand.logoImageUrl : undefined}
              showSubtitle={true}
              subtitleText={`BY ${content.brand.founderName || 'RONADISA'}`}
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
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {defaultNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`text-sm tracking-wide transition-all duration-300 relative py-1 focus:outline-none font-medium ${
                    isActive
                      ? 'text-[#1A1715] font-semibold'
                      : 'text-[#6C635B] hover:text-[#1A1715]'
                  }`}
                >
                  <span>{item.labelAr}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#936942] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* CTA & Admin Control actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={userLabel ? onLogout : onOpenAccount}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-[#6c635b] hover:bg-[#efe9e0]/70 hover:text-[#1a1715]"
              title={userLabel ? `تسجيل خروج ${userLabel}` : 'تسجيل الدخول أو إنشاء حساب'}
            >
              {userLabel ? <LogOut className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
              <span className="hidden xl:inline">{userLabel || 'حسابي'}</span>
            </button>
            {/* Admin Dashboard Access */}
            <button
              id="admin-dashboard-btn"
              onClick={onOpenAdmin}
              className="relative p-2 text-[#7C7167] hover:text-[#1A1715] hover:bg-[#EFE9E0]/60 rounded-full transition-colors focus:outline-none"
              title="لوحة التحكم والإدارة الفورية (Admin CMS)"
              aria-label="Admin Dashboard"
            >
              <Lock className="w-4 h-4" />
              {birthdayAlertCount > 0 && (
                <span
                  title={`${birthdayAlertCount} تنبيهات أعياد ميلاد قادمة`}
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
              className="bg-[#1A1715] text-[#FAF8F5] px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wider hover:bg-[#38312B] active:scale-98 transition-all duration-300 shadow-[0_2px_12px_rgba(26,23,21,0.12)] flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>احجزوا موعدكم</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={userLabel ? onLogout : onOpenAccount}
              className="p-2 text-[#7C7167] hover:text-[#1A1715] focus:outline-none"
              aria-label={userLabel ? 'تسجيل الخروج' : 'حسابي'}
            >
              {userLabel ? <LogOut className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
            </button>
            <button
              id="mobile-admin-btn"
              onClick={onOpenAdmin}
              className="relative p-2 text-[#7C7167] hover:text-[#1A1715] focus:outline-none"
              aria-label="Admin"
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
              aria-label="Toggle menu"
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
          className="lg:hidden fixed inset-x-0 top-[65px] bg-[#FAF8F5]/98 backdrop-blur-xl border-b border-[#E8E1D7] px-6 py-6 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex flex-col gap-3">
            {defaultNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`text-right py-2.5 px-3 rounded-lg text-base transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-[#EAE3DA]/70 font-semibold text-[#1A1715]'
                      : 'text-[#5C534C] hover:bg-[#EFE9E0]/40'
                  }`}
                >
                  <span className="font-serif text-sm tracking-wider text-[#9E9084]">
                    {item.labelEn}
                  </span>
                  <span>{item.labelAr}</span>
                </button>
              );
            })}

            <div className="pt-4 border-t border-[#EAE3DA] flex flex-col gap-2">
              <button
                id="mobile-drawer-inquire-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full bg-[#1A1715] text-[#FAF8F5] py-3 rounded-xl text-center text-sm font-medium tracking-wide shadow-md flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#D4A373]" />
                <span>احجزوا موعدكم الآن / Inquire</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
