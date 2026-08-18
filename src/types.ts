export interface PortfolioCategory {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  icon?: string;
  active: boolean;
  displayOrder: number;
}

export interface PhotoItem {
  id: string;
  url: string;
  thumbUrl?: string;
  deleteUrl?: string;
  title?: string;
  caption?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  featured?: boolean;
  uploadedAt: string;
}

export interface Album {
  id: string;
  title: string;
  titleEn?: string;
  category: string; // slug of PortfolioCategory e.g. 'weddings', 'fashion', 'children', or custom
  coverImage: string;
  date: string;
  location?: string;
  story?: string;
  featured?: boolean;
  published?: boolean;
  tags?: string[];
  images: PhotoItem[];
}

export interface Booking {
  id: string;
  clientName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  serviceType: string;
  date: string; // YYYY-MM-DD
  timeSlot?: string;
  location: string;
  governorate?: string; // stable key from EGYPT_GOVERNORATES
  city?: string; // markaz / city within the governorate
  storyNotes?: string;
  budget?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  userId?: string;
}

export interface ClientContact {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  birthday?: string; // YYYY-MM-DD
  weddingAnniversary?: string; // YYYY-MM-DD
  governorate?: string; // stable key from EGYPT_GOVERNORATES
  city?: string; // markaz / city within the governorate
  serviceInterests: string[];
  notes?: string;
  subscribeUpdates: boolean;
  totalBookings: number;
  tags: string[];
  createdAt: string;
  userId?: string;
  /** Where this contact came from — a booking request, the standalone
   *  "stay in touch" form, or added by hand in the dashboard. */
  source?: 'booking' | 'stay-in-touch' | 'manual';
}

export interface Review {
  id: string;
  clientName: string;
  service: string;
  rating: number; // 1 to 5
  comment: string;
  eventDate?: string;
  approved: boolean;
  createdAt: string;
  clientLocation?: string;
  userId?: string;
}

export interface ServiceItem {
  id: string;
  titleAr: string;
  titleEn: string;
  categorySlug: string;
  descriptionAr: string;
  descriptionEn?: string;
  inclusions: string[];
  priceStarting?: string;
  showPrice?: boolean;
  badge?: string;
  coverImage?: string;
  featured?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

export interface SiteContent {
  brand: {
    studioName: string;
    founderName: string;
    taglineAr: string;
    taglineEn: string;
    logoType: 'svg' | 'vector' | 'image';
    logoImageUrl?: string;
    footerLogoType?: 'svg' | 'vector' | 'image' | 'same_as_header';
    footerLogoImageUrl?: string;
    badgeText: string;
    showPalestinianBadge: boolean;
  };
  hero: {
    preTitle: string;
    titleMain: string;
    titleAccent: string;
    subtitle: string;
    quote: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    bgImageUrl?: string;
    imageEyebrowAr?: string;
    imageEyebrowEn?: string;
    imageStoryTitleAr?: string;
    imageStoryTitleEn?: string;
    imageLocationAr?: string;
    imageLocationEn?: string;
    imageAvailabilityAr?: string;
    imageAvailabilityEn?: string;
    stats: { number: string; label: string }[];
  };
  intro: {
    heading: string;
    paragraph1: string;
    paragraph2: string;
    quote: string;
    quoteAuthor: string;
    stats: { value: string; label: string }[];
  };
  servicesSettings?: {
    showPricing: boolean;
    hidePriceCustomText?: string;
  };
  services: ServiceItem[];
  approach: {
    sectionTitle: string;
    sectionSubtitle: string;
    steps: {
      number: string;
      title: string;
      subtitle: string;
      description: string;
      detail: string;
    }[];
  };
  signature: {
    title: string;
    subtitle: string;
    quote: string;
    imageUrl?: string;
    imageCaption: string;
  };
  aboutKallista: {
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
    coverImage?: string;
    pillars: { title: string; description: string }[];
  };
  aboutRonadisa: {
    title: string;
    founderName: string;
    subtitle: string;
    bioParagraph1: string;
    bioParagraph2: string;
    quote: string;
    palestinianTribute: string;
    gearList: string[];
    awards: string[];
    photoUrl: string;
  };
  experience: {
    title: string;
    subtitle: string;
    timelineSteps: { step: string; title: string; time: string; desc: string }[];
    guarantees: { title: string; desc: string }[];
  };
  faq: FAQItem[];
  contact: {
    title: string;
    subtitle: string;
    address: string;
    workingHours: string;
    phone: string;
    whatsapp: string;
    email: string;
    instagram: string;
    facebook: string;
    tiktok?: string;
    socialLinks?: SocialLink[];
    depositPolicy: string;
    privacyNote: string;
  };
  footer: {
    copyrightText: string;
    disclaimerText: string;
    privacyNotice: string;
    developerCredit?: string;
  };
}

export interface SiteSettings {
  adminUsername: string;
  adminPassword: string;
  adminPin: string;
  imgbbApiKey: string;
  useFirebaseAuth: boolean;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
  currency: string;
  bodyFontKey: string;
  headingFontKey: string;
  /** Global public-site content text scale, as a percentage (85–125). */
  bodyFontScale?: number;
  /** Global public-site heading scale, as a percentage (85–125). */
  headingFontScale?: number;
}
