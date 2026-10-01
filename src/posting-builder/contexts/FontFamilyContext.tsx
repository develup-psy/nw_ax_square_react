import { createContext, useContext } from 'react';
import type { FontFamilyId } from '../types/project';

export const FontFamilyContext = createContext<FontFamilyId>('Pretendard');

export function useEditorFontFamily() {
  return useContext(FontFamilyContext);
}
