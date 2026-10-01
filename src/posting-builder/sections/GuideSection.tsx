import type { CSSProperties } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import { createId } from '../lib/ids';
import { ElementBoxField, ElementPanel, MarkdownField, PlainField, RepeaterCard, SelectField, Toggle, TypographyField } from '../components/ui/Form';
import { Markdown } from '../components/Markdown';
import { resolveTextStyle, textStyleVariables } from '../lib/textStyle';
import type { GuideData, GuideStep, TextElementStyle } from '../types/project';
import type { SectionDefinition, SectionEditorProps, SectionRendererProps } from './types';
import { EditableElement, IconBadge, SectionFrame } from './shared';
import { createSectionCommon, createSectionFooter, createSectionStyle } from './common';

const DEFAULT_STYLES: Record<string, TextElementStyle> = {
  heading: { fontSize: 36, lineHeight: 1.18, marginBottom: 22 },
  description: { fontSize: 15, lineHeight: 1.6, marginBottom: 34 },
  itemLabel: { fontSize: 10, lineHeight: 1.2, marginBottom: 16 },
  itemTitle: { fontSize: 18, lineHeight: 1.28, marginBottom: 14 },
  itemDescription: { fontSize: 12.5, lineHeight: 1.6},
  body: { fontSize: 16, lineHeight: 1.6, borderRadius: 0 },
  card: { fontSize: 16, lineHeight: 1.6, borderWidth: 0, borderRadius: 16 },
};

function Editor({ section, onChange, selectedElement, onElementSelect }: SectionEditorProps) {
  if (section.type !== 'guide') return null;
  const update = <K extends keyof GuideData>(key: K, value: GuideData[K]) =>
    onChange({ ...section, data: { ...section.data, [key]: value } });
  const updateStep = (id: string, patch: Partial<GuideStep>) =>
    update('steps', section.data.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)));
  const updateTextStyle = (key: string, value: TextElementStyle) =>
    update('textStyles', { ...section.data.textStyles, [key]: value });

  const columns = section.data.columns ?? 3;
  const showIndex = section.data.showIndex ?? true;
  const itemLabel = section.data.itemLabel ?? 'STEP';

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

      <ElementPanel elementId="body" title="가이드 레이아웃" active={selectedElement === 'body' || selectedElement === 'itemLabel'} onSelect={onElementSelect}>
        <SelectField label="배치 방식" value={section.data.orientation} onChange={(value) => update('orientation', value as 'horizontal' | 'vertical')}>
          <option value="horizontal">가로형</option>
          <option value="vertical">세로형</option>
        </SelectField>
        {section.data.orientation === 'horizontal' ? (
          <SelectField label="가로형 열 수" value={columns} onChange={(value) => update('columns', Number(value) as 2 | 3 | 4)}>
            <option value={2}>2열</option>
            <option value={3}>3열</option>
            <option value={4}>4열</option>
          </SelectField>
        ) : null}
        <Toggle label="순번 표시" checked={showIndex} onChange={(value) => update('showIndex', value)} />
        {showIndex ? <PlainField label="순번 라벨" value={itemLabel} onChange={(value) => update('itemLabel', value)} placeholder="예: STEP, ITEM, CASE" /> : null}
        {showIndex ? <TypographyField label="순번" value={resolveTextStyle(section.data.textStyles, 'itemLabel', DEFAULT_STYLES.itemLabel)} onChange={(value) => updateTextStyle('itemLabel', value)} minFontSize={8} maxFontSize={24} /> : null}
        <ElementBoxField label="가이드 영역" value={resolveTextStyle(section.data.textStyles, 'body', DEFAULT_STYLES.body)} onChange={(value) => updateTextStyle('body', value)} />
        <ElementBoxField label="가이드 카드" value={resolveTextStyle(section.data.textStyles, 'card', DEFAULT_STYLES.card)} onChange={(value) => updateTextStyle('card', value)} />
      </ElementPanel>

      <ElementPanel elementId="itemTitle" title="카드 텍스트" active={selectedElement === 'itemTitle' || selectedElement === 'itemDescription'} onSelect={onElementSelect}>
        <TypographyField label="카드 제목" value={resolveTextStyle(section.data.textStyles, 'itemTitle', DEFAULT_STYLES.itemTitle)} onChange={(value) => updateTextStyle('itemTitle', value)} minFontSize={9} maxFontSize={48} />
        <TypographyField label="카드 설명" value={resolveTextStyle(section.data.textStyles, 'itemDescription', DEFAULT_STYLES.itemDescription)} onChange={(value) => updateTextStyle('itemDescription', value)} minFontSize={8} maxFontSize={36} />
      </ElementPanel>

      <ElementPanel elementId="items" title="가이드 항목" active={selectedElement === 'items'} onSelect={onElementSelect}>
        {section.data.steps.map((step, index) => (
          <RepeaterCard key={step.id} title={`항목 ${index + 1}`} onRemove={() => update('steps', section.data.steps.filter((item) => item.id !== step.id))}>
            <PlainField label="아이콘" value={step.icon ?? ''} onChange={(value) => updateStep(step.id, { icon: value })} placeholder="예: AI, J, 01, ✦" />
            <MarkdownField label="제목" value={step.title} onChange={(value) => updateStep(step.id, { title: value })} rows={2} />
            <MarkdownField label="설명" value={step.description} onChange={(value) => updateStep(step.id, { description: value })} rows={5} />
          </RepeaterCard>
        ))}
        <button
          className="secondary-button full"
          type="button"
          onClick={() => update('steps', [...section.data.steps, { id: createId('guide-item'), icon: '', title: '새 항목', description: '내용을 입력하세요.' }])}
        >
          <Plus size={15} /> 항목 추가
        </button>
      </ElementPanel>
    </>
  );
}

