import type { CSSProperties } from 'react';
import { Grid2X2, Plus } from 'lucide-react';
import { createId } from '../lib/ids';
import { MarkdownField, PlainField, RepeaterCard, SelectField } from '../components/ui/Form';
import { Markdown } from '../components/Markdown';
import type { GridCard, GridData } from '../types/project';
import type { SectionDefinition, SectionEditorProps, SectionRendererProps } from './types';
import { IconBadge, SectionFooter, SectionHeading, SectionInner } from './shared';

function Editor({ section, onChange }: SectionEditorProps) {
  if (section.type !== 'grid') return null;
  const update = <K extends keyof GridData>(key: K, value: GridData[K]) =>
    onChange({ ...section, data: { ...section.data, [key]: value } });
  const updateCard = (id: string, patch: Partial<GridCard>) =>
    update('cards', section.data.cards.map((card) => (card.id === id ? { ...card, ...patch } : card)));

  return (
    <>
      <MarkdownField label="섹션 제목" value={section.data.heading} onChange={(value) => update('heading', value)} rows={3} />
      <MarkdownField label="섹션 설명" value={section.data.description} onChange={(value) => update('description', value)} rows={4} />
      <SelectField label="열 수" value={section.data.columns} onChange={(value) => update('columns', Number(value) as 2 | 3 | 4)}>
        <option value={2}>2열</option>
        <option value={3}>3열</option>
        <option value={4}>4열</option>
      </SelectField>
      <div className="inspector-divider" />
      {section.data.cards.map((card, index) => (
        <RepeaterCard key={card.id} title={`카드 ${index + 1}`} onRemove={() => update('cards', section.data.cards.filter((item) => item.id !== card.id))}>
          <PlainField label="아이콘" value={card.icon} onChange={(value) => updateCard(card.id, { icon: value })} placeholder="예: 01, ✦, AI" />
          <MarkdownField label="제목" value={card.title} onChange={(value) => updateCard(card.id, { title: value })} rows={2} />
          <MarkdownField label="설명" value={card.description} onChange={(value) => updateCard(card.id, { description: value })} rows={5} />
        </RepeaterCard>
      ))}
      <button
        className="secondary-button full"
        type="button"
        onClick={() => update('cards', [...section.data.cards, { id: createId('grid-card'), icon: String(section.data.cards.length + 1).padStart(2, '0'), title: '새 기능', description: '기능에 대한 설명을 입력하세요.' }])}
      >
        <Plus size={15} /> 카드 추가
      </button>
    </>
  );
}

function Renderer({ section }: SectionRendererProps) {
  if (section.type !== 'grid') return null;
  return (
    <div className="section-block grid-section">
      <SectionInner>
        <SectionHeading heading={section.data.heading} description={section.data.description} />
        <div className="feature-grid" style={{ '--grid-columns': section.data.columns } as CSSProperties}>
          {section.data.cards.map((card) => (
            <div className="content-card feature-card" key={card.id}>
              <IconBadge value={card.icon} />
              <Markdown value={card.title} className="md-card-title" />
              <Markdown value={card.description} className="md-card-description" />
            </div>
          ))}
        </div>
        <SectionFooter footer={section.footer} />
      </SectionInner>
    </div>
  );
}

export const gridDefinition: SectionDefinition = {
  type: 'grid',
  label: 'Grid',
  description: '기능 · 운영 현황 · 서비스 · 사례를 2~4열 카드로 구성',
  library: false,
  icon: Grid2X2,
  create: () => ({
    id: createId('grid'),
    type: 'grid',
    data: {
      heading: '## 운영에서 할 수 있는 일',
      description: '필요한 카드를 원하는 만큼 추가하고 열 수를 바꿀 수 있습니다.',
      columns: 3,
      cards: [
        { id: createId('grid-card'), icon: '01', title: '**신규 개설 / 운영 신청**', description: '필요한 운영 공간이나 서비스를 신청하고 관리합니다.' },
        { id: createId('grid-card'), icon: '02', title: '**과제 사례 등록 및 반영**', description: '현업 사례를 남기고 재사용 가능한 운영 자산으로 축적합니다.' },
        { id: createId('grid-card'), icon: '03', title: '**과제 인수인계 신청**', description: '담당자 변경 시 필요한 정보를 구조적으로 전달합니다.' },
      ],
    },
  }),
  Editor,
  Renderer,
};
