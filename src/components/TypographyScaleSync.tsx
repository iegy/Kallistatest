import { useEffect } from 'react';
import { SiteSettings } from '../types';
import { FIRESTORE_COLLECTIONS, watchDocument } from '../services/firebase';
import { getSettings } from '../services/storage';

const MIN_SCALE = 85;
const MAX_SCALE = 125;
const DEFAULT_SCALE = 100;

const normalizeScale = (value: number | undefined): number => {
  const numericValue = Number(value ?? DEFAULT_SCALE);
  if (!Number.isFinite(numericValue)) return DEFAULT_SCALE;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, numericValue));
};

const applyTypographyScales = (settings?: Partial<SiteSettings> | null) => {
  if (typeof document === 'undefined') return;

  const bodyScale = normalizeScale(settings?.bodyFontScale) / 100;
  const headingScale = normalizeScale(settings?.headingFontScale) / 100;
  const themeKey = (
    settings?.themeKey === 'sage'
    || settings?.themeKey === 'meadow'
    || settings?.themeKey === 'olive-blush'
  ) ? settings.themeKey : 'classic';

  document.documentElement.style.setProperty('--kallista-body-font-scale', String(bodyScale));
  document.documentElement.style.setProperty('--kallista-heading-font-scale', String(headingScale));
  document.documentElement.dataset.kallistaTheme = themeKey;
};

