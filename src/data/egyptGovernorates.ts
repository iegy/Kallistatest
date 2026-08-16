/**
 * Egypt's 27 governorates, bilingual.
 *
 * `value` is what gets stored in Firestore — a stable English key that never
 * changes with the site language, so admin filtering, sorting and CSV export
 * stay consistent. `ar` / `en` are display labels only.
 */
export interface EgyptGovernorate {
  value: string;
  ar: string;
  en: string;
}

export const EGYPT_GOVERNORATES: EgyptGovernorate[] = [
  { value: 'Cairo', ar: 'القاهرة', en: 'Cairo' },
  { value: 'Giza', ar: 'الجيزة', en: 'Giza' },
  { value: 'Alexandria', ar: 'الإسكندرية', en: 'Alexandria' },
  { value: 'Qalyubia', ar: 'القليوبية', en: 'Qalyubia' },
  { value: 'PortSaid', ar: 'بورسعيد', en: 'Port Said' },
  { value: 'Suez', ar: 'السويس', en: 'Suez' },
  { value: 'Dakahlia', ar: 'الدقهلية', en: 'Dakahlia' },
  { value: 'Sharqia', ar: 'الشرقية', en: 'Sharqia' },
  { value: 'Gharbia', ar: 'الغربية', en: 'Gharbia' },
  { value: 'Monufia', ar: 'المنوفية', en: 'Monufia' },
  { value: 'Beheira', ar: 'البحيرة', en: 'Beheira' },
  { value: 'KafrElSheikh', ar: 'كفر الشيخ', en: 'Kafr El Sheikh' },
  { value: 'Damietta', ar: 'دمياط', en: 'Damietta' },
  { value: 'Ismailia', ar: 'الإسماعيلية', en: 'Ismailia' },
  { value: 'Faiyum', ar: 'الفيوم', en: 'Faiyum' },
  { value: 'BeniSuef', ar: 'بني سويف', en: 'Beni Suef' },
  { value: 'Minya', ar: 'المنيا', en: 'Minya' },
  { value: 'Asyut', ar: 'أسيوط', en: 'Asyut' },
  { value: 'Sohag', ar: 'سوهاج', en: 'Sohag' },
  { value: 'Qena', ar: 'قنا', en: 'Qena' },
  { value: 'Luxor', ar: 'الأقصر', en: 'Luxor' },
  { value: 'Aswan', ar: 'أسوان', en: 'Aswan' },
  { value: 'RedSea', ar: 'البحر الأحمر', en: 'Red Sea' },
  { value: 'NewValley', ar: 'الوادي الجديد', en: 'New Valley' },
  { value: 'Matrouh', ar: 'مطروح', en: 'Matrouh' },
  { value: 'NorthSinai', ar: 'شمال سيناء', en: 'North Sinai' },
  { value: 'SouthSinai', ar: 'جنوب سيناء', en: 'South Sinai' },
];

/** Display label for a stored governorate value. Falls back to the raw value
 *  so older records written before this field existed still render sensibly. */
export function governorateLabel(value: string | undefined, language: 'ar' | 'en'): string {
  if (!value) return '';
  const match = EGYPT_GOVERNORATES.find((item) => item.value === value);
  if (!match) return value;
  return language === 'ar' ? match.ar : match.en;
}
