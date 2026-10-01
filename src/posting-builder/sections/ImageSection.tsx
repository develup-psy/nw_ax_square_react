import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { createId } from '../lib/ids';
import { ElementBoxField, ElementPanel, ImageField, MarkdownField, PlainField, RangeField, SelectField, Toggle, TypographyField } from '../components/ui/Form';
import { Markdown } from '../components/Markdown';
import { resolveTextStyle } from '../lib/textStyle';
import type {
  ImageData,
  ImageDisplayMode,
  ImageFit,
  ImageLayout,
  ImageRatio,
  TextElementStyle,
} from '../types/project';
import type { SectionDefinition, SectionEditorProps, SectionRendererProps } from './types';
import { EditableElement, SectionFrame } from './shared';
import { createSectionCommon, createSectionFooter, createSectionStyle } from './common';

const DEFAULT_STYLES: Record<string, TextElementStyle> = {
  heading: { fontSize: 36, lineHeight: 1.18, marginBottom: 22 },
  description: { fontSize: 15, lineHeight: 1.6, marginBottom: 34 },
  caption: { fontSize: 11, lineHeight: 1.45, marginTop: 10 },
  imageBox: { fontSize: 16, lineHeight: 1.6, borderWidth: 0, borderRadius: 16 },
};

function Editor({ section, onChange, selectedElement, onElementSelect }: SectionEditorProps) {
  if (section.type !== 'image') return null;
  const update = <K extends keyof ImageData>(key: K, value: ImageData[K]) =>
    onChange({ ...section, data: { ...section.data, [key]: value } });
  const updateTextStyle = (key: string, value: TextElementStyle) =>
    update('textStyles', { ...section.data.textStyles, [key]: value });

  return (
    <>
      <ElementPanel elementId="title" title="제목" active={selectedElement === 'title'} defaultOpen onSelect={onElementSelect}>
        <MarkdownField label="섹션 제목" value={section.data.heading} onChange={(value) => update('heading', value)} rows={3} />
        <TypographyField label="제목" value={resolveTextStyle(section.data.textStyles, 'heading', DEFAULT_STYLES.heading)} onChange={(value) => updateTextStyle('heading', value)} minFontSize={14} maxFontSize={72} />
      </ElementPanel>

      <ElementPanel elementId="description" title="설명" active={selectedElement === 'description'} onSelect={onElementSelect}>
        <MarkdownField label="섹션 설명" value={section.data.description} onChange={(value) => update('description', value)} rows={4} />
        <TypographyField label="설명" value={resolveTextStyle(section.data.textStyles, 'description', DEFAULT_STYLES.description)} onChange={(value) => updateTextStyle('description', value)} minFontSize={8} maxFontSize={36} />
      </ElementPanel>

      <ElementPanel elementId="image" title="이미지" active={selectedElement === 'image'} onSelect={onElementSelect}>
        <SelectField label="이미지 배치" value={section.data.displayMode} onChange={(value) => update('displayMode', value as ImageDisplayMode)}>
          <option value="single">이미지 1장</option>
          <option value="split">이미지 2장 · 반반</option>
        </SelectField>
        <ImageField label="이미지 1" value={section.data.image} onChange={(value) => update('image', value)} />
        <PlainField label="이미지 1 대체 텍스트" value={section.data.alt} onChange={(value) => update('alt', value)} placeholder="이미지 내용을 설명해주세요" />
        {section.data.displayMode === 'split' ? (
          <>
            <ImageField label="이미지 2" value={section.data.image2} onChange={(value) => update('image2', value)} />
            <PlainField label="이미지 2 대체 텍스트" value={section.data.alt2} onChange={(value) => update('alt2', value)} placeholder="두 번째 이미지 내용을 설명해주세요" />
          </>
        ) : null}
        <SelectField label="이미지 기준 너비" value={section.data.layout} onChange={(value) => update('layout', value as ImageLayout)}>
          <option value="contained">본문 너비 기준</option>
          <option value="full">캔버스 전체 너비 기준</option>
        </SelectField>
        <RangeField label="이미지 크기" value={section.data.widthPercent} min={20} max={100} step={1} unit="%" onChange={(value) => update('widthPercent', value)} />
        <SelectField label="이미지 비율" value={section.data.ratio} onChange={(value) => update('ratio', value as ImageRatio)}>
          <option value="auto">원본 비율</option>
          <option value="16:9">16 : 9</option>
          <option value="4:3">4 : 3</option>
          <option value="1:1">1 : 1</option>
        </SelectField>
        <SelectField label="이미지 맞춤" value={section.data.fit} onChange={(value) => update('fit', value as ImageFit)}>
          <option value="cover">영역 채우기</option>
          <option value="contain">이미지 전체 보기</option>
        </SelectField>
        <ElementBoxField label="이미지 영역" value={resolveTextStyle(section.data.textStyles, 'imageBox', DEFAULT_STYLES.imageBox)} onChange={(value) => updateTextStyle('imageBox', value)} />
      </ElementPanel>

      <ElementPanel elementId="caption" title="캡션" active={selectedElement === 'caption'} onSelect={onElementSelect}>
        <Toggle label="캡션 표시" checked={section.data.showCaption} onChange={(value) => update('showCaption', value)} />
        <MarkdownField label="이미지 1 캡션" value={section.data.caption} onChange={(value) => update('caption', value)} rows={3} />
        {section.data.displayMode === 'split' ? <MarkdownField label="이미지 2 캡션" value={section.data.caption2} onChange={(value) => update('caption2', value)} rows={3} /> : null}
        <TypographyField label="캡션" value={resolveTextStyle(section.data.textStyles, 'caption', DEFAULT_STYLES.caption)} onChange={(value) => updateTextStyle('caption', value)} minFontSize={8} maxFontSize={28} />
      </ElementPanel>
    </>
  );
}

