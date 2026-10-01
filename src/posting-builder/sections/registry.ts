import type { SectionDefinition } from './types';
import type { SectionType } from '../types/project';
import { heroDefinition } from './HeroSection';
import { introDefinition } from './IntroSection';
import { beforeAfterDefinition } from './BeforeAfterSection';
import { gridDefinition } from './GridSection';
import { faqDefinition } from './FaqSection';
import { guideDefinition } from './GuideSection';
import { tableDefinition } from './TableSection';
import { imageDefinition } from './ImageSection';
import { ctaDefinition } from './CtaSection';

/**
 * 전체 Registry입니다. Intro/Grid는 기존 JSON 프로젝트 호환을 위해 남아 있지만
 * library=false라 새 게시물의 섹션 라이브러리에는 노출되지 않습니다.
 */
export const sectionDefinitions: SectionDefinition[] = [
  heroDefinition,
  guideDefinition,
  beforeAfterDefinition,
  tableDefinition,
  imageDefinition,
  faqDefinition,
  ctaDefinition,
  // Legacy: 기존 저장 프로젝트 호환용
  introDefinition,
  gridDefinition,
];

export const librarySectionDefinitions = sectionDefinitions.filter((definition) => definition.library !== false);

export const sectionRegistry = sectionDefinitions.reduce((registry, definition) => {
  registry[definition.type] = definition;
  return registry;
}, {} as Record<SectionType, SectionDefinition>);

export const supportedSectionTypes = new Set<SectionType>(sectionDefinitions.map((definition) => definition.type));
