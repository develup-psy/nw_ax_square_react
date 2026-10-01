import { ArrowLeft, Check, Download, FileDown, FileUp, ImageDown, Layers3, Loader2, TriangleAlert } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { BuilderSaveState } from '../PostingBuilderEditor';

import postingBuilderIcon
  from '../../assets/images/nw_ax_icon.svg';

export function TopBar({
  title,
  onTitleChange,
  onSaveJson,
  onLoadJson,
  onExportPng,
  exporting,
  onBack,
  saveState,
}: {
  title: string;
  onTitleChange: (title: string) => void;
  onSaveJson: () => void;
  onLoadJson: (file: File) => void;
  onExportPng: () => void;
  exporting: boolean;
  onBack: () => void;
  saveState: BuilderSaveState;
}) {
  const handleLoad = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onLoadJson(file);
    event.target.value = '';
  };

  return (
    <header className="topbar">
      <button className="studio-editor-back" type="button" onClick={onBack} aria-label="내 게시물로 돌아가기">
        <ArrowLeft size={16} />
      </button>

      <div className="brand-block">
        <img
      src={postingBuilderIcon}
      alt=""
      className="brand-mark"
    />
        <div>
          <strong>NW AX Square Studio</strong>
          <span>POSTING BUILDER</span>
        </div>
      </div>

      <div className="project-title-control">
        <span>프로젝트</span>
        <input value={title} onChange={(event) => onTitleChange(event.target.value)} aria-label="프로젝트 제목" />
      </div>

      <div className={`studio-save-state studio-save-state--${saveState}`}>
        {saveState === 'saving' ? <Loader2 size={13} className="spin-subtle" /> : null}
        {saveState === 'saved' ? <Check size={13} /> : null}
        {saveState === 'error' ? <TriangleAlert size={13} /> : null}
        <span>{saveState === 'saving' ? '저장 중' : saveState === 'error' ? '저장 실패' : '저장됨'}</span>
      </div>

      <div className="topbar-actions">
        <button type="button" className="ghost-button" onClick={onSaveJson}><FileDown size={15} /> JSON 백업</button>
        <label className="ghost-button file-button"><FileUp size={15} /> JSON 불러오기<input type="file" accept="application/json,.json" onChange={handleLoad} /></label>
        <button type="button" className="primary-button" onClick={onExportPng} disabled={exporting}>
          {exporting ? <Download size={15} className="spin-subtle" /> : <ImageDown size={15} />}
          {exporting ? '이미지 생성 중…' : '이미지 다운로드'}
        </button>
      </div>
    </header>
  );
}
