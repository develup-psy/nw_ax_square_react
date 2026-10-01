import type { CSSProperties, ReactNode } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Markdown } from '../components/Markdown';
import { resolveTextStyle, textStyleVariables } from '../lib/textStyle';
import type {
  BuilderSection,
  SectionFooterSettings,
  TextElementStyle,
} from '../types/project';
import {
  DEFAULT_COMMON_TEXT_STYLES,
  DEFAULT_SECTION_FOOTER_STYLE,
  getSectionCommon,
} from './common';

export { DEFAULT_SECTION_FOOTER_STYLE } from './common';

export function SectionInner({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`section-inner ${className}`}>{children}</div>;
}

function PreviewTextToolbar({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TextElementStyle;
  onChange: (value: TextElementStyle) => void;
}) {
  const color = value.color ?? '#1F1B20';
  return (
    <div className="preview-text-toolbar" onClick={(event) => event.stopPropagation()}>
      <span className="preview-text-toolbar-label">{label}</span>
      <button type="button" title="글자 작게" onClick={() => onChange({ ...value, fontSize: Math.max(6, value.fontSize - 1) })}>
        <Minus size={12} />
      </button>
      <input
        className="preview-font-size-input"
        type="number"
        min={6}
        max={160}
        value={value.fontSize}
        onChange={(event) => onChange({ ...value, fontSize: Number(event.target.value) || value.fontSize })}
        aria-label={`${label} 글자 크기`}
      />
      <button type="button" title="글자 크게" onClick={() => onChange({ ...value, fontSize: Math.min(160, value.fontSize + 1) })}>
        <Plus size={12} />
      </button>
      <label className="preview-color-input" title="글자 색상">
        <input type="color" value={color} onChange={(event) => onChange({ ...value, color: event.target.value })} />
      </label>
      <button type="button" title="테마 글자색 상속" onClick={() => onChange({ ...value, color: undefined })}>
        <RotateCcw size={11} />
      </button>
    </div>
  );
}

/**
 * Preview의 선택 가능한 요소 래퍼입니다.
 * 실제 동적 typography 값만 CSS 변수로 inline 전달하고 나머지 스타일은 global CSS가 담당합니다.
 */
