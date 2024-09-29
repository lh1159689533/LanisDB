import { useEffect, useState } from 'react';
import Tabs, { ITabData, TabContent } from '@src/components/Tabs';
import SqlQueryEditor from '@src/pages/datas/sqlQueryEditor';
import useTab from '@hooks/useTab';
import UnSaveTip from '@src/components/Tabs/unSaveTip';

interface SqlQueryTabs {
  tabs: ITabData[];
}

export default function SqlQueryTabs({ tabs }: SqlQueryTabs) {
  const [activeId, setActiveId] = useState('');
  const [currentTabId, setCurrentTabId] = useState('');

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
  const onTabContextMenu = (tabId: string) => {
    setCurrentTabId(tabId);
  };

  useEffect(() => {
    if (tabs) {
      setActiveId(tabs.find((item) => item.active)?.id);
    }
  }, [tabs]);

  return tabs?.length ? (
    <>
      <Tabs
        activeId={tabs?.find((tab) => tab.active)?.id}
        tabs={tabs}
        contextMenu={{ id: 'sql_tabs__rightmenu', menus: getMenuList(currentTabId) }}
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
      <UnSaveTip />
    </>
  ) : null;
}
