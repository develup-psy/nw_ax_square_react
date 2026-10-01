import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, Palette, Settings2, SlidersHorizontal, Trash2, Type } from 'lucide-react';
import type { BuilderSection, SectionBackgroundToken, ThemeSettings } from '../types/project';
import { sectionRegistry } from '../sections/registry';
import { ThemeEditor } from './ThemeEditor';
import { ColorField, ElementPanel, ImageField, MarkdownField, PlainField, RangeField, Toggle, TypographyField } from './ui/Form';
import {
  DEFAULT_COMMON_TEXT_STYLES,
  DEFAULT_SECTION_FOOTER_STYLE,
  createSectionCommon,
  createSectionFooter,
  getSectionCommon,
  getSectionFooter,
} from '../sections/common';
import { resolveTextStyle } from '../lib/textStyle';
import { hexToRgba } from '../lib/color';
import { FontFamilyContext } from '../contexts/FontFamilyContext';

function BackgroundSelector({
  value,
  customColor,
  theme,
  onChange,
  onCustomColorChange,
}: {
  value: SectionBackgroundToken;
  customColor: string;
  theme: ThemeSettings;
  onChange: (value: SectionBackgroundToken) => void;
  onCustomColorChange: (value: string) => void;
}) {
  const options: Array<{ id: SectionBackgroundToken; label: string; color: string }> = [
    { id: 'background', label: '기본 배경', color: theme.background },
    { id: 'surface', label: '보조 배경', color: theme.surface },
    { id: 'primarySoft', label: '대표색 연하게', color: hexToRgba(theme.primary, 0.08) },
    { id: 'secondary', label: '보조 색상', color: theme.secondary },
    { id: 'primary', label: '대표 색상', color: theme.primary },
    { id: 'custom', label: '직접 지정', color: customColor },
  ];

  return (
    <div className="field-group">
      <div className="field-label-row">
        <label className="field-label">섹션 배경</label>
        <span className="field-hint">현재 색상을 바로 선택</span>
      </div>
      <div className="background-token-grid">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            className={`background-token-button ${value === option.id ? 'is-active' : ''}`}
            onClick={() => onChange(option.id)}
          >
            <span className="background-token-swatch" style={{ background: option.color }} />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      {value === 'custom' ? <ColorField label="직접 지정 배경색" value={customColor} onChange={onCustomColorChange} /> : null}
    </div>
  );
}

