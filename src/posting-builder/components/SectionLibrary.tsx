import { Plus } from 'lucide-react';
import type { SectionType } from '../types/project';
import { librarySectionDefinitions } from '../sections/registry';

export function SectionLibrary({ onAdd }: { onAdd: (type: SectionType) => void }) {
  return (
    <section className="sidebar-section">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">POSTING SECTIONS</span>
          <h2>섹션 추가</h2>
        </div>
      </div>
      <div className="section-library-grid">
        {librarySectionDefinitions.map((definition) => {
          const Icon = definition.icon;
          return (
            <button key={definition.type} className="section-library-item" type="button" onClick={() => onAdd(definition.type)}>
              <span className="section-library-icon"><Icon size={16} /></span>
              <span className="section-library-copy">
                <strong>{definition.label}</strong>
                <small>{definition.description}</small>
              </span>
              <Plus className="section-library-plus" size={14} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
