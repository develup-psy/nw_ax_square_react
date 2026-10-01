import { CircleHelp, Plus } from 'lucide-react';
import { createId } from '../lib/ids';
import { ElementBoxField, ElementPanel, MarkdownField, RepeaterCard, TypographyField } from '../components/ui/Form';
import { Markdown } from '../components/Markdown';
import { resolveTextStyle, textStyleVariables } from '../lib/textStyle';
import type { FaqData, FaqItem, TextElementStyle } from '../types/project';
import type { SectionDefinition, SectionEditorProps, SectionRendererProps } from './types';
import { EditableElement, SectionFrame } from './shared';
import { createSectionCommon, createSectionFooter, createSectionStyle } from './common';

const DEFAULT_STYLES: Record<string, TextElementStyle> = {
  heading: { fontSize: 36, lineHeight: 1.18, marginBottom: 22 },
  description: { fontSize: 15, lineHeight: 1.6, marginBottom: 34 },
  question: { fontSize: 17, lineHeight: 1.28, marginBottom: 10 },
  answer: { fontSize: 12.5, lineHeight: 1.6},
  body: { fontSize: 16, lineHeight: 1.6 },
  itemBox: { fontSize: 16, lineHeight: 1.6, borderWidth: 0, borderRadius: 16 },
};

function Editor({ section, onChange, selectedElement, onElementSelect }: SectionEditorProps) {
  if (section.type !== 'faq') return null;
  const update = <K extends keyof FaqData>(key: K, value: FaqData[K]) =>
    onChange({ ...section, data: { ...section.data, [key]: value } });
  const updateItem = (id: string, patch: Partial<FaqItem>) =>
    update('items', section.data.items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
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


      <ElementPanel elementId="body" title="FAQ 영역" active={selectedElement === 'body'} onSelect={onElementSelect}>
        <ElementBoxField label="FAQ 목록" value={resolveTextStyle(section.data.textStyles, 'body', DEFAULT_STYLES.body)} onChange={(value) => updateTextStyle('body', value)} />
        <ElementBoxField label="FAQ 카드" value={resolveTextStyle(section.data.textStyles, 'itemBox', DEFAULT_STYLES.itemBox)} onChange={(value) => updateTextStyle('itemBox', value)} />
      </ElementPanel>

      <ElementPanel elementId="question" title="질문 / 답변 스타일" active={selectedElement === 'question' || selectedElement === 'answer'} onSelect={onElementSelect}>
        <TypographyField label="질문" value={resolveTextStyle(section.data.textStyles, 'question', DEFAULT_STYLES.question)} onChange={(value) => updateTextStyle('question', value)} minFontSize={9} maxFontSize={48} />
        <TypographyField label="답변" value={resolveTextStyle(section.data.textStyles, 'answer', DEFAULT_STYLES.answer)} onChange={(value) => updateTextStyle('answer', value)} minFontSize={8} maxFontSize={36} />
      </ElementPanel>

      <ElementPanel elementId="items" title="FAQ 항목" active={selectedElement === 'items'} onSelect={onElementSelect}>
        {section.data.items.map((item, index) => (
          <RepeaterCard key={item.id} title={`FAQ ${index + 1}`} onRemove={() => update('items', section.data.items.filter((value) => value.id !== item.id))}>
            <MarkdownField label="Q" value={item.question} onChange={(value) => updateItem(item.id, { question: value })} rows={3} />
            <MarkdownField label="A" value={item.answer} onChange={(value) => updateItem(item.id, { answer: value })} rows={5} />
          </RepeaterCard>
        ))}
        <button
          className="secondary-button full"
          type="button"
          onClick={() => update('items', [...section.data.items, { id: createId('faq-item'), question: '새 질문을 입력하세요.', answer: '답변을 입력하세요.' }])}
        >
          <Plus size={15} /> FAQ 추가
        </button>
      </ElementPanel>
    </>
  );
}

function Renderer({ section, onChange, selectedElement, onElementSelect, exporting }: SectionRendererProps) {
  if (section.type !== 'faq') return null;
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
      className="faq-section"
    >
      <EditableElement elementId="body" label="FAQ 영역" selectedElement={selectedElement} onElementSelect={onElementSelect} textStyle={resolveTextStyle(styles, 'body', DEFAULT_STYLES.body)} onTextStyleChange={(value) => updateTextStyle('body', value)} exporting={exporting} className="editable-body-element">
        <div className="faq-list">
        {section.data.items.map((item, index) => (
          <div className="faq-item element-box-target" key={item.id} style={textStyleVariables(resolveTextStyle(styles, 'itemBox', DEFAULT_STYLES.itemBox))}>
            <div className="faq-index">Q{String(index + 1).padStart(2, '0')}</div>
            <div className="faq-copy">
              <EditableElement
                elementId="question"
                label="질문"
                selectedElement={selectedElement}
                onElementSelect={onElementSelect}
                textStyle={resolveTextStyle(styles, 'question', DEFAULT_STYLES.question)}
                onTextStyleChange={(value) => updateTextStyle('question', value)}
                exporting={exporting}
              >
                <Markdown value={item.question} className="md-faq-question" />
              </EditableElement>
              <EditableElement
                elementId="answer"
                label="답변"
                selectedElement={selectedElement}
                onElementSelect={onElementSelect}
                textStyle={resolveTextStyle(styles, 'answer', DEFAULT_STYLES.answer)}
                onTextStyleChange={(value) => updateTextStyle('answer', value)}
                exporting={exporting}
              >
                <Markdown value={item.answer} className="md-card-description" />
              </EditableElement>
            </div>
          </div>
        ))}
        </div>
      </EditableElement>
    </SectionFrame>
  );
}

export const faqDefinition: SectionDefinition = {
  type: 'faq',
  label: 'FAQ',
  description: '질문과 답변을 반복해서 구성하는 지식형 섹션',
  icon: CircleHelp,
  create: () => ({
    id: createId('faq'),
    type: 'faq',
    style: createSectionStyle({ backgroundToken: 'background' }),
    common: createSectionCommon(),
    footer: createSectionFooter(),
    data: {
      heading: '## 자주 묻는 질문',
      description: '사용자가 자주 궁금해하는 내용을 질문과 답변 구조로 정리하세요.',
      items: [
        { id: createId('faq-item'), question: '**어떤 내용을 넣을 수 있나요?**', answer: '운영 가이드, 신청 방법, 정책, 사용법 등 반복적으로 안내하는 내용을 넣을 수 있습니다.' },
        { id: createId('faq-item'), question: '**FAQ는 몇 개까지 만들 수 있나요?**', answer: '필요한 만큼 항목을 추가하거나 삭제할 수 있습니다.' },
      ],
      textStyles: { ...DEFAULT_STYLES },
    },
  }),
  Editor,
  Renderer,
};
