import type { CSSProperties } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { createId } from '../lib/ids';
import { ElementBoxField, ElementPanel, MarkdownField, PlainField, TypographyField } from '../components/ui/Form';
import { Markdown } from '../components/Markdown';
import { resolveTextStyle } from '../lib/textStyle';
import type { BeforeAfterData, TextElementStyle } from '../types/project';
import type { SectionDefinition, SectionEditorProps, SectionRendererProps } from './types';
import { EditableElement, SectionFrame } from './shared';
import { createSectionCommon, createSectionFooter, createSectionStyle } from './common';

const DEFAULT_STYLES: Record<string, TextElementStyle> = {
  heading: { fontSize: 36, lineHeight: 1.18, marginBottom: 22 },
  description: { fontSize: 15, lineHeight: 1.6, marginBottom: 34 },
  beforeLabel: { fontSize: 10, lineHeight: 1.2, marginBottom: 18 },
  beforeTitle: { fontSize: 23, lineHeight: 1.25, marginBottom: 14 },
  beforeDescription: { fontSize: 12.5, lineHeight: 1.6},
  afterLabel: { fontSize: 10, lineHeight: 1.2, marginBottom: 18 },
  afterTitle: { fontSize: 23, lineHeight: 1.25, marginBottom: 14 },
  afterDescription: { fontSize: 12.5, lineHeight: 1.6},
  beforeBox: { fontSize: 16, lineHeight: 1.6, borderWidth: 0, borderRadius: 16 },
  afterBox: { fontSize: 16, lineHeight: 1.6, borderWidth: 0, borderRadius: 16 },
};

function Editor({ section, onChange, selectedElement, onElementSelect }: SectionEditorProps) {
  if (section.type !== 'beforeAfter') return null;
  const update = <K extends keyof BeforeAfterData>(key: K, value: BeforeAfterData[K]) =>
    onChange({ ...section, data: { ...section.data, [key]: value } });
  const updateTextStyle = (key: string, value: TextElementStyle) =>
    update('textStyles', { ...section.data.textStyles, [key]: value });

  return (
    <>
      <ElementPanel elementId="title" title="제목" active={selectedElement === 'title'} defaultOpen onSelect={onElementSelect}>
        <MarkdownField label="섹션 제목" value={section.data.heading} onChange={(value) => update('heading', value)} rows={3} />
        <TypographyField label="제목" value={resolveTextStyle(section.data.textStyles, 'heading', DEFAULT_STYLES.heading)} onChange={(value) => updateTextStyle('heading', value)} minFontSize={14} maxFontSize={72} />
      </ElementPanel>

      <ElementPanel elementId="description" title="설명" active={selectedElement === 'description'} onSelect={onElementSelect}>
        <MarkdownField label="섹션 설명" value={section.data.description} onChange={(value) => update('description', value)} rows={4} />
        <TypographyField label="설명" value={resolveTextStyle(section.data.textStyles, 'description', DEFAULT_STYLES.description)} onChange={(value) => updateTextStyle('description', value)} minFontSize={8} maxFontSize={36} />
      </ElementPanel>

      <ElementPanel elementId="before" title="Before 영역" active={Boolean(selectedElement?.startsWith('before'))} onSelect={onElementSelect}>
        <PlainField label="Before 문구" value={section.data.beforeLabel} onChange={(value) => update('beforeLabel', value)} placeholder="BEFORE / AS-IS" />
        <TypographyField label="Before 문구" value={resolveTextStyle(section.data.textStyles, 'beforeLabel', DEFAULT_STYLES.beforeLabel)} onChange={(value) => updateTextStyle('beforeLabel', value)} minFontSize={8} maxFontSize={28} />
        <ElementBoxField label="Before 카드" value={resolveTextStyle(section.data.textStyles, 'beforeBox', DEFAULT_STYLES.beforeBox)} onChange={(value) => updateTextStyle('beforeBox', value)} />
        <MarkdownField label="Before 제목" value={section.data.beforeTitle} onChange={(value) => update('beforeTitle', value)} rows={2} />
        <TypographyField label="Before 제목" value={resolveTextStyle(section.data.textStyles, 'beforeTitle', DEFAULT_STYLES.beforeTitle)} onChange={(value) => updateTextStyle('beforeTitle', value)} minFontSize={10} maxFontSize={56} />
        <MarkdownField label="Before 설명" value={section.data.beforeDescription} onChange={(value) => update('beforeDescription', value)} rows={6} />
        <TypographyField label="Before 설명" value={resolveTextStyle(section.data.textStyles, 'beforeDescription', DEFAULT_STYLES.beforeDescription)} onChange={(value) => updateTextStyle('beforeDescription', value)} minFontSize={8} maxFontSize={36} />
      </ElementPanel>

      <ElementPanel elementId="after" title="After 영역" active={Boolean(selectedElement?.startsWith('after'))} onSelect={onElementSelect}>
        <PlainField label="After 문구" value={section.data.afterLabel} onChange={(value) => update('afterLabel', value)} placeholder="AFTER / TO-BE" />
        <TypographyField label="After 문구" value={resolveTextStyle(section.data.textStyles, 'afterLabel', DEFAULT_STYLES.afterLabel)} onChange={(value) => updateTextStyle('afterLabel', value)} minFontSize={8} maxFontSize={28} />
        <ElementBoxField label="After 카드" value={resolveTextStyle(section.data.textStyles, 'afterBox', DEFAULT_STYLES.afterBox)} onChange={(value) => updateTextStyle('afterBox', value)} />
        <MarkdownField label="After 제목" value={section.data.afterTitle} onChange={(value) => update('afterTitle', value)} rows={2} />
        <TypographyField label="After 제목" value={resolveTextStyle(section.data.textStyles, 'afterTitle', DEFAULT_STYLES.afterTitle)} onChange={(value) => updateTextStyle('afterTitle', value)} minFontSize={10} maxFontSize={56} />
        <MarkdownField label="After 설명" value={section.data.afterDescription} onChange={(value) => update('afterDescription', value)} rows={6} />
        <TypographyField label="After 설명" value={resolveTextStyle(section.data.textStyles, 'afterDescription', DEFAULT_STYLES.afterDescription)} onChange={(value) => updateTextStyle('afterDescription', value)} minFontSize={8} maxFontSize={36} />
      </ElementPanel>
    </>
  );
}

