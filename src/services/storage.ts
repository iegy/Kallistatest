import {
  Album,
  Booking,
  ClientContact,
  Review,
  SiteSettings,
  PhotoItem,
  PortfolioCategory,
  SiteContent,
} from '../types';

import ronadisaPhoto from '../assets/images/ronadisa_founder_1786838963744.jpg';
import veiledWeddingPhoto from '../assets/images/veiled_bride_groom_1786838979487.jpg';
import veiledFashionPhoto from '../assets/images/veiled_fashion_model_1786838992213.jpg';
import veiledFamilyPhoto from '../assets/images/veiled_mother_child_1786839008569.jpg';

export { ronadisaPhoto, veiledWeddingPhoto, veiledFashionPhoto, veiledFamilyPhoto };

const STORAGE_KEYS = {
  ALBUMS: 'kallista_albums_v3',
  CATEGORIES: 'kallista_categories_v3',
  CONTENT: 'kallista_content_v3',
  BOOKINGS: 'kallista_bookings_v3',
  CLIENTS: 'kallista_clients_v3',
  REVIEWS: 'kallista_reviews_v3',
  SETTINGS: 'kallista_settings_v3',
};

// --- 1. DEFAULT PORTFOLIO CATEGORIES (Completely Dynamic & Editable) ---
export const DEFAULT_CATEGORIES: PortfolioCategory[] = [
  {
    id: 'cat-all',
    slug: 'all',
    nameAr: 'كافة الأعمال',
    nameEn: 'All Curations',
    description: 'استعراض شامل لكافة جلسات وألبومات كاليستا الفنية',
    icon: 'Sparkles',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'cat-wed',
    slug: 'weddings',
    nameAr: 'حفلات الزفاف والعرائس',
    nameEn: 'Veiled Weddings & Couples',
    description: 'توثيق سينمائي وفوتوغرافي ملكي لأعراس المحجبات والعروسين مع الخصوصية التامة',
    icon: 'Heart',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'cat-fash',
    slug: 'fashion',
    nameAr: 'أزياء المحجبات والافتتاحيات',
    nameEn: 'Modest Fashion & Editorials',
    description: 'جلسات تصوير تحريرية لأحدث خطوط أزياء وعباءات وفساتين المحجبات الراقية',
    icon: 'Crown',
    active: true,
    displayOrder: 3,
  },
  {
    id: 'cat-child',
    slug: 'children',
    nameAr: 'الأطفال واللحظات العائلية',
    nameEn: 'Children & Pure Warmth',
    description: 'مشاعر أمومة وعائلة عفوية دافئة خالية من التصنع والوقفات الجامدة',
    icon: 'Smile',
    active: true,
    displayOrder: 4,
  },
  {
    id: 'cat-portrait',
    slug: 'portraits',
    nameAr: 'البورتريه الشخصي الفاخر',
    nameEn: 'Editorial Portraits',
    description: 'بورتريهات شخصية وهوية بصرية لكبار الشخصيات وسيدات الأعمال ومصممي الأزياء',
    icon: 'Camera',
    active: true,
    displayOrder: 5,
  },
];

// --- 2. DEFAULT SITE SETTINGS (With Secure Admin Credentials & Firebase Keys) ---
export const DEFAULT_SETTINGS: SiteSettings = {
  adminUsername: import.meta.env.VITE_ADMIN_EMAIL || 'adminmoro@kallista.com',
  adminPassword: '',
  adminPin: '',
  imgbbApiKey: import.meta.env.VITE_IMGBB_API_KEY || '',
  useFirebaseAuth: true,
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  firebaseAuthDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  firebaseProjectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  firebaseStorageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  firebaseMessagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  firebaseAppId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  currency: 'EGP',
};