export function InspectorPanel({
  tab,
  onTabChange,
  section,
  theme,
  selectedElement,
  onElementSelect,
  onThemeChange,
  onSectionChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: {
  tab: 'section' | 'theme';
  onTabChange: (tab: 'section' | 'theme') => void;
  section: BuilderSection | null;
  theme: ThemeSettings;
  selectedElement: string | null;
  onElementSelect: (elementId: string) => void;
  onThemeChange: (theme: ThemeSettings) => void;
  onSectionChange: (section: BuilderSection) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const definition = section ? sectionRegistry[section.type] : null;
  const Editor = definition?.Editor;

  const updateSectionStyle = (patch: NonNullable<BuilderSection['style']>) => {
    if (!section) return;
    onSectionChange({ ...section, style: { ...section.style, ...patch } } as BuilderSection);
  };

  const updateCommon = (patch: Partial<ReturnType<typeof createSectionCommon>>) => {
    if (!section) return;
    const common = getSectionCommon(section);
    onSectionChange({ ...section, common: { ...common, ...patch } } as BuilderSection);
  };

  const updateCommonTextStyle = (key: 'category' | 'button', value: ReturnType<typeof resolveTextStyle>) => {
    if (!section) return;
    const common = getSectionCommon(section);
    updateCommon({ textStyles: { ...common.textStyles, [key]: value } });
  };

  const updateSectionFooter = (patch: Partial<ReturnType<typeof createSectionFooter>>) => {
    if (!section) return;
    const current = getSectionFooter(section);
    onSectionChange({ ...section, footer: { ...current, ...patch } } as BuilderSection);
  };

  const common = section ? getSectionCommon(section) : null;
  const footer = section ? getSectionFooter(section) : null;
  const backgroundToken = section?.style?.backgroundToken ?? 'background';
  const customBackgroundColor = section?.style?.customBackgroundColor ?? section?.style?.backgroundColor ?? theme.background;
  const inspectorScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab !== 'section' || !section || !selectedElement) return;
    let frame1 = 0;
    let frame2 = 0;
    frame1 = window.requestAnimationFrame(() => {
      frame2 = window.requestAnimationFrame(() => {
        const container = inspectorScrollRef.current;
        const target = container?.querySelector<HTMLElement>('.element-panel[data-active="true"]');
        target?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      });
    });
    return () => {
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
    };
  }, [tab, section?.id, selectedElement]);

  return (
    <FontFamilyContext.Provider value={theme.fontFamily}>
      <aside className="inspector-panel">
      <div className="inspector-tabs">
        <button type="button" className={tab === 'section' ? 'is-active' : ''} onClick={() => onTabChange('section')}>
          <SlidersHorizontal size={15} /> 섹션 편집
        </button>
        <button type="button" className={tab === 'theme' ? 'is-active' : ''} onClick={() => onTabChange('theme')}>
          <Settings2 size={15} /> 테마
        </button>
      </div>

      <div className="inspector-scroll" ref={inspectorScrollRef}>
        {tab === 'theme' ? (
          <ThemeEditor theme={theme} onChange={onThemeChange} />
        ) : section && Editor && common && footer ? (
          <>
            <div className="inspector-title-block">
              <span className="eyebrow">선택한 섹션</span>
              <h2>{definition?.label}</h2>
              <p>{definition?.description}</p>
            </div>
            <div className="section-action-row">
              <button type="button" onClick={onMoveUp}><ArrowUp size={14} /> 위로</button>
              <button type="button" onClick={onMoveDown}><ArrowDown size={14} /> 아래로</button>
              <button type="button" onClick={onDuplicate}><Copy size={14} /> 복제</button>
              <button type="button" className="danger" onClick={onDelete}><Trash2 size={14} /> 삭제</button>
            </div>
            <div className="markdown-help">Preview의 텍스트를 클릭하면 해당 편집 패널이 자동으로 열립니다. <code>#</code> <code>##</code> <code>###</code> 크기는 Markdown 단계에 따라 달라집니다.</div>

            <div className="inspector-group inspector-elements-group">
              <div className="inspector-group-heading">
                <span className="inspector-group-icon"><Type size={14} /></span>
                <div><strong>콘텐츠 요소</strong><small>Preview에서 요소를 누르면 해당 항목만 열리고 자동으로 이동합니다.</small></div>
              </div>

              <ElementPanel elementId="category" title="카테고리" active={selectedElement === 'category'} onSelect={onElementSelect}>
                <MarkdownField label="카테고리" value={common.category} onChange={(category) => updateCommon({ category })} rows={2} />
                <TypographyField
                  label="카테고리"
                  value={resolveTextStyle(common.textStyles, 'category', DEFAULT_COMMON_TEXT_STYLES.category)}
                  onChange={(value) => updateCommonTextStyle('category', value)}
                  minFontSize={7}
                  maxFontSize={32}
                  defaultColor={theme.primary}
                  allowStroke
                />
              </ElementPanel>

              <Editor section={section} onChange={onSectionChange} selectedElement={selectedElement} onElementSelect={onElementSelect} />

              <ElementPanel elementId="footer" title="하단 텍스트" active={selectedElement === 'footer'} onSelect={onElementSelect}>
                <MarkdownField
                  label="하단 텍스트"
                  value={footer.text}
                  onChange={(text) => updateSectionFooter({ text })}
                  rows={5}
                  placeholder="섹션 본문 아래에 추가 설명을 입력하세요."
                />
                <TypographyField
                  label="하단 텍스트"
                  value={{ ...DEFAULT_SECTION_FOOTER_STYLE, ...(footer.textStyle ?? {}) }}
                  onChange={(textStyle) => updateSectionFooter({ textStyle })}
                  minFontSize={8}
                  maxFontSize={40}
                  defaultColor={theme.text}
                />
              </ElementPanel>

              <ElementPanel elementId="button" title="버튼" active={selectedElement === 'button'} onSelect={onElementSelect}>
                <MarkdownField label="버튼 텍스트" value={common.buttonText} onChange={(buttonText) => updateCommon({ buttonText })} rows={2} />
                <TypographyField
                  label="버튼"
                  value={resolveTextStyle(common.textStyles, 'button', DEFAULT_COMMON_TEXT_STYLES.button)}
                  onChange={(value) => updateCommonTextStyle('button', value)}
                  minFontSize={8}
                  maxFontSize={32}
                  defaultColor="#FFFFFF"
                  allowStroke
                />
              </ElementPanel>
            </div>

            <div className="inspector-group inspector-section-style-group">
              <div className="inspector-group-heading">
                <span className="inspector-group-icon"><Palette size={14} /></span>
                <div><strong>섹션 스타일</strong><small>콘텐츠와 별개로 섹션 전체의 배경과 여백을 설정합니다.</small></div>
              </div>
              <ElementPanel elementId="background" title="배경 / 여백" tone="section" active={selectedElement === 'background'} onSelect={onElementSelect}>
                <BackgroundSelector
                  value={backgroundToken}
                  customColor={customBackgroundColor}
                  theme={theme}
                  onChange={(value) => updateSectionStyle({ backgroundToken: value })}
                  onCustomColorChange={(value) => updateSectionStyle({ backgroundToken: 'custom', customBackgroundColor: value })}
                />
                <RangeField label="위쪽 여백" value={section.style?.paddingTop ?? theme.paddingTop} min={0} max={220} step={2} unit="px" onChange={(value) => updateSectionStyle({ paddingTop: value })} />
                <RangeField label="아래쪽 여백" value={section.style?.paddingBottom ?? theme.paddingBottom} min={0} max={220} step={2} unit="px" onChange={(value) => updateSectionStyle({ paddingBottom: value })} />
                <ImageField label="배경 이미지" value={common.backgroundImage} onChange={(backgroundImage) => updateCommon({ backgroundImage })} />
              </ElementPanel>
            </div>

            <div className="inspector-group inspector-visibility-group">
              <div className="inspector-group-heading">
                <span className="inspector-group-icon"><Eye size={14} /></span>
                <div><strong>요소 표시</strong><small>섹션에 노출할 공통 요소를 선택합니다.</small></div>
              </div>
              <div className="visibility-toggle-group">
                <Toggle label="카테고리 표시" checked={common.showCategory} onChange={(showCategory) => updateCommon({ showCategory })} />
                <Toggle label="제목 표시" checked={common.showTitle} onChange={(showTitle) => updateCommon({ showTitle })} />
                <Toggle label="설명 표시" checked={common.showDescription} onChange={(showDescription) => updateCommon({ showDescription })} />
                <Toggle label="배경 이미지 표시" checked={common.showBackgroundImage} onChange={(showBackgroundImage) => updateCommon({ showBackgroundImage })} />
                <Toggle label="하단 텍스트 표시" checked={footer.show} onChange={(show) => updateSectionFooter({ show })} />
                <Toggle label="버튼 표시 · 항상 최하단" checked={common.showButton} onChange={(showButton) => updateCommon({ showButton })} />
              </div>
            </div>
          </>
        ) : (
          <div className="inspector-empty">
            <SlidersHorizontal size={26} />
            <strong>편집할 섹션을 선택하세요</strong>
            <span>왼쪽 구조 또는 미리보기에서 섹션을 선택할 수 있습니다.</span>
          </div>
        )}
      </div>
      </aside>
    </FontFamilyContext.Provider>
  );
}
