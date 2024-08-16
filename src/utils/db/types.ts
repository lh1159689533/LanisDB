import { DIALECT } from '@src/constant';

// 方言
export type IDialect = keyof typeof DIALECT;

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

// 表详情
export interface ITableColumnsDetail {
  name: string;
  defaultValue: any;
  notNull: boolean;
  primaryKey: boolean;
  type: string;
}

// mysql表详情
export interface IMysqlTableColumnsDetail extends ITableColumnsDetail {
  columnComment?: string;
  characterName?: string;
  collationName?: string;
}

// select查询结果
export interface ISelectResult {
  columns: IMysqlTableColumnsDetail[];
  data: any[];
  total?: number;
}

// DB构造参数
export type IDBProps = ISqliteDBProps | IMysqlDBProps;
