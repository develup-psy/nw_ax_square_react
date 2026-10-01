import { forwardRef } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Layers3 } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { BuilderProject, BuilderSection, ThemeSettings } from '../types/project';
import { FONT_STACKS } from '../data/presets';
import { sectionRegistry } from '../sections/registry';
import { hexToRgba } from '../lib/color';

function resolveSectionBackground(section: BuilderSection, theme: ThemeSettings) {
  const token = section.style?.backgroundToken;
  if (!token && section.style?.useCustomBackground && section.style.backgroundColor) return section.style.backgroundColor;
  switch (token) {
    case 'surface': return theme.surface;
    case 'primarySoft': return hexToRgba(theme.primary, 0.08);
    case 'secondary': return theme.secondary;
    case 'primary': return theme.primary;
    case 'custom': return section.style?.customBackgroundColor ?? section.style?.backgroundColor ?? theme.background;
    case 'background':
    default: return theme.background;
  }
}

function SortablePreviewSection({
  section,
  selected,
  selectedElement,
  onSelect,
  onSectionChange,
  zoom,
  exporting,
  theme,
}: {
  section: BuilderSection;
  selected: boolean;
  selectedElement: string | null;
  onSelect: (elementId: string) => void;
  onSectionChange: (section: BuilderSection) => void;
  zoom: number;
  exporting: boolean;
  theme: ThemeSettings;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const Renderer = sectionRegistry[section.type].Renderer;

  const correctedTransform = transform
    ? { ...transform, x: transform.x / zoom, y: transform.y / zoom }
    : null;

  const sectionVariables = {
    transform: CSS.Transform.toString(correctedTransform),
    transition,
    '--section-background': resolveSectionBackground(section, theme),
    ...(typeof section.style?.paddingTop === 'number' ? { '--section-padding-top': `${section.style.paddingTop}px` } : {}),
    ...(typeof section.style?.paddingBottom === 'number' ? { '--section-padding-bottom': `${section.style.paddingBottom}px` } : {}),
  } as CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={sectionVariables}
      className={`preview-section ${selected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect('background');
      }}
    >
      {!exporting ? (
        <button
          className="preview-drag-handle"
          type="button"
          aria-label="미리보기에서 드래그하여 섹션 이동"
          title="드래그하여 섹션 이동"
          onClick={(event) => event.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
          <span>이동</span>
        </button>
      ) : null}
      <Renderer
        section={section}
        onChange={onSectionChange}
        selectedElement={selected ? selectedElement : null}
        onElementSelect={onSelect}
        exporting={exporting}
      />
    </div>
  );
}

export const PreviewCanvas = forwardRef<HTMLDivElement, {
  project: BuilderProject;
  selectedId: string | null;
  selectedElement: string | null;
  onSelect: (id: string, elementId: string) => void;
  onSectionChange: (section: BuilderSection) => void;
  onReorder: (sections: BuilderSection[]) => void;
  zoom: number;
  exporting: boolean;
}>(function PreviewCanvas({ project, selectedId, selectedElement, onSelect, onSectionChange, onReorder, zoom, exporting }, ref) {
  const theme = project.theme;
  const variables = {
    '--theme-primary': theme.primary,
    '--theme-secondary': theme.secondary,
    '--theme-text': theme.text,
    '--theme-bg': theme.background,
    '--theme-surface': theme.surface,
    '--theme-muted': theme.muted,
    '--theme-primary-soft': hexToRgba(theme.primary, 0.1),
    '--theme-primary-soft-2': hexToRgba(theme.primary, 0.055),
    '--theme-secondary-soft': hexToRgba(theme.secondary, 0.1),
    '--font-family': FONT_STACKS[theme.fontFamily],
    '--font-scale': theme.fontSizeScale,
    '--line-height': theme.lineHeight,
    '--letter-spacing': `${theme.letterSpacing}em`,
    '--font-weight': theme.fontWeight,
    '--heading-weight': 700,
    '--accent-weight': 700,
    '--section-width': `${theme.sectionWidth}px`,
    '--card-radius': `${theme.cardRadius}px`,
    '--gap': `${theme.gap}px`,
    '--page-padding-top': `${theme.paddingTop}px`,
    '--page-padding-bottom': `${theme.paddingBottom}px`,
  } as CSSProperties;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = project.sections.findIndex((section) => section.id === active.id);
    const newIndex = project.sections.findIndex((section) => section.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(project.sections, oldIndex, newIndex));
  };

  return (
    <div className="canvas-stage" style={{ transform: exporting ? 'none' : `scale(${zoom})`, transformOrigin: 'top center' }}>
      <div className="canvas-shadow">
        <div ref={ref} className={`page-canvas ${exporting ? 'is-exporting' : ''}`} style={variables}>
          {project.sections.length ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={project.sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
                {project.sections.map((section) => (
                  <SortablePreviewSection
                    key={section.id}
                    section={section}
                    selected={section.id === selectedId}
                    selectedElement={selectedElement}
                    onSelect={(elementId) => onSelect(section.id, elementId)}
                    onSectionChange={onSectionChange}
                    zoom={zoom}
                    exporting={exporting}
                    theme={theme}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="empty-canvas">
              <div className="empty-canvas-icon"><Layers3 size={30} /></div>
              <span className="eyebrow">빈 캔버스</span>
              <h2>필요한 섹션을 조립해 게시물을 시작하세요</h2>
              <p>왼쪽 섹션 목록에서 오프닝, 가이드, 표, 이미지, FAQ, CTA 등을 추가하면 실시간으로 여기에 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
