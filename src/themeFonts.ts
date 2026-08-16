export interface SiteFontOption {
  key: string;
  labelAr: string;
  labelEn: string;
  stack: string;
  googleFamily?: string;
}

export const BODY_FONT_OPTIONS: SiteFontOption[] = [
  {
    key: 'alexandria',
    labelAr: 'Alexandria — عصري وهادئ',
    labelEn: 'Alexandria — modern and calm',
    stack: "'Alexandria', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    key: 'cairo',
    labelAr: 'Cairo — واضح واحترافي',
    labelEn: 'Cairo — clear and professional',
    stack: "'Cairo', 'Alexandria', sans-serif",
    googleFamily: 'Cairo:wght@300;400;500;600;700',
  },
  {
    key: 'tajawal',
    labelAr: 'Tajawal — بسيط ومريح',
    labelEn: 'Tajawal — simple and readable',
    stack: "'Tajawal', 'Alexandria', sans-serif",
    googleFamily: 'Tajawal:wght@300;400;500;700',
  },
  {
    key: 'ibm-plex-arabic',
    labelAr: 'IBM Plex Arabic — هندسي وأنيق',
    labelEn: 'IBM Plex Arabic — refined and structured',
    stack: "'IBM Plex Sans Arabic', 'Alexandria', sans-serif",
    googleFamily: 'IBM+Plex+Sans+Arabic:wght@300;400;500;600;700',
  },
];

export const HEADING_FONT_OPTIONS: SiteFontOption[] = [
  {
    key: 'amiri',
    labelAr: 'Amiri — تحريري كلاسيكي',
    labelEn: 'Amiri — classic editorial',
    stack: "'Amiri', serif",
  },
  {
    key: 'noto-naskh',
    labelAr: 'Noto Naskh Arabic — نسخ فاخر',
    labelEn: 'Noto Naskh Arabic — elegant Naskh',
    stack: "'Noto Naskh Arabic', 'Amiri', serif",
    googleFamily: 'Noto+Naskh+Arabic:wght@400;500;600;700',
  },
  {
    key: 'aref-ruqaa',
    labelAr: 'Aref Ruqaa — فني ومميز',
    labelEn: 'Aref Ruqaa — artistic and distinctive',
    stack: "'Aref Ruqaa', 'Amiri', serif",
    googleFamily: 'Aref+Ruqaa:wght@400;700',
  },
  {
    key: 'cairo',
    labelAr: 'Cairo — عنوان حديث وواضح',
    labelEn: 'Cairo — clean modern heading',
    stack: "'Cairo', 'Alexandria', sans-serif",
    googleFamily: 'Cairo:wght@300;400;500;600;700',
  },
];

export const DEFAULT_BODY_FONT_KEY = 'alexandria';
export const DEFAULT_HEADING_FONT_KEY = 'amiri';

const findOption = (options: SiteFontOption[], key: string | undefined, fallbackKey: string) => (
  options.find((option) => option.key === key)
  || options.find((option) => option.key === fallbackKey)
  || options[0]
);

export const getBodyFontOption = (key?: string) => (
  findOption(BODY_FONT_OPTIONS, key, DEFAULT_BODY_FONT_KEY)
);

export const getHeadingFontOption = (key?: string) => (
  findOption(HEADING_FONT_OPTIONS, key, DEFAULT_HEADING_FONT_KEY)
);

const ensureGoogleFontLoaded = (option: SiteFontOption) => {
  if (!option.googleFamily || typeof document === 'undefined') return;
  if (document.querySelector(`link[data-kallista-font="${option.key}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${option.googleFamily}&display=swap`;
  link.dataset.kallistaFont = option.key;
  document.head.appendChild(link);
};

export const ensureSiteFontsLoaded = (bodyKey?: string, headingKey?: string) => {
  ensureGoogleFontLoaded(getBodyFontOption(bodyKey));
  ensureGoogleFontLoaded(getHeadingFontOption(headingKey));
};
