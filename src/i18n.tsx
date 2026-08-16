import React, { createContext, useContext } from 'react';
import { Album, PortfolioCategory, SiteContent } from './types';

export type Language = 'ar' | 'en';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (arabic: string, english: string) => string;
}

export const LanguageContext = createContext<LanguageContextValue>({
  language: 'ar',
  setLanguage: () => undefined,
  toggleLanguage: () => undefined,
  t: (arabic) => arabic,
});

export const useLanguage = () => useContext(LanguageContext);

const englishServices: Record<string, { description: string; inclusions: string[]; badge: string; price: string }> = {
  weddings: {
    description: 'Complete, discreet wedding-day coverage—from quiet preparations and refined portraits to golden-hour frames filled with genuine emotion.',
    inclusions: ['Full editorial coverage of the day', 'A professional female team for the bride’s comfort', 'Hand-finished colour grading and high-resolution delivery', 'A luxury archival wedding album', 'A curated outdoor or heritage-location session'],
    badge: 'Most requested',
    price: 'Packages from EGP 15,000',
  },
  fashion: {
    description: 'Editorial campaigns and lookbooks for modest-fashion designers and premium brands, with art direction that celebrates texture, movement and detail.',
    inclusions: ['International editorial visual standard', 'Studio and cinematic lighting options', 'Campaign and e-commerce-ready images', 'Colour and composition art direction'],
    badge: 'Editorial standard',
    price: 'Sessions from EGP 8,000',
  },
  children: {
    description: 'Warm, unforced family sessions that preserve childhood laughter and honest connection in a relaxed, playful atmosphere.',
    inclusions: ['A child-friendly and flexible session', 'Studio or natural-light outdoor coverage', 'Fine prints and a keepsake box', 'Honest documentation of family connection'],
    badge: 'Natural warmth',
    price: 'Sessions from EGP 5,500',
  },
  portraits: {
    description: 'Refined portraits for founders, professionals and creatives, designed to communicate confidence, character and a distinctive visual identity.',
    inclusions: ['Posing and wardrobe guidance', 'Multiple background and lighting directions', 'Natural, detail-conscious expert retouching'],
    badge: 'Confident identity',
    price: 'Sessions from EGP 4,000',
  },
};

