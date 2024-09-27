import { Menu, Item, useContextMenu } from 'react-contexify';
import { forwardRef, ForwardedRef, useImperativeHandle } from 'react';

import './index.less';

export interface IMenu {
  id: string;
  label: React.ReactNode;
  callback?: (tabId?: string) => void;
}

interface IMenuProps {
  id: string;
  menus: IMenu[];
  onMenuClick?: (key: string) => void;
}

function LanisMenu({ id, menus, onMenuClick }: IMenuProps, ref: ForwardedRef<any>) {
  const { show, hideAll } = useContextMenu({ id });

  const handleMenuClick = (item: IMenu) => {
    if (item.callback) {
      item.callback();
    } else {
      onMenuClick?.(item.id);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      show: (event) =>
        show({
          id,
          event,
        }),
    }),
    []
  );

  return (
    <Menu id={id} className="tabs-menu">
      {menus.map((item) => (
        <Item
          key={item.id}
          onClick={() => {
            hideAll();
            handleMenuClick(item);
          }}
          className={item.id.includes('delete') ? 'delete' : ''}
        >
          {item.label}
        </Item>
      ))}
    </Menu>
  );
}

export default forwardRef(LanisMenu);
