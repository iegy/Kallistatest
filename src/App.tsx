import React, { useState, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { where } from 'firebase/firestore';
import {
  Album, Booking, ClientContact, Review, SiteSettings, PhotoItem,
  PortfolioCategory, SiteContent
} from './types';
import {
  getAlbums,
  getSettings,
  getPortfolioCategories,
  getSiteContent,
  getUpcomingBirthdayAlerts,
} from './services/storage';
import {
  FIRESTORE_COLLECTIONS,
  createBookingRecord,
  createReviewRecord,
  isFirebaseAdmin,
  logoutFirebase,
  replaceCollection,
  saveDocument,
  seedDefaults,
  subscribeToFirebaseAuthState,
  syncUserProfile,
  watchCollection,
  watchDocument,
} from './services/firebase';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { IntroductionSection } from './components/IntroductionSection';
import { ServicesSection } from './components/ServicesSection';
import { ApproachAndSignatureSection } from './components/KallistaApproachSection';
import { AboutSections } from './components/AboutSections';
import { PortfolioSection } from './components/PortfolioSection';
import { ExperienceSection } from './components/ExperienceSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { ContactAndBookingSection } from './components/ContactAndBookingSection';
import { FooterSection } from './components/FooterSection';
import { AlbumDetailsModal } from './components/AlbumDetailsModal';
import { AlbumLightboxModal } from './components/AlbumLightboxModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { BookingModal } from './components/BookingModal';
import { AccountModal } from './components/AccountModal';
import { AppearanceControls } from './components/AppearanceControls';
import { Language, LanguageProvider, localizeAlbums, localizeCategories, localizeContent } from './i18n';

interface UserProfileRecord {
  id: string;
  name?: string;
  email?: string;
  provider?: string;
}

export default function App() {
  const [language, setLanguageState] = useState<Language>(() => {
    const queryLanguage = new URLSearchParams(window.location.search).get('lang');
    if (queryLanguage === 'en' || queryLanguage === 'ar') return queryLanguage;
    return localStorage.getItem('kallista_language') === 'en' ? 'en' : 'ar';
  });

  // Global State (Completely Dynamic & User-Editable)
  const [categories, setCategories] = useState<PortfolioCategory[]>(() => getPortfolioCategories());
  const [content, setContent] = useState<SiteContent>(() => getSiteContent());
  const [albums, setAlbums] = useState<Album[]>(() => getAlbums());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<ClientContact[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfileRecord[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(() => getSettings());
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // UI Navigation & Filters
  const [activeSection, setActiveSection] = useState<string>('home');
  const [portfolioCategory, setPortfolioCategory] = useState<string>('all');

  // Modal Dialogs
  const [selectedAlbumForDetails, setSelectedAlbumForDetails] = useState<Album | null>(null);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<PhotoItem | null>(null);
  const [lightboxAlbumTitle, setLightboxAlbumTitle] = useState<string | undefined>(undefined);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => window.location.hash === '#/admin');
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [preselectedBookingService, setPreselectedBookingService] = useState<string>('weddings');

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem('kallista_language', nextLanguage);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', nextLanguage);
    window.history.replaceState({}, '', url);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.title = isAdminOpen
      ? 'لوحة تحكم كاليستا | Kallista CMS'
      : language === 'ar'
        ? 'Kallista by Ronadisa | تصوير تحريري فاخر'
        : 'Kallista by Ronadisa | Editorial Photography in Egypt';
  }, [language, isAdminOpen]);

  const publicContent = useMemo(() => localizeContent(content, language), [content, language]);
  const publicCategories = useMemo(() => localizeCategories(categories, language), [categories, language]);
  const publicAlbums = useMemo(() => localizeAlbums(albums, language), [albums, language]);

  useEffect(() => subscribeToFirebaseAuthState(async (nextUser) => {
    setUser(nextUser);
    if (nextUser) void syncUserProfile(nextUser).catch((error) => console.warn('Profile sync failed:', error));
    setIsAdmin(await isFirebaseAdmin(nextUser).catch(() => false));
  }), []);

  useEffect(() => {
    const unsubscribers = [
      watchDocument<SiteContent>(FIRESTORE_COLLECTIONS.CONTENT, 'main', (value) => value && setContent(value)),
      watchDocument<SiteSettings>(FIRESTORE_COLLECTIONS.SETTINGS, 'public', (value) => value && setSettings(value)),
      watchCollection<PortfolioCategory>(FIRESTORE_COLLECTIONS.CATEGORIES, (values) => values.length && setCategories(values), where('active', '==', true)),
      watchCollection<Album>(FIRESTORE_COLLECTIONS.ALBUMS, (values) => values.length && setAlbums(values), where('published', '==', true)),
      watchCollection<Review>(FIRESTORE_COLLECTIONS.REVIEWS, setReviews, where('approved', '==', true)),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void seedDefaults({ content, settings, categories, albums });
    const unsubscribers = [
      watchCollection<PortfolioCategory>(FIRESTORE_COLLECTIONS.CATEGORIES, setCategories),
      watchCollection<Album>(FIRESTORE_COLLECTIONS.ALBUMS, setAlbums),
      watchCollection<Booking>(FIRESTORE_COLLECTIONS.BOOKINGS, setBookings),
      watchCollection<ClientContact>(FIRESTORE_COLLECTIONS.CLIENTS, setClients),
      watchCollection<Review>(FIRESTORE_COLLECTIONS.REVIEWS, setReviews),
      watchCollection<UserProfileRecord>(FIRESTORE_COLLECTIONS.PROFILES, setRegisteredUsers),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [isAdmin]);

  const reportSaveError = (error: unknown) => {
    console.error('Firebase save failed:', error);
    const code = (error as { code?: string })?.code || '';
    if (code.includes('permission-denied')) {
      alert('رفض Firestore الحفظ لأن قواعد الصلاحيات المنشورة لا تتعرف على حساب المدير. انشر ملف firestore.rules المحدّث ثم سجّل الخروج والدخول مرة أخرى.');
      return;
    }
    alert(`تعذر حفظ التغيير في Firebase${code ? ` (${code})` : ''}. حاول مرة أخرى.`);
  };

  const handleUpdateCategories = (newCategories: PortfolioCategory[]) => {
    setCategories(newCategories);
    void replaceCollection(FIRESTORE_COLLECTIONS.CATEGORIES, newCategories).catch(reportSaveError);
  };

  const handleUpdateContent = (newContent: SiteContent) => {
    setContent(newContent);
    void saveDocument(FIRESTORE_COLLECTIONS.CONTENT, 'main', newContent).catch(reportSaveError);
  };

  const handleUpdateAlbums = (newAlbums: Album[]) => {
    setAlbums(newAlbums);
    void replaceCollection(FIRESTORE_COLLECTIONS.ALBUMS, newAlbums.map((album) => ({ ...album, published: album.published ?? true }))).catch(reportSaveError);
  };

  const handleUpdateBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    void replaceCollection(FIRESTORE_COLLECTIONS.BOOKINGS, newBookings).catch(reportSaveError);
  };

  const handleUpdateClients = (newClients: ClientContact[]) => {
    setClients(newClients);
    void replaceCollection(FIRESTORE_COLLECTIONS.CLIENTS, newClients).catch(reportSaveError);
  };

  const handleUpdateReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
    void replaceCollection(FIRESTORE_COLLECTIONS.REVIEWS, newReviews).catch(reportSaveError);
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    void saveDocument(FIRESTORE_COLLECTIONS.SETTINGS, 'public', newSettings).catch(reportSaveError);
  };

  // Add new Booking
  const handleSaveBooking = async (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>,
    clientData?: Partial<ClientContact>
  ): Promise<boolean> => {
    if (!user) {
      setIsAccountOpen(true);
      return false;
    }
    try {
      await createBookingRecord(bookingData, clientData);
      return true;
    } catch (error) {
      alert((error as Error).message || 'تعذر إرسال الحجز.');
      return false;
    }
  };

  // Add new Review
  const handleAddReview = async (reviewData: Omit<Review, 'id' | 'createdAt' | 'approved'>): Promise<boolean> => {
    if (!user) {
      setIsAccountOpen(true);
      return false;
    }
    try {
      await createReviewRecord(reviewData);
      return true;
    } catch (error) {
      alert((error as Error).message || 'تعذر إرسال التقييم.');
      return false;
    }
  };

  // Navigation Scrolling Handler
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    
    // Check if category matching
    const matchingCat = categories.find((c) => c.slug === sectionId);
    if (matchingCat) {
      setPortfolioCategory(sectionId);
      const el = document.getElementById('portfolio');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Lightbox Handlers
  const handleOpenLightbox = (photo: PhotoItem, albumTitle?: string) => {
    setActiveLightboxPhoto(photo);
    setLightboxAlbumTitle(albumTitle);
  };

  const handleNextPhoto = () => {
    if (!activeLightboxPhoto) return;
    const allPhotos = publicAlbums.flatMap((a) => a.images);
    const currentIndex = allPhotos.findIndex((p) => p.id === activeLightboxPhoto.id || p.url === activeLightboxPhoto.url);
    if (currentIndex >= 0 && currentIndex < allPhotos.length - 1) {
      setActiveLightboxPhoto(allPhotos[currentIndex + 1]);
    } else if (allPhotos.length > 0) {
      setActiveLightboxPhoto(allPhotos[0]);
    }
  };

  const handlePrevPhoto = () => {
    if (!activeLightboxPhoto) return;
    const allPhotos = publicAlbums.flatMap((a) => a.images);
    const currentIndex = allPhotos.findIndex((p) => p.id === activeLightboxPhoto.id || p.url === activeLightboxPhoto.url);
    if (currentIndex > 0) {
      setActiveLightboxPhoto(allPhotos[currentIndex - 1]);
    } else if (allPhotos.length > 0) {
      setActiveLightboxPhoto(allPhotos[allPhotos.length - 1]);
    }
  };

  // Open quick booking with preselection
  const handleOpenQuickBooking = (service?: string) => {
    if (service) setPreselectedBookingService(service);
    setIsQuickBookingOpen(true);
  };

  const handleOpenAdmin = () => {
    if (!user) {
      setIsAccountOpen(true);
      return;
    }
    if (!isAdmin) {
      alert('الحساب الحالي مستخدم عادي ولا يملك صلاحية فتح لوحة التحكم.');
      return;
    }
    window.location.hash = '/admin';
    setIsAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    if (window.location.hash === '#/admin') {
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
    }
    setIsAdminOpen(false);
  };

  useEffect(() => {
    const syncAdminRoute = () => setIsAdminOpen(window.location.hash === '#/admin');
    window.addEventListener('hashchange', syncAdminRoute);
    return () => window.removeEventListener('hashchange', syncAdminRoute);
  }, []);

  useEffect(() => {
    if (window.location.hash === '#/admin' && user && isAdmin) setIsAdminOpen(true);
  }, [user, isAdmin]);

  // Birthday alerts count
  const birthdayAlerts = getUpcomingBirthdayAlerts(clients);

  return (
    <LanguageProvider value={{
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === 'ar' ? 'en' : 'ar'),
      t: (arabic, english) => language === 'ar' ? arabic : english,
    }}>
    <div id="kallista-app-root" dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#fffefb] text-[#24211e] flex flex-col selection:bg-[#c6a585]/30">
      
      {/* 03 — HEADER / NAVIGATION */}
      <Navbar
        settings={settings}
        content={publicContent}
        categories={publicCategories}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenBooking={() => handleOpenQuickBooking('weddings')}
        onOpenAdmin={handleOpenAdmin}
        onOpenAccount={() => setIsAccountOpen(true)}
        userLabel={user?.displayName || user?.email || undefined}
        birthdayAlertCount={birthdayAlerts.length}
      />

      {/* Main Content Flow according to the 27 Sections in the Brief */}
      <main className="flex-1">
        {/* 04 — HOMEPAGE HERO SECTION */}
        <HeroSection
          content={publicContent}
          onExplore={() => handleNavigate('portfolio')}
          onInquire={() => handleOpenQuickBooking('weddings')}
        />

        {/* 05 — INTRODUCTION SECTION */}
        <IntroductionSection
          content={publicContent}
          onDiscover={() => handleNavigate('about')}
        />

        {/* 06 — SERVICES (What We Preserve) */}
        <ServicesSection
          content={publicContent}
          categories={publicCategories}
          onSelectCategory={(cat) => {
            setPortfolioCategory(cat);
            handleNavigate('portfolio');
          }}
          onInquire={(srv) => handleOpenQuickBooking(srv || 'weddings')}
        />

        {/* 07, 08, 09 — THE KALLISTA APPROACH, SIGNATURE IMAGE & WEDDING FEATURE */}
        <ApproachAndSignatureSection
          content={publicContent}
          onInquireWedding={() => handleOpenQuickBooking('weddings')}
        />

        {/* 10, 11 — ABOUT KALLISTA & ABOUT RONADISA */}
        <AboutSections
          content={publicContent}
          onExploreWork={() => handleNavigate('portfolio')}
        />

        {/* 12 — PORTFOLIO (The Work — Visual First Editorial Albums) */}
        <PortfolioSection
          albums={publicAlbums}
          categories={publicCategories}
          selectedCategory={portfolioCategory}
          onCategoryChange={setPortfolioCategory}
          onOpenAlbumModal={(album) => setSelectedAlbumForDetails(album)}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* 13, 14 — THE KALLISTA EXPERIENCE & WHY KALLISTA */}
        <ExperienceSection
          content={publicContent}
          onInquire={() => handleOpenQuickBooking('weddings')}
        />

        {/* 15 — TESTIMONIALS & REVIEWS */}
        <TestimonialsSection
          reviews={reviews}
          onAddReview={handleAddReview}
        />

        {/* 16 — FAQ */}
        <FAQSection
          content={publicContent}
          onContactClick={() => handleNavigate('contact')}
        />

        {/* 17 — CONTACT & BOOKING SYSTEM */}
        <ContactAndBookingSection
          settings={settings}
          content={publicContent}
          categories={publicCategories}
          onSaveBooking={handleSaveBooking}
          preselectedService={preselectedBookingService}
        />
      </main>

      {/* 18, 27 — MINIMAL FOOTER & FINAL WEBSITE MESSAGE */}
      <FooterSection
        settings={settings}
        content={publicContent}
        categories={publicCategories}
        onNavigate={handleNavigate}
        onOpenBooking={() => handleOpenQuickBooking('weddings')}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* MODAL DIALOGS */}
      {/* 1. Full Album Details Modal */}
      <AlbumDetailsModal
        album={selectedAlbumForDetails}
        isOpen={!!selectedAlbumForDetails}
        onClose={() => setSelectedAlbumForDetails(null)}
        onOpenLightbox={handleOpenLightbox}
        onInquireAlbumService={(cat) => handleOpenQuickBooking(cat)}
      />

      {/* 2. Photo Lightbox Modal */}
      <AlbumLightboxModal
        photo={activeLightboxPhoto}
        albumTitle={lightboxAlbumTitle}
        isOpen={!!activeLightboxPhoto}
        onClose={() => setActiveLightboxPhoto(null)}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
      />

      {/* 3. Quick Booking Popup Modal */}
      <BookingModal
        isOpen={isQuickBookingOpen}
        onClose={() => setIsQuickBookingOpen(false)}
        settings={settings}
        preselectedService={preselectedBookingService}
        onSaveBooking={handleSaveBooking}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        onLogout={logoutFirebase}
      />

      {/* 4. Full Admin Management Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        isAdminAuthenticated={isAdmin}
        registeredUsersCount={registeredUsers.length}
        registeredUsers={registeredUsers}
        onRequestLogin={() => {
          setIsAdminOpen(false);
          setIsAccountOpen(true);
        }}
        albums={albums}
        categories={categories}
        content={content}
        bookings={bookings}
        clients={clients}
        reviews={reviews}
        settings={settings}
        onUpdateAlbums={handleUpdateAlbums}
        onUpdateCategories={handleUpdateCategories}
        onUpdateContent={handleUpdateContent}
        onUpdateBookings={handleUpdateBookings}
        onUpdateClients={handleUpdateClients}
        onUpdateReviews={handleUpdateReviews}
        onUpdateSettings={handleUpdateSettings}
      />

      <AppearanceControls controlsHidden={isAdminOpen} />

    </div>
    </LanguageProvider>
  );
}