export function localizeContent(content: SiteContent, language: Language): SiteContent {
  if (language === 'ar') {
    const approachSubtitles = ['الرؤية الإبداعية', 'الموقع وتوقيت الضوء', 'تجربة التصوير', 'المعالجة والتسليم'];
    return {
      ...content,
      hero: { ...content.hero, preTitle: 'التصوير الفني والتحريري' },
      approach: {
        ...content.approach,
        steps: content.approach.steps.map((step, index) => ({ ...step, subtitle: approachSubtitles[index] || step.subtitle })),
      },
      signature: { ...content.signature, subtitle: 'اللقطة التوقيعية لكاليستا' },
      experience: { ...content.experience, subtitle: 'تجربة واضحة ومريحة ومدروسة في كل مرحلة' },
    };
  }

  return {
    ...content,
    brand: {
      ...content.brand,
      taglineAr: content.brand.taglineEn || 'Editorial Luxury & Timeless Fine Art Photography in Egypt',
      badgeText: 'Luxury editorial photography — Alexandria & Cairo',
    },
    hero: {
      ...content.hero,
      preTitle: 'FINE ART & EDITORIAL PHOTOGRAPHY',
      titleMain: 'Your story, preserved',
      titleAccent: 'with timeless grace',
      subtitle: 'A refined editorial photography experience for women, men, couples, families and brands—shaped by cinematic light, privacy and meticulous attention to detail.',
      quote: 'A timeless photograph preserves more than appearance; it holds the feeling before it becomes a memory.',
      primaryCtaText: 'Explore the portfolio',
      secondaryCtaText: 'Book a private consultation',
      stats: [
        { number: '01', label: 'A distinct vision for every session' },
        { number: '100%', label: 'Nothing published without consent' },
        { number: '04', label: 'Core photography disciplines' },
      ],
    },
    intro: {
      ...content.intro,
      heading: 'A visual philosophy of quiet elegance',
      paragraph1: 'At Kallista Studio, led by editorial photographer Ronadisa, we believe true beauty lives in refined modesty, visual harmony and honest emotion—never in forced poses or commercial noise.',
      paragraph2: 'We create magazine-inspired imagery where considered styling, graceful fabrics and natural light come together in photographs designed to remain meaningful for generations.',
      quote: 'We do not simply take photographs; we compose visual stories that preserve your presence and your most valuable memories.',
      quoteAuthor: '— Ronadisa, Founder of Kallista',
      stats: [
        { value: 'Fine Art', label: 'Meticulous hand-finished imagery' },
        { value: 'Editorial', label: 'Confident, comfortable direction' },
        { value: 'Authentic', label: 'Honest emotion and visual identity' },
      ],
    },
    servicesSettings: {
      ...content.servicesSettings,
      hidePriceCustomText: 'Request a tailored quotation',
    },
    services: content.services.map((service) => {
      const copy = englishServices[service.categorySlug];
      return {
        ...service,
        titleAr: service.titleEn || service.titleAr,
        descriptionAr: service.descriptionEn || copy?.description || service.descriptionAr,
        inclusions: copy?.inclusions || service.inclusions,
        badge: copy?.badge || service.badge,
        priceStarting: copy?.price || service.priceStarting,
      };
    }),
    approach: {
      sectionTitle: 'The Kallista approach — artistry in every detail',
      sectionSubtitle: 'A calm, considered journey from the first conversation to the final heirloom',
      steps: [
        { number: '01', title: 'Creative consultation', subtitle: 'Your vision', description: 'We learn your story, style and priorities, then build a tailored visual direction for the session.', detail: 'Lighting, colour, wardrobe and timing are considered in advance for a seamless experience.' },
        { number: '02', title: 'Location and light planning', subtitle: 'Scouting & timing', description: 'We study the location and select the most flattering natural-light window and compositions.', detail: 'Every angle is chosen to complement the setting and your presence.' },
        { number: '03', title: 'A calm editorial session', subtitle: 'The experience', description: 'Gentle direction and a private, welcoming atmosphere help you look natural, confident and entirely yourself.', detail: 'Our team stays attentive to comfort, discretion and every meaningful detail.' },
        { number: '04', title: 'Master finishing & delivery', subtitle: 'The final collection', description: 'Each selected frame is carefully refined while preserving natural skin, colour and character.', detail: 'Your private gallery and archival album are delivered with care.' },
      ],
    },
    signature: {
      ...content.signature,
      title: 'The signature frame — timeless harmony of light and grace',
      subtitle: 'The Signature Kallista Frame',
      quote: 'Elegance is not excess; it is beauty expressed with confidence, balance and intention.',
      imageCaption: 'A refined wedding story — Alexandria, Egypt',
    },
    aboutKallista: {
      ...content.aboutKallista,
      title: 'About Kallista Studio',
      subtitle: 'An editorial photography house created around elegance, privacy and meaningful imagery',
      paragraph1: 'Kallista was founded to offer an exceptional visual experience for women, men, couples, families and brands in Egypt and across the Arab world. We unite editorial sophistication with honest human emotion.',
      paragraph2: 'From lighting and composition to a restrained colour palette, every detail is considered with an uncompromising commitment to privacy and client care.',
      pillars: [
        { title: 'Complete privacy', description: 'A trusted team and protected workflow keep every project discreet' },
        { title: 'Cinematic natural light', description: 'A refined visual language that feels alive, never staged' },
        { title: 'Archival fine-art printing', description: 'Museum-quality albums designed to last for generations' },
      ],
    },
    aboutRonadisa: {
      ...content.aboutRonadisa,
      title: 'About Ronadisa',
      founderName: 'Ronadisa',
      subtitle: 'Editorial photographer and founder of Kallista Studio',
      bioParagraph1: 'Ronadisa’s work blends a sensitive artistic eye with a deep command of light, composition and direction. Her signature is refined, cinematic imagery that honours every subject’s personality and presence.',
      bioParagraph2: 'She approaches every commission as a human and creative collaboration—balancing thoughtful guidance with space for spontaneous moments to unfold naturally.',
      quote: 'Everyone in front of my lens deserves to see an honest, elegant portrait that truly feels like them.',
      palestinianTribute: content.aboutRonadisa.palestinianTribute,
    },
    experience: {
      title: 'The Kallista experience — effortless from beginning to end',
      subtitle: 'A clear, comfortable and thoughtfully managed journey',
      timelineSteps: [
        { step: '1', title: 'Enquiry and availability', time: 'Day 1', desc: 'We receive your request, understand the service and confirm the available date.' },
        { step: '2', title: 'Creative planning', time: 'Before the session', desc: 'We align wardrobe, location, mood and the best time for light.' },
        { step: '3', title: 'The editorial session', time: 'Session day', desc: 'A relaxed experience with clear direction and attentive privacy.' },
        { step: '4', title: 'Private proofing & editing', time: 'Within 5 days', desc: 'A protected gallery lets you select your preferred photographs for final finishing.' },
        { step: '5', title: 'Album & high-resolution delivery', time: 'Within two weeks', desc: 'Your finished collection is delivered digitally and in an elegant archival presentation.' },
      ],
      guarantees: [
        { title: 'Privacy without compromise', desc: 'No image is published without explicit client consent.' },
        { title: 'Clear timelines', desc: 'Every stage and delivery date is agreed in advance.' },
        { title: 'Secure, organised delivery', desc: 'Storage, access and delivery terms are transparent before booking.' },
      ],
    },
    faq: [
      { id: 'faq-1', question: 'How do you protect client privacy?', answer: 'Every project follows a discreet workflow. We can arrange a female team where requested, secure private locations and never publish an image without explicit written consent.', category: 'weddings' },
      { id: 'faq-2', question: 'How far in advance should we book?', answer: 'For weddings, we recommend booking two to four months in advance. Portrait, family and brand sessions may be available sooner depending on the season.', category: 'weddings' },
      { id: 'faq-3', question: 'Do you work outside Alexandria?', answer: 'Yes. We photograph in Cairo, El Gouna, the North Coast and across Egypt, with destination coverage available by arrangement.', category: 'general' },
      { id: 'faq-4', question: 'What kind of albums do you offer?', answer: 'Our albums use archival fine-art paper and premium linen or leather finishes, created to preserve colour and detail for generations.', category: 'deliverables' },
      { id: 'faq-5', question: 'How are photographs delivered?', answer: 'Final images are delivered through a private password-protected gallery in high resolution, with printed albums and keepsake presentation options available.', category: 'deliverables' },
    ],
    contact: {
      ...content.contact,
      title: 'Let us preserve a story worth remembering',
      subtitle: 'Tell us about your celebration, family, portrait or brand project and we will shape a thoughtful experience around it.',
      address: 'Alexandria, Egypt — Laurent / San Stefano',
      workingHours: 'Saturday–Thursday, 11:00 AM–9:00 PM — by appointment',
      depositPolicy: 'A 30% deposit confirms the booking. Date changes remain possible with advance coordination and subject to availability.',
      privacyNote: 'Your information and photographs are treated with complete discretion.',
    },
    footer: {
      ...content.footer,
      copyrightText: '© 2026 KALLISTA by Ronadisa. All rights reserved.',
      disclaimerText: 'Editorial fine-art photography for weddings, portraits, families and brands — Alexandria, Egypt.',
      privacyNotice: 'We protect client privacy, creative rights and every entrusted image.',
    },
  };
}

