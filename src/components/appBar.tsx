import { Box, AppBar, Button } from '@mui/material';
import { IOperateItem } from '@src/types';

interface IAppBar {
  items: IOperateItem[];
}

export default function CusAppBar({ items }: IAppBar) {
  return (
    <AppBar position="relative" color="transparent" sx={{ boxShadow: 'none' }}>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 2,
          py: 1.2,
        }}
      >
        {items.map((item, idx) => (
          <Button
            key={item.key}
            onClick={item.handle}
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
            variant={idx === 0 ? 'contained' : 'outlined'}
            disableElevation
            size="small"
          >
            {item.icon}
            {item.title}
          </Button>
        ))}
      </Box>
    </AppBar>
  );
}
