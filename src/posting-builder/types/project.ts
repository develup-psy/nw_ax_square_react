export type ThemePresetId = 'corporate' | 'guide' | 'faq' | 'modern';

export type FontFamilyId = 'Pretendard' | 'SUIT' | 'Noto Sans KR' | 'Wanted Sans' | 'LG Smart' | 'LG Smart Regular';

export type TextAlign = 'left' | 'center' | 'right';

/**
 * 실제 값은 CSS Custom Property로 Preview에 전달하고, 렌더링 규칙은 styles.css가 담당합니다.
 * color/fontWeight/textAlign은 지정하지 않으면 현재 테마 값을 그대로 상속합니다.
 */
export interface TextElementStyle {
  fontSize: number;
  lineHeight: number;
  /** @deprecated v9부터 UI에서 제거. 과거 JSON 호환을 위해 필드만 유지합니다. */
  blockGap?: number;
  /** 이 Element 자체와 앞/뒤 Element 사이의 외부 간격(px). */
  marginTop?: number;
  marginBottom?: number;
  color?: string;
  fontWeight?: number;
  textAlign?: TextAlign;
  /** Element 박스 스타일. 미지정 시 투명/테두리 없음. */
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  paddingX?: number;
  paddingY?: number;
}

export type TextStyleMap = Record<string, TextElementStyle>;

export interface SectionFooterSettings {
  text: string;
  show: boolean;
  textStyle: TextElementStyle;
}

export type SectionBackgroundToken = 'background' | 'surface' | 'primarySoft' | 'secondary' | 'primary' | 'custom';

export interface SectionStyleSettings {
  /** 값이 없으면 전역 테마의 섹션 위쪽 여백을 사용합니다. */
  paddingTop?: number;
  /** 값이 없으면 전역 테마의 섹션 아래쪽 여백을 사용합니다. */
  paddingBottom?: number;
  /** 테마 토큰 기반 배경. 섹션 순서를 변경해도 색상이 바뀌지 않습니다. */
  backgroundToken?: SectionBackgroundToken;
  /** backgroundToken === custom 일 때 사용하는 실제 색상 */
  customBackgroundColor?: string;
  /** @deprecated v6 이전 JSON 호환용 */
  useCustomBackground?: boolean;
  /** @deprecated v6 이전 JSON 호환용 */
  backgroundColor?: string;
}

/** 모든 섹션에서 공유하는 공통 UI 요소입니다. */
export interface SectionCommonSettings {
  category: string;
  buttonText: string;
  backgroundImage: string | null;
  showCategory: boolean;
  showTitle: boolean;
  showDescription: boolean;
  showButton: boolean;
  showBackgroundImage: boolean;
  textStyles: TextStyleMap;
}

export interface ThemeSettings {
  presetId: ThemePresetId;
  primary: string;
  secondary: string;
  text: string;
  background: string;
  surface: string;
  muted: string;
  fontFamily: FontFamilyId;
  fontSizeScale: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: number;
  sectionWidth: number;
  cardRadius: number;
  gap: number;
  paddingTop: number;
  paddingBottom: number;
}

export type HeroLayout = 'text-only' | 'text-left-image-right' | 'image-left-text-right';
export type HeroContentRatio = '50-50' | '55-45' | '60-40';

export interface HeroData {
  title: string;
  description: string;
  contentImage: string | null;
  layout: HeroLayout;
  contentRatio: HeroContentRatio;
  imageFit: 'cover' | 'contain';
  showContentImage: boolean;
  /** 오프닝 2열 레이아웃에서 이미지가 차지하는 열 너비(%, 25~70). Preview 경계선을 드래그해 조절합니다. */
  contentImageColumnPercent?: number;
  /** @deprecated v8 이전에는 이미지 열 내부에서 이미지 자체 너비를 조절했습니다. */
  contentImageWidthPercent?: number;
  /** 오프닝 콘텐츠 이미지 장식은 각각 독립적으로 켜고 끕니다. 기본값은 모두 false입니다. */
  contentImageShadow?: boolean;
  contentImageBackground?: boolean;
  contentImageBorder?: boolean;
  textStyles: TextStyleMap;
  /** @deprecated v5 이전 JSON 호환용 */
  category?: string;
  /** @deprecated v5 이전 JSON 호환용 */
  buttonText?: string;
  /** @deprecated v5 이전 JSON 호환용 */
  backgroundImage?: string | null;
  /** @deprecated v5 이전 JSON 호환용 */
  showCategory?: boolean;
  /** @deprecated v5 이전 JSON 호환용 */
  showDescription?: boolean;
  /** @deprecated v5 이전 JSON 호환용 */
  showButton?: boolean;
  /** @deprecated v5 이전 JSON 호환용 */
  showBackgroundImage?: boolean;
}

