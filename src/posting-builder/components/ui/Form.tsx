import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import type { TextElementStyle } from '../../types/project';
import { ChevronDown, ImagePlus, RotateCcw, Trash2 } from 'lucide-react';
import { readImageFile } from '../../lib/image';
import { getFontWeightOptions } from '../../data/presets';
import { useEditorFontFamily } from '../../contexts/FontFamilyContext';

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="field-label-row">
      <label className="field-label">{children}</label>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(props, ref) {
  return <input {...props} ref={ref} className={`control-input ${props.className ?? ''}`} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(props, ref) {
  return <textarea {...props} ref={ref} className={`control-input control-textarea ${props.className ?? ''}`} />;
});

type InlineColorMark = {
  fullStart: number;
  fullEnd: number;
  textStart: number;
  textEnd: number;
  text: string;
  color: string;
};

const INLINE_COLOR_MARK_PATTERN = /\[([^\]\n]+)\]\(#text-color-([0-9A-Fa-f]{6})\)/g;

function getInlineColorMarks(value: string): InlineColorMark[] {
  const regex = new RegExp(INLINE_COLOR_MARK_PATTERN.source, 'g');
  const marks: InlineColorMark[] = [];
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(value))) {
    const fullStart = match.index;
    const textStart = fullStart + 1;
    const text = match[1];
    marks.push({
      fullStart,
      fullEnd: fullStart + match[0].length,
      textStart,
      textEnd: textStart + text.length,
      text,
      color: `#${match[2].toUpperCase()}`,
    });
  }
  return marks;
}

function stripInlineColorMarks(value: string) {
  return value.replace(INLINE_COLOR_MARK_PATTERN, '$1');
}

function colorMark(text: string, color: string) {
  if (!text) return '';
  return `[${text}](#text-color-${color.replace('#', '').toUpperCase()})`;
}

