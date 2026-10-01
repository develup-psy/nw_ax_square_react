import { RotateCcw } from 'lucide-react';
import { THEME_PRESETS, THEME_PRESET_LABELS, getFontWeightOptions } from '../data/presets';
import type { FontFamilyId, ThemePresetId, ThemeSettings } from '../types/project';
import { ColorField, RangeField, SelectField } from './ui/Form';

export function ThemeEditor({ theme, onChange }: { theme: ThemeSettings; onChange: (theme: ThemeSettings) => void }) {
  const update = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => onChange({ ...theme, [key]: value });
  const applyPreset = (presetId: ThemePresetId) => onChange({ ...THEME_PRESETS[presetId] });
  const fontWeightOptions = getFontWeightOptions(theme.fontFamily);

  return (
    <div className="theme-editor">
      <div className="inspector-section-title">프리셋 테마</div>
      <div className="preset-grid">
        {(Object.keys(THEME_PRESETS) as ThemePresetId[]).map((presetId) => (
          <button
            type="button"
            key={presetId}
            className={`preset-card ${theme.presetId === presetId ? 'is-active' : ''}`}
            onClick={() => applyPreset(presetId)}
          >
            <span className="preset-swatches">
              <i style={{ background: THEME_PRESETS[presetId].primary }} />
              <i style={{ background: THEME_PRESETS[presetId].secondary }} />
              <i style={{ background: THEME_PRESETS[presetId].surface }} />
            </span>
            <strong>{THEME_PRESET_LABELS[presetId]}</strong>
          </button>
        ))}
      </div>

      <div className="inspector-divider" />
      <div className="inspector-section-title">색상</div>
      <ColorField label="대표 색상" value={theme.primary} onChange={(value) => update('primary', value)} />
      <ColorField label="보조 색상" value={theme.secondary} onChange={(value) => update('secondary', value)} />
      <ColorField label="텍스트 색상" value={theme.text} onChange={(value) => update('text', value)} />
      <ColorField label="배경 색상" value={theme.background} onChange={(value) => update('background', value)} />
      <ColorField label="보조 배경 색상" value={theme.surface} onChange={(value) => update('surface', value)} />

      <div className="inspector-divider" />
      <div className="inspector-section-title">글꼴</div>
      <SelectField
        label="글꼴 종류"
        value={theme.fontFamily}
        onChange={(value) => {
          const fontFamily = value as FontFamilyId;
          const weights = getFontWeightOptions(fontFamily);
          const supported = weights.some((item) => item.value === theme.fontWeight);
          onChange({ ...theme, fontFamily, fontWeight: supported ? theme.fontWeight : 400 });
        }}
      >
        <option value="Pretendard">Pretendard Std</option>
        <option value="SUIT">SUIT</option>
        <option value="Noto Sans KR">Noto Sans KR</option>
        <option value="Wanted Sans">Wanted Sans</option>
        <option value="LG Smart">LG Smart</option>
      </SelectField>
      <RangeField label="글자 크기 배율" value={theme.fontSizeScale} min={0.8} max={1.25} step={0.01} onChange={(value) => update('fontSizeScale', value)} />
      <RangeField label="줄 간격" value={theme.lineHeight} min={1.2} max={2} step={0.02} onChange={(value) => update('lineHeight', value)} />
      <RangeField label="자간" value={theme.letterSpacing} min={-0.06} max={0.06} step={0.002} unit="em" onChange={(value) => update('letterSpacing', value)} />
      <SelectField label="기본 글자 굵기" value={theme.fontWeight} onChange={(value) => update('fontWeight', Number(value))}>
        {fontWeightOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </SelectField>

      <div className="inspector-divider" />
      <div className="inspector-section-title">레이아웃</div>
      <RangeField label="섹션 너비" value={theme.sectionWidth} min={620} max={880} step={10} unit="px" onChange={(value) => update('sectionWidth', value)} />
      <RangeField label="카드 모서리 둥글기" value={theme.cardRadius} min={0} max={40} step={1} unit="px" onChange={(value) => update('cardRadius', value)} />
      <RangeField label="요소 간격" value={theme.gap} min={8} max={40} step={1} unit="px" onChange={(value) => update('gap', value)} />
      <RangeField label="섹션 위쪽 여백" value={theme.paddingTop} min={0} max={140} step={2} unit="px" onChange={(value) => update('paddingTop', value)} />
      <RangeField label="섹션 아래쪽 여백" value={theme.paddingBottom} min={0} max={140} step={2} unit="px" onChange={(value) => update('paddingBottom', value)} />

      <button className="secondary-button full" type="button" onClick={() => applyPreset(theme.presetId)}>
        <RotateCcw size={15} /> 현재 프리셋으로 초기화
      </button>
    </div>
  );
}
