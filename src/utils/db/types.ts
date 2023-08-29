// 方言
export type IDialect = 'mysql' | 'sqlite' | 'sysdb';

// sqlite数据库DB构造参数
export interface ISqliteDBProps {
  dialect: IDialect;
  storage?: string;
}

// mysql数据库DB构造参数
export interface IMysqlDBProps {
  dialect: IDialect;
  username: string;
  password: string;
  host: string;
  port: number;
  database?: string;
}

// 执行sql结果
export interface IQueryResult {
  rowsAffected: number; // 影响的行数
  lastInsertId: number; // 最新insert ID
}

// sqlite表详情
export interface ISqliteTableDetail {
  name: string;
  defaultValue: any;
  notNull: boolean;
  primaryKey: boolean;
  type: string;
}

// mysql表详情
export interface IMysqlTableDetail {
  name: string;
  defaultValue: any;
  notNull: boolean;
  primaryKey: boolean;
  type: string;
  columnComment: string;
  characterName: string;
  collationName: string;
}

// select查询结果
export interface ISelectResult {
  columns: string[];
  data: any[];
  total?: number;
}

// DB构造参数
export type IDBProps = ISqliteDBProps | IMysqlDBProps;

// 表详情
export type ITableDetail = ISqliteTableDetail | IMysqlTableDetail;
