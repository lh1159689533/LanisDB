import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { groupBy } from 'lodash';
import { IParseResult } from 'syntax-parser';
import { getDatabaseList, getTableListByDbName, getColumnsByDbNameAndTableName } from '../../common/util';
import snippet from './snippet';
import { sqlParser, reader } from './completion';
import { ITableInfo, ICursorInfo } from './completion/types';

const { CompletionItemKind, CompletionItemInsertTextRule } = monaco.languages;

/** 高优先级的关键词 */
const HIGH_PRIORITY_KEYWORDS = [
  'BETWEEN',
  'CREATE',
  'FROM',
  'GROUP',
  'INSERT',
  'LIMIT',
  'ORDER',
  'SELECT',
  'TABLE',
  'WHERE',
];

const KEYWORDS = [
  '*',
  'AS',
  'ALL',
  'AND',
  'ASC',
  'ADD',
  'ALTER',
  'AFTER',
  'ANALYZE',
  'ANY',
  'AUTHORIZATION',
  'BETWEEN',
  'BEGIN',
  'BEFORE',
  'BOTH',
  'BY',
  'CREATE',
  'COLUMN',
  'CATALOG',
  'CASE',
  'CAST',
  'COMMIT',
  'CURRENT',
  'CURRENT_DATE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'DROP',
  'DATABASE',
  'DATABASES',
  'DISTINCT',
  'DELETE',
  'DESCRIBE',
  'DESC',
  'DATE',
  'DAY',
  'DECIMAL',
  'DOUBLE',
  'ELSE',
  'EXISTS',
  'END',
  'EXCEPTION',
  'EXTRACT',
  'FROM',
  'FIRST',
  'FUNCTION',
  'FLOAT',
  'FOR',
  'GROUP',
  'GROUPS',
  'GRANT',
  'HAVING',
  'HOUR',
  'INSERT',
  'INDEX',
  'INNER',
  'INTEGER',
  'IF',
  'IN',
  'INT',
  'INTO',
  'IS',
  'JOIN',
  'KEY',
  'KILL',
  'LIMIT',
  'LIKE',
  'LEFT',
  'LAST',
  'LOAD',
  'LOCAL',
  'MATERIALIZED',
  'MERGE',
  'MINUTE',
  'NONE',
  'NOT',
  'NCHAR',
  'NULL',
  'NUMERIC',
  'OR',
  'ORDER',
  'OVERWRITE ',
  'ON',
  'OFFSET',
  'OUTER',
  'OVER',
  'PRIMARY',
  'RIGHT',
  'REGEXP',
  'REINDEX',
  'RENAME',
  'REPLICATION',
  'ROW',
  'ROWS',
  'SELECT',
  'SET',
  'SHOW',
  'SCHEMA',
  'SECOND',
  'SMALLINT',
  'TABLE',
  'TABLES',
  'TRUE',
  'TEMP',
  'TEMPORARY',
  'THEN',
  'TIMESTAMP',
  'TOP',
  'TRIGGER',
  'TRUNCATE',
  'UPDATE',
  'UNION',
  'UNIQUE',
  'USE',
  'USER',
  'VARCHAR',
  'VIEW',
  'VALUE',
  'VALUES',
  'WHERE',
  'WITH',
  'WHEN',
  'WHILE',
  'WINDOW',
  'YEAR',
];

const FUNCTIONS = ['SUBSTRING', 'TRIM', 'REPLACE', 'COUNT', 'SUM'];

/**
 * 关键字Suggestions
 */
const getKeywordSuggestions = (nextMatchings: string[]): any[] => {
  if (!KEYWORDS?.length) return [];
  return KEYWORDS.filter((item) => nextMatchings.includes(item.toLowerCase())).map((item) => ({
    kind: CompletionItemKind.Keyword,
    label: item,
    filter: item,
    insertText: item,
    sortText: HIGH_PRIORITY_KEYWORDS.includes(item) ? `CA${item}` : `CB${item}`,
    detail: '关键字',
  }));
};

/**
 * 快捷语法
 */
const getFastSuggestions = (nextMatchings: string[]) =>
  snippet
    .filter((item) => nextMatchings.includes(item.category))
    .map(({ label, insertText }) => ({
      label,
      kind: CompletionItemKind.Snippet,
      insertText,
      insertTextRules: CompletionItemInsertTextRule.InsertAsSnippet,
      sortText: `AC${insertText}`,
    }));

