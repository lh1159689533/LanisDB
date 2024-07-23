import { useEffect, useRef } from 'react';
import useAppState from './useAppState';
import { ITab } from '@src/types';

export default function useTab(tabKey: string) {
  const [tabs, setTabs] = useAppState<ITab[]>(tabKey);
  const tabsRef = useRef<ITab[]>([]);

  useEffect(() => {
    tabsRef.current = tabs ?? [];
  }, [tabs]);

  const add = (tab: ITab) => {
    const index = tabsRef.current.findIndex(item => item.key === tab.key);
    if (index === -1) {
      tabsRef.current = [...tabsRef.current, tab];
    }
    active(tab.key);
    const tabs = [...tabsRef.current];
    setTabs(tabs);
  };

  const remove = (key: string) => {
    let nextActiveKey = '';
    const index = tabsRef.current.findIndex((item) => item.key === key);
    if (index !== -1 && tabsRef.current[index].active) {
      if (index === 0 && tabsRef.current.length > 1) {
        nextActiveKey = tabsRef.current[index + 1].key;
      } else if (index !== 0) {
        nextActiveKey = tabsRef.current[index - 1].key;
      }
    }
    tabsRef.current = tabsRef.current.filter((item) => item.key !== key);
    active(nextActiveKey);
    setTabs(tabsRef.current);
  };

  const activeTab = (key: string) => {
    active(key);
    setTabs(tabsRef.current);
  };

  const active = (key: string) => {
    if (!key) return;
    const tab: ITab = tabsRef.current.find((item) => item.key === key);
    if (!tab?.active) {
      tabsRef.current.forEach((item) => (item.active = false));
      tab.active = true;
    }
  };

  const clear = () => {
    tabsRef.current = [];
    setTabs(tabsRef.current);
  };

  return {
    add,
    remove,
    active: activeTab,
    clear
  };
}