function wrapColorSegment(segment: string, color: string) {
  const code = color.replace('#', '').toUpperCase();
  const clean = stripInlineColorMarks(segment);
  const wrapLine = (line: string) => {
    if (!line) return line;
    const prefix = line.match(/^(\s*(?:(?:#{1,6}|>|[-*+])\s+|\d+\.\s+)?)/)?.[0] ?? '';
    const body = line.slice(prefix.length);
    if (!body) return line;
    return `${prefix}[${body}](#text-color-${code})`;
  };
  return clean.includes('\n') ? clean.split('\n').map(wrapLine).join('\n') : wrapLine(clean);
}

function findMarkAtSelection(marks: InlineColorMark[], start: number, end: number) {
  return marks.find((mark) => {
    if (start === end) return start >= mark.fullStart && start <= mark.fullEnd;
    return (
      (start >= mark.textStart && end <= mark.textEnd) ||
      (start >= mark.fullStart && end <= mark.fullEnd)
    );
  });
}

export function MarkdownField({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inlineColor, setInlineColor] = useState('#FF2E98');
  const [colorMessage, setColorMessage] = useState('');
  const colorMarks = useMemo(() => getInlineColorMarks(value), [value]);

  const replaceRange = (start: number, end: number, replacement: string) => {
    const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      const cursor = start + replacement.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const applyInlineColor = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const existing = findMarkAtSelection(colorMarks, start, end);

    // 이미 색상이 적용된 텍스트의 일부만 다시 선택했다면 기존 marker를 분할해 정확한 선택 범위만 변경합니다.
    if (existing) {
      const isTextSubrange = start < end && start >= existing.textStart && end <= existing.textEnd;
      if (isTextSubrange && (start > existing.textStart || end < existing.textEnd)) {
        const relativeStart = start - existing.textStart;
        const relativeEnd = end - existing.textStart;
        const before = existing.text.slice(0, relativeStart);
        const selected = existing.text.slice(relativeStart, relativeEnd);
        const after = existing.text.slice(relativeEnd);
        const replacement = `${colorMark(before, existing.color)}${colorMark(selected, inlineColor)}${colorMark(after, existing.color)}`;
        replaceRange(existing.fullStart, existing.fullEnd, replacement);
        setColorMessage('선택한 글자 범위만 새 색상으로 변경했습니다.');
      } else {
        replaceRange(existing.fullStart, existing.fullEnd, colorMark(existing.text, inlineColor));
        setColorMessage('기존 색상 구간을 새 색상으로 변경했습니다.');
      }
      return;
    }

    if (start === end) {
      setColorMessage('색상을 적용할 글자를 먼저 드래그해서 선택해주세요.');
      textarea.focus();
      return;
    }

    // 선택 범위가 기존 color marker와 겹치면 marker 전체까지 범위를 확장한 뒤 하나로 다시 만듭니다.
    const overlapping = colorMarks.filter((mark) => end > mark.fullStart && start < mark.fullEnd);
    const rangeStart = overlapping.length ? Math.min(start, ...overlapping.map((mark) => mark.fullStart)) : start;
    const rangeEnd = overlapping.length ? Math.max(end, ...overlapping.map((mark) => mark.fullEnd)) : end;
    const replacement = wrapColorSegment(value.slice(rangeStart, rangeEnd), inlineColor);
    replaceRange(rangeStart, rangeEnd, replacement);
    setColorMessage(overlapping.length ? '기존 색상 구간을 새 색상으로 교체했습니다.' : '선택한 글자에 색상을 적용했습니다.');
  };

  const removeSelectedColor = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const existing = findMarkAtSelection(colorMarks, start, end);
    if (existing) {
      const isTextSubrange = start < end && start >= existing.textStart && end <= existing.textEnd;
      if (isTextSubrange && (start > existing.textStart || end < existing.textEnd)) {
        const relativeStart = start - existing.textStart;
        const relativeEnd = end - existing.textStart;
        const before = existing.text.slice(0, relativeStart);
        const selected = existing.text.slice(relativeStart, relativeEnd);
        const after = existing.text.slice(relativeEnd);
        const replacement = `${colorMark(before, existing.color)}${selected}${colorMark(after, existing.color)}`;
        replaceRange(existing.fullStart, existing.fullEnd, replacement);
        setColorMessage('선택한 글자 범위의 색상만 제거했습니다.');
      } else {
        replaceRange(existing.fullStart, existing.fullEnd, existing.text);
        setColorMessage('선택한 구간의 색상을 제거했습니다.');
      }
      return;
    }
    if (start === end) {
      setColorMessage('색상을 제거할 구간 안에 커서를 두거나 텍스트를 선택해주세요.');
      return;
    }
    const overlapping = colorMarks.filter((mark) => end > mark.fullStart && start < mark.fullEnd);
    if (!overlapping.length) {
      setColorMessage('선택한 범위에 부분 색상이 없습니다.');
      return;
    }
    const rangeStart = Math.min(start, ...overlapping.map((mark) => mark.fullStart));
    const rangeEnd = Math.max(end, ...overlapping.map((mark) => mark.fullEnd));
    replaceRange(rangeStart, rangeEnd, stripInlineColorMarks(value.slice(rangeStart, rangeEnd)));
    setColorMessage('선택 범위의 부분 색상을 제거했습니다.');
  };

  const updateExistingMark = (index: number, color: string) => {
    const currentMarks = getInlineColorMarks(value);
    const mark = currentMarks[index];
    if (!mark) return;
    const replacement = colorMark(mark.text, color);
    replaceRange(mark.fullStart, mark.fullEnd, replacement);
    setInlineColor(color);
    setColorMessage(`“${mark.text}” 색상을 변경했습니다.`);
  };

  const removeExistingMark = (index: number) => {
    const currentMarks = getInlineColorMarks(value);
    const mark = currentMarks[index];
    if (!mark) return;
    replaceRange(mark.fullStart, mark.fullEnd, mark.text);
    setColorMessage(`“${mark.text}” 부분 색상을 제거했습니다.`);
  };

  return (
    <div className="field-group markdown-field-group">
      <FieldLabel hint="Markdown · Enter 1회 줄바꿈">{label}</FieldLabel>
      <TextArea
        ref={textareaRef}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          setColorMessage('');
        }}
      />

      <div className="markdown-color-editor">
        <div className="markdown-color-editor-head">
          <div>
            <strong>부분 글자 색상</strong>
            <small>텍스트를 드래그 → 색상 선택 → 적용/변경</small>
          </div>
          <span className="markdown-color-count">{colorMarks.length}개 적용</span>
        </div>
        <div className="markdown-color-actions">
          <label className="markdown-color-picker" title="적용할 색상">
            <input type="color" value={inlineColor} onChange={(event) => setInlineColor(event.target.value)} />
            <span>{inlineColor.toUpperCase()}</span>
          </label>
          <button type="button" className="markdown-color-apply" onClick={applyInlineColor}>선택 영역 적용 / 변경</button>
          <button type="button" className="markdown-color-remove" onClick={removeSelectedColor}>색상 제거</button>
        </div>
        {colorMessage ? <div className="markdown-color-message">{colorMessage}</div> : null}

        {colorMarks.length ? (
          <div className="markdown-color-list">
            <div className="markdown-color-list-title">현재 색상 적용 구간</div>
            {colorMarks.map((mark, index) => (
              <div className="markdown-color-item" key={`${mark.fullStart}-${mark.color}-${index}`}>
                <span className="markdown-color-preview" title={mark.text}>{mark.text}</span>
                <input
                  type="color"
                  value={mark.color}
                  aria-label={`${mark.text} 색상 변경`}
                  onChange={(event) => updateExistingMark(index, event.target.value)}
                />
                <button type="button" onClick={() => removeExistingMark(index)}>제거</button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PlainField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="field-group">
      <FieldLabel>{label}</FieldLabel>
      <TextInput type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <span className={`toggle ${checked ? 'is-on' : ''}`}>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span className="toggle-knob" />
      </span>
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="field-group">
      <FieldLabel>{label}</FieldLabel>
      <select className="control-input control-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </div>
  );
}

export function RangeField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <div className="field-group">
      <FieldLabel hint={`${value}${unit ?? ''}`}>{label}</FieldLabel>
      <input
        className="control-range"
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        style={{ '--range-progress': `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export function TypographyField({
  label,
  value,
  onChange,
  minFontSize = 8,
  maxFontSize = 96,
  defaultColor = '#1F1B20',
  allowStroke = false,
}: {
  label: string;
  value: TextElementStyle;
  onChange: (value: TextElementStyle) => void;
  minFontSize?: number;
  maxFontSize?: number;
  defaultColor?: string;
  /** 텍스트 Element에는 기본적으로 Stroke UI를 노출하지 않습니다. 버튼/카테고리처럼 필요한 경우에만 true. */
  allowStroke?: boolean;
}) {
  const fontFamily = useEditorFontFamily();
  const fontWeightOptions = getFontWeightOptions(fontFamily);
  const background = value.backgroundColor ?? '#FFFFFF';
  const borderColor = value.borderColor ?? '#D9D9DF';
  return (
    <div className="typography-field-body typography-field-standalone">
      <div className="field-subheading">타이포그래피</div>
      <RangeField label={`${label} 크기`} value={value.fontSize} min={minFontSize} max={maxFontSize} step={1} unit="px" onChange={(fontSize) => onChange({ ...value, fontSize })} />
      <RangeField label="줄 간격" value={value.lineHeight} min={0.8} max={2.8} step={0.02} onChange={(lineHeight) => onChange({ ...value, lineHeight })} />
      <div className="field-group">
        <FieldLabel hint={value.color ? '직접 지정' : '테마 상속'}>글자 색상</FieldLabel>
        <div className="color-control color-control-with-reset">
          <input className="color-picker" type="color" value={value.color ?? defaultColor} onChange={(event) => onChange({ ...value, color: event.target.value })} />
          <TextInput value={value.color ?? ''} placeholder="테마 색상 상속" onChange={(event) => onChange({ ...value, color: event.target.value || undefined })} />
          <button className="mini-reset-button" type="button" title="테마 색상 상속" onClick={() => onChange({ ...value, color: undefined })}><RotateCcw size={12} /></button>
        </div>
      </div>
      <SelectField label="정렬" value={value.textAlign ?? 'left'} onChange={(textAlign) => onChange({ ...value, textAlign: textAlign as TextElementStyle['textAlign'] })}>
        <option value="left">왼쪽</option><option value="center">가운데</option><option value="right">오른쪽</option>
      </SelectField>
      <SelectField label="글자 굵기" value={value.fontWeight ?? 0} onChange={(fontWeight) => onChange({ ...value, fontWeight: Number(fontWeight) || undefined })}>
        <option value={0}>테마 상속</option>
        {fontWeightOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </SelectField>

      <div className="field-subheading">Element 간격</div>
      <RangeField label="위쪽 간격" value={value.marginTop ?? 0} min={0} max={120} step={1} unit="px" onChange={(marginTop) => onChange({ ...value, marginTop })} />
      <RangeField label="아래쪽 간격" value={value.marginBottom ?? 0} min={0} max={120} step={1} unit="px" onChange={(marginBottom) => onChange({ ...value, marginBottom })} />

      <div className="field-subheading">Element 배경 / Stroke</div>
      <div className="field-group">
        <FieldLabel hint={value.backgroundColor ? '사용 중' : '투명'}>배경 색상</FieldLabel>
        <div className="color-control color-control-with-reset">
          <input className="color-picker" type="color" value={background} onChange={(event) => onChange({ ...value, backgroundColor: event.target.value })} />
          <TextInput value={value.backgroundColor ?? ''} placeholder="투명" onChange={(event) => onChange({ ...value, backgroundColor: event.target.value || undefined })} />
          <button className="mini-reset-button" type="button" title="배경 없음" onClick={() => onChange({ ...value, backgroundColor: undefined })}><RotateCcw size={12} /></button>
        </div>
      </div>
      {allowStroke ? (
        <>
          <Toggle
            label="Stroke 사용"
            checked={(value.borderWidth ?? 0) > 0}
            onChange={(enabled) => onChange({ ...value, borderWidth: enabled ? Math.max(1, value.borderWidth ?? 1) : 0 })}
          />
          {(value.borderWidth ?? 0) > 0 ? (
            <>
              <RangeField label="Stroke 굵기" value={value.borderWidth ?? 1} min={1} max={8} step={1} unit="px" onChange={(borderWidth) => onChange({ ...value, borderWidth })} />
              <div className="field-group">
                <FieldLabel>Stroke 색상</FieldLabel>
                <div className="color-control">
                  <input className="color-picker" type="color" value={borderColor} onChange={(event) => onChange({ ...value, borderColor: event.target.value })} />
                  <TextInput value={value.borderColor ?? borderColor} onChange={(event) => onChange({ ...value, borderColor: event.target.value })} />
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
      <RangeField label="모서리 둥글기" value={value.borderRadius ?? 0} min={0} max={48} step={1} unit="px" onChange={(borderRadius) => onChange({ ...value, borderRadius })} />
      <RangeField label="좌우 내부 여백" value={value.paddingX ?? 0} min={0} max={64} step={1} unit="px" onChange={(paddingX) => onChange({ ...value, paddingX })} />
      <RangeField label="상하 내부 여백" value={value.paddingY ?? 0} min={0} max={64} step={1} unit="px" onChange={(paddingY) => onChange({ ...value, paddingY })} />
    </div>
  );
}

export function ElementBoxField({
  label, value, onChange,
}: { label: string; value: TextElementStyle; onChange: (value: TextElementStyle) => void }) {
  const background = value.backgroundColor ?? '#FFFFFF';
  const borderColor = value.borderColor ?? '#D9D9DF';
  return (
    <div className="typography-field-body typography-field-standalone">
      <div className="field-subheading">{label} 박스</div>
      <RangeField label="위쪽 간격" value={value.marginTop ?? 0} min={0} max={120} step={1} unit="px" onChange={(marginTop) => onChange({ ...value, marginTop })} />
      <RangeField label="아래쪽 간격" value={value.marginBottom ?? 0} min={0} max={120} step={1} unit="px" onChange={(marginBottom) => onChange({ ...value, marginBottom })} />
      <div className="field-group">
        <FieldLabel hint={value.backgroundColor ? '사용 중' : '투명'}>배경 색상</FieldLabel>
        <div className="color-control color-control-with-reset">
          <input className="color-picker" type="color" value={background} onChange={(event) => onChange({ ...value, backgroundColor: event.target.value })} />
          <TextInput value={value.backgroundColor ?? ''} placeholder="투명" onChange={(event) => onChange({ ...value, backgroundColor: event.target.value || undefined })} />
          <button className="mini-reset-button" type="button" title="배경 없음" onClick={() => onChange({ ...value, backgroundColor: undefined })}><RotateCcw size={12} /></button>
        </div>
      </div>
      <Toggle
        label="Stroke 사용"
        checked={(value.borderWidth ?? 0) > 0}
        onChange={(enabled) => onChange({ ...value, borderWidth: enabled ? Math.max(1, value.borderWidth ?? 1) : 0 })}
      />
      {(value.borderWidth ?? 0) > 0 ? (
        <>
          <RangeField label="Stroke 굵기" value={value.borderWidth ?? 1} min={1} max={8} step={1} unit="px" onChange={(borderWidth) => onChange({ ...value, borderWidth })} />
          <div className="field-group"><FieldLabel>Stroke 색상</FieldLabel><div className="color-control"><input className="color-picker" type="color" value={borderColor} onChange={(event) => onChange({ ...value, borderColor: event.target.value })} /><TextInput value={value.borderColor ?? borderColor} onChange={(event) => onChange({ ...value, borderColor: event.target.value })} /></div></div>
        </>
      ) : null}
      <RangeField label="모서리 둥글기" value={value.borderRadius ?? 0} min={0} max={48} step={1} unit="px" onChange={(borderRadius) => onChange({ ...value, borderRadius })} />
      <RangeField label="좌우 내부 여백" value={value.paddingX ?? 0} min={0} max={64} step={1} unit="px" onChange={(paddingX) => onChange({ ...value, paddingX })} />
      <RangeField label="상하 내부 여백" value={value.paddingY ?? 0} min={0} max={64} step={1} unit="px" onChange={(paddingY) => onChange({ ...value, paddingY })} />
    </div>
  );
}

/**
 * Preview의 선택 상태와 1:1로 동기화되는 Inspector 패널입니다.
 * active인 패널 하나만 열리므로 다른 요소는 자동으로 접힙니다.
 */
export function ElementPanel({
  elementId,
  title,
  active = false,
  onSelect,
  children,
  tone = 'element',
}: {
  elementId: string;
  title: string;
  active?: boolean;
  defaultOpen?: boolean; // v6 호출부 호환용. v7에서는 selectedElement가 상태를 결정합니다.
  onSelect?: (elementId: string) => void;
  children: ReactNode;
  tone?: 'element' | 'section';
}) {
  return (
    <section
      className={`element-panel tone-${tone} ${active ? 'is-active' : ''}`}
      data-inspector-element={elementId}
      data-active={active ? 'true' : 'false'}
    >
      <button
        type="button"
        className="element-panel-toggle"
        aria-expanded={active}
        onClick={() => onSelect?.(elementId)}
      >
        <span>{title}</span>
        <ChevronDown size={14} className={active ? 'is-open' : ''} />
      </button>
      {active ? <div className="element-panel-body">{children}</div> : null}
    </section>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="field-group">
      <FieldLabel>{label}</FieldLabel>
      <div className="color-control">
        <input className="color-picker" type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <TextInput value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readImageFile(file);
    onChange(dataUrl);
    event.target.value = '';
  };

  return (
    <div className="field-group">
      <FieldLabel>{label}</FieldLabel>
      {value ? (
        <div className="image-field-preview">
          <img src={value} alt="업로드 미리보기" />
          <button className="image-remove" type="button" onClick={() => onChange(null)} aria-label="이미지 삭제">
            <Trash2 size={14} /> 삭제
          </button>
        </div>
      ) : (
        <label className="image-upload">
          <ImagePlus size={18} />
          <span>이미지 선택</span>
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>
      )}
    </div>
  );
}

export function RepeaterCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="repeater-card">
      <div className="repeater-head">
        <strong>{title}</strong>
        <button className="icon-text-button danger" type="button" onClick={onRemove}>
          <Trash2 size={13} /> 삭제
        </button>
      </div>
      {children}
    </div>
  );
}
