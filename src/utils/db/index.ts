import { invoke } from '@tauri-apps/api';
import { select, onlyOneSelect, tryCatch } from './decorator';
import {
  IMysqlDBProps,
  IDBProps,
  IQueryResult,
  ITableColumnsDetail,
  IMysqlTableColumnsDetail,
  ISelectResult,
} from './types';

import { patternTableNameBySql, getDBUrl, getTableColumnsSql, getCountSql, isSelectSql } from './utils';

class DB {
  private props: IDBProps;
  private prefix: string;
  private url: string;

  constructor(props: IDBProps) {
    this.props = props;
    this.prefix = '';

    this.prefix = `${this.props.dialect}_`;
    this.url = getDBUrl(props);
  }

  static async load(props: IDBProps): Promise<DB> {
    const url = getDBUrl(props);
    await invoke(`${props.dialect}_load`, { url });
    return new DB(props);
  }

  /**
   * 查询所有表
   */
  @tryCatch
  getTables(): Promise<any[]> {
    let sql = '';
    if (this.props.dialect === 'mysql') {
      const database = (this.props as IMysqlDBProps).database;
      if (!database) throw new Error('mysql数据库查询未指定database');
      sql = `select table_name as name, table_type as type from information_schema.tables where table_schema="${database}" order by table_name`;
    } else {
      sql = 'select name from sqlite_master where type = "table" order by name';
    }

    return this.select(sql, false) as Promise<any[]>;
  }

  @tryCatch
  async getCreateSql(tableName: string, tableType: 'view' | 'table' = 'table') {
    let createSql: string;
    if (this.props.dialect === 'mysql') {
      const result = await this.select(`show create ${tableType} ${tableName}`, false);
      console.log('result:', result);
      const key = tableType === 'table' ? 'Create Table' : 'Create View';
      createSql = result?.[0]?.[key];
    } else {
      const result = await this.select(
        `select sql from sqlite_master where type = "table" and name='${tableName}'`,
        false
      );
      createSql = result?.[0]?.sql;
    }
    return createSql;
  }

  /**
   * 加载
   */
  async load() {
    await invoke(`${this.prefix}load`, { url: this.url });
  }

  async reload(props: Partial<IDBProps>): Promise<boolean> {
    await this.close(); // 关闭原连接
    this.props = { ...this.props, ...props };
    this.prefix = `${this.props.dialect}_`;
    this.url = getDBUrl(this.props); // 重新获取url

    return await invoke<boolean>(`${this.prefix}load`, { url: this.url });
  }

  /**
   * 查询表字段名称集合
   * @param tableName 表名
   */
  async selectTableColumns(tableName: string): Promise<string[]> {
    const invokeKey = `${this.prefix}select`;
    const columns = await invoke<any[]>(invokeKey, {
      url: this.url,
      query: getTableColumnsSql(tableName, this.props.dialect, (this.props as IMysqlDBProps).database),
    });

    return columns?.map((item) => item.name);
  }

  /**
   * select查询并统计总数据条数
   * @param sql sql语句
   */
  @select
  @onlyOneSelect
  @tryCatch
  async selectAndCount(sql: string): Promise<ISelectResult> {
    const tableName = patternTableNameBySql(sql);

    if (tableName) {
      const invokeKey = `${this.prefix}select`;
      const countResult = await invoke(invokeKey, {
        url: this.url,
        query: getCountSql(sql, tableName),
      });
      const total = countResult?.[0]?.total;

      // const columns = await this.selectTableColumns(invokeKey, tableName);
      const columns = await this.tableColumnsDetail(tableName);

      return {
        columns,
        data: await invoke(invokeKey, { url: this.url, query: sql }),
        total,
      };
    }
  }

  /**
   * select查询
   * @param sql sql语句
   */
  @onlyOneSelect
  @tryCatch
  async select(sql: string, hasColumns = true): Promise<any[] | ISelectResult> {
    const invokeKey = `${this.prefix}select`;
    if (hasColumns) {
      const columns = await this.tableColumnsDetail(patternTableNameBySql(sql));
      const data = await invoke<any[]>(invokeKey, {
        url: this.url,
        query: sql,
      });
      return {
        data,
        columns,
      };
    }
    return invoke<any[]>(invokeKey, { url: this.url, query: sql });
  }

  /**
   * 执行sql
   * @param sql sql语句
   */
  private async executeSql(sql: string): Promise<IQueryResult> {
    const [rowsAffected, lastInsertId] = await invoke<[number, number]>(`${this.prefix}execute`, {
      url: this.url,
      query: sql,
    });
    return { rowsAffected, lastInsertId };
  }

  /**
   * sql查询
   * @param sql sql语句，多条分号分隔
   */
  @tryCatch
  execute(sql: string): Promise<any[] | ISelectResult[]> {
    const sqlList = sql.split(';');
    const promises = [];
    sqlList.filter(item => !!item).forEach((s) => {
      if (isSelectSql(s)) {
        promises.push(this.select(s));
      } else {
        promises.push(this.executeSql(s));
      }
    });

    return Promise.all(promises);
  }

  /**
   * 查询sqlite表字段详情
   * @param tableName 表名
   */
  private async tableColumnsDetail_sqlite(tableName: string): Promise<ITableColumnsDetail[]> {
    const result = (await this.select(getTableColumnsSql(tableName, 'sqlite'), false)) as any[];
    if (result?.length) {
      return result.map(({ name, dflt_value, notnull, pk, type }) => ({
        name,
        defaultValue: dflt_value,
        notNull: notnull === 1,
        primaryKey: pk === 1,
        type,
      }));
    }
    return null;
  }

  /**
   * 查询mysql表字段详情
   * @param tableName 表名
   */
  private async tableColumnsDetail_mysql(tableName: string): Promise<IMysqlTableColumnsDetail[]> {
    const result = (await this.select(
      getTableColumnsSql(tableName, 'mysql', (this.props as IMysqlDBProps).database),
      false
    )) as any[];
    if (result?.length) {
      return result.map(
        ({ name, defaultValue, notNull, characterName, type, collationName, columnComment, columnKey }) => ({
          name,
          defaultValue,
          notNull: notNull === 'YES',
          primaryKey: columnKey === 'PRI',
          type,
          columnComment,
          characterName,
          collationName,
        })
      );
    }
    return null;
  }

  /**
   * 查询表字段详情
   * @param tableName 表名
   */
  @tryCatch
  tableColumnsDetail(tableName: string): Promise<IMysqlTableColumnsDetail[]> {
    const { dialect } = this.props;
    if (dialect === 'mysql') {
      return this.tableColumnsDetail_mysql(tableName);
    } else {
      return this.tableColumnsDetail_sqlite(tableName);
    }
  }

  /**
   * 关闭连接
   */
  @tryCatch
  close(): Promise<boolean> {
    return invoke<boolean>(`${this.prefix}close`, { url: this.url });
  }
}

export default DB;
