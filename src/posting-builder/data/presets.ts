import type { ThemePresetId, ThemeSettings, FontFamilyId } from '../types/project';

export const FONT_STACKS: Record<FontFamilyId, string> = {
  Pretendard: "'Pretendard Std', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  SUIT: "'SUIT', 'Pretendard Std', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'Noto Sans KR': "'Noto Sans KR', 'Pretendard Std', -apple-system, BlinkMacSystemFont, sans-serif",
  'Wanted Sans': "'Wanted Sans', 'Pretendard Std', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'LG Smart': "'NWAX LG Smart', 'Pretendard Std', sans-serif",
  'LG Smart Regular': "'NWAX LG Smart', 'Pretendard Std', sans-serif",
};

export interface FontWeightOption {
  label: string;
  value: number;
}

const PRETENDARD_WEIGHTS: FontWeightOption[] = [
  { label: '100 · Thin', value: 100 },
  { label: '200 · Extra Light', value: 200 },
  { label: '300 · Light', value: 300 },
  { label: '400 · Regular', value: 400 },
  { label: '500 · Medium', value: 500 },
  { label: '600 · Semi Bold', value: 600 },
  { label: '700 · Bold', value: 700 },
  { label: '800 · Extra Bold', value: 800 },
  { label: '900 · Black', value: 900 },
];

const LG_SMART_WEIGHTS: FontWeightOption[] = [
  { label: '300 · Light', value: 300 },
  { label: '400 · Regular', value: 400 },
  { label: '600 · Semi Bold', value: 600 },
  { label: '700 · Bold', value: 700 },
];

const DEFAULT_WEIGHTS: FontWeightOption[] = [
  { label: '300 · Light', value: 300 },
  { label: '400 · Regular', value: 400 },
  { label: '500 · Medium', value: 500 },
  { label: '600 · Semi Bold', value: 600 },
  { label: '700 · Bold', value: 700 },
  { label: '800 · Extra Bold', value: 800 },
];

export function getFontWeightOptions(fontFamily: FontFamilyId): FontWeightOption[] {
  if (fontFamily === 'Pretendard') return PRETENDARD_WEIGHTS;
  if (fontFamily === 'LG Smart' || fontFamily === 'LG Smart Regular') return LG_SMART_WEIGHTS;
  return DEFAULT_WEIGHTS;
}

/**
 * v4/v5에서 확정했던 네 가지 기본 테마입니다.
 * 이후 Element 커스텀 스타일은 이 색을 덮어쓸 수 있지만,
 * 새 섹션의 기본 디자인은 아래 Theme token을 그대로 사용합니다.
 */
export const THEME_PRESETS: Record<ThemePresetId, ThemeSettings> = {
  corporate: {
    presetId: 'corporate',
    primary: '#FF2E98',
    secondary: '#FFFFFF',
    text: '#1F1B20',
    background: '#FFFFFF',
    surface: '#FFF7FB',
    muted: '#73707A',
    fontFamily: 'Pretendard',
    fontSizeScale: 1,
    lineHeight: 1.6,
    letterSpacing: -0.025,
    fontWeight: 500,
    sectionWidth: 820,
    cardRadius: 18,
    gap: 20,
    paddingTop: 64,
    paddingBottom: 64,
  },
  guide: {
    presetId: 'guide',
    primary: '#2563EB',
    secondary: '#7C3AED',
    text: '#172033',
    background: '#FFFFFF',
    surface: '#F5F8FF',
    muted: '#67738A',
    fontFamily: 'SUIT',
    fontSizeScale: 0.96,
    lineHeight: 1.72,
    letterSpacing: -0.018,
    fontWeight: 500,
    sectionWidth: 800,
    cardRadius: 14,
    gap: 18,
    paddingTop: 58,
    paddingBottom: 58,
  },
  faq: {
    presetId: 'faq',
    primary: '#0F766E',
    secondary: '#0E7490',
    text: '#14211F',
    background: '#FCFEFD',
    surface: '#F0F8F6',
    muted: '#60716D',
    fontFamily: 'Noto Sans KR',
    fontSizeScale: 0.94,
    lineHeight: 1.72,
    letterSpacing: -0.012,
    fontWeight: 500,
    sectionWidth: 790,
    cardRadius: 12,
    gap: 16,
    paddingTop: 56,
    paddingBottom: 56,
  },
  modern: {
    presetId: 'modern',
    primary: '#7C3AED',
    secondary: '#EC4899',
    text: '#17151C',
    background: '#FAFAFC',
    surface: '#FFFFFF',
    muted: '#716D79',
    fontFamily: 'Wanted Sans',
    fontSizeScale: 1.02,
    lineHeight: 1.58,
    letterSpacing: -0.024,
    fontWeight: 500,
    sectionWidth: 840,
    cardRadius: 24,
    gap: 22,
    paddingTop: 68,
    paddingBottom: 68,
  },
};

export const THEME_PRESET_LABELS: Record<ThemePresetId, string> = {
  corporate: 'LG U+ 느낌',
  guide: '가이드',
  faq: '지식베이스형',
  modern: '모던 스타일',
};
