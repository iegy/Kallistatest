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
  mergeSiteContent,
  mergeSettings,
  saveAlbums,
  saveBookings,
  saveClients,
  savePortfolioCategories,
  saveReviews,
  saveSettings,
  saveSiteContent,
} from './services/storage';
import {
  FIRESTORE_COLLECTIONS,
  createBookingRecord,
  createLeadRecord,
  createReviewRecord,
  isFirebaseAdmin,
  logoutFirebase,
  saveDocument,
  seedDefaults,
  subscribeToFirebaseAuthState,
  syncCollection,
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
import { StayInTouchSection } from './components/StayInTouchSection';
import { FooterSection } from './components/FooterSection';
import { AlbumDetailsModal } from './components/AlbumDetailsModal';
import { AlbumLightboxModal } from './components/AlbumLightboxModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { BookingModal } from './components/BookingModal';
import { AccountModal } from './components/AccountModal';
import { AppearanceControls } from './components/AppearanceControls';
import { Language, LanguageProvider, localizeAlbums, localizeCategories, localizeContent } from './i18n';
import { ensureSiteFontsLoaded, getBodyFontOption, getHeadingFontOption } from './themeFonts';

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

  // Prevent the public UI from flashing stale local/default content before
  // Firestore sends the first authoritative snapshot.
  const [firebaseHydration, setFirebaseHydration] = useState({
    content: false,
    settings: false,
    categories: false,
    albums: false,
  });
  const [hydrationFallbackReached, setHydrationFallbackReached] = useState(false);

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
      watchDocument<SiteContent>(FIRESTORE_COLLECTIONS.CONTENT, 'main', (value) => {
        setFirebaseHydration((current) => ({ ...current, content: true }));
        if (!value) return;
        const normalizedContent = mergeSiteContent(value);
        setContent(normalizedContent);
        saveSiteContent(normalizedContent);
      }),
      watchDocument<SiteSettings>(FIRESTORE_COLLECTIONS.SETTINGS, 'public', (value) => {
        setFirebaseHydration((current) => ({ ...current, settings: true }));
        if (!value) return;
        const normalizedSettings = mergeSettings(value);
        setSettings(normalizedSettings);
        saveSettings(normalizedSettings);
      }),
    ];
    if (!isAdmin) {
      unsubscribers.push(
        watchCollection<PortfolioCategory>(FIRESTORE_COLLECTIONS.CATEGORIES, (values) => {
          setFirebaseHydration((current) => ({ ...current, categories: true }));
          setCategories(values);
          savePortfolioCategories(values);
        }, where('active', '==', true)),
        watchCollection<Album>(FIRESTORE_COLLECTIONS.ALBUMS, (values) => {
          setFirebaseHydration((current) => ({ ...current, albums: true }));
          setAlbums(values);
          saveAlbums(values);
        }, where('published', '==', true)),
        watchCollection<Review>(FIRESTORE_COLLECTIONS.REVIEWS, (values) => {
          setReviews(values);
          saveReviews(values);
        }, where('approved', '==', true)),
      );
    }
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [isAdmin]);

  useEffect(() => {
    const root = document.documentElement;
    const bodyFont = getBodyFontOption(settings.bodyFontKey);
    const headingFont = getHeadingFontOption(settings.headingFontKey);

    ensureSiteFontsLoaded(bodyFont.key, headingFont.key);
    root.style.setProperty('--font-arabic-sans', bodyFont.stack);
    root.style.setProperty('--font-arabic-serif', headingFont.stack);
  }, [settings.bodyFontKey, settings.headingFontKey]);

  const isFirebaseHydrated =
    firebaseHydration.content
    && firebaseHydration.settings
    && firebaseHydration.categories
    && firebaseHydration.albums;

  const isInitialSiteReady = isFirebaseHydrated || hydrationFallbackReached;

  useEffect(() => {
    if (isFirebaseHydrated) return;

    const timeoutId = window.setTimeout(() => {
      // Safety fallback only: if Firebase is unavailable, do not leave the site
      // permanently blocked. Local/default content can still be used after 4s.
      setHydrationFallbackReached(true);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [isFirebaseHydrated]);

  useEffect(() => {
    if (!isAdmin) return;
    void seedDefaults({ content, settings, categories, albums });
    const unsubscribers = [
      watchCollection<PortfolioCategory>(FIRESTORE_COLLECTIONS.CATEGORIES, (values) => {
        setFirebaseHydration((current) => ({ ...current, categories: true }));
        setCategories(values);
        savePortfolioCategories(values);
      }),
      watchCollection<Album>(FIRESTORE_COLLECTIONS.ALBUMS, (values) => {
        setFirebaseHydration((current) => ({ ...current, albums: true }));
        setAlbums(values);
        saveAlbums(values);
      }),
      watchCollection<Booking>(FIRESTORE_COLLECTIONS.BOOKINGS, (values) => {
        setBookings(values);
        saveBookings(values);
      }),
      watchCollection<ClientContact>(FIRESTORE_COLLECTIONS.CLIENTS, (values) => {
        setClients(values);
        saveClients(values);
      }),
      watchCollection<Review>(FIRESTORE_COLLECTIONS.REVIEWS, (values) => {
        setReviews(values);
        saveReviews(values);
      }),
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

  const commitSave = async (operation: () => Promise<void>, onSuccess: () => void) => {
    try {
      await operation();
      onSuccess();
    } catch (error) {
      reportSaveError(error);
      throw error;
    }
  };

  const handleUpdateCategories = async (newCategories: PortfolioCategory[]) => {
    await commitSave(
      () => syncCollection(FIRESTORE_COLLECTIONS.CATEGORIES, categories, newCategories),
      () => {
        setCategories(newCategories);
        savePortfolioCategories(newCategories);
      },
    );
  };

  const handleUpdateContent = async (newContent: SiteContent) => {
    const normalizedContent = mergeSiteContent(newContent);
    await commitSave(
      () => saveDocument(FIRESTORE_COLLECTIONS.CONTENT, 'main', normalizedContent),
      () => {
        setContent(normalizedContent);
        saveSiteContent(normalizedContent);
      },
    );
  };

  const handleUpdateAlbums = async (newAlbums: Album[]) => {
    const normalizedAlbums = newAlbums.map((album) => ({ ...album, published: album.published ?? true }));
    await commitSave(
      () => syncCollection(FIRESTORE_COLLECTIONS.ALBUMS, albums, normalizedAlbums),
      () => {
        setAlbums(normalizedAlbums);
        saveAlbums(normalizedAlbums);
      },
    );
  };

  const handleUpdateBookings = async (newBookings: Booking[]) => {
    await commitSave(
      () => syncCollection(FIRESTORE_COLLECTIONS.BOOKINGS, bookings, newBookings),
      () => {
        setBookings(newBookings);
        saveBookings(newBookings);
      },
    );
  };

  const handleUpdateClients = async (newClients: ClientContact[]) => {
    await commitSave(
      () => syncCollection(FIRESTORE_COLLECTIONS.CLIENTS, clients, newClients),
      () => {
        setClients(newClients);
        saveClients(newClients);
      },
    );
  };

  const handleUpdateReviews = async (newReviews: Review[]) => {
    await commitSave(
      () => syncCollection(FIRESTORE_COLLECTIONS.REVIEWS, reviews, newReviews),
      () => {
        setReviews(newReviews);
        saveReviews(newReviews);
      },
    );
  };

  const handleUpdateSettings = async (newSettings: SiteSettings) => {
    const normalizedSettings = mergeSettings(newSettings);
    await commitSave(
      () => saveDocument(FIRESTORE_COLLECTIONS.SETTINGS, 'public', normalizedSettings),
      () => {
        setSettings(normalizedSettings);
        saveSettings(normalizedSettings);
      },
    );
  };

  // Add new Booking — no account required; signing in is optional and simply
  // links the request to the client's profile.
  const handleSaveBooking = async (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>,
    clientData?: Partial<ClientContact>
  ): Promise<boolean> => {
    try {
      await createBookingRecord(bookingData, clientData);
      return true;
    } catch (error) {
      alert((error as Error).message || 'تعذر إرسال الحجز.');
      return false;
    }
  };

  // "Stay in touch" lead capture — open to everyone, no account needed.
  const handleSaveLead = async (lead: {
    name: string; phone: string; whatsapp?: string; email: string;
    birthday?: string; governorate?: string; city?: string;
    serviceInterests?: string[]; notes?: string;
  }): Promise<boolean> => {
    try {
      await createLeadRecord(lead);
      return true;
    } catch (error) {
      alert((error as Error).message || 'تعذر حفظ بياناتك. حاول مرة أخرى.');
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

  // Support shareable section links such as https://kallista.work/#reviews.
  // The public UI mounts only after Firebase hydration, so perform the fragment
  // scroll after the real sections exist in the DOM and keep it working on
  // later hash changes too.
  useEffect(() => {
    if (!isInitialSiteReady) return;

    const scrollToPublicHash = () => {
      const rawHash = window.location.hash;
      if (!rawHash || rawHash === '#/admin' || rawHash.startsWith('#/')) return;

      const sectionId = decodeURIComponent(rawHash.slice(1));
      if (!sectionId) return;

      window.setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        section.style.scrollMarginTop = '96px';
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    };

    scrollToPublicHash();
    window.addEventListener('hashchange', scrollToPublicHash);
    return () => window.removeEventListener('hashchange', scrollToPublicHash);
  }, [isInitialSiteReady]);

  // Birthday alerts count
  const birthdayAlerts = getUpcomingBirthdayAlerts(clients);

  const preventPublicImageAction = (event: React.SyntheticEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('img')) return;
    if (target.closest('#kallista-admin-dashboard')) return;
    event.preventDefault();
  };

  if (!isInitialSiteReady) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#fffefb] text-[#24211e]"
        role="status"
        aria-live="polite"
        aria-label={language === 'ar' ? 'جاري تحميل كاليستا' : 'Loading Kallista'}
      >
        <div className="flex flex-col items-center px-6 text-center">
          <div className="font-serif text-[clamp(2rem,7vw,4.5rem)] font-semibold tracking-[0.18em] sm:tracking-[0.24em]">
            KALLISTA
          </div>
          <div className="mt-1 font-serif text-sm italic tracking-[0.16em] text-[#8c6742] sm:text-base">
            by Ronadisa
          </div>

          <div className="mt-8 flex items-center gap-2" aria-hidden="true">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c6a585]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#738262] [animation-delay:180ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c6a585] [animation-delay:360ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider value={{
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === 'ar' ? 'en' : 'ar'),
      t: (arabic, english) => language === 'ar' ? arabic : english,
    }}>
    <div
      id="kallista-app-root"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#fffefb] text-[#24211e] flex flex-col selection:bg-[#c6a585]/30"
      onContextMenu={preventPublicImageAction}
      onDragStart={preventPublicImageAction}
    >

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

        {/* 17b — STAY IN TOUCH (lead capture for visitors not booking today) */}
        <StayInTouchSection
          categories={publicCategories}
          onSaveLead={handleSaveLead}
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
        currentUserId={user?.uid}
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