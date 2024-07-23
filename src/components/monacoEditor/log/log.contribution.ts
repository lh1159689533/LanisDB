import { registerLanguage } from 'monaco-editor/esm/vs/basic-languages/_.contribution';

// 注册log语言
registerLanguage({
  id: 'log',
  extensions: ['.log'],
  aliases: ['Logger', 'log'],
  loader: () => import('./log'),
});
