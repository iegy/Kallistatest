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


const ensureVeloraFontsLoaded = () => {
  if (typeof document === 'undefined') return;
  if (document.querySelector('link[data-kallista-velora-fonts]')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&family=Cairo:wght@400;500;600;700;800&display=swap';
  link.dataset.kallistaVeloraFonts = 'true';
  document.head.appendChild(link);
};

const applyTypographyScales = (settings?: Partial<SiteSettings> | null) => {
  if (typeof document === 'undefined') return;

  const bodyScale = normalizeScale(settings?.bodyFontScale) / 100;
  const headingScale = normalizeScale(settings?.headingFontScale) / 100;
  const themeKey = (
    settings?.themeKey === 'sage'
    || settings?.themeKey === 'meadow'
    || settings?.themeKey === 'olive-blush'
    || settings?.themeKey === 'glass-sage'
    || settings?.themeKey === 'velora'
  ) ? settings.themeKey : 'classic';

  document.documentElement.style.setProperty('--kallista-body-font-scale', String(bodyScale));
  document.documentElement.style.setProperty('--kallista-heading-font-scale', String(headingScale));
  document.documentElement.dataset.kallistaTheme = themeKey;

  if (themeKey === 'velora') ensureVeloraFontsLoaded();
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

  /*
   * Kallista Glass Sage V2 — stronger, visible glassmorphism.
   * The previous version looked too flat because the footer still used
   * light-on-dark text colours after its dark background became translucent.
   * This version adds visible background layers, stronger glass panels and
   * explicit light-theme contrast fixes, while leaving the admin and dark mode untouched.
   */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark']) {
    --color-offwhite: #fffdf7;
    --color-light-warm: #ede5d8;
    --color-gray-green: #b7c9a8;
    --color-gray-orange: #d7b38a;
    --color-dark: #2f332b;
    --glass-sage-deep: #60704f;
    --glass-sage-mid: #8fa278;
    --glass-sage-light: #dce8d4;
    --glass-sage-cream: #fffdf7;
    --glass-sage-copper: #d7b38a;
    --glass-border: rgba(143, 162, 120, 0.34);
    --glass-shadow: rgba(70, 86, 58, 0.13);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark']) body,
  html[data-kallista-theme='glass-sage']:not([data-theme='dark']) #kallista-app-root {
    color: #2f332b;
    background-color: #edf4e8 !important;
  }

  /* Stronger backdrop so transparent cards have something visible to blur. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark']) #kallista-app-root {
    background-image:
      radial-gradient(circle at 8% 8%, rgba(183, 201, 168, 0.78) 0, rgba(183, 201, 168, 0.22) 21rem, transparent 38rem),
      radial-gradient(circle at 92% 20%, rgba(220, 232, 212, 0.95) 0, rgba(220, 232, 212, 0.24) 24rem, transparent 42rem),
      radial-gradient(circle at 18% 68%, rgba(215, 179, 138, 0.25) 0, rgba(215, 179, 138, 0.08) 18rem, transparent 34rem),
      radial-gradient(circle at 82% 84%, rgba(143, 162, 120, 0.38) 0, rgba(143, 162, 120, 0.08) 22rem, transparent 38rem),
      linear-gradient(145deg, #f5f8f1 0%, #eef5e9 48%, #f9f6ee 100%);
    background-attachment: fixed;
  }

  /* Glass navigation bar. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > header {
    background:
      linear-gradient(135deg, rgba(255, 253, 247, 0.78), rgba(220, 232, 212, 0.52)) !important;
    border-color: rgba(143, 162, 120, 0.42) !important;
    backdrop-filter: blur(20px) saturate(135%);
    -webkit-backdrop-filter: blur(20px) saturate(135%);
    box-shadow:
      0 12px 36px rgba(70, 86, 58, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.82);
  }

  /* Alternating translucent sections with visible green depth behind the glass cards. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(even) {
    background:
      linear-gradient(145deg, rgba(220, 232, 212, 0.42), rgba(255, 253, 247, 0.16)) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(odd) {
    background:
      linear-gradient(145deg, rgba(255, 253, 247, 0.46), rgba(183, 201, 168, 0.18)) !important;
  }

  /*
   * Primary glass panels. Keep the selector limited to elements that already
   * have card/panel backgrounds so photo wrappers and layout containers are not altered.
   */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main
  :where(
    div[class*='bg-white'],
    div[class*='bg-[#fffefb]'],
    div[class*='bg-[#FAF8F5]'],
    div[class*='bg-[#faf8f5]'],
    div[class*='bg-[#faf7f2]'],
    div[class*='bg-[#fdfaf6]'],
    div[class*='bg-[#f8f4ee]'],
    div[class*='bg-[#F7F3EE]'],
    article[class*='bg-white'],
    article[class*='bg-[#fffefb]'],
    article[class*='bg-[#FAF8F5]'],
    aside[class*='bg-white'],
    aside[class*='bg-[#fffefb]'],
    form[class*='bg-white'],
    form[class*='bg-[#fffefb]']
  ) {
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.69), rgba(220, 232, 212, 0.34)) !important;
    border-color: rgba(143, 162, 120, 0.38) !important;
    backdrop-filter: blur(20px) saturate(138%);
    -webkit-backdrop-filter: blur(20px) saturate(138%);
    box-shadow:
      0 18px 44px rgba(70, 86, 58, 0.12),
      0 4px 14px rgba(96, 112, 79, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.88),
      inset 0 -1px 0 rgba(183, 201, 168, 0.14);
  }

  /* Make bordered rounded cards glassy even when their background is custom. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main
  :where(
    div[class*='rounded-2xl'][class*='border'],
    div[class*='rounded-3xl'][class*='border'],
    article[class*='rounded-2xl'][class*='border'],
    article[class*='rounded-3xl'][class*='border']
  ) {
    border-color: rgba(143, 162, 120, 0.36) !important;
    box-shadow:
      0 16px 38px rgba(70, 86, 58, 0.10),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  /* Green-tinted secondary glass surfaces. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main
  :where(
    div[class*='bg-[#e6e1d6]'],
    div[class*='bg-[#EAE3DA]'],
    div[class*='bg-[#f2ede4]'],
    div[class*='bg-[#efe9e0]'],
    div[class*='bg-[#EFE9E0]'],
    article[class*='bg-[#e6e1d6]'],
    article[class*='bg-[#EAE3DA]']
  ) {
    background:
      linear-gradient(135deg, rgba(220, 232, 212, 0.66), rgba(183, 201, 168, 0.30)) !important;
    border-color: rgba(143, 162, 120, 0.36) !important;
    backdrop-filter: blur(16px) saturate(126%);
    -webkit-backdrop-filter: blur(16px) saturate(126%);
    box-shadow:
      0 14px 34px rgba(70, 86, 58, 0.10),
      inset 0 1px 0 rgba(255, 255, 255, 0.70);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#e6e1d6]'],
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#EAE3DA]'],
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#ded5c7]'] {
    border-color: rgba(143, 162, 120, 0.42) !important;
  }

  /* Public forms inherit the glass treatment without touching the admin. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main :where(input, textarea, select) {
    background: rgba(255, 253, 247, 0.64) !important;
    border-color: rgba(143, 162, 120, 0.42) !important;
    color: #2f332b !important;
    backdrop-filter: blur(10px) saturate(118%);
    -webkit-backdrop-filter: blur(10px) saturate(118%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  /* Strong, readable green actions. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]'],
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]'] {
    background:
      linear-gradient(135deg, rgba(96, 112, 79, 0.98), rgba(122, 143, 102, 0.96)) !important;
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow:
      0 10px 28px rgba(70, 86, 58, 0.20),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]']:hover,
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]']:hover {
    background:
      linear-gradient(135deg, #71865d, #8fa278) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#738262]'] {
    background:
      linear-gradient(135deg, rgba(117, 137, 96, 0.96), rgba(143, 162, 120, 0.94)) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#738262]'],
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#5f6c50]'] {
    color: #536545 !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#c6a585]'] {
    background:
      linear-gradient(135deg, #d7b38a, #c99d6e) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#c6a585]'] {
    border-color: rgba(199, 151, 103, 0.76) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#c6a585]'] {
    color: #9a6a3f !important;
  }

  /*
   * Footer: the original footer was designed for a dark background, so when
   * it became translucent its pale text lost contrast. This section explicitly
   * remaps those colours for the light glass theme.
   */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #main-footer {
    color: #2f332b !important;
    background:
      linear-gradient(145deg, rgba(255, 253, 247, 0.68), rgba(220, 232, 212, 0.46)) !important;
    border-color: rgba(143, 162, 120, 0.46) !important;
    backdrop-filter: blur(22px) saturate(136%);
    -webkit-backdrop-filter: blur(22px) saturate(136%);
    box-shadow:
      0 -16px 46px rgba(70, 86, 58, 0.10),
      inset 0 1px 0 rgba(255, 255, 255, 0.82);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #main-footer > div:first-child {
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.42), rgba(183, 201, 168, 0.18));
    border-color: rgba(143, 162, 120, 0.34) !important;
    backdrop-filter: blur(18px) saturate(128%);
    -webkit-backdrop-filter: blur(18px) saturate(128%);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #main-footer > div.max-w-7xl {
    margin-top: 2rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(143, 162, 120, 0.32);
    border-radius: 2rem;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.54), rgba(220, 232, 212, 0.28));
    backdrop-filter: blur(18px) saturate(130%);
    -webkit-backdrop-filter: blur(18px) saturate(130%);
    box-shadow:
      0 18px 48px rgba(70, 86, 58, 0.10),
      inset 0 1px 0 rgba(255, 255, 255, 0.78);
  }

  /* Footer readable text hierarchy. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #main-footer [class*='text-[#e6e1d6]'] {
    color: #4f5b46 !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #main-footer [class*='text-[#afbb9c]'] {
    color: #60704f !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #main-footer [class*='text-[#c6a585]'] {
    color: #9a6a3f !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #main-footer [class*='border-[#3d3833]'] {
    border-color: rgba(143, 162, 120, 0.36) !important;
  }

  /* Social buttons stay dark enough for white icons. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #main-footer a[class*='bg-[#3d3833]'] {
    color: #fffdf7 !important;
    background:
      linear-gradient(135deg, #536545, #71865d) !important;
    border: 1px solid rgba(255, 255, 255, 0.24);
    box-shadow: 0 8px 22px rgba(70, 86, 58, 0.16);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #main-footer a[class*='bg-[#3d3833]']:hover {
    color: #2f332b !important;
    background:
      linear-gradient(135deg, #d7b38a, #c99d6e) !important;
  }

  /* Footer CTA remains warm and legible. */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #footer-final-inquire-btn {
    color: #2f332b !important;
    background:
      linear-gradient(135deg, #d7b38a, #c99d6e) !important;
    border: 1px solid rgba(255, 255, 255, 0.32);
    box-shadow:
      0 12px 30px rgba(154, 106, 63, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.34);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #footer-final-inquire-btn:hover {
    background:
      linear-gradient(135deg, #cfa678, #bd8e60) !important;
  }

  /* Fallback for browsers without backdrop-filter. */
  @supports not ((backdrop-filter: blur(2px)) or (-webkit-backdrop-filter: blur(2px))) {
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > header,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #main-footer,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > main
    :where(
      div[class*='bg-white'],
      div[class*='bg-[#fffefb]'],
      div[class*='bg-[#FAF8F5]'],
      article[class*='bg-white'],
      form[class*='bg-white']
    ) {
      background-color: rgba(245, 248, 241, 0.95) !important;
    }
  }

  /* Reduce GPU load on small screens while preserving the glass look. */
  @media (max-width: 640px) {
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root {
      background-attachment: scroll;
    }

    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > header,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #main-footer,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #main-footer > div,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > main
    :where(
      div[class*='bg-white'],
      div[class*='bg-[#fffefb]'],
      div[class*='bg-[#FAF8F5]'],
      article[class*='bg-white'],
      article[class*='bg-[#fffefb]'],
      form[class*='bg-white'],
      form[class*='bg-[#fffefb]']
    ) {
      backdrop-filter: blur(10px) saturate(118%);
      -webkit-backdrop-filter: blur(10px) saturate(118%);
    }

    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #main-footer > div.max-w-7xl {
      margin-left: 0.75rem;
      margin-right: 0.75rem;
      border-radius: 1.5rem;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > header,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #main-footer,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #main-footer > div,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > main :where(div, article, aside, form) {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
  }

  /*
   * Kallista Velora V2
   * ------------------
   * This version fixes the selector bug in V1:
   * [class*='...'] also matched opacity utilities and hover utilities such as
   * bg-[#738262]/15 and hover:text-[#c6a585], which made translucent blocks
   * solid and made hover colours appear permanently.
   *
   * V2 uses exact class-token matching ([class~='...']) and explicitly
   * preserves opacity variants. It changes only the Velora public theme.
   */
  html[data-kallista-theme='velora']:not([data-theme='dark']) {
    --color-offwhite: #fffefb;
    --color-light-warm: #e6e1d6;
    --color-gray-green: #afbb9c;
    --color-gray-orange: #c6a585;
    --color-dark: #2c2a26;

    --velora-bg: #fffefb;
    --velora-bg-alt: #e6e1d6;
    --velora-green: #afbb9c;
    --velora-green-deep: #7f8f6c;
    --velora-orange: #c6a585;
    --velora-orange-hover: #b18f6f;
    --velora-text: #2c2a26;
    --velora-text-soft: #6b6459;
    --velora-border: #e2ddd0;
    --velora-footer-text: #b7b1a3;
    --velora-footer-muted: #918b7d;
  }

  /* Exact Velora font family on the PUBLIC interface only.
     The admin dashboard keeps its own inherited typography. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])[lang='ar']
  #kallista-app-root > :where(header, main, footer),
  html[data-kallista-theme='velora']:not([data-theme='dark'])[lang='ar']
  #kallista-app-root [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *) {
    font-family: 'Cairo', 'Poppins', sans-serif !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])[lang='ar']
  #kallista-app-root > :where(header, main, footer)
  :where(h1, h2, h3, h4, h5, h6, .font-serif-luxury, .font-arabic-editorial),
  html[data-kallista-theme='velora']:not([data-theme='dark'])[lang='ar']
  #kallista-app-root [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *)
  :where(h1, h2, h3, h4, h5, h6, .font-serif-luxury, .font-arabic-editorial) {
    font-family: 'Cairo', 'Poppins', sans-serif !important;
    font-weight: 700;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])[lang='en']
  #kallista-app-root > :where(header, main, footer),
  html[data-kallista-theme='velora']:not([data-theme='dark'])[lang='en']
  #kallista-app-root [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *) {
    font-family: 'Poppins', 'Cairo', sans-serif !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])[lang='en']
  #kallista-app-root > :where(header, main, footer)
  :where(h1, h2, h3, h4, h5, h6, .font-serif-luxury, .font-arabic-editorial),
  html[data-kallista-theme='velora']:not([data-theme='dark'])[lang='en']
  #kallista-app-root [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *)
  :where(h1, h2, h3, h4, h5, h6, .font-serif-luxury, .font-arabic-editorial) {
    font-family: 'Playfair Display', 'Cairo', serif !important;
    font-weight: 600;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark']) body,
  html[data-kallista-theme='velora']:not([data-theme='dark']) #kallista-app-root {
    color: var(--velora-text);
    background-color: var(--velora-bg) !important;
  }

  /* Velora header: warm off-white with the same subtle blur as the source site. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root > header {
    color: var(--velora-text) !important;
    background: rgba(255, 254, 251, 0.92) !important;
    border-color: var(--velora-border) !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  /* Main rhythm: off-white / beige, while nested sections keep their own intended tone. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(odd) {
    background-color: var(--velora-bg) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(even) {
    background-color: var(--velora-bg-alt) !important;
  }

  /* Nested about sections and any explicit section backgrounds. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root main section[class~='bg-[#fffefb]'] {
    background-color: var(--velora-bg) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root main section[class~='bg-[#e6e1d6]/30'] {
    background-color: var(--velora-bg-alt) !important;
  }

  /* Exact solid card/background mappings. They DO NOT match /opacity or hover utilities. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(
    main,
    [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *)
  )
  :where(
    [class~='bg-white'],
    [class~='bg-[#fffefb]'],
    [class~='bg-[#FAF8F5]'],
    [class~='bg-[#faf8f5]'],
    [class~='bg-[#faf7f2]'],
    [class~='bg-[#fdfaf6]'],
    [class~='bg-[#f8f4ee]'],
    [class~='bg-[#F7F3EE]']
  ) {
    background-color: #ffffff !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(
    main,
    [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *)
  )
  :where(
    [class~='bg-[#e6e1d6]'],
    [class~='bg-[#EAE3DA]'],
    [class~='bg-[#f2ede4]'],
    [class~='bg-[#efe9e0]'],
    [class~='bg-[#EFE9E0]']
  ) {
    background-color: var(--velora-bg-alt) !important;
  }

  /* Preserve Kallista's intentionally translucent warm surfaces. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#e6e1d6]/20'] {
    background-color: rgba(230, 225, 214, 0.20) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#e6e1d6]/30'] {
    background-color: rgba(230, 225, 214, 0.30) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#e6e1d6]/40'] {
    background-color: rgba(230, 225, 214, 0.40) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#e6e1d6]/50'] {
    background-color: rgba(230, 225, 214, 0.50) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#e6e1d6]/95'] {
    background-color: rgba(230, 225, 214, 0.95) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#fffefb]/55'] {
    background-color: rgba(255, 254, 251, 0.55) !important;
  }

  /*
   * Green translucent surfaces — this is the main V1 bug fix.
   * The FAQ helper, WhatsApp inquiry blocks, VIP cards, avatars and success icons
   * stay translucent instead of becoming a solid green rectangle.
   */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#738262]/10'] {
    background-color: rgba(175, 187, 156, 0.10) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#738262]/15'] {
    background-color: rgba(175, 187, 156, 0.15) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#738262]/20'] {
    background-color: rgba(175, 187, 156, 0.20) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#738262]/25'] {
    background-color: rgba(175, 187, 156, 0.25) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#738262]/30'] {
    background-color: rgba(175, 187, 156, 0.30) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#afbb9c]/20'] {
    background-color: rgba(175, 187, 156, 0.20) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#afbb9c]/25'] {
    background-color: rgba(175, 187, 156, 0.25) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#afbb9c]/30'] {
    background-color: rgba(175, 187, 156, 0.30) !important;
  }

  /* Warm translucent accents keep their opacity. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#c6a585]/10'] {
    background-color: rgba(198, 165, 133, 0.10) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#c6a585]/15'] {
    background-color: rgba(198, 165, 133, 0.15) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#c6a585]/20'] {
    background-color: rgba(198, 165, 133, 0.20) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#c6a585]/30'] {
    background-color: rgba(198, 165, 133, 0.30) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#c6a585]/40'] {
    background-color: rgba(198, 165, 133, 0.40) !important;
  }

  /* Exact text mappings — hover:text-* classes are no longer captured. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(
    [class~='text-[#1A1715]'],
    [class~='text-[#1a1715]'],
    [class~='text-[#24211e]'],
    [class~='text-[#302a25]'],
    [class~='text-[#38312b]'],
    [class~='text-[#3d342d]'],
    [class~='text-[#3d362f]'],
    [class~='text-[#403831]'],
    [class~='text-[#423d38]']
  ):not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *) {
    color: var(--velora-text) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(
    [class~='text-[#4a4038]'],
    [class~='text-[#4d443b]'],
    [class~='text-[#524940]'],
    [class~='text-[#524941]'],
    [class~='text-[#594f45]'],
    [class~='text-[#595046]'],
    [class~='text-[#5C534C]'],
    [class~='text-[#5a4f44]'],
    [class~='text-[#5c5248]'],
    [class~='text-[#5e4b3c]'],
    [class~='text-[#5e4e3e]'],
    [class~='text-[#5e4f40]'],
    [class~='text-[#5e5348]'],
    [class~='text-[#5f554c]'],
    [class~='text-[#61574d]'],
    [class~='text-[#665a4e]'],
    [class~='text-[#6C635B]'],
    [class~='text-[#6c6258]'],
    [class~='text-[#6c635b]'],
    [class~='text-[#6e6359]'],
    [class~='text-[#70655a]'],
    [class~='text-[#73685d]'],
    [class~='text-[#786d62]'],
    [class~='text-[#7C7167]'],
    [class~='text-[#7d7266]'],
    [class~='text-[#85796f]'],
    [class~='text-[#8a8075]'],
    [class~='text-[#8c7b6f]'],
    [class~='text-[#8c7e72]'],
    [class~='text-[#8c7f73]'],
    [class~='text-[#9b9188]']
  ):not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *) {
    color: var(--velora-text-soft) !important;
  }

  /* Green is reserved for real accent text/icons, with a deeper readable tone. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(
    [class~='text-[#738262]'],
    [class~='text-[#5f6c50]'],
    [class~='text-[#4e633d]']
  ):not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *) {
    color: var(--velora-green-deep) !important;
  }

  /* Body copy that was green in Kallista becomes Velora's soft text colour.
     This fixes the low-contrast FAQ/booking helper copy visible in the screenshot. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(
    [class~='text-[#445636]'],
    [class~='text-[#465738]'],
    [class~='text-[#495b3a]'],
    [class~='text-[#4e5e40]']
  ):not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *) {
    color: var(--velora-text-soft) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(
    [class~='text-[#c6a585]'],
    [class~='text-[#a5794f]'],
    [class~='text-[#8c6742]']
  ):not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *) {
    color: var(--velora-orange) !important;
  }

  /* Exact borders; hover:border-* is no longer permanently applied. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(
    [class~='border-[#e6e1d6]'],
    [class~='border-[#EAE3DA]'],
    [class~='border-[#ded5c7]'],
    [class~='border-[#d8cfc4]'],
    [class~='border-[#e8dfd5]'],
    [class~='border-[#e6ded3]']
  ):not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *) {
    border-color: var(--velora-border) !important;
  }

  /* Preserve translucent green borders. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='border-[#738262]/30'] {
    border-color: rgba(175, 187, 156, 0.45) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='border-[#738262]/25'] {
    border-color: rgba(175, 187, 156, 0.35) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='border-[#c6a585]/30'] {
    border-color: rgba(198, 165, 133, 0.38) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='border-[#c6a585]/40'] {
    border-color: rgba(198, 165, 133, 0.48) !important;
  }

  /*
   * Primary actions:
   * only elements with the exact solid bg classes are remapped.
   * Photo overlays using bg-[#24211e]/80 or /90 remain dark translucent.
   */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(main, [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *))
  :where(
    button[class~='bg-[#24211e]'],
    a[class~='bg-[#24211e]'],
    button[class~='bg-[#c6a585]'],
    a[class~='bg-[#c6a585]']
  ) {
    color: #ffffff !important;
    background-color: var(--velora-orange) !important;
    border-color: var(--velora-orange) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(main, [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *))
  :where(
    button[class~='bg-[#24211e]'],
    a[class~='bg-[#24211e]'],
    button[class~='bg-[#c6a585]'],
    a[class~='bg-[#c6a585]']
  ):hover {
    color: #ffffff !important;
    background-color: var(--velora-orange-hover) !important;
  }

  /* Solid green actions only. Translucent green helpers are handled above. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(main, [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *))
  :where(
    button[class~='bg-[#738262]'],
    a[class~='bg-[#738262]']
  ) {
    color: #ffffff !important;
    background-color: var(--velora-green) !important;
    border-color: var(--velora-green) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(main, [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *))
  :where(
    button[class~='bg-[#738262]'],
    a[class~='bg-[#738262]']
  ):hover {
    background-color: var(--velora-green-deep) !important;
  }

  /* Tailwind hover classes keep their stateful behaviour instead of becoming permanent. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='hover:text-[#c6a585]']:hover {
    color: var(--velora-orange) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='hover:border-[#c6a585]']:hover {
    border-color: var(--velora-orange) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='hover:border-[#738262]']:hover {
    border-color: var(--velora-green-deep) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='hover:bg-[#738262]/25']:hover {
    background-color: rgba(175, 187, 156, 0.25) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='hover:bg-[#e6e1d6]']:hover {
    background-color: var(--velora-bg-alt) !important;
  }

  /* Forms reproduce Velora's off-white fields and orange focus state. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(main, [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *))
  :where(input, textarea, select) {
    color: var(--velora-text) !important;
    background-color: var(--velora-bg) !important;
    border-color: var(--velora-border) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root
  :where(main, [role='dialog']:not(#kallista-admin-dashboard):not(#kallista-admin-dashboard *))
  :where(input, textarea, select):focus {
    background-color: #ffffff !important;
    border-color: var(--velora-orange) !important;
    outline-color: var(--velora-orange) !important;
  }

  /*
   * FAQ / helper cards: explicit readable treatment.
   * This targets the exact translucent green utility from the screenshot.
   */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#738262]/15'] {
    color: var(--velora-text-soft) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #kallista-app-root [class~='bg-[#738262]/15'] p {
    color: var(--velora-text-soft) !important;
  }

  /* Velora footer: intentionally dark, matching the source site's distribution. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer {
    color: #d8d3c8 !important;
    background: #2c2a26 !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer > div:first-child {
    background: transparent !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer :where(h1, h2, h3, h4) {
    color: #ffffff !important;
  }

  /* Exact footer text tokens: opacity variants are handled separately. */
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer [class~='text-[#e6e1d6]'],
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer [class~='text-[#afbb9c]'] {
    color: var(--velora-footer-text) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer [class~='text-[#e6e1d6]/80'] {
    color: rgba(183, 177, 163, 0.80) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer [class~='text-[#e6e1d6]/60'] {
    color: rgba(183, 177, 163, 0.72) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer [class~='text-[#e6e1d6]/55'] {
    color: rgba(183, 177, 163, 0.66) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer [class~='text-[#c6a585]'],
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer [class~='text-[#c6a585]/90'] {
    color: var(--velora-orange) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer [class~='border-[#3d3833]'] {
    border-color: rgba(255, 255, 255, 0.12) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer a,
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer button {
    transition: color 0.28s ease, background-color 0.28s ease, border-color 0.28s ease;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer a:hover,
  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer button:hover {
    color: var(--velora-orange) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer a[class~='bg-[#3d3833]'] {
    color: #d8d3c8 !important;
    background-color: #3d3833 !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer a[class~='bg-[#3d3833]']:hover {
    color: #ffffff !important;
    background-color: var(--velora-orange) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #footer-final-inquire-btn {
    color: #ffffff !important;
    background-color: var(--velora-orange) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #footer-final-inquire-btn:hover {
    color: #ffffff !important;
    background-color: var(--velora-orange-hover) !important;
  }

  html[data-kallista-theme='velora']:not([data-theme='dark'])
  #main-footer > div.max-w-7xl > div:last-child {
    color: var(--velora-footer-muted) !important;
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
