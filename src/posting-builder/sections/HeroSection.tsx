import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { createId } from '../lib/ids';
import { ElementBoxField, ElementPanel, ImageField, MarkdownField, RangeField, SelectField, Toggle, TypographyField } from '../components/ui/Form';
import { resolveTextStyle } from '../lib/textStyle';
import type { HeroContentRatio, HeroData, HeroLayout, TextElementStyle } from '../types/project';
import type { SectionDefinition, SectionEditorProps, SectionRendererProps } from './types';
import {
  CommonButton,
  CommonCategory,
  EditableElement,
  SectionFooter,
  SectionHeading,
  SectionInner,
} from './shared';
import { createSectionCommon, createSectionFooter, createSectionStyle, getSectionCommon } from './common';

const DEFAULT_STYLES: Record<string, TextElementStyle> = {
  title: { fontSize: 58, lineHeight: 1.06, marginBottom: 22 },
  description: { fontSize: 16, lineHeight: 1.6, marginBottom: 0 },
  contentImageBox: { fontSize: 16, lineHeight: 1.6, borderWidth: 0, borderRadius: 20, paddingX: 0, paddingY: 0 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function legacyColumnFromRatio(ratio: HeroContentRatio) {
  if (ratio === '60-40') return 40;
  if (ratio === '55-45') return 45;
  return 50;
}

function getContentImageColumnPercent(data: HeroData) {
  return clamp(data.contentImageColumnPercent ?? legacyColumnFromRatio(data.contentRatio), 25, 70);
}

function Editor({ section, onChange, selectedElement, onElementSelect }: SectionEditorProps) {
  if (section.type !== 'hero') return null;
  const update = <K extends keyof HeroData>(key: K, value: HeroData[K]) =>
    onChange({ ...section, data: { ...section.data, [key]: value } });
  const updateTextStyle = (key: string, value: TextElementStyle) =>
    update('textStyles', { ...section.data.textStyles, [key]: value });

  const imageColumnPercent = getContentImageColumnPercent(section.data);

  return (
    <>
      <ElementPanel elementId="title" title="제목" active={selectedElement === 'title'} defaultOpen onSelect={onElementSelect}>
        <MarkdownField label="제목" value={section.data.title} onChange={(value) => update('title', value)} rows={4} />
        <TypographyField
          label="제목"
          value={resolveTextStyle(section.data.textStyles, 'title', DEFAULT_STYLES.title)}
          onChange={(value) => updateTextStyle('title', value)}
          minFontSize={20}
          maxFontSize={96}
        />
      </ElementPanel>

      <ElementPanel elementId="description" title="설명" active={selectedElement === 'description'} onSelect={onElementSelect}>
        <MarkdownField label="설명" value={section.data.description} onChange={(value) => update('description', value)} rows={5} />
        <TypographyField
          label="설명"
          value={resolveTextStyle(section.data.textStyles, 'description', DEFAULT_STYLES.description)}
          onChange={(value) => updateTextStyle('description', value)}
          minFontSize={9}
          maxFontSize={40}
        />
      </ElementPanel>

      <ElementPanel elementId="contentImage" title="콘텐츠 이미지" active={selectedElement === 'contentImage'} onSelect={onElementSelect}>
        <SelectField label="오프닝 배치" value={section.data.layout} onChange={(value) => update('layout', value as HeroLayout)}>
          <option value="text-only">텍스트만</option>
          <option value="text-left-image-right">왼쪽 텍스트 · 오른쪽 이미지</option>
          <option value="image-left-text-right">왼쪽 이미지 · 오른쪽 텍스트</option>
        </SelectField>
        {section.data.layout !== 'text-only' ? (
          <>
            <Toggle label="콘텐츠 이미지 표시" checked={section.data.showContentImage} onChange={(value) => update('showContentImage', value)} />
            <ImageField label="콘텐츠 이미지" value={section.data.contentImage} onChange={(value) => update('contentImage', value)} />
            <RangeField
              label="이미지 영역 너비"
              value={imageColumnPercent}
              min={25}
              max={70}
              step={1}
              unit="%"
              onChange={(value) => update('contentImageColumnPercent', value)}
            />
            <div className="field-note">Preview에서 텍스트/이미지 경계선을 좌우로 드래그해도 같은 값이 변경됩니다. 이미지 자체는 배정된 영역을 100% 사용합니다.</div>
            <SelectField label="이미지 맞춤" value={section.data.imageFit} onChange={(value) => update('imageFit', value as 'cover' | 'contain')}>
              <option value="cover">영역 채우기</option>
              <option value="contain">이미지 전체 보기</option>
            </SelectField>
            <ElementBoxField
              label="콘텐츠 이미지"
              value={resolveTextStyle(section.data.textStyles, 'contentImageBox', DEFAULT_STYLES.contentImageBox)}
              onChange={(value) => updateTextStyle('contentImageBox', value)}
            />
            <div className="image-decoration-settings">
              <Toggle label="Drop shadow 사용" checked={section.data.contentImageShadow ?? false} onChange={(value) => update('contentImageShadow', value)} />
            </div>
          </>
        ) : null}
      </ElementPanel>
    </>
  );
}

function columnVariables(layout: HeroLayout, imagePercent: number) {
  const image = clamp(imagePercent, 25, 70);
  const text = 100 - image;
  if (layout === 'image-left-text-right') {
    return { '--hero-first-ratio': `${image}fr`, '--hero-second-ratio': `${text}fr` };
  }
  return { '--hero-first-ratio': `${text}fr`, '--hero-second-ratio': `${image}fr` };
}

function startColumnResize(
  event: ReactPointerEvent<HTMLButtonElement>,
  layout: HeroLayout,
  onChange: (value: number) => void,
) {
  event.preventDefault();
  event.stopPropagation();
  const grid = event.currentTarget.closest<HTMLElement>('.hero-content-layout');
  if (!grid) return;

  const rect = grid.getBoundingClientRect();
  const move = (pointerEvent: PointerEvent) => {
    const xPercent = clamp(((pointerEvent.clientX - rect.left) / Math.max(1, rect.width)) * 100, 0, 100);
    const imagePercent = layout === 'image-left-text-right' ? xPercent : 100 - xPercent;
    onChange(Math.round(clamp(imagePercent, 25, 70)));
  };
  const end = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    document.body.classList.remove('is-resizing-media');
  };

  document.body.classList.add('is-resizing-media');
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end, { once: true });
}