export function localizeCategories(categories: PortfolioCategory[], language: Language): PortfolioCategory[] {
  if (language === 'ar') return categories;
  return categories.map((category) => ({ ...category, nameAr: category.nameEn || category.nameAr }));
}

const englishAlbumStories: Record<string, { location: string; story: string }> = {
  'album-wed-flagship': { location: 'Alexandria — historic palace gardens', story: 'A graceful wedding story shaped by soft architecture, warm evening light and honest moments between Noor and Kareem.' },
  'album-fash-1': { location: 'Kallista Studio — Alexandria', story: 'A modest-fashion editorial exploring silk, movement and warm shadow through a clean contemporary visual language.' },
  'album-child-1': { location: 'Alexandria gardens', story: 'A relaxed family session preserving childhood laughter, maternal warmth and the quiet beauty of everyday connection.' },
};

const arabicAlbumLocations: Record<string, string> = {
  'album-wed-flagship': 'حدائق قصر تاريخي — الإسكندرية',
  'album-fash-1': 'ستوديو كاليستا — المساحة الإبداعية بالإسكندرية',
  'album-child-1': 'جلسة خارجية — حدائق الإسكندرية الهادئة',
};

export function localizeAlbums(albums: Album[], language: Language): Album[] {
  if (language === 'ar') {
    return albums.map((album) => ({
      ...album,
      location: arabicAlbumLocations[album.id] || album.location,
    }));
  }
  return albums.map((album) => {
    const copy = englishAlbumStories[album.id];
    return {
      ...album,
      title: album.titleEn || album.title,
      location: copy?.location || album.location,
      story: copy?.story || album.story,
      images: album.images.map((photo, index) => ({
        ...photo,
        title: `Editorial frame ${String(index + 1).padStart(2, '0')}`,
        caption: 'A carefully finished photograph from the complete session story.',
      })),
    };
  });
}

export const LanguageProvider = LanguageContext.Provider;
