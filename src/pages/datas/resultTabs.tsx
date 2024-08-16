import { useState, useEffect, useRef } from 'react';
import Tabs, { TabContent } from '@src/components/Tabs';
import SqlQueryResult from '@src/pages/datas/sqlQueryResult';
import useTab from '@hooks/useTab';
import LanisMenu from '@src/components/Menu';

export default function ResultTabs({ tabs, height }) {
  const [activeId, setActiveId] = useState(tabs?.[0]?.id);
  const [currentTabId, setCurrentTabId] = useState('');

  const menuRef = useRef(null);

  const tab = useTab('sqlQueryResult');

  const onTabClick = (tabId: string) => {
    setActiveId(tabId);
  };

  const getMenuList = (tabId: string) => {
    const total = tabs.length;
    const index = tabs.findIndex((item) => item.id === tabId);

    const menus = [{ id: 'sq-close-current', label: '关闭', callback: () => tab.close(tabId) }];

    if (total > 1) {
      menus.push(
        ...[
          { id: 'sq-close-other', label: '关闭其他', callback: () => tab.closeOther(tabId) },
          { id: 'sq-close-all', label: '关闭全部', callback: () => tab.clear() },
        ]
      );
    }
    if (index !== total - 1 && total > 1) {
      menus.push({ id: 'sq-close-right', label: '关闭右侧', callback: () => tab.closeRight(tabId) });
    }
    if (index !== 0 && total > 1) {
      menus.push({ id: 'sq-close-left', label: '关闭左侧', callback: () => tab.closeLeft(tabId) });
    }

    return menus;
  };

  /**
   * tab右键菜单事件
   */
  const onTabContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setCurrentTabId(tabId);
    menuRef.current?.show(e);
  };

  useEffect(() => {
    if (tabs) {
      setActiveId(tabs.find((item) => item.active)?.id);
    }
  }, [tabs]);

  return (
    <>
      <Tabs
        activeId={activeId || tabs?.[0]?.id}
        tabs={tabs}
        boxClassName="wedata-design-mix"
        onTabClick={onTabClick}
        onTabContextMenu={onTabContextMenu}
      >
        {tabs.map((tab, index) => (
          <TabContent
            tabId={tab.id}
            activeId={activeId ?? tabs?.[0]?.id}
            forceRender={index < 10}
            destroyInactiveTabContent={tabs.length > 20}
            key={tab.id}
          >
            <SqlQueryResult height={height - 36} {...(tab.params ?? {})} />
          </TabContent>
        ))}
      </Tabs>
      <LanisMenu id="result_tabs__rightmenu" ref={menuRef} menus={getMenuList(currentTabId)} />
    </>
  );
}