import { PopoverProps } from 'antd';

export interface ITabData {
  id: string;
  title?: React.ReactNode;
  /** title前的icon，使用ruyi icon */
  icon?: React.ReactNode;
  className?: string;
  /** 提示信息，默认title */
  tooltip?:
    | React.ReactNode
    | ((children: React.ReactNode, bubbleProps?: Omit<PopoverProps, 'content'>) => React.ReactNode);
  /** 业务数据 */
  params?: { [key: string]: any };
  /** 禁止点击 */
  disabled?: boolean;
  /** 是否冻结（冻结在左侧，不参与滚动） */
  isFreeze?: boolean;
  /** 不在更多下拉中显示 */
  hideInMore?: boolean;
  active?: boolean;
  /** 是否保存,默认true */
  saved?: boolean;
  /** 关闭 */
  onClose?: (tabId: string) => void;
  /** 保存 */
  onSave?: (tabId: string) => void;
}
