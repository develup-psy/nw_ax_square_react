import type { CSSProperties } from 'react';
import type { TextElementStyle, TextStyleMap } from '../types/project';

export function resolveTextStyle(
  styles: TextStyleMap | undefined,
  key: string,
  fallback: TextElementStyle,
): TextElementStyle {
  return { ...fallback, ...(styles?.[key] ?? {}) };
}

/**
 * 사용자 변경값은 CSS Custom Property만 inline으로 전달합니다.
 * 실제 typography/layout 규칙은 src/styles.css에서 일괄 관리합니다.
 */
export function textStyleVariables(style: TextElementStyle): CSSProperties {
  return {
    '--element-font-size': `${style.fontSize}px`,
    '--element-line-height': style.lineHeight,
    ...(typeof style.marginTop === 'number' ? { '--element-margin-top': `${style.marginTop}px` } : {}),
    ...(typeof style.marginBottom === 'number' ? { '--element-margin-bottom': `${style.marginBottom}px` } : {}),
    ...(style.color ? { '--element-color': style.color } : {}),
    ...(typeof style.fontWeight === 'number' ? { '--element-font-weight': style.fontWeight } : {}),
    ...(style.textAlign ? { '--element-text-align': style.textAlign } : {}),
    ...(style.backgroundColor ? { '--element-background': style.backgroundColor } : {}),
    ...(style.borderColor ? { '--element-border-color': style.borderColor } : {}),
    ...(typeof style.borderWidth === 'number' ? { '--element-border-width': `${style.borderWidth}px` } : {}),
    ...(typeof style.borderRadius === 'number' ? { '--element-border-radius': `${style.borderRadius}px` } : {}),
    ...(typeof style.paddingX === 'number' ? { '--element-padding-x': `${style.paddingX}px` } : {}),
    ...(typeof style.paddingY === 'number' ? { '--element-padding-y': `${style.paddingY}px` } : {}),
  } as CSSProperties;
}
