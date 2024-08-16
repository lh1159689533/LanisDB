import { THEME } from './constants';
import EventBus from './eventBus';
import { CompletionTable, CompletionColumn, CompletionFunc } from '../common/types';

/** 获取wedata主题 */
const getTheme = () => (document.body.hasAttribute('dark-theme') ? THEME.dark : THEME.light);

/**
 * 获取数据库
 */
const getDatabaseList = async (modelId: string): Promise<string[]> => {
  const dbApi = EventBus.get(modelId)?.db;
  if (!dbApi) return [];

  const data = await dbApi();

  return data ?? [];
};

/**
 * 获取表
 * @param databaseName 数据库名
 */
const getTableListByDbName = async (modelId: string, databaseName: string): Promise<CompletionTable[]> => {
  const tableApi = EventBus.get(modelId)?.table;
  if (!tableApi) return [];

  const data = await tableApi(databaseName);

  return data ?? [];
};

/**
 * 查询表的列
 * @param databaseName 数据库名
 * @param tableName 表名
 */
const getColumnsByDbNameAndTableName = async (
  modelId: string,
  databaseName: string,
  tableName: string,
  tableType = 'TABLE'
): Promise<CompletionColumn[]> => {
  const columnApi = EventBus.get(modelId)?.column;
  if (!columnApi) return [];

  const data = await columnApi(databaseName, tableName, tableType);

  return data ?? [];
};

/**
 * 查询表的列
 * @param databaseName 数据库名
 * @param tableName 表名
 */
const getFunctions = async (modelId: string): Promise<CompletionFunc[]> => {
  const columnApi = EventBus.get(modelId)?.func;
  if (!columnApi) return [];

  const data = await columnApi();

  return data ?? [];
};

export { getDatabaseList, getTableListByDbName, getColumnsByDbNameAndTableName, getFunctions, getTheme };
