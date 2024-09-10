import { languages } from 'monaco-editor/esm/vs/editor/editor.api';
import { language } from 'monaco-editor/esm/vs/basic-languages/sql/sql';
import { provideCompletionItems, provideHover } from './monacoPlugin';
import { CUSTOM_KEYWORDS } from '../common/constants';

const { keywords } = language;
keywords.push(...CUSTOM_KEYWORDS);

/**
 * 输入提示
 */
languages.registerCompletionItemProvider('sql', {
  triggerCharacters: ['.', ' ', ...keywords],
  provideCompletionItems,
});

languages.registerHoverProvider('sql', {
  provideHover,
});
