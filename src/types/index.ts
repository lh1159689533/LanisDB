export interface IOperateItem {
  key: string;
  title: string;
  icon?: React.ReactNode;
  loading?: boolean;
  handle?: () => void;
}

export interface IPage {
  current: number;
  size: number;
  total?: number;
}
