import { Box, AppBar } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { IOperateItem } from '@src/types';
import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';

interface IAppBar {
  items: IOperateItem[];
  type?: 'button' | 'icon';
}

export default function CusAppBar({ items, type = 'button' }: IAppBar) {
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    setLoading(
      items.reduce((acc, item) => {
        acc[item.key] = false;
        return acc;
      }, {})
    );
  }, [items]);

  return (
    <AppBar
      position="relative"
      color="transparent"
      sx={{
        boxShadow: 'none',
        borderBottom: '1px solid var(--lanis-db-stroke-color-primary)',
        backgroundColor: 'var(--lanis-db-bg-color-tool-bar)',
      }}
    >
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
        {items.map((item, idx) => {
          if (type === 'button') {
            return (
              <LoadingButton
                key={item.key}
                onClick={async () => {
                  setLoading({ ...loading, [item.key]: true });
                  await item.handle();
                  setLoading({ ...loading, [item.key]: false });
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
                variant={idx === 0 ? 'contained' : 'outlined'}
                disableElevation
                size="small"
                loading={loading?.[item.key]}
              >
                {item.icon}
                {item.title}
              </LoadingButton>
            );
          } else if (type === 'icon') {
            return (
              <Tooltip key={item.key} title={<span className="text-gray-600 text-xs">{item.title}</span>} color="#fff">
                <LoadingButton
                  key={item.key}
                  onClick={async () => {
                    setLoading({ ...loading, [item.key]: true });
                    await item.handle();
                    setLoading({ ...loading, [item.key]: false });
                  }}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '50%',
                    minWidth: 0,
                    width: 28,
                    height: 28,
                    padding: 0,
                  }}
                  disableElevation
                  loading={loading?.[item.key]}
                  color="inherit"
                >
                  <i
                    className="cursor-pointer w-full h-full flex justify-center items-center lanis-icon"
                    style={{ fontSize: 15 }}
                  >
                    {item.icon}
                  </i>
                </LoadingButton>
              </Tooltip>
            );
          }
        })}
      </Box>
    </AppBar>
  );
}