const typographyCss = `
  /*
   * Scoped to public content only:
   * - navigation keeps its original size
   * - admin dashboard keeps its original size
   * - existing responsive Tailwind font hierarchy stays intact
   */
  #kallista-app-root :where(main, footer, [role='dialog'])
  :where(h1, h2, h3, h4, h5, h6):not(#kallista-admin-dashboard *) {
    zoom: var(--kallista-heading-font-scale, 1);
  }

  #kallista-app-root :where(main, footer, [role='dialog'])
  :where(p, li, label, input, textarea, select, button, small):not(#kallista-admin-dashboard *) {
    zoom: var(--kallista-body-font-scale, 1);
  }

  /*
   * Kallista Sage — the same warm palette with a visibly stronger green
   * presence. It is scoped to the public light theme so the existing
   * dark-mode design and the admin dashboard stay untouched.
   */
  html[data-kallista-theme='sage']:not([data-theme='dark']) {
    --color-offwhite: #f8faf5;
    --color-light-warm: #dbe3d1;
    --color-gray-green: #afbb9c;
    --color-gray-orange: #c6a585;
    --color-dark: #24211e;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark']) body,
  html[data-kallista-theme='sage']:not([data-theme='dark']) #kallista-app-root {
    background-color: #f8faf5 !important;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark']) #kallista-app-root {
    background-image:
      radial-gradient(circle at 8% 12%, rgba(115, 130, 98, 0.18), transparent 28rem),
      radial-gradient(circle at 92% 28%, rgba(143, 162, 120, 0.14), transparent 32rem);
  }

  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(even) {
    background-color: color-mix(in srgb, #afbb9c 32%, #fffefb) !important;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(odd) {
    background-color: color-mix(in srgb, #fffefb 92%, #afbb9c) !important;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#e6e1d6]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#EAE3DA]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#f2ede4]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#efe9e0]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#EFE9E0]'] {
    background-color: #dbe3d1 !important;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#FAF8F5]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#faf8f5]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#faf7f2]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#fdfaf6]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#f8f4ee]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#F7F3EE]'] {
    background-color: #f3f7ee !important;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#e6e1d6]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#EAE3DA]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#ded5c7]'] {
    border-color: #c8d4bb !important;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]'] {
    background-color: #4e633d !important;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]']:hover,
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]']:hover {
    background-color: #738262 !important;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#738262]'] {
    background-color: #738262 !important;
  }

  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#738262]'],
  html[data-kallista-theme='sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#5f6c50]'] {
    color: #4e633d !important;
  }

  /*
   * Kallista Meadow — light green + soft orange + beige + cream.
   * Warm, natural and bright without changing the site's structure.
   */
  html[data-kallista-theme='meadow']:not([data-theme='dark']) {
    --color-offwhite: #fff9ee;
    --color-light-warm: #ddd1be;
    --color-gray-green: #b8c9a7;
    --color-gray-orange: #e7b07b;
    --color-dark: #302a25;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark']) body,
  html[data-kallista-theme='meadow']:not([data-theme='dark']) #kallista-app-root {
    color: #302a25;
    background-color: #fff9ee !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark']) #kallista-app-root {
    background-image:
      radial-gradient(circle at 8% 12%, rgba(184, 201, 167, 0.22), transparent 28rem),
      radial-gradient(circle at 92% 28%, rgba(231, 176, 123, 0.18), transparent 32rem);
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(even) {
    background-color: color-mix(in srgb, #b8c9a7 26%, #fff9ee) !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(odd) {
    background-color: color-mix(in srgb, #fff9ee 91%, #f0c59a) !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#e6e1d6]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#EAE3DA]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#f2ede4]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#efe9e0]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#EFE9E0]'] {
    background-color: #ddd1be !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#FAF8F5]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#faf8f5]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#faf7f2]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#fdfaf6]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#f8f4ee]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#F7F3EE]'] {
    background-color: #f7f1e7 !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#e6e1d6]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#EAE3DA]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#ded5c7]'] {
    border-color: #d8c8b2 !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]'] {
    background-color: #667a52 !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]']:hover,
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]']:hover {
    background-color: #8fa278 !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#738262]'] {
    background-color: #8fa278 !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#738262]'],
  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#5f6c50]'] {
    color: #667a52 !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#c6a585]'] {
    background-color: #e7b07b !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#c6a585]'] {
    border-color: #e7b07b !important;
  }

  html[data-kallista-theme='meadow']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#c6a585]'] {
    color: #b87843 !important;
  }

  /*
   * Kallista Olive Blush — olive green + dusty blush + sandy beige.
   * A softer editorial-luxury alternative.
   */
  html[data-kallista-theme='olive-blush']:not([data-theme='dark']) {
    --color-offwhite: #fff9f1;
    --color-light-warm: #d9ccba;
    --color-gray-green: #b6be9d;
    --color-gray-orange: #d8b3a8;
    --color-dark: #342c28;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark']) body,
  html[data-kallista-theme='olive-blush']:not([data-theme='dark']) #kallista-app-root {
    color: #342c28;
    background-color: #fff9f1 !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark']) #kallista-app-root {
    background-image:
      radial-gradient(circle at 8% 12%, rgba(182, 190, 157, 0.2), transparent 28rem),
      radial-gradient(circle at 92% 28%, rgba(216, 179, 168, 0.18), transparent 32rem);
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(even) {
    background-color: color-mix(in srgb, #b6be9d 24%, #fff9f1) !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(odd) {
    background-color: color-mix(in srgb, #fff9f1 92%, #d8b3a8) !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#e6e1d6]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#EAE3DA]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#f2ede4]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#efe9e0]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#EFE9E0]'] {
    background-color: #d9ccba !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#FAF8F5]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#faf8f5]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#faf7f2]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#fdfaf6]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#f8f4ee]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#F7F3EE]'] {
    background-color: #f4eee5 !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#e6e1d6]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#EAE3DA]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#ded5c7]'] {
    border-color: #d9ccba !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]'] {
    background-color: #606b4d !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]']:hover,
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]']:hover {
    background-color: #929d78 !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#738262]'] {
    background-color: #929d78 !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#738262]'],
  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#5f6c50]'] {
    color: #606b4d !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#c6a585]'] {
    background-color: #d8b3a8 !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#c6a585]'] {
    border-color: #d8b3a8 !important;
  }

  html[data-kallista-theme='olive-blush']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#c6a585]'] {
    color: #a76f61 !important;
  }
`;

export const TypographyScaleSync = () => {
  useEffect(() => {
    // Apply the cached settings immediately to avoid a visible size jump.
    applyTypographyScales(getSettings());

    let unsubscribe = () => undefined;

    try {
      unsubscribe = watchDocument<SiteSettings>(
        FIRESTORE_COLLECTIONS.SETTINGS,
        'public',
        (value) => {
          if (value) applyTypographyScales(value);
        },
      );
    } catch (error) {
      // Cached settings remain active if Firebase is temporarily unavailable.
      console.warn('Typography settings sync is unavailable:', error);
    }

    return unsubscribe;
  }, []);

  return <style data-kallista-typography-scale>{typographyCss}</style>;
};