/** 이전 프로젝트 JSON 호환을 위해 유지합니다. 새 게시물에서는 Guide 사용을 권장합니다. */
export interface IntroCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface IntroData {
  heading: string;
  description: string;
  cards: IntroCard[];
  textStyles?: TextStyleMap;
}

export interface BeforeAfterData {
  heading: string;
  description: string;
  beforeLabel: string;
  beforeTitle: string;
  beforeDescription: string;
  beforeBackground: string;
  afterLabel: string;
  afterTitle: string;
  afterDescription: string;
  afterBackground: string;
  textStyles: TextStyleMap;
}

/** 이전 프로젝트 JSON 호환을 위해 유지합니다. 새 게시물에서는 Guide 사용을 권장합니다. */
export interface GridCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface GridData {
  heading: string;
  description: string;
  columns: 2 | 3 | 4;
  cards: GridCard[];
  textStyles?: TextStyleMap;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqData {
  heading: string;
  description: string;
  items: FaqItem[];
  textStyles: TextStyleMap;
}

export interface GuideStep {
  id: string;
  icon?: string;
  title: string;
  description: string;
}

export interface GuideData {
  heading: string;
  description: string;
  orientation: 'horizontal' | 'vertical';
  columns?: 2 | 3 | 4;
  showIndex?: boolean;
  itemLabel?: string;
  steps: GuideStep[];
  textStyles: TextStyleMap;
}

export interface TableData {
  heading: string;
  description: string;
  tableMarkdown: string;
  textStyles: TextStyleMap;
}

export type ImageLayout = 'contained' | 'full';
export type ImageFit = 'cover' | 'contain';
export type ImageRatio = 'auto' | '16:9' | '4:3' | '1:1';
export type ImageDisplayMode = 'single' | 'split';

export interface ImageData {
  heading: string;
  description: string;
  image: string | null;
  image2: string | null;
  alt: string;
  alt2: string;
  caption: string;
  caption2: string;
  /** @deprecated v5부터는 section.footer를 사용합니다. */
  bottomText?: string;
  layout: ImageLayout;
  displayMode: ImageDisplayMode;
  fit: ImageFit;
  ratio: ImageRatio;
  widthPercent: number;
  /** @deprecated v6부터는 section.common.showTitle 사용 */
  showHeading?: boolean;
  /** @deprecated v6부터는 section.common.showDescription 사용 */
  showDescription?: boolean;
  showCaption: boolean;
  /** @deprecated v5부터는 section.footer를 사용합니다. */
  showBottomText?: boolean;
  textStyles: TextStyleMap;
}

export interface CtaData {
  title: string;
  description: string;
  textStyles: TextStyleMap;
  /** @deprecated v6부터는 section.common.category 사용 */
  kickerText?: string;
  /** @deprecated v6부터는 section.common.showCategory 사용 */
  showKicker?: boolean;
  /** @deprecated v6부터는 section.common.buttonText 사용 */
  buttonText?: string;
  /** @deprecated v6부터는 section.common.showButton 사용 */
  showButton?: boolean;
}

export interface SectionDataMap {
  hero: HeroData;
  intro: IntroData;
  beforeAfter: BeforeAfterData;
  grid: GridData;
  faq: FaqData;
  guide: GuideData;
  table: TableData;
  image: ImageData;
  cta: CtaData;
}

export type SectionType = keyof SectionDataMap;

export type BuilderSection = {
  [K in SectionType]: {
    id: string;
    type: K;
    data: SectionDataMap[K];
    /** 섹션 공통 레이아웃/배경 설정. 미지정 값은 전역 테마를 상속합니다. */
    style?: SectionStyleSettings;
    /** 카테고리/버튼/배경 이미지/표시 토글 등 섹션 공통 요소 */
    common?: SectionCommonSettings;
    /** 모든 섹션에서 공통으로 사용하는 하단 Markdown 텍스트 */
    footer?: SectionFooterSettings;
  }
}[SectionType];

export interface BuilderProject {
  version: 1;
  id: string;
  title: string;
  theme: ThemeSettings;
  sections: BuilderSection[];
}
