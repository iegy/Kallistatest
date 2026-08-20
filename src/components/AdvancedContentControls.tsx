import React, { useEffect, useState } from 'react';
import { Check, Edit3, Eye, EyeOff, Languages, X } from 'lucide-react';
import { SiteContent } from '../types';
import { localizeContent } from '../i18n';
import {
  getSiteContent,
  mergeSiteContent,
  saveSiteContent,
} from '../services/storage';
import {
  FIRESTORE_COLLECTIONS,
  isFirebaseAdmin,
  saveDocument,
  subscribeToFirebaseAuthState,
  watchDocument,
} from '../services/firebase';

type EditorLanguage = 'ar' | 'en';
type EditorSection =
  | 'signature'
  | 'contact'
  | 'faq'
  | 'hero'
  | 'intro'
  | 'approach'
  | 'about'
  | 'experience'
  | 'footer';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const ensureEditableDefaults = (content: SiteContent): SiteContent => ({
  ...content,
  signature: {
    ...content.signature,
    visible: content.signature.visible === true,
    eyebrow: content.signature.eyebrow || 'قصة الزفاف المميزة',
    description: content.signature.description
      || 'حفل الزفاف ليس مجرد جلسة تصوير، بل هو بداية فصل جديد في حياتكم. نحن نتواجد معكم بهدوء لنوثق كل لحظة تفيض بالمشاعر: نظرة اللقاء الأولى، دعوات الوالدين، تفاصيل فستان العروس المحتشم وطرحتها، وأناقة العريس.',
    benefits: content.signature.benefits?.length
      ? content.signature.benefits
      : [
          'تغطية سينمائية وفوتوغرافية متكاملة للعروسين والعائلة',
          'معالجة لونية تحريرية دقيقة تحافظ على طبيعية الملامح ونضارة البشرة',
          'تسليم ألبومات فاخرة مطبوعة يدوياً بأرقى الخامات الإيطالية',
        ],
    ctaText: content.signature.ctaText || 'احجزوا استشارة وتغطية زفافكم',
  },
  faqSettings: {
    helperText: content.faqSettings?.helperText
      || 'لديكم أي استفسار آخر لم نذكره هنا؟ يسعدنا دائماً الإجابة على جميع أسئلتكم.',
    helperCta: content.faqSettings?.helperCta
      || 'تواصلوا معنا مباشرة عبر الواتساب أو نموذج الحجز',
  },
  contact: {
    ...content.contact,
    eyebrow: content.contact.eyebrow || 'التواصل وطلب الحجز',
    kicker: content.contact.kicker || 'دعونا نوثّق شيئًا جميلًا.',
    directTitle: content.contact.directTitle || 'تواصل مباشر وسريع',
    directDescription: content.contact.directDescription
      || 'نرحب بجميع استفساراتكم ومشاركتكم لتفاصيل مناسبتكم في أي وقت، ويسعدنا دائماً تقديم المشورة لاختيار أفضل وقت وإضاءة لجلسة التصوير.',
  },
});

