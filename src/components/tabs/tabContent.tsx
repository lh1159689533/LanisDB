import React, { useEffect, useMemo, useState } from 'react';

interface ITabContent {
  /** 激活的页签ID */
  activeId: string;
  /** 页签的数据 */
  tabId: string;
  /** 是否强制渲染，默认false */
  forceRender?: boolean;
  /** 是否在切换时销毁未激活的TabContent，默认true */
  destroyInactiveTabContent?: boolean;
  /** 子节点 */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function TabContent({
  activeId,
  tabId,
  forceRender = false,
  destroyInactiveTabContent = true,
  children,
  style = {},
  className = '',
}: ITabContent) {
  // 已激活的页签ID列表
  const [activeIds, setActiveIds] = useState([activeId]);

  // 是否渲染当前页签
  const isRender = useMemo(() => {
    // 如果强制渲染或当前激活页签，则渲染
    if (forceRender || activeId === tabId) {
      return true;
    }
    // 如果切换时不销毁且已激活过的页签，则渲染
    return !destroyInactiveTabContent && activeIds.includes(tabId);
  }, [activeIds, forceRender, destroyInactiveTabContent, tabId]);

  useEffect(() => {
    if (activeId) {
      setActiveIds(activeIds.concat(activeId));
    }
  }, [activeId]);

  return (
    <div
      style={
        activeId !== tabId
          ? { transform: 'translateX(-999em)', position: 'absolute' }
          : { transform: 'translateX(0)', height: '100%', width: '100%', ...style }
      }
      className={className}
      key={tabId}
    >
      {isRender && children}
    </div>
  );
}
