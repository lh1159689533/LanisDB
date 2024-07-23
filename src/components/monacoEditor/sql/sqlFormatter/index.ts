import { StandardSqlFormatter } from './languages/StandardSqlFormatter';
import { FormatOptions } from './types';
import type MonacoEditor from '../../monacoEditor';

const FormatConfig = {
  indent: 4,
  uppercase: false,
  linesBetweenQueries: 2,
};

/**
 * sql格式化
 * @param query sql语句
 * @param cfg 格式化配置
 */
const format = (query: string, cfg: Omit<FormatOptions, 'indent'> & { indent?: number } = FormatConfig) => {
  const { indent, ...others } = cfg;

  return new StandardSqlFormatter({ ...others, indent: ' '.repeat(indent!) }).format(query);
};

/**
 * sql格式化，如果有选中只格式化选中部分，并插入编辑器
 * @param editor 编辑器实例
 */
const formatAndInsert = (editor: MonacoEditor, cfg?: Omit<FormatOptions, 'indent'> & { indent?: number }) => {
  if (!editor) return;

  let range;
  const monacoEditor = editor.getMonacoEditor()!;
  const { startLineNumber, startColumn, endLineNumber, endColumn } = monacoEditor.getSelection()!;
  if (startLineNumber === endLineNumber && startColumn === endColumn) {
    range = monacoEditor.getModel()!.getFullModelRange();
  } else {
    range = { startLineNumber, startColumn, endLineNumber, endColumn };
  }
  const value = editor.getModel()?.getValueInRange(range);

  if (value) {
    editor.insertValue(format(value, cfg), range);
  }
};

export const sqlFormatter = {
  format,
  formatAndInsert,
};
