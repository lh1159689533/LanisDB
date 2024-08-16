import React, { useState, useMemo } from 'react';
import { Dropdown, List } from 'antd';
import { InputBase, Paper } from '@mui/material';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ITabData } from './types';
import Tab from './tab';

interface IMoreTabs {
  /** tab */
  tabs: ITabData[];
  /** 当前激活tab id */
  activeId: string;
  style?: React.CSSProperties;
  className?: string;
  boxStyle?: React.CSSProperties;
  boxClassName?: string;
  /**
   * 点击激活tab
   * @param tabId tab id
   */
  onClick?: (tabId: string) => void;
  /**
   * 关闭tab
   * @param tabId tab id
   */
  onClose?: (tabId: string) => void;
}

export default function More({
  tabs,
  activeId,
  boxStyle = {},
  style = {},
  boxClassName = '',
  className,
  onClick,
  onClose,
}: IMoreTabs) {
  const [searchTabsKey, setSearchTabsKey] = useState('');

  const showTabs = useMemo(() => tabs.filter((tab) => `${tab.title}`.includes(searchTabsKey)), [tabs, searchTabsKey]);

  const onChange = (e) => {
    setSearchTabsKey(e.target.value);
  };

  return (
    <div className={`tabs-more ${className}`} style={style}>
      <Dropdown
        className="more-dropdown"
        overlayClassName={`${boxClassName} tabs-more-container`}
        overlayStyle={{ width: 200, borderRadius: 0, ...boxStyle }}
        trigger={['click']}
        dropdownRender={() => (
          <>
            <Paper variant="outlined" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
              <InputBase
                value={searchTabsKey}
                sx={{ ml: 1, flex: 1, fontSize: 13 }}
                placeholder="请输入名称搜索"
                inputProps={{ 'aria-label': '请输入名称搜索' }}
                size="small"
                onChange={onChange}
              />
            </Paper>
            <List.Item>
              {showTabs.map((item) => (
                <Tab
                  key={item.id}
                  data={item}
                  activeId={activeId}
                  bubbleProps={{ placement: 'left' }}
                  onClose={onClose}
                  onClick={(tabId) => {
                    onClick(tabId);
                  }}
                />
              ))}
            </List.Item>
          </>
        )}
      >
        <ArrowDownIcon sx={{ cursor: 'pointer' }} />
      </Dropdown>
    </div>
  );
}