// --- 3. DEFAULT SITE CONTENT (Every single section is editable) ---
export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    studioName: 'KALLISTA',
    founderName: 'Ronadisa',
    taglineAr: 'توثيق فوتوغرافي تحريري للزفاف والبورتريه والعائلة والأزياء',
    taglineEn: 'Editorial Luxury & Timeless Fine Art Photography in Egypt',
    logoType: 'svg',
    badgeText: 'تصوير تحريري فاخر — الإسكندرية والقاهرة',
    showPalestinianBadge: false,
  },
  hero: {
    preTitle: 'FINE ART & EDITORIAL PHOTOGRAPHY',
    titleMain: 'نوثق حكايتكم بوقار',
    titleAccent: 'وفخامة لا تزول',
    subtitle: 'تجربة تصوير تحريرية راقية للنساء والرجال والعروسين والعائلات والعلامات التجارية، بإضاءة سينمائية واهتمام حقيقي بالخصوصية والتفاصيل.',
    quote: '«الصورة الخالدة لا تلتقط الشكل فحسب، بل تحفظ النقاء والشعور قبل أن يصبح ذكرى»',
    primaryCtaText: 'استكشاف معرض الأعمال',
    secondaryCtaText: 'حجز جلسة استشارية خاصة',
    stats: [
      { number: '01', label: 'رؤية فنية مصممة لكل جلسة' },
      { number: '100%', label: 'لا نشر من دون موافقة العميل' },
      { number: '04', label: 'مجالات تصوير رئيسية' },
    ],
  },
  intro: {
    heading: 'الفلسفة البصرية — فن الرقي والجمال الهادئ',
    paragraph1: 'في ستوديو كاليستا بقيادة المصورة التحريرية روناديسا (Ronadisa)، نؤمن أن الجمال الحقيقي يكمن في الاحتشام الرفيع، والتناغم البصري، والمشاعر الصادقة العفوية الخالية من أي افتعال أو صخب تجاري.',
    paragraph2: 'نقدم لكما ولعائلاتكم رؤية فوتوغرافية مستوحاة من صفحات كبريات المجلات العالمية؛ حيث تمتزج نعومة الأقمشة والحجاب الملكي مع الإضاءة الطبيعية لإنتاج أعمال فنية تبقى مصدراً للفخر عبر الأجيال.',
    quote: 'نحن لا نلتقط صوراً عادية، بل نؤلف قصائد بصرية تحفظ مكانتكم وذكرياتكم الثمينة.',
    quoteAuthor: '— روناديسا (Ronadisa)، مؤسسة كاليستا',
    stats: [
      { value: 'Fine Art', label: 'معالجة فوتوغرافية يدوية متقنة' },
      { value: 'Editorial', label: 'توجيه محترف ومريح أثناء الجلسة' },
      { value: 'Authentic', label: 'مشاعر حقيقية وهوية بصرية أصيلة' },
    ],
  },
  servicesSettings: {
    showPricing: false,
    hidePriceCustomText: 'طلب عرض السعر عبر واتساب',
  },
  services: [
    {
      id: 'srv-weddings',
      titleAr: 'حفلات الزفاف وجلسات العروسين (Veiled Weddings)',
      titleEn: 'Signature Veiled Wedding Photography',
      categorySlug: 'weddings',
      descriptionAr: 'توثيق شامل ليوم العمر، يشمل لحظات الاستعداد الهادئة، إطلالة العروس المحجبة الملكية بفستانها وطرحتها، حضور العريس الأنيق، وجلسة الغروب السينمائية مع الخصوصية التامة.',
      inclusions: [
        'تغطية فوتوغرافية وسينمائية كاملة لكافة لحظات اليوم',
        'فريق عمل نسائي متكامل ومحترف لضمان الراحة التامة للعروس',
        'معالجة لونية يدوية تحريرية لكافة الصور بدقة 4K فائقة',
        'ألبوم ملكي فاخر مغلف بالكتان والجلد الإيطالي المحفور بالذهب',
        'جلسة تصوير خارجية في أفضل اللوكيشنات والقصور التاريخية',
      ],
      priceStarting: 'تبدأ الباقات من 15,000 ج.م',
      badge: 'الأكثر طلباً للعرائس',
      featured: true,
    },
    {
      id: 'srv-fashion',
      titleAr: 'أزياء المحجبات وجلسات اللوك بوك (Modest Fashion)',
      titleEn: 'High-Fashion & Modest Lookbooks',
      categorySlug: 'fashion',
      descriptionAr: 'جلسات تصوير احترافية لمصممي ومصممات الأزياء، علامات العباءات والفساتين، والبراندات الراقية مع تنسيق الإضاءة والزوايا لإبراز تفاصيل الأقمشة وانسيابيتها.',
      inclusions: [
        'تصوير تحريري بأسلوب المجلات العالمية (Editorial Standard)',
        'استوديو مجهز بالكامل وإضاءات سينمائية ناعمة',
        'تسليم صور مهيأة للحملات الإعلانية ومواقع التجارة الإلكترونية',
        'إشراف كامل على تناغم الألوان والتكوين الفني',
      ],
      priceStarting: 'تبدأ من 8,000 ج.م للجلسة',
      badge: 'Editorial Standard',
      featured: true,
    },
    {
      id: 'srv-children',
      titleAr: 'الأطفال والمشاعر العائلية (Pure Moments)',
      titleEn: 'Children & Family Fine Art',
      categorySlug: 'children',
      descriptionAr: 'جلسات دافئة تسجل ضحكات الأطفال وعفوية العائلة في أجواء مريحة وممتعة بدون أي وقفات مصطنعة أو توتر.',
      inclusions: [
        'جلسة هادئة ومرنة تتناسب مع طاقة واحتياجات الأطفال',
        'تصوير داخلي في الاستوديو أو في الحدائق المفتوحة مع الضوء الطبيعي',
        'مجموعة صور مطبوعة فاخرة وصندوق ذكريات خشبي',
        'توثيق تفاصيل النمو ودفء مشاعر الأمومة والأبوة',
      ],
      priceStarting: 'تبدأ من 5,500 ج.م',
      badge: 'عفوية ودفء حقيقي',
      featured: true,
    },
    {
      id: 'srv-portraits',
      titleAr: 'البورتريه الشخصي والبراندينج (Personal Branding)',
      titleEn: 'Executive & Creative Portraits',
      categorySlug: 'portraits',
      descriptionAr: 'جلسات تصوير بورتريه راقية لسيدات ورجال الأعمال، المبدعين، وصناع المحتوى، تعكس الثقة والوقار والتميز المهني.',
      inclusions: [
        'توجيه دقيق في لغة الجسد واختيار الإطلالات المناسبة',
        'خيارات متعددة للخلفيات الفنية والإضاءات الحديثة',
        'ريتاتش خبير يحافظ على الملامح الطبيعية بدون إفراط',
      ],
      priceStarting: 'تبدأ من 4,000 ج.م',
      badge: 'هوية بصرية واثقة',
      featured: false,
    },
  ],
  approach: {
    sectionTitle: 'منهجية كاليستا — الفن في أدق تفاصيله',
    sectionSubtitle: 'رحلة فنية منظمة ومريحة من اللحظة الأولى حتى استلام تحفتكم الفنية',
    steps: [
      {
        number: '01',
        title: 'الاستشارة الفنية وتنسيق الرؤية',
        subtitle: 'The Creative Consultation',
        description: 'جلسة حوارية هادئة نفهم فيها ذوقكم الرفيع، تفاصيل الفستان والإطلالة، والأجواء المفضلة لبناء لوحة إلهام (Moodboard) خاصة بكم.',
        detail: 'نقاش مسبق لجميع تفاصيل الإضاءة، الألوان، والمواعيد لضمان أعلى مستويات الراحة النفسية.',
      },
      {
        number: '02',
        title: 'معاينة اللوكيشن وتوقيت الضوء الذهبي',
        subtitle: 'Scouting & Golden Hour Timing',
        description: 'دراسة هندسية وميدانية لموقع التصوير وتحديد الساعات المثالية لأشعة الشمس الطبيعية وانعكاساتها على تفاصيل الحجاب والأناقة.',
        detail: 'اختيار زوايا حصرية تبرز جمال المكان وفخامة الحضور.',
      },
      {
        number: '03',
        title: 'يوم الجلسة — توجيه هادئ وأجواء ممتعة',
        subtitle: 'The Editorial Experience',
        description: 'نوفر لكم بيئة مفعمة بالراحة والخصوصية التامة، مع توجيه دقيق ومريح للوقفات لتظهروا بأبهى صورة عفوية وواثقة.',
        detail: 'فريق عمل محترف يحرص على راحة العروس وخصوصيتها طوال اليوم.',
      },
      {
        number: '04',
        title: 'المعالجة والأرشفة الفاخرة',
        subtitle: 'Master Retouching & Legacy Print',
        description: 'معالجة فوتوغرافية يدوية دقيقة بأحدث التقنيات مع الحفاظ على نضارة البشرة وواقعية الألوان، وطباعة الألبومات الملكية الخالدة.',
        detail: 'تسليم معرض رقمي فائق السرعة وألبوم محفوظ بعناية فائقة.',
      },
    ],
  },
  signature: {
    title: 'اللقطة التوقيعية — التناغم الخالد بين الحجاب والضوء',
    subtitle: 'The Signature Kallista Frame',
    quote: '«الوقار ليس قيداً على الجمال، بل هو أسمى درجات الفخامة والأناقة»',
    imageCaption: 'جلسة زفاف ملكية للمحجبات — الإسكندرية، قصر المنتزه',
  },
  aboutKallista: {
    title: 'عن ستوديو كاليستا (KALLISTA)',
    subtitle: 'دار فوتوغرافية تحريرية تأسست لتصنع معياراً جديداً للرقي والخصوصية',
    paragraph1: 'تأسست دار كاليستا للتصوير الفوتوغرافي لتقديم تجربة بصرية استثنائية تحتفي بالمرأة المحجبة والعائلات الراقية في مصر والعالم العربي. نحن نجمع بين فخامة الإخراج التحريري وأصالة المشاعر الإنسانية.',
    paragraph2: 'نحرص على أدق التفاصيل من اختيار درجات الإضاءة إلى تنسيق الألوان الترابية المتناسقة، مع التزام تام بأعلى معايير الخصوصية والأمان لكافة عملائنا.',
    pillars: [
      { title: 'خصوصية تامة 100%', description: 'فريق عمل مدرب وأرشيف مشفر يضمن السرية التامة' },
      { title: 'إضاءة طبيعية سينمائية', description: 'توليف فني يبث الحياة في كل صورة بدون تصنع' },
      { title: 'طباعة متحفية خالدة', description: 'ألبومات مستوردة بمواصفات حفظ عالمية تدوم لأجيال' },
    ],
  },
  aboutRonadisa: {
    title: 'عن المؤسسة والمصورة روناديسا (Ronadisa)',
    founderName: 'روناديسا (Ronadisa)',
    subtitle: 'مصورة فوتوغرافية تحريرية — رائدة تصوير أزياء وزفاف المحجبات الراقي',
    bioParagraph1: 'كرّست روناديسا مسيرتها الفنية لإبراز جمال ووقار المرأة المحجبة من خلال عدسة تحريرية سينمائية تضاهي كبرى دور الأزياء العالمية. تجمع في أسلوبها بين الحس الفني المرهف، والخبرة التقنية العميقة في إدارة الإضاءة، والشغف بتوثيق اللحظات الصادقة.',
    bioParagraph2: 'تتعامل روناديسا مع كل جلسة بوصفها تعاوناً إنسانياً وفنياً، وتوازن بين التوجيه المهني وترك مساحة للحظات العفوية كي تعكس الصور شخصية أصحابها بصدق.',
    quote: '«كل شخص يقف أمام عدستي يستحق أن يرى نفسه بصورة صادقة وأنيقة تشبهه.»',
    palestinianTribute: '',
    gearList: [],
    awards: [],
    photoUrl: ronadisaPhoto,
  },
  experience: {
    title: 'تجربة العميل مع كاليستا — راحة واحترافية من البداية للنهاية',
    subtitle: 'The Seamless Kallista Experience',
    timelineSteps: [
      { step: '1', title: 'التواصل المبدئي وحجز الموعد', time: 'يوم 1', desc: 'استقبال طلبكم عبر الواتساب أو الموقع، وتأكيد موعد الجلسة والخدمة المطلوبة بكل سلاسة.' },
      { step: '2', title: 'جلسة التنسيق وتحديد لوحة الألوان', time: 'أسبوع قبل الجلسة', desc: 'مراجعة خيارات الفستان والحجاب والإكسسوارات واقتراح أفضل الأماكن وتوقيت الضوء.' },
      { step: '3', title: 'يوم الجلسة التحريري الممتع', time: 'يوم الحدث', desc: 'تجربة مريحة تماماً مع توجيه دقيق وفريق عمل نسائي يوفر أعلى درجات الخصوصية.' },
      { step: '4', title: 'معاينة الصور الأولية والمعالجة', time: 'خلال 5 أيام', desc: 'إتاحة معرض إلكتروني خاص ومحمي لاختيار اللقطات المفضلة لبدء الريتاتش الفني.' },
      { step: '5', title: 'استلام الألبوم الملكي والملفات عالية الدقة', time: 'خلال أسبوعين', desc: 'تسليم الألبوم الفاخر في صندوق خشبي أنيق مع رابط تحميل فائق السرعة لكافة الصور.' },
    ],
    guarantees: [
      { title: 'ضمان الخصوصية والسرية المطلقة', desc: 'لا يتم نشر أي صورة إلا بعد موافقة العميل الخطية الصريحة.' },
      { title: 'التزام دقيق بالمواعيد وجودة التسليم', desc: 'جداول زمنية واضحة ومحددة بدون أي تأخير.' },
      { title: 'تسليم منظم وآمن', desc: 'تُوضح طريقة الحفظ والتسليم ومدة الإتاحة لكل مشروع قبل الحجز.' },
    ],
  },
  faq: [
    {
      id: 'faq-1',
      question: 'كيف تضمنون الخصوصية التامة للعروس المحجبة أثناء التصوير؟',
      answer: 'نوفر فريق تصوير نسائي متكامل ومحترف ومدرب على أعلى مستوى، مع إمكانية إغلاق قاعات أو استوديوهات التصوير بالكامل لضمان الراحة النفسية التامة للعروس، كما نلتزم بعدم نشر أي صورة إطلاقاً إلا بموافقة كتابية صريحة.',
      category: 'weddings',
    },
    {
      id: 'faq-2',
      question: 'قبل كم من الوقت يجب حجز موعد جلسة الزفاف؟',
      answer: 'نظراً لحرصنا على تقديم أعلى جودة وتكريس وقتنا لكل عميل، نوصي بالحجز المسبق قبل موعد الزفاف بشهرين إلى 4 أشهر لضمان توفر الموعد وتنسيق جلسة التخطيط المسبقة.',
      category: 'weddings',
    },
    {
      id: 'faq-3',
      question: 'هل توفرون تصوير في مدن أخرى خارج الإسكندرية؟',
      answer: 'نعم بكل تأكيد، نصور في القاهرة، الجونة، الساحل الشمالي، وكافة محافظات مصر، بالإضافة إلى إمكانية السفر لتغطية الأعراس الفاخرة في دول الخليج العربي.',
      category: 'general',
    },
    {
      id: 'faq-4',
      question: 'ما هي مواصفات الألبومات والطباعة التي تقدمونها؟',
      answer: 'نعتمد أفخر أنواع الورق الأرشيفي (Fine Art Rag) بملمس قطني مطفأ يدوم لأكثر من 100 عام دون تغير الألوان، بأغلفة من الجلد الطبيعي والكتان الفاخر مع حفر بالذهب أو الفضة.',
      category: 'deliverables',
    },
    {
      id: 'faq-5',
      question: 'كيف يتم تسليم الصور والفيديوهات للعملاء؟',
      answer: 'يتم تسليم الصور عبر معرض رقمي سحابي خاص ومحمي بكلمة مرور بدقة 4K الفائقة للتحميل المباشر، بالإضافة إلى فلاش ميموري أنيق والألبوم المطبوع داخل صندوق خشبي فاخر.',
      category: 'deliverables',
    },
  ],
  contact: {
    title: 'تواصلوا معنا واحجزوا جلستكم التحريرية',
    subtitle: 'يسعدنا دائماً استقبال استفساراتكم والحديث عن تفاصيل مناسبتكم القادمة',
    address: 'الإسكندرية، مصر (Alexandria, Egypt) — لوران / سان ستيفانو',
    workingHours: 'السبت إلى الخميس: 11:00 صباحاً – 09:00 مساءً (المقابلات بحجز مسبق)',
    phone: '',
    whatsapp: '',
    email: 'adminmoro@kallista.com',
    instagram: 'https://instagram.com/kallista.photography',
    facebook: 'https://facebook.com/kallistaphotography',
    tiktok: 'https://tiktok.com/@kallista.photo',
    socialLinks: [
      { id: 'social-instagram', label: 'Instagram', icon: 'instagram', url: 'https://instagram.com/kallista.photography' },
      { id: 'social-facebook', label: 'Facebook', icon: 'facebook', url: 'https://facebook.com/kallistaphotography' },
      { id: 'social-tiktok', label: 'TikTok', icon: 'tiktok', url: 'https://tiktok.com/@kallista.photo' },
    ],
    depositPolicy: 'يتم تأكيد الحجز النهائي بدفع عربون بنسبة 30% من قيمة الباقة المختارة، مع إمكانية تعديل الموعد بالتنسيق المسبق.',
    privacyNote: 'خصوصية بياناتكم وصوركم هي أولويتنا المطلقة دائماً وأبداً.',
  },
  footer: {
    copyrightText: '© 2026 KALLISTA by Ronadisa. جميع الحقوق محفوظة.',
    disclaimerText: 'دار كاليستا للتصوير الفوتوغرافي التحريري الفاخر والبورتريه الملكي للمحجبات — الإسكندرية ومصر.',
    privacyNotice: 'نلتزم بالخصوصية التامة وحماية كافة حقوق الملكية الفكرية وخصوصية العملاء.',
    developerCredit: 'Designed & Developed by Mohammed Hussein · iegy.net ©',
  },
};

