import type {
  BuilderSection,
  SectionCommonSettings,
  SectionFooterSettings,
  SectionStyleSettings,
  TextElementStyle,
} from '../types/project';

export const DEFAULT_COMMON_TEXT_STYLES: Record<'category' | 'button', TextElementStyle> = {
  category: { fontSize: 11, lineHeight: 1.2, marginBottom: 18 },
  button: { fontSize: 13, lineHeight: 1.2, marginTop: 26 },
};

export const DEFAULT_SECTION_FOOTER_STYLE: TextElementStyle = {
  fontSize: 14,
  lineHeight: 1.65,
  marginTop: 26,
};

export function createSectionCommon(overrides: Partial<SectionCommonSettings> = {}): SectionCommonSettings {
  return {
    category: 'NW AX SQUARE',
    buttonText: '자세히 보기',
    backgroundImage: null,
    showCategory: false,
    showTitle: true,
    showDescription: true,
    showButton: false,
    showBackgroundImage: false,
    ...overrides,
    textStyles: {
      category: { ...DEFAULT_COMMON_TEXT_STYLES.category },
      button: { ...DEFAULT_COMMON_TEXT_STYLES.button },
      ...(overrides.textStyles ?? {}),
    },
  };
}

export function createSectionFooter(overrides: Partial<SectionFooterSettings> = {}): SectionFooterSettings {
  return {
    text: '',
    show: false,
    ...overrides,
    textStyle: { ...DEFAULT_SECTION_FOOTER_STYLE, ...(overrides.textStyle ?? {}) },
  };
}

export function createSectionStyle(overrides: Partial<SectionStyleSettings> = {}): SectionStyleSettings {
  return {
    backgroundToken: 'background',
    ...overrides,
  };
}

export function getSectionCommon(section: BuilderSection): SectionCommonSettings {
  return section.common ?? createSectionCommon();
}

export function getSectionFooter(section: BuilderSection): SectionFooterSettings {
  return section.footer ?? createSectionFooter();
}
