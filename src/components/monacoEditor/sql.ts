import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { language } from 'monaco-editor/esm/vs/basic-languages/sql/sql';
import { provideCompletionItems } from './provide';

const { keywords } = language;

/**
 * 输入提示
 */
monaco.languages.registerCompletionItemProvider('sql', {
  triggerCharacters: [' ', '.', ...keywords],
  provideCompletionItems,
});
