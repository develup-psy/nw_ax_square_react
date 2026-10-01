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
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import type { BuilderSection } from '../types/project';
import { sectionRegistry } from '../sections/registry';

function SortableItem({
  section,
  index,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  section: BuilderSection;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const definition = sectionRegistry[section.type];
  const Icon = definition.icon;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`outline-item ${selected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''}`}
      onClick={onSelect}
    >
      <button className="drag-handle" type="button" {...attributes} {...listeners} aria-label="드래그하여 이동">
        <GripVertical size={15} />
      </button>
      <span className="outline-index">{String(index + 1).padStart(2, '0')}</span>
      <span className="outline-type-icon"><Icon size={14} /></span>
      <span className="outline-label">{definition.label}</span>
      <div className="outline-actions">
        <button type="button" title="복제" onClick={(event) => { event.stopPropagation(); onDuplicate(); }}><Copy size={13} /></button>
        <button type="button" title="삭제" onClick={(event) => { event.stopPropagation(); onDelete(); }}><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

export function PageOutline({
  sections,
  selectedId,
  onSelect,
  onReorder,
  onDuplicate,
  onDelete,
}: {
  sections: BuilderSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (sections: BuilderSection[]) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(sections, oldIndex, newIndex));
  };

  return (
    <section className="sidebar-section outline-section">
      <div className="panel-heading compact">
        <div>
          <span className="eyebrow">PAGE OUTLINE</span>
          <h2>게시물 구조</h2>
        </div>
        <span className="count-badge">{sections.length}</span>
      </div>
      {sections.length ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
            <div className="outline-list">
              {sections.map((section, index) => (
                <SortableItem
                  key={section.id}
                  section={section}
                  index={index}
                  selected={section.id === selectedId}
                  onSelect={() => onSelect(section.id)}
                  onDuplicate={() => onDuplicate(section.id)}
                  onDelete={() => onDelete(section.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="outline-empty">위에서 섹션을 추가하면<br />여기에 순서가 표시됩니다.</div>
      )}
    </section>
  );
}
