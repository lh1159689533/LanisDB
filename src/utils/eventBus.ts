export type EventCallback = (...args: any[]) => void;

interface EventList {
  [propName: string]: EventCallback[];
}

const EventBus = {
  eventList: [],

  /**
   * 添加事件监听
   * @param eventName 事件名
   * @param callback 回调
   */
  on(eventName: number | string, callback: EventCallback) {
    this.eventList[eventName] = this.eventList[eventName] || [];
    this.eventList[eventName].push(callback);
  },

  /**
   * 触发事件
   * @param eventName 事件名
   * @param args 传参
   */
  emit(eventName: number | string, ...args: any[]) {
    const listeners = this.eventList[eventName] || [];

    listeners.forEach((listener) => {
      listener.apply(null, args);
    });
  },

  /**
   * 取消监听
   * @params eventName 事件名
   */
  off(eventName: number | string) {
    this.eventList[eventName] = [];
  },

  /**
   * 移除所有事件监听器
   */
  clear(): void {
    this.eventList = {};
  },

  getEventList(): EventList {
    return { ...this.eventList };
  },
};

export default EventBus;