const buildEnglishOverrides = (english: SiteContent): Record<string, unknown> => ({
  brand: {
    studioName: english.brand.studioName,
    founderName: english.brand.founderName,
    taglineAr: english.brand.taglineAr,
    badgeText: english.brand.badgeText,
  },
  hero: {
    titleMain: english.hero.titleMain,
    titleAccent: english.hero.titleAccent,
    subtitle: english.hero.subtitle,
    quote: english.hero.quote,
    primaryCtaText: english.hero.primaryCtaText,
    secondaryCtaText: english.hero.secondaryCtaText,
    stats: english.hero.stats,
  },
  intro: {
    heading: english.intro.heading,
    paragraph1: english.intro.paragraph1,
    paragraph2: english.intro.paragraph2,
    quote: english.intro.quote,
    quoteAuthor: english.intro.quoteAuthor,
    stats: english.intro.stats,
  },
  approach: {
    sectionTitle: english.approach.sectionTitle,
    sectionSubtitle: english.approach.sectionSubtitle,
    steps: english.approach.steps,
  },
  signature: {
    eyebrow: english.signature.eyebrow,
    title: english.signature.title,
    description: english.signature.description,
    benefits: english.signature.benefits,
    ctaText: english.signature.ctaText,
    subtitle: english.signature.subtitle,
    quote: english.signature.quote,
    imageCaption: english.signature.imageCaption,
  },
  aboutKallista: {
    title: english.aboutKallista.title,
    subtitle: english.aboutKallista.subtitle,
    paragraph1: english.aboutKallista.paragraph1,
    paragraph2: english.aboutKallista.paragraph2,
    pillars: english.aboutKallista.pillars,
  },
  aboutRonadisa: {
    title: english.aboutRonadisa.title,
    founderName: english.aboutRonadisa.founderName,
    subtitle: english.aboutRonadisa.subtitle,
    bioParagraph1: english.aboutRonadisa.bioParagraph1,
    bioParagraph2: english.aboutRonadisa.bioParagraph2,
    quote: english.aboutRonadisa.quote,
    palestinianTribute: english.aboutRonadisa.palestinianTribute,
    gearList: english.aboutRonadisa.gearList,
    awards: english.aboutRonadisa.awards,
  },
  experience: {
    title: english.experience.title,
    subtitle: english.experience.subtitle,
    timelineSteps: english.experience.timelineSteps,
    guarantees: english.experience.guarantees,
  },
  faq: english.faq,
  faqSettings: english.faqSettings,
  contact: {
    eyebrow: english.contact.eyebrow,
    kicker: english.contact.kicker,
    title: english.contact.title,
    subtitle: english.contact.subtitle,
    directTitle: english.contact.directTitle,
    directDescription: english.contact.directDescription,
    address: english.contact.address,
    workingHours: english.contact.workingHours,
    depositPolicy: english.contact.depositPolicy,
    privacyNote: english.contact.privacyNote,
  },
  footer: {
    copyrightText: english.footer.copyrightText,
    disclaimerText: english.footer.disclaimerText,
    privacyNotice: english.footer.privacyNotice,
    developerCredit: english.footer.developerCredit,
  },
});

const sections: { id: EditorSection; ar: string; en: string }[] = [
  { id: 'signature', ar: 'اللقطة التوقيعية', en: 'Signature' },
  { id: 'contact', ar: 'التواصل والحجز', en: 'Contact' },
  { id: 'faq', ar: 'الأسئلة', en: 'FAQ' },
  { id: 'hero', ar: 'الهيرو', en: 'Hero' },
  { id: 'intro', ar: 'المقدمة', en: 'Introduction' },
  { id: 'approach', ar: 'المنهجية', en: 'Approach' },
  { id: 'about', ar: 'عنا', en: 'About' },
  { id: 'experience', ar: 'التجربة', en: 'Experience' },
  { id: 'footer', ar: 'الفوتر', en: 'Footer' },
];

const inputClass =
  'w-full rounded-xl border border-[#e6e1d6] bg-white px-3 py-2.5 text-sm text-[#24211e] outline-none focus:border-[#c6a585]';
const labelClass = 'mb-1 block text-[11px] font-semibold text-[#594f45]';

