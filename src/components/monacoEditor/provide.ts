import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { language } from 'monaco-editor/esm/vs/basic-languages/sql/sql';
import snippet from './snippet';
import DB from '@src/utils/db';

const SORT_TEXT = {
  Database: '0',
  Table: '1',
  Column: '2',
  Keyword: '3',
};

const { keywords, operators, builtinFunctions } = language;
keywords.push('DATABASES'); // 支持客户DATABASES关键词使用

const { CompletionItemKind, CompletionItemInsertTextRule } = monaco.languages;
const { Snippet, Function, Value, Text } = CompletionItemKind;
const { InsertAsSnippet } = CompletionItemInsertTextRule;

const getKeywordSuggestions = (Keywords) => {
  return Keywords?.map((item) => ({
    kind: Function,
    label: item,
    filter: item,
    insertText: item,
    sortText: SORT_TEXT.Keyword,
    detail: '关键字',
  }));
};

// 表Suggestions
const getTableSuggestions = (tables) => {
  return tables?.map((item) => ({
    kind: Value,
    label: item.name,
    filter: item.name,
    insertText: item.name,
    sortText: SORT_TEXT.Table,
    detail: '表',
  }));
};

/**
 * 字段Suggestions
 * @param columns 表字段列表
 * @param tableAlia 表别名
 */
const getColumnSuggestions = (columns, tableAlia = '') => {
  if (!columns?.length) return [];
  tableAlia = tableAlia ? `${tableAlia}.` : '';
  const allNames = columns.map((c) => c.name);
  return [
    {
      label: allNames.join(', '),
      kind: Text,
      detail: '',
      sortText: SORT_TEXT.Column,
      insertText: allNames.join(`, ${tableAlia}`),
    },
    ...columns.map((c) => ({
      label: c.name,
      kind: Text,
      detail: c.type ?? '',
      sortText: SORT_TEXT.Column,
      insertText: c.name,
      documentation: {
        value: `说明: ${c.columnComment ?? ''}`,
      },
    })),
  ];
};

// 快捷语法
const getFastSuggestions = () => {
  return snippet.map(({ label, value }) => ({
    label,
    kind: Snippet,
    insertText: value,
    insertTextRules: InsertAsSnippet,
    sortText: SORT_TEXT.Database,
  }));
};

/**
 * 获取sql中所有的表名和别名
 * @param {*} sqlText SQL字符串
 */
const getTableNameAndTableAlia = (sqlText: string) => {
  const regTableAliaFrom = /(^|(\s+))from\s+([^\s]+((\s+as\s+)|\s+)[^\s]+)/gi;
  const regTableAliaJoin = /(^|(\s+))join\s+([^\s]+)\s+(as\s+)?([^\s]+)\s+on/gi;

  const regTableAliaFromList = sqlText.match(regTableAliaFrom) ?? [];
  const regTableAliaJoinList = sqlText.match(regTableAliaJoin) ?? [];

  const strList = [
    ...regTableAliaFromList.map((item) =>
      item
        .replace(/(^|(\s+))from\s+/gi, '')
        .replace(/\s+(where|left|right|full|join|inner|union)((\s+.*?$)|$)/gi, '')
        .replace(/\s+as\s+/gi, ' ')
        .trim()
    ),
    ...regTableAliaJoinList.map((item) =>
      item
        .replace(/(^|(\s+))join\s+/gi, '')
        .replace(/\s+on((\s+.*?$)|$)/, '')
        .replace(/\s+as\s+/gi, ' ')
        .trim()
    ),
  ];
  const tableList = [];
  strList.map((tableAndAlia) => {
    tableAndAlia.split(',').forEach((item) => {
      const tableName = item.trim().split(/\s+/)[0];
      const tableAlia = item.trim().split(/\s+/)[1];
      tableList.push({
        tableName,
        tableAlia,
      });
    });
  });
  return tableList;
};

// 自动补全
export const provideCompletionItems = async (model, position): Promise<any> => {
  const { lineNumber, column } = position;

  // 行: 光标所在行, 列: 1-光标所在列
  const textUntilPosition = model.getValueInRange({
    startLineNumber: lineNumber,
    startColumn: 1,
    endLineNumber: lineNumber,
    endColumn: column,
  });

  // 行: 1-光标所在行, 列: 1-光标所在列
  const textBeforePointerMulti = model.getValueInRange({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: lineNumber,
    endColumn: column,
  });

  // 行: 光标所在行-最大行, 列: 光标所在列-最大行的最大列
  const textAfterPointerMulti = model.getValueInRange({
    startLineNumber: lineNumber,
    startColumn: column,
    endLineNumber: model.getLineCount(),
    endColumn: model.getLineMaxColumn(model.getLineCount()),
  });

  let suggestions = [];
  const matches = textUntilPosition.trim().split(/\s+/);
  if (!matches?.length) return { suggestions };
  const lastMatche = matches[matches.length - 1]?.toLowerCase() ?? '';

  if (lastMatche.endsWith('.')) {
    const tokenNoDot = lastMatche.slice(0, lastMatche.length - 1); // 去掉.后
    const name = tokenNoDot.replace(/^.*,/g, '');
    // 考虑多行，以分号判断出光标所在语句
    const sqlText =
      textBeforePointerMulti.split(';')[textBeforePointerMulti.split(';').length - 1] +
      textAfterPointerMulti.split(';')[0];

    if (getTableNameAndTableAlia(sqlText)) {
      const tableInfos = getTableNameAndTableAlia(sqlText);
      const current = tableInfos.find((tbl) => tbl.tableAlia === name);
      if (current?.tableName) {
        // 表.字段
        const db = (window as any).dbInstance as DB;
        const columns = await db.tableColumnsDetail(current.tableName);
        suggestions = [...getColumnSuggestions(columns, name)];
      } else {
        suggestions = [];
      }
    } else {
      suggestions = [];
    }
  } else if (
    lastMatche === 'from' ||
    lastMatche === 'join' ||
    /(from|join)\s+.*?\s?,\s*$/.test(textUntilPosition.replace(/.*?\(/gm, '').toLowerCase())
  ) {
    const db = (window as any).dbInstance as DB;
    const tables = await db.getTables();
    suggestions = [
      ...getTableSuggestions(tables),
      ...getKeywordSuggestions(keywords.filter((_) => !builtinFunctions.includes(_) && !operators.includes(_))),
    ];
  } else {
    const sqlText =
      textBeforePointerMulti.split(';')[textBeforePointerMulti.split(';').length - 1] +
      textAfterPointerMulti.split(';')[0];
    const match = sqlText.match(/(?:^|\s+)select\s+[^\s]*\s+from\s+([^\s]*)/i);
    const tableName = (match ?? [])[1];
    if (tableName && ['where', 'select', 'by'].includes(lastMatche)) {
      // 字段
      const db = (window as any).dbInstance as DB;
      const columns = await db.tableColumnsDetail(tableName);
      suggestions = [...getColumnSuggestions(columns)];
    } else {
      suggestions = [
        ...getKeywordSuggestions(keywords.filter((_) => !builtinFunctions.includes(_) && !operators.includes(_))),
        ...getFastSuggestions(),
      ];
    }
  }

  return {
    suggestions,
  };
};
