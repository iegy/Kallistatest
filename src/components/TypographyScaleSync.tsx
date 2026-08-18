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
    || settings?.themeKey === 'glass-sage'
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

  /*
   * Kallista Glass Sage — a light sage glassmorphism theme.
   * The blur is intentionally moderate and only applies to public cards/panels
   * in light mode, keeping dark mode and the admin dashboard untouched.
   */
  html[data-kallista-theme='glass-sage']:not([data-theme='dark']) {
    --color-offwhite: #fffdf7;
    --color-light-warm: #ede5d8;
    --color-gray-green: #b7c9a8;
    --color-gray-orange: #d7b38a;
    --color-dark: #2f332b;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark']) body,
  html[data-kallista-theme='glass-sage']:not([data-theme='dark']) #kallista-app-root {
    color: #2f332b;
    background-color: #f5f8f1 !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark']) #kallista-app-root {
    background-image:
      radial-gradient(circle at 12% 10%, rgba(220, 232, 212, 0.88), transparent 31rem),
      radial-gradient(circle at 88% 23%, rgba(183, 201, 168, 0.42), transparent 34rem),
      radial-gradient(circle at 54% 82%, rgba(215, 179, 138, 0.15), transparent 30rem);
    background-attachment: fixed;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > header {
    background: rgba(255, 253, 247, 0.68) !important;
    border-color: rgba(183, 201, 168, 0.42) !important;
    backdrop-filter: blur(14px) saturate(118%);
    -webkit-backdrop-filter: blur(14px) saturate(118%);
    box-shadow: 0 10px 34px rgba(96, 112, 79, 0.08);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(even) {
    background-color: rgba(220, 232, 212, 0.24) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main > section:nth-of-type(odd) {
    background-color: rgba(255, 253, 247, 0.34) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main
  :where(
    div[class*='bg-white'],
    div[class*='bg-[#fffefb]'],
    div[class*='bg-[#FAF8F5]'],
    div[class*='bg-[#faf8f5]'],
    div[class*='bg-[#faf7f2]'],
    div[class*='bg-[#fdfaf6]'],
    article[class*='bg-white'],
    article[class*='bg-[#fffefb]'],
    article[class*='bg-[#FAF8F5]'],
    aside[class*='bg-white'],
    aside[class*='bg-[#fffefb]'],
    form[class*='bg-white'],
    form[class*='bg-[#fffefb]']
  ) {
    background: rgba(255, 253, 247, 0.58) !important;
    border-color: rgba(183, 201, 168, 0.46) !important;
    backdrop-filter: blur(14px) saturate(122%);
    -webkit-backdrop-filter: blur(14px) saturate(122%);
    box-shadow:
      0 14px 38px rgba(96, 112, 79, 0.09),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

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
    background: rgba(220, 232, 212, 0.5) !important;
    border-color: rgba(143, 162, 120, 0.34) !important;
    backdrop-filter: blur(11px) saturate(116%);
    -webkit-backdrop-filter: blur(11px) saturate(116%);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#e6e1d6]'],
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#EAE3DA]'],
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#ded5c7]'] {
    border-color: rgba(183, 201, 168, 0.52) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]'],
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]'] {
    background-color: rgba(96, 112, 79, 0.94) !important;
    box-shadow: 0 8px 24px rgba(96, 112, 79, 0.16);
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main button[class*='bg-[#24211e]']:hover,
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main a[class*='bg-[#24211e]']:hover {
    background-color: #8fa278 !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#738262]'] {
    background-color: rgba(143, 162, 120, 0.92) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#738262]'],
  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#5f6c50]'] {
    color: #60704f !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='bg-[#c6a585]'] {
    background-color: #d7b38a !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='border-[#c6a585]'] {
    border-color: rgba(215, 179, 138, 0.78) !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > main [class*='text-[#c6a585]'] {
    color: #a8794d !important;
  }

  html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
  #kallista-app-root > footer {
    background: rgba(255, 253, 247, 0.54) !important;
    border-color: rgba(183, 201, 168, 0.38) !important;
    backdrop-filter: blur(12px) saturate(118%);
    -webkit-backdrop-filter: blur(12px) saturate(118%);
  }

  @media (max-width: 640px) {
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > header,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > footer,
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
      backdrop-filter: blur(8px) saturate(112%);
      -webkit-backdrop-filter: blur(8px) saturate(112%);
    }

    html[data-kallista-theme='glass-sage']:not([data-theme='dark']) #kallista-app-root {
      background-attachment: scroll;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > header,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > footer,
    html[data-kallista-theme='glass-sage']:not([data-theme='dark'])
    #kallista-app-root > main :where(div, article, aside, form) {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
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
