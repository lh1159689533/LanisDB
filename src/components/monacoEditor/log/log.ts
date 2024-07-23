import { languages } from 'monaco-editor/esm/vs/editor/editor.api';

export const conf: languages.LanguageConfiguration = {};

// 自定义log语言
export const language = {
  ignoreCase: true,
  tokenPostfix: '.log',
  levelTag: ['error', 'info', 'warn', 'debug'],
  keywords: ['failed', 'exception', 'Caused by', 'not found', 'execute failed', 'Connection timed out', '失败', '异常'],
  tokenizer: {
    root: [
      [/(ERROR|Error|error|exception|Exception)( |:){1}.*/, 'log-error'],
      [/(NOTICE|notice)( |:){1}.*/, 'log-notice'],
      [/(WARN|warn)( |:){1}.*/, 'log-notice'],
      [/[^a-zA-Z0-9](INFO|info)( |:){1}/, 'log-info'],
      [/(DEBUG|debug)( |:){1}.*/, 'log-debug'],
      [/	at .*/, 'log-text'],
      [/\[DataInLong Tips\].*/, 'log-tip'],
      [/\[WeData Tips\].*/, 'log-tip'],
      [/\[[a-zA-Z 0-9:]+\]/, 'log-date'],
    ],
  },
};
