import React, { useEffect, useState } from 'react';
import { Input, PopoverProps } from 'antd';
import { CloseIcon } from '@components/icons-lanis';
import Tooltip from './tooltip';
import { ITabData } from './types';

interface ITab {
  data: ITabData;
  /** 当前激活tab id */
  activeId: string;
  /** tab冒泡提示配置，同tea.Bubble */
  bubbleProps?: Omit<PopoverProps, 'content'>;
  /** 是否可编辑tab名称，默认false */
  editable?: boolean;
  /**
   * 点击激活tab
   * @param tabId tab id
   */
  onClick: (tabId: string) => void;
  /**
   * 关闭tab
   * @param tabId tab id
   */
  onClose?: (tabId: string) => void;
  /**
   * 修改tab名称
   * @param tabId tab id
   * @param newName 新名称
   */
  onRename?: (tabId: string, newName: string) => Promise<void>;
  /**
   * 右键菜单事件
   * @param e event
   * @param tabId tab id
   */
  onContextMenu?: (e: React.MouseEvent, tabId: string) => void;
}

export default function Tab({
  data,
  activeId,
  bubbleProps = {},
  editable = false,
  onClick,
  onClose,
  onRename,
  onContextMenu,
}: ITab) {
  const [tabName, setTabName] = useState(data?.title);
  const [editing, setEditing] = useState(false);

  /**
   * 双击触发编辑
   */
  const onDoubleClick = () => {
    editable && setEditing(true);
  };

  /**
   * 失焦后去掉编辑态
   */
  const onBlur = () => {
    setEditing(false);
  };

  /**
   * 回车完成编辑
   * @param value 编辑的值
   */
  const onPressEnter = (e) => {
    onRename(data.id, e.target.value);
    setTabName(e.target.value);
    setEditing(false);
  };

  useEffect(() => {
    data?.title && setTabName(data.title);
  }, [data.title]);

  useEffect(() => {
    activeId && document.getElementById(activeId)?.scrollIntoView();
  }, [activeId]);

  return (
    <Tooltip key={data.id} content={data?.tooltip} bubbleProps={bubbleProps}>
      <li
        id={data.id}
        key={data.id}
        className={`tabs-item ${data.className} ${activeId === data.id ? 'is-active' : ''} ${
          data.disabled ? 'is-disabled' : ''
        }`}
        onClick={() => {
          !data.disabled && onClick(data.id);
        }}
        onContextMenu={(e) => {
          !editing && onContextMenu?.(e, data.id);
        }}
      >
        <span className={`tabs-item__tab ${data?.saved === false ? 'unsave' : 'saved'}`}>
          {data?.icon}
          {tabName && (
            <>
              {editable && editing ? (
                <Input
                  defaultValue={tabName as string}
                  autoFocus
                  onBlur={onBlur}
                  onPressEnter={onPressEnter}
                  style={{ height: '100%' }}
                />
              ) : (
                <span className="title" onDoubleClick={onDoubleClick}>
                  {tabName}
                </span>
              )}
            </>
          )}
          {(data.onClose || onClose) && (
            <span className="close-save_btn">
              <CloseIcon
                size={16}
                className="close_btn"
                onClick={(e) => {
                  e.stopPropagation();
                  (data.onClose ?? onClose)?.(data.id);
                }}
              />
              <span className="tab__unsave"></span>
            </span>
          )}
        </span>
      </li>
    </Tooltip>
  );
}
