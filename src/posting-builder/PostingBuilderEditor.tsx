import { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, Redo2, Undo2, ZoomIn } from 'lucide-react';
import { toPng } from 'html-to-image';
import { createId } from './lib/ids';
import { downloadDataUrl, downloadText, safeFileName } from './lib/download';
import { THEME_PRESETS } from './data/presets';
import { sectionRegistry, supportedSectionTypes } from './sections/registry';
import type { BuilderProject, BuilderSection, SectionCommonSettings, SectionStyleSettings, SectionType, ThemeSettings } from './types/project';
import { TopBar } from './components/TopBar';
import { SectionLibrary } from './components/SectionLibrary';
import { PageOutline } from './components/PageOutline';
import { InspectorPanel } from './components/InspectorPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { createSectionCommon, createSectionFooter, createSectionStyle } from './sections/common';
import { useHistoryState } from './lib/history';

function deepCloneSection(section: BuilderSection): BuilderSection {
  return JSON.parse(JSON.stringify(section)) as BuilderSection;
}

function migrateCommon(candidate: BuilderSection, fallback: BuilderSection): SectionCommonSettings {
  const base = { ...createSectionCommon(), ...(fallback.common ?? {}) };
  const imported: Partial<SectionCommonSettings> = candidate.common ?? {};
  const next: SectionCommonSettings = {
    ...base,
    ...imported,
    textStyles: { ...base.textStyles, ...(imported.textStyles ?? {}) },
  };

  // v5 이전 Hero의 공통 요소를 section.common으로 이동합니다.
  if (!candidate.common && candidate.type === 'hero') {
    const legacy = candidate.data as BuilderSection['data'] & {
      category?: string;
      buttonText?: string;
      backgroundImage?: string | null;
      showCategory?: boolean;
      showDescription?: boolean;
      showButton?: boolean;
      showBackgroundImage?: boolean;
    };
    if (typeof legacy.category === 'string') next.category = legacy.category;
    if (typeof legacy.buttonText === 'string') next.buttonText = legacy.buttonText;
    if (legacy.backgroundImage !== undefined) next.backgroundImage = legacy.backgroundImage;
    if (typeof legacy.showCategory === 'boolean') next.showCategory = legacy.showCategory;
    if (typeof legacy.showDescription === 'boolean') next.showDescription = legacy.showDescription;
    if (typeof legacy.showButton === 'boolean') next.showButton = legacy.showButton;
    if (typeof legacy.showBackgroundImage === 'boolean') next.showBackgroundImage = legacy.showBackgroundImage;
  }

  // 기존 CTA kicker/button을 공통 카테고리/버튼으로 이동합니다.
  if (!candidate.common && candidate.type === 'cta') {
    const legacy = candidate.data as BuilderSection['data'] & {
      kickerText?: string;
      showKicker?: boolean;
      buttonText?: string;
      showButton?: boolean;
    };
    if (typeof legacy.kickerText === 'string') next.category = legacy.kickerText;
    if (typeof legacy.showKicker === 'boolean') next.showCategory = legacy.showKicker;
    if (typeof legacy.buttonText === 'string') next.buttonText = legacy.buttonText;
    if (typeof legacy.showButton === 'boolean') next.showButton = legacy.showButton;
  }

  // 이미지 섹션의 기존 제목/설명 표시 토글도 공통 visibility로 이동합니다.
  if (!candidate.common && candidate.type === 'image') {
    const legacy = candidate.data as BuilderSection['data'] & { showHeading?: boolean; showDescription?: boolean };
    if (typeof legacy.showHeading === 'boolean') next.showTitle = legacy.showHeading;
    if (typeof legacy.showDescription === 'boolean') next.showDescription = legacy.showDescription;
  }

  return next;
}

function migrateStyle(candidate: BuilderSection, fallback: BuilderSection, index: number): SectionStyleSettings {
  const imported = candidate.style ?? {};
  const fallbackStyle = fallback.style ?? createSectionStyle();
  const tokenByIndex: SectionStyleSettings['backgroundToken'][] = ['background', 'primarySoft', 'surface'];
  let backgroundToken = imported.backgroundToken ?? fallbackStyle.backgroundToken ?? tokenByIndex[index % tokenByIndex.length];
  let customBackgroundColor = imported.customBackgroundColor ?? fallbackStyle.customBackgroundColor;

  if (!imported.backgroundToken && imported.useCustomBackground && imported.backgroundColor) {
    backgroundToken = 'custom';
    customBackgroundColor = imported.backgroundColor;
  }

  return { ...fallbackStyle, ...imported, backgroundToken, customBackgroundColor };
}

