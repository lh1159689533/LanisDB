import React, { useMemo, useRef } from 'react';
import { PopoverProps } from 'antd';
import LanisMenu from '@src/components/Menu';
import Tab from './tab';
import More from './more';
import { ITabData } from './types';

import './index.less';

export * from './types';
export { default as Tab } from './tab';
export { default as TabContent } from './tabContent';

interface IMenu {
  id: string;
  label: string;
  callback: (tabId: string) => void;
}

interface IOperate {
  id: string;
  icon: any;
  callback: () => void;
}

interface ITabs {
  /** 当前激活tab id */
  activeId: ITabData['id'];
  /** tab */
  tabs: ITabData[];
  style?: React.CSSProperties;
  className?: string;
  /** tab bar的className */
  tabClassName?: string;
  /** 更多下拉className */
  boxClassName?: string;
  /** 操作 */
  operates?: IOperate[];
  /** 右键菜单 */
  menus?: IMenu[];
  contextMenu?: { id: string; menus: IMenu[] };
  /** tab bar Bubble提示配置 */
  bubbleProps?: Omit<PopoverProps, 'content'>;
  /** 是否可编辑tab名称，默认false */
  editable?: boolean;
  children?: React.ReactNode | ((activeId: string) => React.ReactNode);
  /**
   * 关闭tab
   * @param tabId tab id
   */
  onTabClose?: (tabId: string) => void;
  /**
   * 点击激活tab
   * @param tabId tab id
   */
  onTabClick: (tabId: string) => void;
  /**
   * 修改tab名称
   * @param tabId tab id
   * @param newName 新名称
   */
  onTabRename?: (tabId: string, newName: string) => Promise<void>;
  onTabContextMenu?: (tabId: string) => void;
}

/**
 * 数据探索运行记录，以tab的形式展示，包括查询记录列表、子查询记录详情
 */
export default function Tabs({
  activeId,
  tabs,
  style,
  className = '',
  tabClassName = '',
  boxClassName = '',
  children,
  operates,
  contextMenu,
  bubbleProps,
  editable = false,
  onTabRename,
  onTabClose,
  onTabClick,
  onTabContextMenu,
}: ITabs) {
  /** 更多下拉 */
  const moreTabs = useMemo(() => tabs.filter((item) => !item.hideInMore), [tabs]);

  const menuRef = useRef(null);

  /**
   * tab右键菜单事件
   */
  const onContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    menuRef.current?.show(e);
    onTabContextMenu?.(tabId);
  };

  return (
    <>
      <div className={`${className ?? ''} tabs-container`} style={{ height: '100%', ...style }}>
        <div className={`tabs-bar ${tabClassName} scrollbar-small`}>
          <ul className="tabs-bar__freeze-list">
            {tabs
              .filter((item) => item.isFreeze)
              .map((tab) => (
                <Tab
                  data={tab}
                  activeId={activeId}
                  key={tab.id}
                  bubbleProps={bubbleProps}
                  onClose={onTabClose}
                  onClick={onTabClick}
                  onRename={onTabRename}
                  onContextMenu={onContextMenu}
                />
              ))}
          </ul>
          <ul className="tabs-bar-list">
            {tabs
              .filter((item) => !item.isFreeze)
              .map((tab) => (
                <Tab
                  data={tab}
                  activeId={activeId}
                  key={tab.id}
                  bubbleProps={bubbleProps}
                  editable={editable}
                  onClose={onTabClose}
                  onClick={onTabClick}
                  onRename={onTabRename}
                  onContextMenu={onContextMenu}
                />
              ))}
          </ul>
          <div className="tabs-addon">
            {moreTabs?.length ? (
              <>
                <span className="separator"></span>
                <More
                  tabs={moreTabs}
                  activeId={activeId}
                  onClick={onTabClick}
                  onClose={onTabClose}
                  boxClassName={boxClassName}
                />
              </>
            ) : null}
            {operates?.length ? (
              <>
                <span className="separator"></span>
                <div className="tabs-operate">
                  {operates.map((item) => (
                    <span key={item.id} className="tabs-operate-item" onClick={item.callback}>
                      {item.icon}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
        <div className="tabs-content">{children instanceof Function ? children(activeId) : children}</div>
      </div>
      <LanisMenu id={contextMenu.id} ref={menuRef} menus={contextMenu.menus} />
    </>
  );
}
