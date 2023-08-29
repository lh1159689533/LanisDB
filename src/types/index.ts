import { ITabComponents } from '@components/tabs/components';

export interface IOperateItem {
  key: string;
  title: string;
  icon?: React.ReactNode;
  handle?: () => void;
}

export interface ITab {
  key: string;
  title: string;
  icon?: React.ReactNode;
  saved?: boolean;
  active?: boolean;
  comp: ITabComponents;
  params?: any;
  onClose: (key: string, title?: string) => void;
}

export interface IPage {
  current: number;
  size: number;
  total?: number;
}
