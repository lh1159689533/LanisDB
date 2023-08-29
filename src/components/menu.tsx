import { MenuList, MenuItem, Popper, Grow, Paper, ClickAwayListener } from '@mui/material';

export interface IMenu {
  key: string;
  title: React.ReactNode;
  handle?: () => void;
}

interface IMenuProps {
  open: boolean;
  anchorEl: HTMLElement;
  menus: IMenu[];
  onClose: () => void;
  onMenuClick?: (key: string) => void;
}

export default function LanisMenu({ open, anchorEl, menus, onClose, onMenuClick }: IMenuProps) {
  const handleMenuClick = (item: IMenu) => {
    if (item.handle) {
      item.handle();
    } else {
      onMenuClick?.(item.key);
    }
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
      sx={{
        zIndex: 1,
      }}
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
          }}
        >
          <Paper elevation={6}>
            <ClickAwayListener onClickAway={onClose}>
              <MenuList aria-labelledby="composition-button">
                {menus.map((item) => (
                  <MenuItem key={item.key} onClick={() => handleMenuClick(item)}>
                    {item.title}
                  </MenuItem>
                ))}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
}
