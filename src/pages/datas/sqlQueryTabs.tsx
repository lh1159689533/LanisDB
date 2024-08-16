import { useEffect, useState, useRef } from 'react';
import Tabs, { ITabData, TabContent } from '@src/components/Tabs';
import SqlQueryEditor from '@src/pages/datas/sqlQueryEditor';
import useTab from '@hooks/useTab';
import LanisMenu from '@src/components/Menu';

interface SqlQueryTabs {
  tabs: ITabData[];
}

export default function SqlQueryTabs({ tabs }: SqlQueryTabs) {
  const [activeId, setActiveId] = useState('');
  const [currentTabId, setCurrentTabId] = useState('');

  const menuRef = useRef(null);

  const tab = useTab('sqlQuery');

  const onTabClick = (tabId: string) => {
    tab.active(tabId);
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
        activeId={tabs?.find((tab) => tab.active)?.id}
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
            <SqlQueryEditor key={tab.id} tabId={tab.id} tabName={tab.title as string} {...(tab.params ?? {})} />
          </TabContent>
        ))}
      </Tabs>
      <LanisMenu id="sql_tabs__rightmenu" ref={menuRef} menus={getMenuList(currentTabId)} />
    </>
  );
}
