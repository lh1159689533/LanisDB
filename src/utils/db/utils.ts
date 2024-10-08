import { DIALECT } from '@src/constant';
import { IDialect, ISqliteDBProps, IMysqlDBProps, IDBProps } from './types';

// sql语句中匹配表名
const patternTableNameBySqlReg = /.?\s+from\s+[\w\[\]]*\.?[\w\[\]]*\.?\[?(\b\w+)\]?[\r\n\s]*/;

// 匹配表名
export const patternTableNameBySql = (sql: string) => {
  return sql.match(patternTableNameBySqlReg)?.[1] ?? '';
};

/**
 * 获取数据库连接sql语句
 * @param props 参数
 */
export const getDBUrl = (props: IDBProps) => {
  let url: string = '';
  if (props.dialect === DIALECT.mysql) {
    const { host, port, username, password, database } = props as IMysqlDBProps;
    url = `mysql://${username}:${password}@${host}:${port}`;
    if (database) {
      url += `/${database}`;
    }
  } else {
    const { storage } = props as ISqliteDBProps;
    url = `sqlite:${storage}`;
  }

  return url;
};

/**
 * 获取查询表字段sql语句
 * @param tableName 表名
 * @param dialect 数据库方言
 * @param database 数据库名
 */
export const getTableColumnsSql = (tableName: string, dialect: IDialect = DIALECT.sqlite, database?: string) => {
  let sql = '';
  if (dialect === DIALECT.mysql) {
    sql = `select column_name as name, column_default as defaultValue, is_nullable as notNull, column_type as type, character_set_name as characterName,
      collation_name as collationName, column_comment as columnComment, column_key as columnKey from information_schema.columns
      where table_schema='${database}' and table_name='${tableName}'`;
  } else {
    sql = `pragma table_info(${tableName})`;
  }

  return sql;
};

/**
 * 根据select查询语句获取count语句
 * @param sql sql语句
 * @param tableName 表名
 */
export const getCountSql = (sql: string, tableName: string) => {
  let countSql = sql.split(tableName)[1];
  if (countSql.includes('limit ')) {
    countSql = countSql.substring(0, countSql.indexOf('limit '));
  }
  return `select count(*) as total from ${tableName} ${countSql}`;
};

export const isSelectSql = (sql: string) => sql.trim().toLowerCase().startsWith('select ');

// 将数据库字段类型转为js可以识别的类型，table列编辑时用
export const convertColumnType = (columnType: string): string => {
  if (!columnType) return 'string';
  if (columnType.startsWith('VARCHAR')) return 'string';
  if (columnType.startsWith('INTEGER') || columnType.startsWith('BIGINT')) return 'number';

  switch (columnType) {
    case 'TEXT':
    case 'REAL':
    case 'CHAR':
    case 'VARCHAR':
    case 'TINYTEXT':
    case 'MEDIUMTEXT':
    case 'LONGTEXT':
    case 'ENUM':
    case 'FLOAT':
    case 'DOUBLE':
    case 'JSON':
      return 'string';
    case 'INTEGER':
    case 'NUMERIC':
    case 'TINYINT':
    case 'SMALLINT':
    case 'INT':
    case 'MEDIUMINT':
    case 'BIGINT':
      return 'number';
    case 'BOOLEAN':
      return 'boolean';
    case 'DATE':
    case 'TIME':
    case 'DATETIME':
    case 'TIMESTAMP':
      return 'date';
    case 'BLOB':
    case 'TINIYBLOB':
    case 'MEDIUMBLOB':
    case 'LONGBLOB':
      return 'blob';
  }
};
