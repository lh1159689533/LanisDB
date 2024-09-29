/**
 * 一些公共函数
 */
import { IDialect } from './db/types';

/**
 * 获取查询文件存放路径前面部分
 * @param dialect 数据库方言
 * @param id 查询id
 */
export const getQueryPath = (dialect: IDialect, id: number) => `${dialect}/${id}`;