function migrateLegacyDefaultStrokes(section: BuilderSection): BuilderSection {
  const strokeKeysByType: Partial<Record<SectionType, string[]>> = {
    guide: ['card'],
    faq: ['itemBox'],
    beforeAfter: ['beforeBox', 'afterBox'],
    image: ['imageBox'],
  };
  const keys = strokeKeysByType[section.type] ?? [];
  if (!keys.length) return section;

  const data = section.data as BuilderSection['data'] & { textStyles?: Record<string, { borderWidth?: number; borderColor?: string }> };
  if (!data.textStyles) return section;
  let changed = false;
  const textStyles = { ...data.textStyles };
  for (const key of keys) {
    const style = textStyles[key];
    // v8/v9에서 자동으로 들어가던 1px + 기본색 fallback만 제거합니다.
    // 사용자가 Stroke 색을 직접 지정한 경우에는 그대로 보존합니다.
    if (style?.borderWidth === 1 && !style.borderColor) {
      textStyles[key] = { ...style, borderWidth: 0 };
      changed = true;
    }
  }
  if (!changed) return section;
  return { ...section, data: { ...section.data, textStyles } } as BuilderSection;
}

function normalizeImportedProject(raw: unknown): BuilderProject {
  if (!raw || typeof raw !== 'object') throw new Error('JSON 형식이 올바르지 않습니다.');
  const value = raw as Partial<BuilderProject>;
  if (!Array.isArray(value.sections)) throw new Error('sections 배열이 없습니다.');

  const sections: BuilderSection[] = [];
  value.sections.forEach((section, index) => {
    if (!section || typeof section !== 'object') return;
    const candidate = section as BuilderSection;
    if (typeof candidate.id !== 'string' || !supportedSectionTypes.has(candidate.type) || !candidate.data) return;
    const fallback = sectionRegistry[candidate.type].create();

    let footer = candidate.footer ? { ...createSectionFooter(), ...candidate.footer } : fallback.footer ?? createSectionFooter();
    if (!candidate.footer && candidate.type === 'image') {
      const legacyData = candidate.data as unknown as {
        bottomText?: string;
        showBottomText?: boolean;
        textStyles?: Record<string, { fontSize: number; lineHeight: number }>;
      };
      if (legacyData.bottomText) {
        footer = createSectionFooter({
          text: legacyData.bottomText,
          show: legacyData.showBottomText ?? false,
          textStyle: legacyData.textStyles?.bottomText ?? { fontSize: 14, lineHeight: 1.65 },
        });
      }
    }

    let data = { ...fallback.data, ...candidate.data } as BuilderSection['data'];
    if (candidate.type === 'hero') {
      const heroCandidate = candidate.data as { contentImageColumnPercent?: number; contentRatio?: string };
      if (typeof heroCandidate.contentImageColumnPercent !== 'number') {
        const mapped = heroCandidate.contentRatio === '60-40' ? 40 : heroCandidate.contentRatio === '50-50' ? 50 : 45;
        data = { ...data, contentImageColumnPercent: mapped } as BuilderSection['data'];
      }
    }

    const normalizedSection = {
      ...fallback,
      id: candidate.id,
      data,
      style: migrateStyle(candidate, fallback, index),
      common: migrateCommon(candidate, fallback),
      footer: { ...createSectionFooter(), ...footer, textStyle: { ...createSectionFooter().textStyle, ...(footer.textStyle ?? {}) } },
    } as BuilderSection;

    sections.push(migrateLegacyDefaultStrokes(normalizedSection));
  });

  const baseTheme = THEME_PRESETS.corporate;
  const rawTheme = (value.theme ?? {}) as Partial<ThemeSettings> & { padding?: number };
  const theme = { ...baseTheme, ...rawTheme } as ThemeSettings;
  if (typeof rawTheme.padding === 'number') {
    if (typeof rawTheme.paddingTop !== 'number') theme.paddingTop = rawTheme.padding;
    if (typeof rawTheme.paddingBottom !== 'number') theme.paddingBottom = rawTheme.padding;
  }
  if (!['corporate', 'guide', 'faq', 'modern'].includes(theme.presetId)) theme.presetId = 'corporate';
  if (theme.fontFamily === 'LG Smart Regular') theme.fontFamily = 'LG Smart';

  return {
    version: 1,
    id: typeof value.id === 'string' ? value.id : createId('page'),
    title: typeof value.title === 'string' ? value.title : '불러온 게시물',
    theme,
    sections,
  };
}