function Renderer({ section, onChange, selectedElement, onElementSelect, exporting }: SectionRendererProps) {
  if (section.type !== 'guide') return null;
  const columns = section.data.columns ?? 3;
  const showIndex = section.data.showIndex ?? true;
  const itemLabel = section.data.itemLabel ?? 'STEP';
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
      className="guide-section"
    >
      <EditableElement elementId="body" label="가이드" selectedElement={selectedElement} onElementSelect={onElementSelect} textStyle={resolveTextStyle(styles, 'body', DEFAULT_STYLES.body)} onTextStyleChange={(value) => updateTextStyle('body', value)} exporting={exporting} className="editable-body-element">
        <div
          className={`guide-list is-${section.data.orientation}`}
          style={section.data.orientation === 'horizontal' ? ({ '--guide-columns': columns } as CSSProperties) : undefined}
        >
          {section.data.steps.map((step, index) => (
            <div className="guide-step element-box-target" key={step.id} style={textStyleVariables(resolveTextStyle(styles, 'card', DEFAULT_STYLES.card))}>
              <div className="guide-step-meta">
                {step.icon ? <IconBadge value={step.icon} /> : null}
                {showIndex ? (
                  <EditableElement
                    elementId="itemLabel"
                    label="순번"
                    selectedElement={selectedElement}
                    onElementSelect={onElementSelect}
                    textStyle={resolveTextStyle(styles, 'itemLabel', DEFAULT_STYLES.itemLabel)}
                    onTextStyleChange={(value) => updateTextStyle('itemLabel', value)}
                    exporting={exporting}
                  >
                    <div className="step-number">{itemLabel} {String(index + 1).padStart(2, '0')}</div>
                  </EditableElement>
                ) : null}
              </div>
              <EditableElement
                elementId="itemTitle"
                label="카드 제목"
                selectedElement={selectedElement}
                onElementSelect={onElementSelect}
                textStyle={resolveTextStyle(styles, 'itemTitle', DEFAULT_STYLES.itemTitle)}
                onTextStyleChange={(value) => updateTextStyle('itemTitle', value)}
                exporting={exporting}
              >
                <Markdown value={step.title} className="md-card-title" />
              </EditableElement>
              <EditableElement
                elementId="itemDescription"
                label="카드 설명"
                selectedElement={selectedElement}
                onElementSelect={onElementSelect}
                textStyle={resolveTextStyle(styles, 'itemDescription', DEFAULT_STYLES.itemDescription)}
                onTextStyleChange={(value) => updateTextStyle('itemDescription', value)}
                exporting={exporting}
              >
                <Markdown value={step.description} className="md-card-description" />
              </EditableElement>
            </div>
          ))}
        </div>
      </EditableElement>
    </SectionFrame>
  );
}

export const guideDefinition: SectionDefinition = {
  type: 'guide',
  label: '가이드',
  description: '소개 · 기능 · 절차 · 사례를 하나의 카드형 섹션으로 구성',
  icon: ListChecks,
  create: () => ({
    id: createId('guide'),
    type: 'guide',
    style: createSectionStyle({ backgroundToken: 'primarySoft' }),
    common: createSectionCommon(),
    footer: createSectionFooter(),
    data: {
      heading: '## 내용을 한눈에 정리하세요',
      description: '가로형/세로형을 바꾸고, 열 수와 카드 수를 자유롭게 조절할 수 있습니다.',
      orientation: 'horizontal',
      columns: 3,
      showIndex: true,
      itemLabel: 'STEP',
      steps: [
        { id: createId('guide-item'), icon: '01', title: '**첫 번째 항목**', description: '서비스 소개, 기능 설명, 절차 등 원하는 내용을 입력하세요.' },
        { id: createId('guide-item'), icon: '02', title: '**두 번째 항목**', description: '필요한 카드를 원하는 만큼 추가할 수 있습니다.' },
        { id: createId('guide-item'), icon: '03', title: '**세 번째 항목**', description: '가로형은 2~4열, 세로형은 한 줄 구조로 표현됩니다.' },
      ],
      textStyles: { ...DEFAULT_STYLES },
    },
  }),
  Editor,
  Renderer,
};