// --- 4. INITIAL ALBUMS WITH USER'S AUTHENTIC WEDDING PHOTOSHOOT ---
export const INITIAL_ALBUMS: Album[] = [
  {
    id: 'album-wed-flagship',
    title: 'حكاية نور وكريم — سحر الزفاف الملكي والأناقة الهادئة',
    titleEn: 'The Royal Garden Romance: Noor & Kareem',
    category: 'weddings',
    coverImage: veiledWeddingPhoto,
    date: '2026-02-12',
    location: 'الإسكندرية — القصر الملكي والحدائق التاريخية',
    story: 'ألبوم زفاف استثنائي وثقنا فيه أرقى لحظات العروسين؛ حيث تلتقي إطلالة العروس المحجبة الملكية بفستانها الحريري الأبيض وطوق اللؤلؤ والورود مع وقار العريس وأناقة بدلته البيج الكلاسيكية، وسط أجواء من الزهور البيضاء وأشعة الغروب الدافئة والضحكات الصادقة المفعمة بالحب.',
    featured: true,
    tags: ['Royal Wedding', 'Veiled Bride', 'Editorial Luxury', 'Golden Hour'],
    images: [
      {
        id: 'img-w-flag-1',
        url: veiledWeddingPhoto,
        title: 'الإطلالة الملكية الكاملة للعروسين',
        caption: 'العروس بفستان زفاف أبيض محتشم وطرحة نقية مع العريس ببدلته الكلاسيكية أمام الدرج الزهري الفاخر',
        orientation: 'portrait',
        featured: true,
        uploadedAt: '2026-02-12',
      },
      {
        id: 'img-w-flag-2',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
        title: 'نظرة الألفة وتلاقي الجبين',
        caption: 'لحظة دافئة قريبة تجمع العروسين وتبرز بريق العيون والمشاعر الصادقة',
        orientation: 'portrait',
        featured: true,
        uploadedAt: '2026-02-12',
      },
      {
        id: 'img-w-flag-3',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
        title: 'نزهة الغروب بين أزهار الحديقة',
        caption: 'انعكاس أشعة الشمس الذهبية وتناغم ألوان الطبيعة مع فستان الزفاف الانسيابي',
        orientation: 'portrait',
        featured: false,
        uploadedAt: '2026-02-12',
      },
      {
        id: 'img-w-flag-4',
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop',
        title: 'البروفايل الرومانسي والضوء الطبيعي',
        caption: 'لقطة جانبية متقنة تبرز تفاصيل الحجاب والستائر الكلاسيكية والإضاءة الناعمة',
        orientation: 'portrait',
        featured: false,
        uploadedAt: '2026-02-12',
      },
      {
        id: 'img-w-flag-5',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
        title: 'فستان العروس الملكي على الدرج الرخامي',
        caption: 'تكوين فوتوغرافي عمودي كامل يبرز فخامة القماش وتطريزات الأكمام والزهور البيضاء',
        orientation: 'portrait',
        featured: true,
        uploadedAt: '2026-02-12',
      },
      {
        id: 'img-w-flag-6',
        url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=1200&auto=format&fit=crop',
        title: 'تفاصيل دبلة الزواج وباقة الورد',
        caption: 'لقطة مقربة (Macro) لأيدي العروسين مع الخاتم الماسي وباقة الهيدرانجيا والورد الأبيض',
        orientation: 'portrait',
        featured: false,
        uploadedAt: '2026-02-12',
      },
      {
        id: 'img-w-flag-7',
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
        title: 'ضحكة من القلب في لحظة الغروب',
        caption: 'قبلة دافئة وضحكة عفوية مليئة بالبهجة والانطلاق في الضوء الذهبي',
        orientation: 'portrait',
        featured: true,
        uploadedAt: '2026-02-12',
      },
      {
        id: 'img-w-flag-8',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
        title: 'بورتريه العريس الأنيق',
        caption: 'إطلالة كلاسيكية واثقة بالبدلة البيج مع وردة العروة البيضاء وإضاءة النافذة',
        orientation: 'portrait',
        featured: false,
        uploadedAt: '2026-02-12',
      },
      {
        id: 'img-w-flag-9',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
        title: 'بورتريه العروس والتاج الزهري اللؤلؤي',
        caption: 'ملامح هادئة نقية مع طرحة الشيفون وتاج اللؤلؤ المصنوع يدوياً',
        orientation: 'portrait',
        featured: true,
        uploadedAt: '2026-02-12',
      },
    ],
  },
  {
    id: 'album-fash-1',
    title: 'مجموعة حرير وظلال — أزياء المحجبات التحريرية الراقية',
    titleEn: 'Silk & Shadows — Modest Couture Editorial',
    category: 'fashion',
    coverImage: veiledFashionPhoto,
    date: '2026-01-20',
    location: 'ستوديو كاليستا — Alexandria Creative Space',
    story: 'جلسة تصوير تحريرية لأحدث تصاميم الأزياء والعباءات والفساتين المحتشمة لعام 2026 للمحجبات، تمتاز بإضاءة فنية هادئة وتدرجات ألوان تعكس الفخامة المعاصرة.',
    featured: true,
    tags: ['Modest Fashion', 'Haute Couture', 'Editorial'],
    images: [
      {
        id: 'img-f1-1',
        url: veiledFashionPhoto,
        title: 'التناغم الحريري والظلال الدافئة',
        caption: 'تكوين فوتوغرافي فني يبرز انسيابية الأقمشة وفخامة الحجاب',
        orientation: 'landscape',
        uploadedAt: '2026-01-20',
      },
      {
        id: 'img-f1-2',
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
        title: 'حضور واثق وهادئ',
        caption: 'تصوير الأزياء المحتشمة بأسلوب راقٍ يتجاوز التقليد التجاري',
        orientation: 'portrait',
        uploadedAt: '2026-01-20',
      },
    ],
  },
  {
    id: 'album-child-1',
    title: 'تولين وحنان — دفء الأمومة وضحكات الطفولة',
    titleEn: 'Toleen & Family — Pure Moments of Warmth',
    category: 'children',
    coverImage: veiledFamilyPhoto,
    date: '2026-02-02',
    location: 'جلسة خارجية — حدائق الإسكندرية الهادئة',
    story: 'جلسة تصوير عائلية دافئة للأم المحجبة مع طفلتها بدون أي تصنع أو وقفات جامدة. ضحكات عفوية وبريق عيون حقيقي في ضوء الصباح الذهبي.',
    featured: true,
    tags: ['Family', 'Maternity', 'Pure Warmth'],
    images: [
      {
        id: 'img-c1-1',
        url: veiledFamilyPhoto,
        title: 'عفوية ودفء العائلة',
        caption: 'ضحكة تنبض بالحياة، لحظة تستحق أن تظل للأبد في ذاكرة العائلة',
        orientation: 'landscape',
        uploadedAt: '2026-02-02',
      },
      {
        id: 'img-c1-2',
        url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1000&auto=format&fit=crop',
        title: 'نظرة فضول وشغف طفولي',
        caption: 'نوثق ملامح الصغر قبل أن تتغير مع الأيام',
        orientation: 'portrait',
        uploadedAt: '2026-02-02',
      },
    ],
  },
];

