import { Table2 } from 'lucide-react';
import { createId } from '../lib/ids';
import { ElementPanel, MarkdownField, TypographyField } from '../components/ui/Form';
import { Markdown } from '../components/Markdown';
import { resolveTextStyle } from '../lib/textStyle';
import type { TableData, TextElementStyle } from '../types/project';
import type { SectionDefinition, SectionEditorProps, SectionRendererProps } from './types';
import { EditableElement, SectionFrame } from './shared';
import { createSectionCommon, createSectionFooter, createSectionStyle } from './common';

const DEFAULT_STYLES: Record<string, TextElementStyle> = {
  heading: { fontSize: 36, lineHeight: 1.18, marginBottom: 22 },
  description: { fontSize: 15, lineHeight: 1.6, marginBottom: 34 },
  table: { fontSize: 13, lineHeight: 1.55 },
};

function Editor({ section, onChange, selectedElement, onElementSelect }: SectionEditorProps) {
  if (section.type !== 'table') return null;
  const update = <K extends keyof TableData>(key: K, value: TableData[K]) =>
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

      <ElementPanel elementId="table" title="표" active={selectedElement === 'table'} onSelect={onElementSelect}>
        <MarkdownField
          label="표 Markdown"
          value={section.data.tableMarkdown}
          onChange={(value) => update('tableMarkdown', value)}
          rows={10}
        />
        <div className="table-markdown-tip">
          <strong>GFM Markdown 표</strong>
          <code>| 항목 | 내용 |</code>
          <code>| --- | --- |</code>
          <code>| 예시 | 설명 |</code>
        </div>
        <TypographyField label="표" value={resolveTextStyle(section.data.textStyles, 'table', DEFAULT_STYLES.table)} onChange={(value) => updateTextStyle('table', value)} minFontSize={8} maxFontSize={32} allowStroke />
      </ElementPanel>
    </>
  );
}

function Renderer({ section, onChange, selectedElement, onElementSelect, exporting }: SectionRendererProps) {
  if (section.type !== 'table') return null;
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
      className="table-section"
    >
      <EditableElement
        elementId="table"
        label="표"
        selectedElement={selectedElement}
        onElementSelect={onElementSelect}
        textStyle={resolveTextStyle(styles, 'table', DEFAULT_STYLES.table)}
        onTextStyleChange={(value) => updateTextStyle('table', value)}
        exporting={exporting}
        className="posting-table-wrap"
      >
        <Markdown value={section.data.tableMarkdown} className="md-table" />
      </EditableElement>
    </SectionFrame>
  );
}

export const tableDefinition: SectionDefinition = {
  type: 'table',
  label: '표',
  description: '비교 · 운영 기준 · 일정 · 정책을 표로 정리',
  icon: Table2,
  create: () => ({
    id: createId('table'),
    type: 'table',
    style: createSectionStyle({ backgroundToken: 'surface' }),
    common: createSectionCommon(),
    footer: createSectionFooter(),
    data: {
      heading: '## 운영 기준을 표로 정리하세요',
      description: '복잡한 정보를 행과 열로 정리하면 빠르게 비교할 수 있습니다.',
      tableMarkdown: '| 구분 | 운영 기준 | 담당 |\n| --- | --- | --- |\n| 신청 | 요청 내용 확인 후 접수 | 운영 담당 |\n| 처리 | 기준에 따라 진행 | 과제 담당 |\n| 완료 | 결과 공유 및 문서화 | 요청자 / 운영 담당 |',
      textStyles: { ...DEFAULT_STYLES },
    },
  }),
  Editor,
  Renderer,
};