function aspectRatioValue(ratio: ImageRatio) {
  if (ratio === '16:9') return '16 / 9';
  if (ratio === '4:3') return '4 / 3';
  if (ratio === '1:1') return '1 / 1';
  return 'auto';
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function startImageWidthResize(
  event: ReactPointerEvent<HTMLButtonElement>,
  value: number,
  layout: ImageLayout,
  onChange: (value: number) => void,
) {
  event.preventDefault();
  event.stopPropagation();
  const basis = layout === 'full'
    ? event.currentTarget.closest<HTMLElement>('.page-canvas')
    : event.currentTarget.closest<HTMLElement>('.section-frame-body');
  if (!basis) return;

  const basisWidth = Math.max(1, basis.getBoundingClientRect().width);
  const startX = event.clientX;
  const startValue = value;

  const move = (pointerEvent: PointerEvent) => {
    const deltaPercent = ((pointerEvent.clientX - startX) / basisWidth) * 200;
    onChange(Math.round(clamp(startValue + deltaPercent, 20, 100)));
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

function ImageFigure({
  src,
  alt,
  caption,
  data,
  selectedElement,
  onElementSelect,
  captionStyle,
  imageStyle,
  onCaptionStyleChange,
  onImageStyleChange,
  exporting,
}: {
  src: string | null;
  alt: string;
  caption: string;
  data: ImageData;
  selectedElement?: string | null;
  onElementSelect?: (elementId: string) => void;
  captionStyle: TextElementStyle;
  imageStyle: TextElementStyle;
  onCaptionStyleChange?: (value: TextElementStyle) => void;
  onImageStyleChange?: (value: TextElementStyle) => void;
  exporting?: boolean;
}) {
  return (
    <figure className="posting-image-figure">
      <EditableElement elementId="image" label="이미지" selectedElement={selectedElement} onElementSelect={onElementSelect} textStyle={imageStyle} onTextStyleChange={onImageStyleChange} exporting={exporting} className="image-box-element">
        <div
          className={`posting-image-frame ${data.ratio === 'auto' ? 'is-auto' : ''} ${src ? '' : 'is-empty'}`}
          style={{ '--image-aspect-ratio': aspectRatioValue(data.ratio), '--image-fit': data.fit } as CSSProperties}
        >
          {src ? <img src={src} alt={alt} /> : (
            <div className="posting-image-empty">
              <ImageIcon size={32} />
              <span>이미지를 업로드하세요</span>
            </div>
          )}
        </div>
      </EditableElement>
      {data.showCaption && caption ? (
        <EditableElement
          elementId="caption"
          label="캡션"
          selectedElement={selectedElement}
          onElementSelect={onElementSelect}
          textStyle={captionStyle}
          onTextStyleChange={onCaptionStyleChange}
          exporting={exporting}
        >
          <Markdown value={caption} className="image-caption" />
        </EditableElement>
      ) : null}
    </figure>
  );
}

function Renderer({ section, onChange, selectedElement, onElementSelect, exporting }: SectionRendererProps) {
  if (section.type !== 'image') return null;
  const data = section.data;
  const styles = data.textStyles;
  const captionStyle = resolveTextStyle(styles, 'caption', DEFAULT_STYLES.caption);
  const imageStyle = resolveTextStyle(styles, 'imageBox', DEFAULT_STYLES.imageBox);
  const updateTextStyle = (key: string, value: TextElementStyle) => {
    onChange?.({ ...section, data: { ...data, textStyles: { ...styles, [key]: value } } });
  };

  return (
    <SectionFrame
      section={section}
      heading={data.heading}
      description={data.description}
      headingStyle={resolveTextStyle(styles, 'heading', DEFAULT_STYLES.heading)}
      descriptionStyle={resolveTextStyle(styles, 'description', DEFAULT_STYLES.description)}
      onHeadingStyleChange={(value) => updateTextStyle('heading', value)}
      onDescriptionStyleChange={(value) => updateTextStyle('description', value)}
      selectedElement={selectedElement}
      onElementSelect={onElementSelect}
      onChange={onChange}
      exporting={exporting}
      className="image-section"
    >
      <div
        className={`posting-image-group is-${data.displayMode} ${data.layout === 'full' ? 'is-canvas-full' : ''}`}
        style={{
          '--image-width': `${data.widthPercent}%`,
          '--image-canvas-width': `${9.6 * data.widthPercent}px`,
        } as CSSProperties}
      >
        <ImageFigure
          src={data.image}
          alt={data.alt}
          caption={data.caption}
          data={data}
          selectedElement={selectedElement}
          onElementSelect={onElementSelect}
          captionStyle={captionStyle}
          imageStyle={imageStyle}
          onImageStyleChange={(value) => updateTextStyle('imageBox', value)}
          onCaptionStyleChange={(value) => updateTextStyle('caption', value)}
          exporting={exporting}
        />
        {data.displayMode === 'split' ? (
          <ImageFigure
            src={data.image2}
            alt={data.alt2}
            caption={data.caption2}
            data={data}
            selectedElement={selectedElement}
            onElementSelect={onElementSelect}
            captionStyle={captionStyle}
            imageStyle={imageStyle}
            onImageStyleChange={(value) => updateTextStyle('imageBox', value)}
            onCaptionStyleChange={(value) => updateTextStyle('caption', value)}
            exporting={exporting}
          />
        ) : null}
        {!exporting && selectedElement === 'image' ? (
          <button
            type="button"
            className="media-resize-handle is-right"
            aria-label="이미지 크기 드래그 조절"
            title="드래그하여 이미지 크기 조절"
            onPointerDown={(event) => startImageWidthResize(event, data.widthPercent, data.layout, (widthPercent) => {
              onChange?.({ ...section, data: { ...data, widthPercent } });
            })}
            onClick={(event) => event.stopPropagation()}
          />
        ) : null}
      </div>
    </SectionFrame>
  );
}

export const imageDefinition: SectionDefinition = {
  type: 'image',
  label: '이미지',
  description: '스크린샷 · 배너 · 안내 이미지를 1장 또는 반반 2장으로 배치',
  icon: ImageIcon,
  create: () => ({
    id: createId('image'),
    type: 'image',
    style: createSectionStyle({ backgroundToken: 'background' }),
    common: createSectionCommon(),
    footer: createSectionFooter(),
    data: {
      heading: '## 이미지로 내용을 보여주세요',
      description: '스크린샷, 서비스 화면, 프로세스 이미지 등을 게시물에 삽입할 수 있습니다.',
      image: null,
      image2: null,
      alt: '',
      alt2: '',
      caption: '*이미지에 대한 간단한 설명을 입력할 수 있습니다.*',
      caption2: '*두 번째 이미지에 대한 설명을 입력할 수 있습니다.*',
      layout: 'contained',
      displayMode: 'single',
      fit: 'cover',
      ratio: '16:9',
      widthPercent: 100,
      showCaption: true,
      textStyles: { ...DEFAULT_STYLES },
    },
  }),
  Editor,
  Renderer,
};
