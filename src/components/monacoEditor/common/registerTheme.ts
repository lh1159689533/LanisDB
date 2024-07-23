import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { wdLight, wdDark } from './theme';
import { THEME } from './constants';

const registerTheme = () => {
  /** 注册浅色主题 */
  monaco.editor.defineTheme(THEME.light, wdLight as any);
  /** 注册深色主题 */
  monaco.editor.defineTheme(THEME.dark, wdDark as any);
};

// 注册主题
registerTheme();
