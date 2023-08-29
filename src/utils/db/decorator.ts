/**
 * 装饰器
 */

/**
 * select查询语句仅支持一个
 */
export function onlyOneSelect(_, __, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (sql, ...args) {
    const newsql = sql.split(';')[0]?.toLowerCase();
    return originalMethod.apply(this, [newsql, ...args]);
  };
  return descriptor;
}

/**
 * 标识select查询
 */
export function select(_, __, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (sql, ...args) {
    if (!sql.startsWith('select')) {
      throw new Error(`${sql}不是一个select语句`);
    }
    return originalMethod.apply(this, [sql, ...args]);
  };
  return descriptor;
}

/**
 * 异常捕获
 */
export function tryCatch(_, __, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args) {
    try {
      return originalMethod.apply(this, args);
    } catch (e) {
      console.error(e);
    }
  };
  return descriptor;
}