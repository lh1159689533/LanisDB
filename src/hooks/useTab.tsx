import { useEffect, useRef } from 'react';
import { cloneDeep } from 'lodash';
import useAppState from './useAppState';
import { ITabData } from '@src/components/Tabs/types';

export default function useTab(tabKey: string) {
  const [tabs, setTabs] = useAppState<ITabData[]>(tabKey);
  const tabsRef = useRef<ITabData[]>([]);

  useEffect(() => {
    tabsRef.current = tabs ?? [];
  }, [tabs]);

  /**
   * 新增
   * @param tab 页签数据
   */
  const add = (tab: ITabData) => {
    const index = tabsRef.current.findIndex((item) => item.id === tab.id);
    if (index === -1) {
      tabsRef.current.push(tab);
    }
    active(tab.id);
    setTabs([...tabsRef.current]);
  };

  const activeTab = (id: string) => {
    active(id);
    setTabs(cloneDeep(tabsRef.current));
  };

  /**
   * 激活
   * @param id 页签ID
   */
  const active = (id: string) => {
    if (!id) return;
    const tab: ITabData = tabsRef.current.find((item) => item.id === id);
    if (!tab?.active) {
      tabsRef.current.forEach((item) => (item.active = false));
      tab.active = true;
    }
  };

  /**
   * 关闭当前
   * @param id 当前ID
   */
  const close = (id: string) => {
    const tabList = cloneDeep(tabsRef.current);
    const index = tabList.findIndex((item) => item.id === id);
    const tabs = tabList.filter((item) => item.id !== id);
    if (tabList[index]?.active) {
      const activeIndex = index - 1 < 0 ? index : index - 1;
      tabs[activeIndex] && (tabs[activeIndex].active = true);
    }
    setTabs(tabs);
  };

  /**
   * 关闭其他
   * @param id 当前ID
   */
  const closeOther = (id: string) => {
    const tab = tabsRef.current.find((item) => item.id === id);
    setTabs([{ ...tab, active: true }]);
  };

  /**
   * 关闭左侧
   * @param id 当前ID
   */
  const closeLeft = (id: string) => {
    const tabList = cloneDeep(tabsRef.current);
    const index = tabList.findIndex((item) => item.id === id);
    const tabs = tabList.filter((_, idx) => idx >= index);
    const activeIndex = tabList.findIndex((item) => item.active);
    if (activeIndex < index) {
      tabs[0].active = true;
    } else {
      tabs[activeIndex - index].active = true;
    }
    setTabs(tabs);
  };

  /**
   * 关闭右侧
   * @param id 当前ID
   */
  const closeRight = (id: string) => {
    const tabList = cloneDeep(tabsRef.current);
    const index = tabList.findIndex((item) => item.id === id);
    const tabs = tabList.filter((_, idx) => idx <= index);
    const activeIndex = tabList.findIndex((item) => item.active);
    if (activeIndex > index) {
      tabs[tabs.length - 1].active = true;
    }
    setTabs(tabs);
  };

  /**
   * 删除全部
   */
  const clear = () => {
    tabsRef.current = [];
    setTabs(tabsRef.current);
  };

  /**
   * 更新
   * @param id 页签ID
   * @param updateData 更新的数据
   */
  const update = (id: string, updateData: Partial<Omit<ITabData, 'id'>>) => {
    if (!id && !updateData) return;
    const tabs = cloneDeep(tabsRef.current);
    const index = tabs.findIndex((item) => item.id === id);
    if (index !== -1) {
      const tab = tabs[index];
      tabs.splice(index, 1, { ...tab, ...updateData });
      setTabs(tabs);
    }
  };

  return {
    add,
    active: activeTab,
    clear,
    close,
    closeOther,
    closeLeft,
    closeRight,
    update,
  };
}
