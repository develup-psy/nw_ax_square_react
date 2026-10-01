import { PanelsTopLeft, Plus } from 'lucide-react';
import { createId } from '../lib/ids';
import { MarkdownField, PlainField, RepeaterCard } from '../components/ui/Form';
import { Markdown } from '../components/Markdown';
import type { IntroCard, IntroData } from '../types/project';
import type { SectionDefinition, SectionEditorProps, SectionRendererProps } from './types';
import { IconBadge, SectionFooter, SectionHeading, SectionInner } from './shared';

function Editor({ section, onChange }: SectionEditorProps) {
  if (section.type !== 'intro') return null;
  const update = <K extends keyof IntroData>(key: K, value: IntroData[K]) =>
    onChange({ ...section, data: { ...section.data, [key]: value } });
  const updateCard = (id: string, patch: Partial<IntroCard>) =>
    update('cards', section.data.cards.map((card) => (card.id === id ? { ...card, ...patch } : card)));
  const addCard = () => update('cards', [...section.data.cards, { id: createId('intro-card'), icon: '✦', title: '새 카드', description: '카드 설명을 입력하세요.' }]);

  return (
    <>
      <MarkdownField label="섹션 제목" value={section.data.heading} onChange={(value) => update('heading', value)} rows={3} />
      <MarkdownField label="섹션 설명" value={section.data.description} onChange={(value) => update('description', value)} rows={4} />
      <div className="inspector-divider" />
      {section.data.cards.map((card, index) => (
        <RepeaterCard key={card.id} title={`카드 ${index + 1}`} onRemove={() => update('cards', section.data.cards.filter((item) => item.id !== card.id))}>
          <PlainField label="아이콘" value={card.icon} onChange={(value) => updateCard(card.id, { icon: value })} placeholder="예: AI, J, ✦" />
          <MarkdownField label="카드 제목" value={card.title} onChange={(value) => updateCard(card.id, { title: value })} rows={2} />
          <MarkdownField label="카드 설명" value={card.description} onChange={(value) => updateCard(card.id, { description: value })} rows={4} />
        </RepeaterCard>
      ))}
      <button className="secondary-button full" type="button" onClick={addCard}><Plus size={15} /> 카드 추가</button>
    </>
  );
}

function Renderer({ section }: SectionRendererProps) {
  if (section.type !== 'intro') return null;
  return (
    <div className="section-block intro-section">
      <SectionInner>
        <SectionHeading heading={section.data.heading} description={section.data.description} align="center" />
        <div className="intro-grid">
          {section.data.cards.map((card) => (
            <div className="content-card intro-card" key={card.id}>
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

export const introDefinition: SectionDefinition = {
  type: 'intro',
  label: '소개',
  description: 'Jira · Confluence · Copilot 같은 반복 카드 소개',
  library: false,
  icon: PanelsTopLeft,
  create: () => ({
    id: createId('intro'),
    type: 'intro',
    data: {
      heading: '## 한눈에 보는 주요 구성',
      description: '필요한 도구나 서비스를 카드 형태로 소개하세요.',
      cards: [
        { id: createId('intro-card'), icon: 'J', title: '**Jira**', description: '업무와 이슈를 체계적으로 관리합니다.' },
        { id: createId('intro-card'), icon: 'C', title: '**Confluence**', description: '지식과 운영 노하우를 한곳에 모읍니다.' },
        { id: createId('intro-card'), icon: 'AI', title: '**Copilot Agent**', description: '반복 업무를 AI와 함께 자동화합니다.' },
      ],
    },
  }),
  Editor,
  Renderer,
};
