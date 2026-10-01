import { MousePointerClick } from 'lucide-react';
import { createId } from '../lib/ids';
import { ElementPanel, MarkdownField, TypographyField } from '../components/ui/Form';
import { resolveTextStyle } from '../lib/textStyle';
import type { CtaData, TextElementStyle } from '../types/project';
import type { SectionDefinition, SectionEditorProps, SectionRendererProps } from './types';
import { SectionFrame } from './shared';
import { createSectionCommon, createSectionFooter, createSectionStyle } from './common';

const DEFAULT_STYLES: Record<string, TextElementStyle> = {
  title: { fontSize: 31, lineHeight: 1.2, marginBottom: 18 },
  description: { fontSize: 13, lineHeight: 1.6, marginBottom: 24 },
};

function Editor({ section, onChange, selectedElement, onElementSelect }: SectionEditorProps) {
  if (section.type !== 'cta') return null;
  const update = <K extends keyof CtaData>(key: K, value: CtaData[K]) =>
    onChange({ ...section, data: { ...section.data, [key]: value } });
  const updateTextStyle = (key: string, value: TextElementStyle) =>
    update('textStyles', { ...section.data.textStyles, [key]: value });

  return (
    <>
      <ElementPanel elementId="title" title="제목" active={selectedElement === 'title'} defaultOpen onSelect={onElementSelect}>
        <MarkdownField label="제목" value={section.data.title} onChange={(value) => update('title', value)} rows={3} />
        <TypographyField label="제목" value={resolveTextStyle(section.data.textStyles, 'title', DEFAULT_STYLES.title)} onChange={(value) => updateTextStyle('title', value)} minFontSize={14} maxFontSize={72} />
      </ElementPanel>
      <ElementPanel elementId="description" title="설명" active={selectedElement === 'description'} onSelect={onElementSelect}>
        <MarkdownField label="설명" value={section.data.description} onChange={(value) => update('description', value)} rows={4} />
        <TypographyField label="설명" value={resolveTextStyle(section.data.textStyles, 'description', DEFAULT_STYLES.description)} onChange={(value) => updateTextStyle('description', value)} minFontSize={8} maxFontSize={36} />
      </ElementPanel>
    </>
  );
}

function Renderer({ section, onChange, selectedElement, onElementSelect, exporting }: SectionRendererProps) {
  if (section.type !== 'cta') return null;
  const styles = section.data.textStyles;
  const updateTextStyle = (key: string, value: TextElementStyle) => {
    onChange?.({ ...section, data: { ...section.data, textStyles: { ...styles, [key]: value } } });
  };

  return (
    <SectionFrame
      section={section}
      heading={section.data.title}
      description={section.data.description}
      headingStyle={resolveTextStyle(styles, 'title', DEFAULT_STYLES.title)}
      descriptionStyle={resolveTextStyle(styles, 'description', DEFAULT_STYLES.description)}
      onHeadingStyleChange={(value) => updateTextStyle('title', value)}
      onDescriptionStyleChange={(value) => updateTextStyle('description', value)}
      selectedElement={selectedElement}
      onElementSelect={onElementSelect}
      onChange={onChange}
      exporting={exporting}
      className="cta-section"
    />
  );
}

export const ctaDefinition: SectionDefinition = {
  type: 'cta',
  label: 'CTA',
  description: '게시물의 마지막 행동을 유도하는 CTA 섹션',
  icon: MousePointerClick,
  create: () => ({
    id: createId('cta'),
    type: 'cta',
    style: createSectionStyle({ backgroundToken: 'primarySoft' }),
    common: createSectionCommon({
      category: 'NEXT ACTION',
      buttonText: '운영 신청하기',
      showCategory: true,
      showButton: true,
    }),
    footer: createSectionFooter(),
    data: {
      title: '## 지금 바로 시작해보세요',
      description: '사용자가 다음 행동을 명확하게 이해할 수 있도록 한 문장으로 안내합니다.',
      textStyles: { ...DEFAULT_STYLES },
    },
  }),
  Editor,
  Renderer,
};