function Renderer({ section, onChange, selectedElement, onElementSelect, exporting }: SectionRendererProps) {
  if (section.type !== 'beforeAfter') return null;
  const styles = section.data.textStyles;

  const updateTextStyle = (key: string, value: TextElementStyle) => {
    onChange?.({ ...section, data: { ...section.data, textStyles: { ...styles, [key]: value } } });
  };

  return (
    <SectionFrame
      section={section}
      heading={section.data.heading}
      description={section.data.description}
      headingStyle={resolveTextStyle(styles, 'heading', DEFAULT_STYLES.heading)}
      descriptionStyle={resolveTextStyle(styles, 'description', DEFAULT_STYLES.description)}
      onHeadingStyleChange={(value) => updateTextStyle('heading', value)}
      onDescriptionStyleChange={(value) => updateTextStyle('description', value)}
      selectedElement={selectedElement}
      onElementSelect={onElementSelect}
      onChange={onChange}
      exporting={exporting}
      className="before-after-section"
    >
      <div className="before-after-grid">
        <EditableElement elementId="before" label="Before" selectedElement={selectedElement} onElementSelect={onElementSelect} textStyle={resolveTextStyle(styles, 'beforeBox', DEFAULT_STYLES.beforeBox)} onTextStyleChange={(value) => updateTextStyle('beforeBox', value)} exporting={exporting} className="before-after-card-shell">
          <div className="before-after-card before-card" style={section.data.beforeBackground ? ({ '--compare-card-background': section.data.beforeBackground } as CSSProperties) : undefined}>
            <EditableElement
              elementId="beforeLabel"
              label="Before 문구"
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              textStyle={resolveTextStyle(styles, 'beforeLabel', DEFAULT_STYLES.beforeLabel)}
              onTextStyleChange={(value) => updateTextStyle('beforeLabel', value)}
              exporting={exporting}
              className="compare-label-element"
            >
              <span className="compare-label">{section.data.beforeLabel}</span>
            </EditableElement>
            <EditableElement
              elementId="beforeTitle"
              label="Before 제목"
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              textStyle={resolveTextStyle(styles, 'beforeTitle', DEFAULT_STYLES.beforeTitle)}
              onTextStyleChange={(value) => updateTextStyle('beforeTitle', value)}
              exporting={exporting}
            >
              <Markdown value={section.data.beforeTitle} className="md-compare-title" />
            </EditableElement>
            <EditableElement
              elementId="beforeDescription"
              label="Before 설명"
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              textStyle={resolveTextStyle(styles, 'beforeDescription', DEFAULT_STYLES.beforeDescription)}
              onTextStyleChange={(value) => updateTextStyle('beforeDescription', value)}
              exporting={exporting}
            >
              <Markdown value={section.data.beforeDescription} className="md-card-description" />
            </EditableElement>
          </div>
        </EditableElement>

        <div className="compare-arrow">→</div>

        <EditableElement elementId="after" label="After" selectedElement={selectedElement} onElementSelect={onElementSelect} textStyle={resolveTextStyle(styles, 'afterBox', DEFAULT_STYLES.afterBox)} onTextStyleChange={(value) => updateTextStyle('afterBox', value)} exporting={exporting} className="before-after-card-shell">
          <div className="before-after-card after-card" style={section.data.afterBackground ? ({ '--compare-card-background': section.data.afterBackground } as CSSProperties) : undefined}>
            <EditableElement
              elementId="afterLabel"
              label="After 문구"
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              textStyle={resolveTextStyle(styles, 'afterLabel', DEFAULT_STYLES.afterLabel)}
              onTextStyleChange={(value) => updateTextStyle('afterLabel', value)}
              exporting={exporting}
              className="compare-label-element"
            >
              <span className="compare-label">{section.data.afterLabel}</span>
            </EditableElement>
            <EditableElement
              elementId="afterTitle"
              label="After 제목"
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              textStyle={resolveTextStyle(styles, 'afterTitle', DEFAULT_STYLES.afterTitle)}
              onTextStyleChange={(value) => updateTextStyle('afterTitle', value)}
              exporting={exporting}
            >
              <Markdown value={section.data.afterTitle} className="md-compare-title" />
            </EditableElement>
            <EditableElement
              elementId="afterDescription"
              label="After 설명"
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              textStyle={resolveTextStyle(styles, 'afterDescription', DEFAULT_STYLES.afterDescription)}
              onTextStyleChange={(value) => updateTextStyle('afterDescription', value)}
              exporting={exporting}
            >
              <Markdown value={section.data.afterDescription} className="md-card-description" />
            </EditableElement>
          </div>
        </EditableElement>
      </div>
    </SectionFrame>
  );
}

export const beforeAfterDefinition: SectionDefinition = {
  type: 'beforeAfter',
  label: 'Before / After',
  description: '변화 전후를 한 화면에서 비교하는 섹션',
  icon: ArrowRightLeft,
  create: () => ({
    id: createId('before-after'),
    type: 'beforeAfter',
    style: createSectionStyle({ backgroundToken: 'surface' }),
    common: createSectionCommon(),
    footer: createSectionFooter(),
    data: {
      heading: '## 왜 변화가 필요한가요?',
      description: '변화 전과 후를 비교해 핵심 차이를 빠르게 전달하세요.',
      beforeLabel: 'BEFORE',
      beforeTitle: '### 흩어진 운영',
      beforeDescription: '- 메일과 메신저에 정보가 흩어짐\n- 담당자 경험에 의존\n- 반복 질문이 계속 발생',
      beforeBackground: '',
      afterLabel: 'AFTER',
      afterTitle: '### 연결된 운영',
      afterDescription: '- 한곳에서 운영 현황 확인\n- 문서와 실행 흐름 연결\n- AI를 활용해 반복 업무 최소화',
      afterBackground: '',
      textStyles: { ...DEFAULT_STYLES },
    },
  }),
  Editor,
  Renderer,
};