export function EditableElement({
  elementId,
  label,
  selectedElement,
  onElementSelect,
  textStyle,
  onTextStyleChange,
  exporting = false,
  className = '',
  children,
}: {
  elementId: string;
  label: string;
  selectedElement?: string | null;
  onElementSelect?: (elementId: string) => void;
  textStyle?: TextElementStyle;
  onTextStyleChange?: (value: TextElementStyle) => void;
  exporting?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const selected = selectedElement === elementId;
  return (
    <div
      className={`editable-element ${selected ? 'is-element-selected' : ''} ${className}`}
      style={textStyle ? textStyleVariables(textStyle) : undefined}
      data-element-id={elementId}
      onClick={(event) => {
        event.stopPropagation();
        onElementSelect?.(elementId);
      }}
    >
      {selected && textStyle && onTextStyleChange && !exporting ? (
        <PreviewTextToolbar label={label} value={textStyle} onChange={onTextStyleChange} />
      ) : null}
      {children}
    </div>
  );
}

export function SectionHeading({
  heading,
  description,
  align = 'left',
  headingStyle,
  descriptionStyle,
  selectedElement,
  onElementSelect,
  onHeadingStyleChange,
  onDescriptionStyleChange,
  exporting,
  headingClassName = 'md-section-heading',
  descriptionClassName = 'md-section-description',
}: {
  heading?: string;
  description?: string;
  align?: 'left' | 'center';
  headingStyle?: TextElementStyle;
  descriptionStyle?: TextElementStyle;
  selectedElement?: string | null;
  onElementSelect?: (elementId: string) => void;
  onHeadingStyleChange?: (value: TextElementStyle) => void;
  onDescriptionStyleChange?: (value: TextElementStyle) => void;
  exporting?: boolean;
  headingClassName?: string;
  descriptionClassName?: string;
}) {
  if (!heading && !description) return null;
  const resolvedHeadingStyle = headingStyle ?? { fontSize: 36, lineHeight: 1.18 };
  const resolvedDescriptionStyle = descriptionStyle ?? { fontSize: 15, lineHeight: 1.6 };
  return (
    <div className={`section-heading ${align === 'center' ? 'is-center' : ''}`}>
      {heading ? (
        <EditableElement
          elementId="title"
          label="제목"
          selectedElement={selectedElement}
          onElementSelect={onElementSelect}
          textStyle={resolvedHeadingStyle}
          onTextStyleChange={onHeadingStyleChange}
          exporting={exporting}
          className="editable-block"
        >
          <Markdown value={heading} className={headingClassName} />
        </EditableElement>
      ) : null}
      {description ? (
        <EditableElement
          elementId="description"
          label="설명"
          selectedElement={selectedElement}
          onElementSelect={onElementSelect}
          textStyle={resolvedDescriptionStyle}
          onTextStyleChange={onDescriptionStyleChange}
          exporting={exporting}
          className="editable-block"
        >
          <Markdown value={description} className={descriptionClassName} />
        </EditableElement>
      ) : null}
    </div>
  );
}

export function SectionFooter({
  footer,
  selectedElement,
  onElementSelect,
  onChange,
  exporting,
}: {
  footer?: SectionFooterSettings;
  selectedElement?: string | null;
  onElementSelect?: (elementId: string) => void;
  onChange?: (footer: SectionFooterSettings) => void;
  exporting?: boolean;
}) {
  if (!footer?.show || !footer.text) return null;
  const style = { ...DEFAULT_SECTION_FOOTER_STYLE, ...(footer.textStyle ?? {}) };
  return (
    <EditableElement
      elementId="footer"
      label="하단 텍스트"
      selectedElement={selectedElement}
      onElementSelect={onElementSelect}
      textStyle={style}
      onTextStyleChange={onChange ? (textStyle) => onChange({ ...footer, textStyle }) : undefined}
      exporting={exporting}
      className="section-footer-text"
    >
      <Markdown value={footer.text} />
    </EditableElement>
  );
}

export function CommonCategory({
  section,
  selectedElement,
  onElementSelect,
  onChange,
  exporting,
}: {
  section: BuilderSection;
  selectedElement?: string | null;
  onElementSelect?: (elementId: string) => void;
  onChange?: (section: BuilderSection) => void;
  exporting?: boolean;
}) {
  const common = getSectionCommon(section);
  if (!common.showCategory || !common.category) return null;
  const style = resolveTextStyle(common.textStyles, 'category', DEFAULT_COMMON_TEXT_STYLES.category);
  return (
    <EditableElement
      elementId="category"
      label="카테고리"
      selectedElement={selectedElement}
      onElementSelect={onElementSelect}
      textStyle={style}
      onTextStyleChange={onChange ? (textStyle) => onChange({ ...section, common: { ...common, textStyles: { ...common.textStyles, category: textStyle } } } as BuilderSection) : undefined}
      exporting={exporting}
      className="common-category-wrap"
    >
      <div className="section-category"><Markdown value={common.category} inline /></div>
    </EditableElement>
  );
}

export function CommonButton({
  section,
  selectedElement,
  onElementSelect,
  onChange,
  exporting,
}: {
  section: BuilderSection;
  selectedElement?: string | null;
  onElementSelect?: (elementId: string) => void;
  onChange?: (section: BuilderSection) => void;
  exporting?: boolean;
}) {
  const common = getSectionCommon(section);
  if (!common.showButton || !common.buttonText) return null;
  const style = resolveTextStyle(common.textStyles, 'button', DEFAULT_COMMON_TEXT_STYLES.button);
  return (
    <EditableElement
      elementId="button"
      label="버튼"
      selectedElement={selectedElement}
      onElementSelect={onElementSelect}
      textStyle={style}
      onTextStyleChange={onChange ? (textStyle) => onChange({ ...section, common: { ...common, textStyles: { ...common.textStyles, button: textStyle } } } as BuilderSection) : undefined}
      exporting={exporting}
      className="common-button-wrap"
    >
      <div className="section-button">
        <Markdown value={common.buttonText} inline />
        <span aria-hidden>→</span>
      </div>
    </EditableElement>
  );
}

function sectionBackgroundImageStyle(section: BuilderSection): CSSProperties | undefined {
  const common = getSectionCommon(section);
  if (!common.showBackgroundImage || !common.backgroundImage) return undefined;
  return { '--section-background-image': `url(${common.backgroundImage})` } as CSSProperties;
}

/**
 * Hero를 제외한 모든 신규 섹션의 공통 프레임.
 * 렌더 순서는 Category → Title → Description → Body → Footer → Button 으로 고정합니다.
 */
export function SectionFrame({
  section,
  heading,
  description,
  headingStyle,
  descriptionStyle,
  onHeadingStyleChange,
  onDescriptionStyleChange,
  selectedElement,
  onElementSelect,
  onChange,
  exporting,
  className = '',
  children,
}: {
  section: BuilderSection;
  heading: string;
  description?: string;
  headingStyle?: TextElementStyle;
  descriptionStyle?: TextElementStyle;
  onHeadingStyleChange?: (value: TextElementStyle) => void;
  onDescriptionStyleChange?: (value: TextElementStyle) => void;
  selectedElement?: string | null;
  onElementSelect?: (elementId: string) => void;
  onChange?: (section: BuilderSection) => void;
  exporting?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const common = getSectionCommon(section);
  const hasBackgroundImage = common.showBackgroundImage && Boolean(common.backgroundImage);
  return (
    <div
      className={`section-block section-frame ${className} ${hasBackgroundImage ? 'has-background-image' : ''}`}
      style={sectionBackgroundImageStyle(section)}
    >
      {hasBackgroundImage ? <div className="section-background-overlay" /> : null}
      <SectionInner className="section-frame-inner">
        <CommonCategory section={section} selectedElement={selectedElement} onElementSelect={onElementSelect} onChange={onChange} exporting={exporting} />
        <SectionHeading
          heading={common.showTitle ? heading : ''}
          description={common.showDescription ? description : ''}
          headingStyle={headingStyle}
          descriptionStyle={descriptionStyle}
          selectedElement={selectedElement}
          onElementSelect={onElementSelect}
          onHeadingStyleChange={onHeadingStyleChange}
          onDescriptionStyleChange={onDescriptionStyleChange}
          exporting={exporting}
        />
        {children ? <div className="section-frame-body">{children}</div> : null}
        <SectionFooter
          footer={section.footer}
          selectedElement={selectedElement}
          onElementSelect={onElementSelect}
          onChange={onChange ? (footer) => onChange({ ...section, footer } as BuilderSection) : undefined}
          exporting={exporting}
        />
        <CommonButton section={section} selectedElement={selectedElement} onElementSelect={onElementSelect} onChange={onChange} exporting={exporting} />
      </SectionInner>
    </div>
  );
}

export function IconBadge({ value }: { value: string }) {
  return <div className="section-icon-badge">{value || '✦'}</div>;
}
