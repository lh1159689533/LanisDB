export interface FormatOptions {
  /** 用于缩进的字符,默认2 */
  indent?: string;
  /** 将关键字转换为大写 */
  uppercase?: boolean;
  /** 语句之间有多少换行符 */
  linesBetweenQueries?: number;
  /** 用于占位符替换的参数集合 */
  params?: any;
}

export interface IToken {
  type: string;
  value: string;
}