// Start with an empty database. Real reviews, client records and bookings are created through Firebase.
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_CLIENTS: ClientContact[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];

// --- STORAGE GETTERS & SETTERS ---
export function getPortfolioCategories(): PortfolioCategory[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return item ? JSON.parse(item) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function savePortfolioCategories(categories: PortfolioCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories to storage', e);
  }
}

export function mergeSiteContent(value?: Partial<SiteContent> | null): SiteContent {
  const source = value || {};
  return {
    ...DEFAULT_SITE_CONTENT,
    ...source,
    brand: { ...DEFAULT_SITE_CONTENT.brand, ...(source.brand || {}) },
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...(source.hero || {}) },
    intro: { ...DEFAULT_SITE_CONTENT.intro, ...(source.intro || {}) },
    servicesSettings: { ...DEFAULT_SITE_CONTENT.servicesSettings, ...(source.servicesSettings || {}) },
    approach: { ...DEFAULT_SITE_CONTENT.approach, ...(source.approach || {}) },
    signature: { ...DEFAULT_SITE_CONTENT.signature, ...(source.signature || {}) },
    aboutKallista: { ...DEFAULT_SITE_CONTENT.aboutKallista, ...(source.aboutKallista || {}) },
    aboutRonadisa: { ...DEFAULT_SITE_CONTENT.aboutRonadisa, ...(source.aboutRonadisa || {}) },
    experience: { ...DEFAULT_SITE_CONTENT.experience, ...(source.experience || {}) },
    contact: { ...DEFAULT_SITE_CONTENT.contact, ...(source.contact || {}) },
    footer: { ...DEFAULT_SITE_CONTENT.footer, ...(source.footer || {}) },
  };
}

