import localForage from 'localforage';

class Store {
  instance: typeof localForage;

  constructor(name: string) {
    this.instance = localForage.createInstance({
      name,
      driver: [localForage.INDEXEDDB, localForage.LOCALSTORAGE],
    });
  }

  /**
   * 全量存储
   * @param key 键
   * @param value 值
   */
  setItem<T>(key: string, value: T): Promise<T> {
    return this.instance.setItem<T>(key, value);
  }

  /**
   * 读取所有值
   * @param key 键
   */
  getItem<T>(key: string): Promise<T | null> {
    return this.instance.getItem<T>(key);
  }

  /**
   * 添加值(增量)
   * @param key 键
   * @param value 值
   */
  async addItem<T, K extends T & { id: number }>(key: string, value: T): Promise<K[]> {
    const values = await this.getItem<K[]>(key);
    const index = values.findIndex(item => item.id === (value as any).id);
    if (index !== -1) {
      values.splice(index, 1, value as unknown as K);
      return this.setItem<K[]>(key, values);
    }
    if (!values) {
      return this.setItem<K[]>(key, [{ ...value, id: Date.now() } as K]);
    }
    return this.setItem<K[]>(key, [...values, { ...value, id: Date.now() } as K]);
  }

  /**
   * 根据ID和键唯一确定并删除值
   * @param key 键
   * @param id 唯一ID
   */
  async delItem<T, K extends T & { id: number }>(key: string, id: number): Promise<K[]> {
    const values = await this.getItem<K[]>(key);
    return this.setItem<K[]>(key, values.filter(item => item.id !== id));
  }

  /**
   * 根据key删除值(全量删除)
   * @param key 键
   */
  removeItem(key: string): Promise<void> {
    return this.instance.removeItem(key);
  }
}

export default new Store('sys_db');