export type BuilderSaveState = 'saved' | 'saving' | 'error';

type PostingBuilderEditorProps = {
  initialProject: BuilderProject;
  onBack: () => void;
  onProjectChange: (project: BuilderProject) => void;
  saveState: BuilderSaveState;
};

export default function PostingBuilderEditor({
  initialProject,
  onBack,
  onProjectChange,
  saveState,
}: PostingBuilderEditorProps) {
  const history = useHistoryState<BuilderProject>(initialProject);
  const project = history.value;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>('title');
  const [inspectorTab, setInspectorTab] = useState<'section' | 'theme'>('section');
  const [zoom, setZoom] = useState(0.74);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const selectedSection = useMemo(
    () => project.sections.find((section) => section.id === selectedId) ?? null,
    [project.sections, selectedId],
  );

  useEffect(() => {
    onProjectChange(project);
  }, [project, onProjectChange]);

  useEffect(() => {
    if (!selectedId) return;
    if (project.sections.some((section) => section.id === selectedId)) return;
    const fallback = project.sections[0]?.id ?? null;
    setSelectedId(fallback);
    setSelectedElement(fallback ? 'title' : null);
  }, [project.sections, selectedId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const command = event.metaKey || event.ctrlKey;
      if (!command) return;
      const key = event.key.toLowerCase();
      if (key === 'z' && event.shiftKey) {
        event.preventDefault();
        history.redo();
      } else if (key === 'z') {
        event.preventDefault();
        history.undo();
      } else if (key === 'y') {
        event.preventDefault();
        history.redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history.undo, history.redo]);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  };

  const selectSection = (id: string, elementId = 'title') => {
    setSelectedId(id);
    setSelectedElement(elementId);
    setInspectorTab('section');
  };

  const updateSections = (sections: BuilderSection[]) => history.update((current) => ({ ...current, sections }), { coalesce: false });

  const addSection = (type: SectionType) => {
    const section = sectionRegistry[type].create();
    history.update((current) => ({ ...current, sections: [...current.sections, section] }), { coalesce: false });
    selectSection(section.id, 'title');
  };

  const updateSection = (next: BuilderSection) => {
    history.update((current) => ({
      ...current,
      sections: current.sections.map((section) => (section.id === next.id ? next : section)),
    }));
  };

  const deleteSection = (id: string) => {
    const index = project.sections.findIndex((section) => section.id === id);
    if (index === -1) return;
    const nextSections = project.sections.filter((section) => section.id !== id);
    history.update((current) => ({ ...current, sections: nextSections }), { coalesce: false });
    if (selectedId === id) {
      const fallback = nextSections[Math.min(index, nextSections.length - 1)]?.id ?? null;
      setSelectedId(fallback);
      setSelectedElement(fallback ? 'title' : null);
    }
  };

  const duplicateSection = (id: string) => {
    const index = project.sections.findIndex((section) => section.id === id);
    if (index === -1) return;
    const copy = deepCloneSection(project.sections[index]);
    copy.id = createId(copy.type);
    const nextSections = [...project.sections];
    nextSections.splice(index + 1, 0, copy);
    history.update((current) => ({ ...current, sections: nextSections }), { coalesce: false });
    selectSection(copy.id, 'title');
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    history.update((current) => {
      const index = current.sections.findIndex((section) => section.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.sections.length) return current;
      const nextSections = [...current.sections];
      [nextSections[index], nextSections[target]] = [nextSections[target], nextSections[index]];
      return { ...current, sections: nextSections };
    }, { coalesce: false });
  };

  const saveJson = () => {
    downloadText(`${safeFileName(project.title)}.json`, JSON.stringify(project, null, 2));
    flash('프로젝트를 저장했습니다.');
  };

  const loadJson = async (file: File) => {
    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const loaded = { ...normalizeImportedProject(raw), id: initialProject.id };
      history.reset(loaded);
      setSelectedId(loaded.sections[0]?.id ?? null);
      setSelectedElement(loaded.sections.length ? 'title' : null);
      setInspectorTab(loaded.sections.length ? 'section' : 'theme');
      flash('프로젝트를 불러왔습니다.');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '프로젝트를 불러오지 못했습니다.');
    }
  };

  const waitForPreviewImages = async () => {
    if (!previewRef.current) return;
    const images = Array.from(previewRef.current.querySelectorAll('img'));
    await Promise.all(images.map(async (image) => {
      try {
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
          });
        }
        if (typeof image.decode === 'function') await image.decode().catch(() => undefined);
      } catch {
        // 이미지 decode 실패는 캡처 자체를 중단시키지 않습니다.
      }
    }));
  };

  const exportPng = async () => {
    if (!previewRef.current) return;
    if (!project.sections.length) {
      window.alert('PNG로 저장할 섹션을 먼저 추가해주세요.');
      return;
    }

    try {
      setExporting(true);
      await document.fonts.ready;
      await waitForPreviewImages();
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const target = previewRef.current;
      const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: project.theme.background,
        width: target.scrollWidth,
        height: target.scrollHeight,
        style: { transform: 'none', transformOrigin: 'top left' },
      });
      downloadDataUrl(`${safeFileName(project.title)}.png`, dataUrl);
      flash('2x 해상도 PNG를 생성했습니다.');
    } catch (error) {
      console.error(error);
      window.alert('PNG 생성에 실패했습니다. 외부 이미지 URL 대신 직접 업로드한 이미지를 사용했는지 확인해주세요.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="app-shell">
      <TopBar
        title={project.title}
        onTitleChange={(title) => history.update((current) => ({ ...current, title }))}
        onSaveJson={saveJson}
        onLoadJson={loadJson}
        onExportPng={exportPng}
        exporting={exporting}
        onBack={onBack}
        saveState={saveState}
      />

      <div className="workspace">
        <aside className="left-sidebar">
          <div className="left-sidebar-scroll">
            <SectionLibrary onAdd={addSection} />
            <PageOutline
              sections={project.sections}
              selectedId={selectedId}
              onSelect={(id) => selectSection(id, 'title')}
              onReorder={updateSections}
              onDuplicate={duplicateSection}
              onDelete={deleteSection}
            />
          </div>
        </aside>

        <main className="preview-workspace">
          <div className="preview-toolbar">
            <div>
              <span className="eyebrow">실시간 미리보기</span>
              <strong>960px 게시물 캔버스</strong>
            </div>
            <div className="preview-toolbar-actions">
              <div className="history-control" title="Ctrl/Cmd + Z · Ctrl/Cmd + Shift + Z">
                <button type="button" disabled={!history.canUndo} onClick={history.undo} aria-label="실행 취소"><Undo2 size={14} /></button>
                <button type="button" disabled={!history.canRedo} onClick={history.redo} aria-label="다시 실행"><Redo2 size={14} /></button>
              </div>
              <div className="zoom-control">
                <ZoomIn size={14} />
                <button type="button" onClick={() => setZoom((value) => Math.max(0.45, Number((value - 0.05).toFixed(2))))}><Minus size={13} /></button>
                <span>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom((value) => Math.min(1.1, Number((value + 0.05).toFixed(2))))}><Plus size={13} /></button>
              </div>
            </div>
          </div>
          <div className="preview-scroll">
            <PreviewCanvas
              ref={previewRef}
              project={project}
              selectedId={selectedId}
              selectedElement={selectedElement}
              onSelect={selectSection}
              onSectionChange={updateSection}
              onReorder={updateSections}
              zoom={zoom}
              exporting={exporting}
            />
          </div>
        </main>

        <InspectorPanel
          tab={inspectorTab}
          onTabChange={setInspectorTab}
          section={selectedSection}
          theme={project.theme}
          selectedElement={selectedElement}
          onElementSelect={setSelectedElement}
          onThemeChange={(theme) => history.update((current) => ({ ...current, theme }))}
          onSectionChange={updateSection}
          onDelete={() => selectedId && deleteSection(selectedId)}
          onDuplicate={() => selectedId && duplicateSection(selectedId)}
          onMoveUp={() => selectedId && moveSection(selectedId, -1)}
          onMoveDown={() => selectedId && moveSection(selectedId, 1)}
        />
      </div>
      {notice ? <div className="toast">{notice}</div> : null}
    </div>
  );
}
