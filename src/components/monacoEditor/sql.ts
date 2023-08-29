import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { language } from 'monaco-editor/esm/vs/basic-languages/sql/sql';

const SUGGESTION = {
  KEYWORD: 'keyword',
  SNIPPET: 'snippet',
  TEXT: 'text',
};

const configSuggestions = [
  { key: 'keyword', enabled: true },
  { key: 'text', enabled: true },
];

const { keywords, operators, builtinFunctions } = language;
keywords.push('DATABASES'); // 支持客户DATABASES关键词使用

const { Text, Function } = monaco.languages.CompletionItemKind;

const genSuggestions = (suggestions, kind, detail?, map?) =>
  suggestions.map((item) => {
    const custom = map ? map(item) : {};
    const result = {
      kind,
      label: String(item),
      insertText: item,
      detail,
      ...custom,
    };
    return result;
  });

const provideCompletionItems = async (model): Promise<any> => {
  const content = model.getValue() || '';

  const promises = [];

  configSuggestions.forEach((sug) => {
    //  加载关键字
    if (sug.key === SUGGESTION.KEYWORD) {
      promises.push(Promise.resolve(keywords.filter((_) => !builtinFunctions.includes(_) && !operators.includes(_))));
    }

    // 文本
    if (sug.key === SUGGESTION.TEXT) {
      promises.push(Promise.resolve(Array.from(new Set(content.match(/"[^"]*"|\w+/g)))));
    }
  });

  const result = await Promise.all(promises);

  const suggestions = [];

  configSuggestions.forEach((sug, index) => {
    const data = result[index];

    if (sug.key === SUGGESTION.KEYWORD) {
      suggestions.push(...genSuggestions(data, Function, '关键字'));
    }

    if (sug.key === SUGGESTION.TEXT) {
      suggestions.push(...genSuggestions(data, Text));
    }
  });
  return {
    suggestions,
  };
};

/**
 * 输入提示
 * classname: monaco-menu-container
 */
monaco.languages.registerCompletionItemProvider('sql', {
  triggerCharacters: [],
  provideCompletionItems,
});
