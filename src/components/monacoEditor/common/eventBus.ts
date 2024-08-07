export type EventCallback = (...args: any[]) => void;

interface EventList {
  [propName: string]: EventCallback[];
}

class EventBus {
  /** 全局事件 */
  private static globalEventList = new Map<string, any>();

  static set(id: string, callback: any) {
    EventBus.globalEventList.set(id, callback);
  }

  static get(id: string) {
    return EventBus.globalEventList.get(id);
  }

  /** 事件列表 */
  private eventList: EventList;

  constructor() {
    this.eventList = {};
  }

  /**
   * 添加事件监听
   * @param eventName 事件名
   * @param callback 回调
   */
  on(eventName: string, callback: EventCallback) {
    this.eventList[eventName] = this.eventList[eventName] || [];
    this.eventList[eventName].push(callback);
  }

  /**
   * 触发事件
   * @param eventName 事件名
   * @param args 传参
   */
  emit(eventName: string, ...args: any[]) {
    const listeners = this.eventList[eventName] || [];

    listeners.forEach((listener) => {
      listener.apply(null, args);
    });
  }

  /**
   * 取消监听
   * @params eventName 事件名
   */
  off(eventName: string) {
    this.eventList[eventName] = [];
  }

  /**
   * 移除所有事件监听器
   */
  public clear(): void {
    this.eventList = {};
  }

  public getEventList(): EventList {
    return { ...this.eventList };
  }
}

export default EventBus;
