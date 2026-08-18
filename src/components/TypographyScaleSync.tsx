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

  document.documentElement.style.setProperty('--kallista-body-font-scale', String(bodyScale));
  document.documentElement.style.setProperty('--kallista-heading-font-scale', String(headingScale));
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