export function getSiteContent(): SiteContent {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CONTENT);
    if (!item) return DEFAULT_SITE_CONTENT;
    return mergeSiteContent(JSON.parse(item));
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export function saveSiteContent(content: SiteContent): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(content));
  } catch (e) {
    console.error('Error saving site content to storage', e);
  }
}

export function getAlbums(): Album[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.ALBUMS);
    return item ? JSON.parse(item) : INITIAL_ALBUMS;
  } catch {
    return INITIAL_ALBUMS;
  }
}

export function saveAlbums(albums: Album[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
  } catch (e) {
    console.error('Error saving albums to storage', e);
  }
}

export function getBookings(): Booking[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return item ? JSON.parse(item) : INITIAL_BOOKINGS;
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Error saving bookings to storage', e);
  }
}

export function getClients(): ClientContact[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return item ? JSON.parse(item) : INITIAL_CLIENTS;
  } catch {
    return INITIAL_CLIENTS;
  }
}

export function saveClients(clients: ClientContact[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error('Error saving clients to storage', e);
  }
}

export function getReviews(): Review[] {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return item ? JSON.parse(item) : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function saveReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving reviews to storage', e);
  }
}

export function getSettings(): SiteSettings {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return item ? JSON.parse(item) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to storage', e);
  }
}

