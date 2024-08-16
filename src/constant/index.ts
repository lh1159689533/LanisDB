/** 数据库链接key */
export const DB_CONNECT_STORE_KEY = 'db_connect';

/** 数据库查询key */
export const DB_QUERY_STORE_KEY = 'db_query';

/**
 * 支持的数据库方言
 */
export enum DIALECT {
  sqlite = 'sqlite',
  mysql = 'mysql',
}

/**
 * sqlite数据库常用函数
 */
export const SQLITE_FUNCTIONS = [
  {
    name: 'COUNT',
    snippet: 'SELECT COUNT(${1}) FROM ${2:TABLENAME};',
    usage: 'SELECT COUNT(*) FROM tableName;',
    desc: '用于计算一个数据库表中的行数',
  },
  {
    name: 'MAX',
    snippet: 'SELECT MAX(${1}) FROM ${2:TABLENAME};',
    usage: 'SELECT MAX(fieldName) FROM tableName;',
    desc: '用于计算某列的最大值',
  },
  {
    name: 'MIN',
    snippet: 'SELECT MIN(${1}) FROM ${2:TABLENAME};',
    usage: 'SELECT MIN(fieldName) FROM tableName;',
    desc: '用于计算某列的最小值',
  },
  {
    name: 'AVG',
    snippet: 'SELECT AVG(${1}) FROM ${2:TABLENAME};',
    usage: 'SELECT AVG(fieldName) FROM tableName;',
    desc: '用于计算某列的平均值',
  },
  {
    name: 'SUM',
    snippet: 'SELECT SUM(${1}) FROM ${2:TABLENAME};',
    usage: 'SELECT SUM(fieldName) FROM tableName;',
    desc: '用于计算一个数值列的总和',
  },
  {
    name: 'RANDOM',
    snippet: 'SELECT RANDOM() AS Random;',
    usage: 'SELECT RANDOM() AS Random;',
    desc: '用于返回一个介于 -9223372036854775808 和 +9223372036854775807 之间的伪随机整数',
  },
  {
    name: 'ABS',
    snippet: 'SELECT ABS(5);',
    usage: 'SELECT abs(5), abs(-15), abs(NULL), abs(0), abs("ABC");',
    desc: '用于计算数值参数的绝对值',
  },
  {
    name: 'UPPER',
    snippet: 'SELECT UPPER(${1}) FROM ${2:TABLENAME};',
    usage: 'SELECT UPPER(fieldName) FROM tableName;',
    desc: '用于把字符串转换为大写字母',
  },
  {
    name: 'LOWER',
    snippet: 'SELECT LOWER(${1}) FROM ${2:TABLENAME};',
    usage: 'SELECT LOWER(fieldName) FROM tableName;',
    desc: '用于把字符串转换为小写字母',
  },
  {
    name: 'LENGTH',
    snippet: 'SELECT LENGTH(${1}) FROM ${2:TABLENAME};',
    usage: 'SELECT LENGTH(fieldName) FROM tableName;',
    desc: '用于计算字符串的长度',
  },
  {
    name: 'sqlite_version',
    snippet: 'SELECT sqlite_version() AS "${1}";',
    usage: 'SELECT sqlite_version() AS "SQLite Version";',
    desc: '用于返回 SQLite 库的版本',
  },
];

/**
 * mysql数据库常用函数
 */
export const MYSQL_FUNCTIONS = [];