export const AdvancedContentControls: React.FC = () => {
  const [isAdminRoute, setIsAdminRoute] = useState(() => window.location.hash === '#/admin');
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [content, setContent] = useState<SiteContent>(() => mergeSiteContent(getSiteContent()));
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<EditorLanguage>('ar');
  const [section, setSection] = useState<EditorSection>('signature');
  const [arabicDraft, setArabicDraft] = useState<SiteContent>(() => ensureEditableDefaults(clone(content)));
  const [englishDraft, setEnglishDraft] = useState<SiteContent>(() =>
    ensureEditableDefaults(localizeContent(clone(content), 'en'))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const syncRoute = () => setIsAdminRoute(window.location.hash === '#/admin');
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  // history.replaceState does not emit a hashchange event.
  // When the admin modal closes, App removes #/admin with replaceState,
  // so keep this tiny guard active only while the editor thinks it is on the admin route.
  useEffect(() => {
    if (!isAdminRoute) return;

    const timer = window.setInterval(() => {
      if (window.location.hash !== '#/admin') {
        setIsAdminRoute(false);
        setIsOpen(false);
      }
    }, 150);

    return () => window.clearInterval(timer);
  }, [isAdminRoute]);

  useEffect(() => subscribeToFirebaseAuthState(async (user) => {
    setIsAuthorizedAdmin(await isFirebaseAdmin(user).catch(() => false));
  }), []);

  useEffect(() => {
    if (!isAdminRoute || !isAuthorizedAdmin) return;
    return watchDocument<SiteContent>(FIRESTORE_COLLECTIONS.CONTENT, 'main', (value) => {
      if (!value) return;
      const normalized = mergeSiteContent(value);
      setContent(normalized);
      saveSiteContent(normalized);
    });
  }, [isAdminRoute, isAuthorizedAdmin]);

  useEffect(() => {
    if (isOpen) return;
    setArabicDraft(ensureEditableDefaults(clone(content)));
    setEnglishDraft(ensureEditableDefaults(localizeContent(clone(content), 'en')));
  }, [content, isOpen]);

  const draft = language === 'ar' ? arabicDraft : englishDraft;
  const setDraft = language === 'ar' ? setArabicDraft : setEnglishDraft;

  const patch = (updater: (next: SiteContent) => void) => {
    setDraft((current) => {
      const next = clone(current);
      updater(next);
      return next;
    });
  };

  const saveAll = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const normalized = mergeSiteContent({
        ...arabicDraft,
        signature: {
          ...arabicDraft.signature,
          visible: arabicDraft.signature.visible === true,
        },
        english: buildEnglishOverrides(englishDraft),
      });
      await saveDocument(FIRESTORE_COLLECTIONS.CONTENT, 'main', normalized);
      saveSiteContent(normalized);
      setContent(normalized);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const TextField = ({
    label,
    value,
    onChange,
    multiline = false,
  }: {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    multiline?: boolean;
  }) => (
    <div>
      <label className={labelClass}>{label}</label>
      {multiline ? (
        <textarea
          rows={4}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );

  const ListEditor = ({
    label,
    values,
    onChange,
  }: {
    label: string;
    values: string[];
    onChange: (values: string[]) => void;
  }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={value}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
              className="rounded-lg border border-[#e6e1d6] px-3 text-xs text-[#8c6742] hover:bg-[#faf7f2]"
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...values, ''])}
          className="rounded-lg border border-dashed border-[#c6a585] px-3 py-2 text-xs font-semibold text-[#8c6742]"
        >
          + إضافة سطر
        </button>
      </div>
    </div>
  );

  const renderSection = () => {
    if (section === 'signature') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-[#e6e1d6] bg-[#faf7f2] p-4">
            <div>
              <div className="text-sm font-bold text-[#24211e]">إظهار قسم اللقطة التوقيعية</div>
              <div className="mt-1 text-[11px] text-[#73685d]">
                مفتاح واحد مشترك للعربي والإنجليزي. القسم مخفي افتراضيًا.
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setArabicDraft((current) => ({
                  ...current,
                  signature: {
                    ...current.signature,
                    visible: current.signature.visible !== true,
                  },
                }))
              }
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                arabicDraft.signature.visible === true
                  ? 'bg-[#738262] text-white'
                  : 'bg-[#e6e1d6] text-[#24211e]'
              }`}
            >
              {arabicDraft.signature.visible === true
                ? <Eye className="h-4 w-4" />
                : <EyeOff className="h-4 w-4" />}
              {arabicDraft.signature.visible === true ? 'ظاهر' : 'مخفي'}
            </button>
          </div>

          <TextField
            label="العنوان الصغير"
            value={draft.signature.eyebrow}
            onChange={(value) => patch((next) => { next.signature.eyebrow = value; })}
          />
          <TextField
            label="العنوان الرئيسي"
            value={draft.signature.title}
            onChange={(value) => patch((next) => { next.signature.title = value; })}
          />
          <TextField
            label="الوصف"
            value={draft.signature.description}
            multiline
            onChange={(value) => patch((next) => { next.signature.description = value; })}
          />
          <ListEditor
            label="النقاط"
            values={draft.signature.benefits || []}
            onChange={(values) => patch((next) => { next.signature.benefits = values; })}
          />
          <TextField
            label="نص زر الحجز"
            value={draft.signature.ctaText}
            onChange={(value) => patch((next) => { next.signature.ctaText = value; })}
          />
          <TextField
            label="النص الصغير فوق الصورة"
            value={draft.signature.subtitle}
            onChange={(value) => patch((next) => { next.signature.subtitle = value; })}
          />
          <TextField
            label="النص الرئيسي فوق الصورة"
            value={draft.signature.quote}
            multiline
            onChange={(value) => patch((next) => { next.signature.quote = value; })}
          />
          <TextField
            label="وصف الصورة"
            value={draft.signature.imageCaption}
            onChange={(value) => patch((next) => { next.signature.imageCaption = value; })}
          />
        </div>
      );
    }

    if (section === 'contact') {
      return (
        <div className="space-y-4">
          <TextField label="التواصل وطلب الحجز — العنوان الصغير" value={draft.contact.eyebrow}
            onChange={(value) => patch((next) => { next.contact.eyebrow = value; })} />
          <TextField label="الجملة المائلة" value={draft.contact.kicker}
            onChange={(value) => patch((next) => { next.contact.kicker = value; })} />
          <TextField label="العنوان الرئيسي" value={draft.contact.title}
            onChange={(value) => patch((next) => { next.contact.title = value; })} />
          <TextField label="وصف القسم" value={draft.contact.subtitle} multiline
            onChange={(value) => patch((next) => { next.contact.subtitle = value; })} />
          <TextField label="عنوان التواصل المباشر" value={draft.contact.directTitle}
            onChange={(value) => patch((next) => { next.contact.directTitle = value; })} />
          <TextField label="وصف التواصل المباشر" value={draft.contact.directDescription} multiline
            onChange={(value) => patch((next) => { next.contact.directDescription = value; })} />
          <TextField label="العنوان / المدينة" value={draft.contact.address}
            onChange={(value) => patch((next) => { next.contact.address = value; })} />
          <TextField label="ساعات العمل" value={draft.contact.workingHours}
            onChange={(value) => patch((next) => { next.contact.workingHours = value; })} />
          <TextField label="سياسة العربون" value={draft.contact.depositPolicy} multiline
            onChange={(value) => patch((next) => { next.contact.depositPolicy = value; })} />
          <TextField label="ملاحظة الخصوصية" value={draft.contact.privacyNote} multiline
            onChange={(value) => patch((next) => { next.contact.privacyNote = value; })} />
        </div>
      );
    }

    if (section === 'faq') {
      return (
        <div className="space-y-4">
          <TextField
            label="جملة أسفل الأسئلة"
            value={draft.faqSettings?.helperText}
            multiline
            onChange={(value) => patch((next) => {
              next.faqSettings = { ...(next.faqSettings || {}), helperText: value };
            })}
          />
          <TextField
            label="زر التواصل أسفل الأسئلة"
            value={draft.faqSettings?.helperCta}
            onChange={(value) => patch((next) => {
              next.faqSettings = { ...(next.faqSettings || {}), helperCta: value };
            })}
          />

          <div className="border-t border-[#e6e1d6] pt-4">
            <div className="mb-3 text-xs font-bold text-[#24211e]">الأسئلة والإجابات</div>
            <div className="space-y-4">
              {draft.faq.map((item, index) => (
                <div key={item.id || index} className="space-y-2 rounded-2xl border border-[#e6e1d6] p-3">
                  <TextField label={`السؤال ${index + 1}`} value={item.question}
                    onChange={(value) => patch((next) => { next.faq[index].question = value; })} />
                  <TextField label="الإجابة" value={item.answer} multiline
                    onChange={(value) => patch((next) => { next.faq[index].answer = value; })} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (section === 'hero') {
      return (
        <div className="space-y-4">
          <TextField label="العنوان الأساسي" value={draft.hero.titleMain}
            onChange={(value) => patch((next) => { next.hero.titleMain = value; })} />
          <TextField label="العنوان المميز" value={draft.hero.titleAccent}
            onChange={(value) => patch((next) => { next.hero.titleAccent = value; })} />
          <TextField label="الوصف" value={draft.hero.subtitle} multiline
            onChange={(value) => patch((next) => { next.hero.subtitle = value; })} />
          <TextField label="الاقتباس" value={draft.hero.quote} multiline
            onChange={(value) => patch((next) => { next.hero.quote = value; })} />
          <TextField label="زر استكشاف الأعمال" value={draft.hero.primaryCtaText}
            onChange={(value) => patch((next) => { next.hero.primaryCtaText = value; })} />
          <TextField label="زر الحجز" value={draft.hero.secondaryCtaText}
            onChange={(value) => patch((next) => { next.hero.secondaryCtaText = value; })} />
        </div>
      );
    }

    if (section === 'intro') {
      return (
        <div className="space-y-4">
          <TextField label="العنوان" value={draft.intro.heading}
            onChange={(value) => patch((next) => { next.intro.heading = value; })} />
          <TextField label="الفقرة الأولى" value={draft.intro.paragraph1} multiline
            onChange={(value) => patch((next) => { next.intro.paragraph1 = value; })} />
          <TextField label="الفقرة الثانية" value={draft.intro.paragraph2} multiline
            onChange={(value) => patch((next) => { next.intro.paragraph2 = value; })} />
          <TextField label="الاقتباس" value={draft.intro.quote} multiline
            onChange={(value) => patch((next) => { next.intro.quote = value; })} />
          <TextField label="صاحب الاقتباس" value={draft.intro.quoteAuthor}
            onChange={(value) => patch((next) => { next.intro.quoteAuthor = value; })} />
        </div>
      );
    }

    if (section === 'approach') {
      return (
        <div className="space-y-4">
          <TextField label="عنوان المنهجية" value={draft.approach.sectionTitle}
            onChange={(value) => patch((next) => { next.approach.sectionTitle = value; })} />
          <TextField label="الوصف" value={draft.approach.sectionSubtitle} multiline
            onChange={(value) => patch((next) => { next.approach.sectionSubtitle = value; })} />
          {draft.approach.steps.map((step, index) => (
            <div key={`${step.number}-${index}`} className="space-y-2 rounded-2xl border border-[#e6e1d6] p-3">
              <div className="text-xs font-bold text-[#24211e]">الخطوة {index + 1}</div>
              <TextField label="العنوان" value={step.title}
                onChange={(value) => patch((next) => { next.approach.steps[index].title = value; })} />
              <TextField label="العنوان الصغير" value={step.subtitle}
                onChange={(value) => patch((next) => { next.approach.steps[index].subtitle = value; })} />
              <TextField label="الوصف" value={step.description} multiline
                onChange={(value) => patch((next) => { next.approach.steps[index].description = value; })} />
              <TextField label="التفصيل" value={step.detail} multiline
                onChange={(value) => patch((next) => { next.approach.steps[index].detail = value; })} />
            </div>
          ))}
        </div>
      );
    }

    if (section === 'about') {
      return (
        <div className="space-y-5">
          <div className="space-y-3 rounded-2xl border border-[#e6e1d6] p-3">
            <div className="text-xs font-bold text-[#24211e]">كاليستا</div>
            <TextField label="العنوان" value={draft.aboutKallista.title}
              onChange={(value) => patch((next) => { next.aboutKallista.title = value; })} />
            <TextField label="العنوان الفرعي" value={draft.aboutKallista.subtitle}
              onChange={(value) => patch((next) => { next.aboutKallista.subtitle = value; })} />
            <TextField label="الفقرة الأولى" value={draft.aboutKallista.paragraph1} multiline
              onChange={(value) => patch((next) => { next.aboutKallista.paragraph1 = value; })} />
            <TextField label="الفقرة الثانية" value={draft.aboutKallista.paragraph2} multiline
              onChange={(value) => patch((next) => { next.aboutKallista.paragraph2 = value; })} />
          </div>

          <div className="space-y-3 rounded-2xl border border-[#e6e1d6] p-3">
            <div className="text-xs font-bold text-[#24211e]">روناديسا</div>
            <TextField label="العنوان" value={draft.aboutRonadisa.title}
              onChange={(value) => patch((next) => { next.aboutRonadisa.title = value; })} />
            <TextField label="الصفة / العنوان الفرعي" value={draft.aboutRonadisa.subtitle}
              onChange={(value) => patch((next) => { next.aboutRonadisa.subtitle = value; })} />
            <TextField label="الفقرة الأولى" value={draft.aboutRonadisa.bioParagraph1} multiline
              onChange={(value) => patch((next) => { next.aboutRonadisa.bioParagraph1 = value; })} />
            <TextField label="الفقرة الثانية" value={draft.aboutRonadisa.bioParagraph2} multiline
              onChange={(value) => patch((next) => { next.aboutRonadisa.bioParagraph2 = value; })} />
            <TextField label="الاقتباس" value={draft.aboutRonadisa.quote} multiline
              onChange={(value) => patch((next) => { next.aboutRonadisa.quote = value; })} />
          </div>
        </div>
      );
    }

    if (section === 'experience') {
      return (
        <div className="space-y-4">
          <TextField label="العنوان" value={draft.experience.title}
            onChange={(value) => patch((next) => { next.experience.title = value; })} />
          <TextField label="العنوان الفرعي" value={draft.experience.subtitle}
            onChange={(value) => patch((next) => { next.experience.subtitle = value; })} />

          {draft.experience.timelineSteps.map((step, index) => (
            <div key={`${step.step}-${index}`} className="space-y-2 rounded-2xl border border-[#e6e1d6] p-3">
              <TextField label={`مرحلة ${index + 1} — العنوان`} value={step.title}
                onChange={(value) => patch((next) => { next.experience.timelineSteps[index].title = value; })} />
              <TextField label="التوقيت" value={step.time}
                onChange={(value) => patch((next) => { next.experience.timelineSteps[index].time = value; })} />
              <TextField label="الوصف" value={step.desc} multiline
                onChange={(value) => patch((next) => { next.experience.timelineSteps[index].desc = value; })} />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <TextField label="حقوق النشر" value={draft.footer.copyrightText}
          onChange={(value) => patch((next) => { next.footer.copyrightText = value; })} />
        <TextField label="وصف الفوتر" value={draft.footer.disclaimerText} multiline
          onChange={(value) => patch((next) => { next.footer.disclaimerText = value; })} />
        <TextField label="الخصوصية" value={draft.footer.privacyNotice} multiline
          onChange={(value) => patch((next) => { next.footer.privacyNotice = value; })} />
        <TextField label="اعتماد المطور" value={draft.footer.developerCredit}
          onChange={(value) => patch((next) => { next.footer.developerCredit = value; })} />
      </div>
    );
  };

  if (!isAdminRoute || !isAuthorizedAdmin) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 z-[70] inline-flex items-center gap-2 rounded-full border border-[#c6a585]/50 bg-[#24211e] px-4 py-3 text-xs font-bold text-white shadow-2xl transition-transform hover:scale-[1.02]"
      >
        <Edit3 className="h-4 w-4 text-[#c6a585]" />
        محرر المحتوى AR / EN
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-start bg-black/25 p-3 sm:items-center sm:p-5">
          <div
            dir="rtl"
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#e6e1d6] bg-[#fffefb] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#e6e1d6] bg-[#faf8f5] px-4 py-3">
              <div>
                <h3 className="font-arabic-editorial text-lg font-bold text-[#24211e]">
                  محرر المحتوى المتقدم
                </h3>
                <p className="text-[10px] text-[#73685d]">
                  عربي / English — بدون المساس بالصور أو الحجز أو إعدادات Firebase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-[#73685d] hover:bg-[#e6e1d6]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-[#e6e1d6] px-4 py-3">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  language === 'ar' ? 'bg-[#24211e] text-white' : 'bg-[#e6e1d6] text-[#24211e]'
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  language === 'en' ? 'bg-[#24211e] text-white' : 'bg-[#e6e1d6] text-[#24211e]'
                }`}
              >
                <Languages className="me-1 inline h-3.5 w-3.5" />
                English
              </button>

              <select
                value={section}
                onChange={(event) => setSection(event.target.value as EditorSection)}
                className="ms-auto rounded-xl border border-[#e6e1d6] bg-white px-3 py-2 text-xs font-semibold text-[#24211e]"
              >
                {sections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {language === 'ar' ? item.ar : item.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {language === 'en' && (
                <div className="mb-4 rounded-2xl border border-[#afbb9c]/50 bg-[#afbb9c]/15 p-3 text-[11px] leading-5 text-[#24211e]">
                  النصوص الإنجليزية الحالية تظهر كبداية، وأي تعديل هنا يُحفظ في Firebase.
                  صور الموقع وأرقام التواصل تظل مشتركة. الباقات والتصنيفات والألبومات تظل
                  تستخدم حقولها الإنجليزية الموجودة أصلًا في أماكنها الحالية بلوحة التحكم.
                </div>
              )}
              {renderSection()}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#e6e1d6] bg-[#faf8f5] px-4 py-3">
              <span className={`text-xs font-semibold ${saved ? 'text-emerald-700' : 'text-[#73685d]'}`}>
                {saved ? 'تم الحفظ في Firebase ✓' : 'الحفظ يحدّث العربي والإنجليزي معًا'}
              </span>
              <button
                type="button"
                onClick={saveAll}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#24211e] px-5 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-60"
              >
                <Check className={`h-4 w-4 text-[#c6a585] ${isSaving ? 'animate-pulse' : ''}`} />
                {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