// ImgBB API Direct Upload function
export async function uploadImageToImgBB(
  imageFile: File,
  apiKey: string = DEFAULT_SETTINGS.imgbbApiKey
): Promise<{ success: boolean; url?: string; thumbUrl?: string; deleteUrl?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data && data.success && data.data) {
      return {
        success: true,
        url: data.data.url,
        thumbUrl: data.data.thumb?.url || data.data.display_url,
        deleteUrl: data.data.delete_url,
      };
    } else {
      return {
        success: false,
        error: data?.error?.message || 'فشل رفع الصورة إلى ImgBB، تأكدي من مفتاح الـ API',
      };
    }
  } catch (err: any) {
    console.error('ImgBB upload error:', err);
    return {
      success: false,
      error: err.message || 'حدث خطأ في الاتصال بالسيرفر أثناء رفع الصورة',
    };
  }
}

// Birthday Reminder Calculations
export function getUpcomingBirthdayAlerts(clients: ClientContact[]): {
  client: ClientContact;
  daysRemaining: number;
  isToday: boolean;
  formattedDate: string;
}[] {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const results: {
    client: ClientContact;
    daysRemaining: number;
    isToday: boolean;
    formattedDate: string;
  }[] = [];

  clients.forEach((client) => {
    if (!client.birthday) return;
    const bdayParts = client.birthday.split('-');
    if (bdayParts.length < 3) return;

    const bMonth = parseInt(bdayParts[1], 10) - 1;
    const bDay = parseInt(bdayParts[2], 10);

    const nextBday = new Date(today.getFullYear(), bMonth, bDay);
    if (nextBday < new Date(today.getFullYear(), currentMonth, currentDay)) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextBday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 30) {
      results.push({
        client,
        daysRemaining: diffDays,
        isToday: diffDays === 0,
        formattedDate: `${bDay}/${bMonth + 1}`,
      });
    }
  });

  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

