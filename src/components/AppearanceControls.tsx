import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  Moon,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  ThermometerSun,
  X,
} from 'lucide-react';
import { useLanguage } from '../i18n';

type ThemeMode = 'light' | 'dark';

interface AppearanceSettings {
  mode: ThemeMode;
  brightness: number;
  temperature: number;
}

interface AppearanceControlsProps {
  controlsHidden?: boolean;
}

const STORAGE_KEY = 'kallista_appearance_v1';
const DEFAULT_SETTINGS: AppearanceSettings = {
  mode: 'light',
  brightness: 100,
  temperature: 8,
};

const readStoredSettings = (): AppearanceSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<AppearanceSettings>;
    return {
      mode: parsed.mode === 'dark' ? 'dark' : 'light',
      brightness: Math.min(115, Math.max(85, Number(parsed.brightness) || 100)),
      temperature: Math.min(50, Math.max(-50, Number(parsed.temperature) || 0)),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const AppearanceControls: React.FC<AppearanceControlsProps> = ({ controlsHidden = false }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AppearanceSettings>(readStoredSettings);

  useEffect(() => {
    const root = document.documentElement;
    const tintStrength = Math.abs(settings.temperature) / 50;
    const tintColor = settings.temperature >= 0
      ? `rgba(198, 165, 133, ${0.14 * tintStrength})`
      : `rgba(175, 187, 156, ${0.13 * tintStrength})`;

    root.dataset.theme = settings.mode;
    root.style.setProperty('--site-brightness', String(settings.brightness / 100));
    root.style.setProperty('--site-temperature-tint', tintColor);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = <Key extends keyof AppearanceSettings>(key: Key, value: AppearanceSettings[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const reset = () => setSettings(DEFAULT_SETTINGS);

  return (
    <>
      <div className="site-visual-filter" aria-hidden="true" />

      {!controlsHidden && (
        <div className="appearance-controls fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-[220] xl:bottom-6 xl:left-6" dir="rtl">
          {isOpen && (
            <section
              className="appearance-panel mb-3 w-[min(21rem,calc(100vw-2rem))] rounded-[1.75rem] border border-[#c6a585]/45 bg-[#fffefb]/95 p-4 shadow-[0_22px_70px_rgba(36,33,30,0.2)] backdrop-blur-xl sm:p-5"
              aria-label={t('إعدادات مظهر الموقع', 'Website appearance settings')}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#24211e]">{t('مظهر الموقع', 'Site appearance')}</p>
                  <p className="mt-0.5 text-[11px] text-[#6c635b]">{t('اختياراتك تُحفظ تلقائيًا', 'Your choices are saved automatically')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-[#6c635b] transition-colors hover:bg-[#e6e1d6]/65 hover:text-[#24211e]"
                  aria-label={t('إغلاق', 'Close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#e6e1d6]/55 p-1.5">
                <button
                  type="button"
                  onClick={() => update('mode', 'light')}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${settings.mode === 'light' ? 'bg-[#fffefb] text-[#24211e] shadow-sm' : 'text-[#6c635b] hover:text-[#24211e]'}`}
                  aria-pressed={settings.mode === 'light'}
                >
                  <Sun className="h-4 w-4 text-[#c6a585]" />
                  {t('فاتح', 'Light')}
                </button>
                <button
                  type="button"
                  onClick={() => update('mode', 'dark')}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${settings.mode === 'dark' ? 'bg-[#24211e] text-[#fffefb] shadow-sm' : 'text-[#6c635b] hover:text-[#24211e]'}`}
                  aria-pressed={settings.mode === 'dark'}
                >
                  <Moon className="h-4 w-4 text-[#afbb9c]" />
                  {t('ليلي', 'Dark')}
                </button>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[#4d443b]">
                  <span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-[#c6a585]" />{t('الإضاءة', 'Brightness')}</span>
                  <span className="font-serif-luxury text-sm text-[#738262]">{settings.brightness}%</span>
                </span>
                <input
                  className="appearance-range w-full"
                  type="range"
                  min="85"
                  max="115"
                  step="1"
                  value={settings.brightness}
                  onChange={(event) => update('brightness', Number(event.target.value))}
                />
              </label>

              <label className="mt-5 block">
                <span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[#4d443b]">
                  <span className="flex items-center gap-2"><ThermometerSun className="h-4 w-4 text-[#c6a585]" />{t('حرارة اللون', 'Color temperature')}</span>
                  <span className="text-[11px] text-[#738262]">
                    {settings.temperature > 10 ? t('دافئ', 'Warm') : settings.temperature < -10 ? t('بارد', 'Cool') : t('متوازن', 'Balanced')}
                  </span>
                </span>
                <input
                  className="appearance-range appearance-temperature w-full"
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={settings.temperature}
                  onChange={(event) => update('temperature', Number(event.target.value))}
                />
                <span className="mt-1.5 flex justify-between text-[10px] text-[#85796f]">
                  <span>{t('بارد', 'Cool')}</span>
                  <span>{t('دافئ', 'Warm')}</span>
                </span>
              </label>

              <button
                type="button"
                onClick={reset}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#e6e1d6] px-3 py-2 text-[11px] font-semibold text-[#6c635b] transition-colors hover:border-[#c6a585] hover:bg-[#e6e1d6]/35 hover:text-[#24211e]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t('استعادة المظهر الافتراضي', 'Restore default appearance')}
              </button>
            </section>
          )}

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="appearance-trigger flex h-12 w-12 items-center justify-center rounded-full border border-[#c6a585]/45 bg-[#24211e] p-0 text-[#fffefb] shadow-[0_12px_35px_rgba(36,33,30,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#3d342d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6a585] focus-visible:ring-offset-2 xl:h-13 xl:w-auto xl:gap-2 xl:px-4"
            aria-expanded={isOpen}
            aria-label={t('تخصيص مظهر الموقع', 'Customize site appearance')}
            title={t('الإضاءة والمظهر', 'Lighting and appearance')}
          >
            <SlidersHorizontal className="h-4 w-4 text-[#c6a585]" />
            <span className="hidden text-xs font-semibold xl:inline">{t('المظهر', 'Appearance')}</span>
          </button>
        </div>
      )}
    </>
  );
};
