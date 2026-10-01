import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { BuilderSection, SectionType } from '../types/project';

export interface SectionEditorProps {
  section: BuilderSection;
  onChange: (section: BuilderSection) => void;
  selectedElement?: string | null;
  onElementSelect?: (elementId: string) => void;
}

export interface SectionRendererProps {
  section: BuilderSection;
  onChange?: (section: BuilderSection) => void;
  selectedElement?: string | null;
  onElementSelect?: (elementId: string) => void;
  exporting?: boolean;
}

export interface SectionDefinition {
  type: SectionType;
  label: string;
  description: string;
  icon: LucideIcon;
  /** false면 과거 프로젝트 호환용으로 Registry에는 남지만 새 섹션 목록에는 노출하지 않습니다. */
  library?: boolean;
  create: () => BuilderSection;
  Editor: ComponentType<SectionEditorProps>;
  Renderer: ComponentType<SectionRendererProps>;
}