function Renderer({ section, onChange, selectedElement, onElementSelect, exporting }: SectionRendererProps) {
  if (section.type !== 'hero') return null;
  const { data } = section;
  const common = getSectionCommon(section);
  const hasBackground = common.showBackgroundImage && Boolean(common.backgroundImage);
  const showContentImage = data.layout !== 'text-only' && data.showContentImage;
  const imageColumnPercent = getContentImageColumnPercent(data);

  const updateTextStyle = (key: string, value: TextElementStyle) => {
    onChange?.({ ...section, data: { ...data, textStyles: { ...data.textStyles, [key]: value } } });
  };
  const updateImageColumn = (value: number) => {
    onChange?.({ ...section, data: { ...data, contentImageColumnPercent: value } });
  };

  const rootStyle = {
    ...(hasBackground ? { '--section-background-image': `url(${common.backgroundImage})` } : {}),
    ...columnVariables(data.layout, imageColumnPercent),
    '--hero-content-fit': data.imageFit,
  } as CSSProperties;

  return (
    <div className={`hero-section section-frame ${hasBackground ? 'has-background-image' : ''}`} style={rootStyle}>
      {hasBackground ? <div className="section-background-overlay hero-overlay" /> : null}
      <SectionInner className="hero-inner section-frame-inner">
        <div className={`hero-content-layout is-${data.layout}`}>
          <div className="hero-copy-column">
            <CommonCategory section={section} selectedElement={selectedElement} onElementSelect={onElementSelect} onChange={onChange} exporting={exporting} />
            <SectionHeading
              heading={common.showTitle ? data.title : ''}
              description={common.showDescription ? data.description : ''}
              headingStyle={resolveTextStyle(data.textStyles, 'title', DEFAULT_STYLES.title)}
              descriptionStyle={resolveTextStyle(data.textStyles, 'description', DEFAULT_STYLES.description)}
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              onHeadingStyleChange={(value) => updateTextStyle('title', value)}
              onDescriptionStyleChange={(value) => updateTextStyle('description', value)}
              exporting={exporting}
              headingClassName="md-hero-title"
              descriptionClassName="md-hero-description"
            />
          </div>

          {showContentImage ? (
            <EditableElement
              elementId="contentImage"
              label="콘텐츠 이미지"
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              textStyle={resolveTextStyle(data.textStyles, 'contentImageBox', DEFAULT_STYLES.contentImageBox)}
              onTextStyleChange={(value) => updateTextStyle('contentImageBox', value)}
              exporting={exporting}
              className="hero-media-element"
            >
              <div className="hero-content-image-size">
                <div
                  className={`hero-content-image-frame ${data.contentImageShadow ? 'has-shadow' : ''}`}
                >
                  {data.contentImage ? (
                    <img src={data.contentImage} alt="오프닝 콘텐츠" />
                  ) : (
                    <div className="hero-content-image-empty">
                      <ImageIcon size={30} />
                      <span>콘텐츠 이미지를 업로드하세요</span>
                    </div>
                  )}
                </div>
                {!exporting && selectedElement === 'contentImage' ? (
                  <button
                    type="button"
                    className={`hero-column-resize-handle ${data.layout === 'image-left-text-right' ? 'is-right-edge' : 'is-left-edge'}`}
                    aria-label="텍스트와 이미지 영역 비율 드래그 조절"
                    title="드래그하여 텍스트/이미지 영역 비율 조절"
                    onPointerDown={(event) => startColumnResize(event, data.layout, updateImageColumn)}
                    onClick={(event) => event.stopPropagation()}
                  />
                ) : null}
              </div>
            </EditableElement>
          ) : null}
        </div>

        <SectionFooter
          footer={section.footer}
          selectedElement={selectedElement}
          onElementSelect={onElementSelect}
          onChange={onChange ? (footer) => onChange({ ...section, footer }) : undefined}
          exporting={exporting}
        />
        <CommonButton section={section} selectedElement={selectedElement} onElementSelect={onElementSelect} onChange={onChange} exporting={exporting} />
      </SectionInner>
    </div>
  );
}

export const heroDefinition: SectionDefinition = {
  type: 'hero',
  label: '오프닝',
  description: '텍스트와 이미지를 좌우로 배치할 수 있는 게시물 오프닝',
  icon: Sparkles,
  create: () => ({
    id: createId('hero'),
    type: 'hero',
    style: createSectionStyle({ backgroundToken: 'background' }),
    common: createSectionCommon({
      category: 'NW AX SQUARE · POSTING BUILDER',
      buttonText: '자세히 보기',
      showCategory: true,
      showButton: true,
    }),
    footer: createSectionFooter(),
    data: {
      title: '# 원하는 섹션을 조립해\n게시물을 완성하세요.',
      description: '템플릿에 맞추는 대신 필요한 섹션을 골라 **자유롭게 구성**합니다.',
      contentImage: null,
      layout: 'text-only',
      contentRatio: '55-45',
      imageFit: 'cover',
      showContentImage: true,
      contentImageColumnPercent: 45,
      contentImageShadow: false,
      contentImageBackground: false,
      contentImageBorder: false,
      textStyles: { ...DEFAULT_STYLES },
    },
  }),
  Editor,
  Renderer,
};