const onSuggestTableFields = async (modelId: string, tableInfo?: ITableInfo): Promise<any> => {
  const columns = await getColumnsByDbNameAndTableName(
    modelId,
    tableInfo?.namespace.value as string,
    tableInfo?.tableName.value as string
  );
  return columns.map((item) => {
    return {
      label: item.name,
      insertText: item.name,
      sortText: `AC${item.name}`,
      kind: CompletionItemKind.Text,
      detail: item.type ?? '',
      documentation: {
        value: `
    数据库: ${item.dbName}
    表: ${item.tblName}
    说明: ${item.description}`,
      },
    };
  });
};

const onSuggestFunctionName = (): Promise<any[]> => {
  return Promise.resolve(
    FUNCTIONS.map((each) => {
      return {
        label: each,
        insertText: each,
        sortText: `B${each}`,
        kind: CompletionItemKind.Function,
      };
    })
  );
};

const onSuggestFieldGroup = (tableNameOrAlias?: string): any => {
  return {
    label: tableNameOrAlias,
    insertText: tableNameOrAlias,
    sortText: `AB${tableNameOrAlias}`,
    kind: CompletionItemKind.Value,
    detail: '表别名',
  };
};

const onSuggestTableNames = async (modelId: string, cursorInfo: any): Promise<any[]> => {
  // if (!cursorInfo.tableInfo?.namespace?.value) {
  //   const dbNames = await getDatabaseList(modelId);
  //   return dbNames.map((name) => ({
  //     label: name,
  //     insertText: name,
  //     sortText: `AA${name}`,
  //     kind: CompletionItemKind.Constructor,
  //     detail: '库',
  //   }));
  // }
  const tableNames = await getTableListByDbName(modelId, cursorInfo.tableInfo.namespace.value);
  return tableNames.map((item) => {
    return {
      label: item.name,
      insertText: item.name,
      sortText: `AB${item.name}`,
      kind: CompletionItemKind.Value,
      detail: '表',
      documentation: `数据库：${item.dbName}`,
    };
  });
};

// 自动补全
export const provideCompletionItems = async (
  model: monaco.editor.ITextModel,
  position: monaco.Position
): Promise<any> => {
  const parseResult: IParseResult = await sqlParser(model.getValue(), model.getOffsetAt(position));
  console.log('parseResult:', parseResult);

  const cursorInfo = await reader.getCursorInfo(parseResult.ast, parseResult.cursorKeyPath);
  console.log('cursorInfo:', cursorInfo);

  const nextMatchings = parseResult.nextMatchings
    .filter((item) => item.type === 'string')
    .map((item) => item.value as string);

  const keywordSuggestions = getKeywordSuggestions(nextMatchings);
  const functionNames = await onSuggestFunctionName();
  const fastSuggestions = await getFastSuggestions(nextMatchings);

  if (!cursorInfo) {
    return { suggestions: keywordSuggestions.concat(fastSuggestions) };
  }

  switch (cursorInfo.type) {
    case 'tableField':
      const cursorRootStatementFields = await reader.getFieldsFromStatement(
        parseResult.ast,
        parseResult.cursorKeyPath,
        async (tableInfo?: ITableInfo) => await onSuggestTableFields(model.id, tableInfo)
      );

      // group.fieldName
      const groups = groupBy(
        cursorRootStatementFields?.filter((cursorRootStatementField) => {
          return cursorRootStatementField.groupPickerName !== null;
        }),
        'groupPickerName'
      );

      return {
        suggestions: (cursorRootStatementFields ?? [])
          .concat(keywordSuggestions)
          .concat(functionNames)
          .concat(
            groups
              ? Object.keys(groups).map((groupName) => {
                  return onSuggestFieldGroup(groupName);
                })
              : []
          ),
      };
    case 'tableFieldAfterGroup':
      // 字段 . 后面的部分
      const cursorRootStatementFieldsAfter = await reader.getFieldsFromStatement(
        parseResult.ast,
        parseResult.cursorKeyPath as any,
        async (tableInfo?: ITableInfo) => await onSuggestTableFields(model.id, tableInfo)
      );

      return {
        suggestions: (cursorRootStatementFieldsAfter ?? [])
          ?.filter((cursorRootStatementField: any) => {
            return (
              cursorRootStatementField.groupPickerName === (cursorInfo as ICursorInfo<{ groupName: string }>).groupName
            );
          })
          .concat(keywordSuggestions),
      };
    case 'tableName':
      const tableNames = await onSuggestTableNames(model.id, cursorInfo as ICursorInfo<ITableInfo>);
      return { suggestions: tableNames.concat(keywordSuggestions) };
    case 'functionName':
      return { suggestions: functionNames };
    default:
      return { suggestions: keywordSuggestions.concat(fastSuggestions) };
  }
};
