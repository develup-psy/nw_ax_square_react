import { THEME_PRESETS } from './presets';
import { createId } from '../lib/ids';
import type { BuilderProject } from '../types/project';

export function createEmptyProject(): BuilderProject {
  return {
    version: 1,
    id: createId('page'),
    title: '새 게시물',
    theme: { ...THEME_PRESETS.corporate },
    sections: [],
  };
}