// WhatsApp Message Builders
export function createBirthdayWhatsAppLink(client: ClientContact): string {
  const cleanPhone = client.whatsapp.replace(/[^0-9+]/g, '');
  const message = `كل عام وأنتِ بألف خير وسعادة يا ${client.name}! 🎂✨
من أسرة ستوديو كاليستا للتصوير الفوتوغرافي (KALLISTA by Ronadisa)، يسعدنا أن نهنئك بمناسبة عيد ميلادك السعيد، ويسرنا تقديم هدية خاصة لكِ بخصم 20% على أي جلسة تصوير تختارينها هذا الشهر. 🌸📷
كل عام وأنتِ مصدر للبهجة والجمال!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function createBookingInquiryWhatsAppLink(booking: Booking): string {
  const message = `مرحباً ستوديو كاليستا، أود تأكيد تفاصيل الحجز:
الاسم: ${booking.clientName}
الخدمة: ${booking.serviceType}
التاريخ: ${booking.date}
التوقيت: ${booking.timeSlot || 'مرن'}
المكان: ${booking.location || 'الإسكندرية'}
تفاصيل المناسبة: ${booking.storyNotes || 'بدون ملاحظات إضافية'}`;

  const subject = encodeURIComponent(`طلب حجز Kallista — ${booking.clientName}`);
  return `mailto:${import.meta.env.VITE_ADMIN_EMAIL || 'adminmoro@kallista.com'}?subject=${subject}&body=${encodeURIComponent(message)}`;
}

// JSON Backup / Export & Import
export function exportDataAsJSON(): string {
  const payload = {
    version: '3.0',
    exportDate: new Date().toISOString(),
    categories: getPortfolioCategories(),
    content: getSiteContent(),
    albums: getAlbums(),
    bookings: getBookings(),
    clients: getClients(),
    reviews: getReviews(),
    settings: getSettings(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.categories) savePortfolioCategories(data.categories);
    if (data.content) saveSiteContent(data.content);
    if (data.albums) saveAlbums(data.albums);
    if (data.bookings) saveBookings(data.bookings);
    if (data.clients) saveClients(data.clients);
    if (data.reviews) saveReviews(data.reviews);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
}
