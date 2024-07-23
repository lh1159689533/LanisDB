import { useEffect, useState } from 'react';
import { Box, Tab } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import { CloseOutlined } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import useTab from '@hooks/useTab';
import { Tooltip } from 'antd';
import { tabComponents } from './components';
import { ITab } from '@src/types';

interface ITabProps {
  tabs: ITab[];
  tabKey: string; // 同一组tab必须相同
  height?: number;
}

const StyledTabList = styled(TabList)(() => ({
  '.MuiTabs-flexContainer': {
    minHeight: 32,
  },
  '.MuiTabs-indicator': {
    top: 0,
    height: 1.5,
    backgroundColor: 'var(--lanis-db-primary-color)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  '&.MuiButtonBase-root': {
    marginLeft: 0,
    minHeight: 32,
    maxWidth: 160,
    paddingTop: theme.spacing(1.2),
    paddingBottom: theme.spacing(1.2),
    textTransform: 'none',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    borderRight: '1px solid #e5e7eb',
    '&:nth-of-type(1)': {
      borderLeft: '1px solid #e5e7eb',
      borderRight: '1px solid #e5e7eb',
    },
    '& .MuiSvgIcon-root': {
      marginBottom: 0,
      fontSize: '0.9rem',
    },
    '&.nosave .MuiSvgIcon-root': {
      marginBottom: 0,
      fontSize: '.5rem',
      color: 'transparent',
      backgroundColor: '#6b7280',
      borderRadius: '50%',
      marginRight: 2,
      '&:hover': {
        color: 'inherit',
        backgroundColor: 'transparent',
        fontSize: '.9rem',
        marginRight: 0,
      },
    },
    '&.Mui-selected': {
      color: '#333',
      backgroundColor: '#fff',
    },
    '&.Mui-selected.nosave .MuiSvgIcon-root': {
      backgroundColor: '#6366f1',
      marginBottom: 0,
      fontSize: '0.5rem',
      '&:hover': {
        color: 'inherit',
        backgroundColor: 'transparent',
        fontSize: '0.9rem',
      },
    },
  },
}));

export default function LTabs({ tabs, tabKey, height }: ITabProps) {
  const [value, setValue] = useState('');

  const tab = useTab(tabKey);

  const handleChange = (_, newValue: string) => {
    tab.active(newValue);
    setValue(newValue);
  };

  useEffect(() => {
    if (tabs?.length) {
      const activeTab = tabs.find((tab) => tab.active);
      setValue(activeTab?.key);
    }
  }, [tabs]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {tabs?.length && value ? (
        <TabContext value={value}>
          <Box sx={{ borderColor: 'divider' }}>
            <StyledTabList
              onChange={handleChange}
              sx={{ minHeight: 32, bgcolor: 'var(--lanis-db-bg-color-tab-bar)' }}
              aria-label="tabs"
              variant="scrollable"
              visibleScrollbar
            >
              {tabs.map((tab) => (
                <StyledTab
                  key={tab.key}
                  label={
                    <Tooltip
                      title={<span className="text-gray-600 text-xs">{tab.title}</span>}
                      arrow={false}
                      color="#fff"
                    >
                      <span className="truncate">{tab.title}</span>
                    </Tooltip>
                  }
                  value={tab.key}
                  icon={
                    <CloseOutlined
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        tab.onClose?.(tab.key);
                      }}
                    />
                  }
                  className={`${tab.saved ? '' : 'nosave'}`}
                />
              ))}
            </StyledTabList>
          </Box>
          <div style={{ height: 'calc(100% - 36px)' }} className="bg-white">
            {tabs.map((tab) => {
              const Module = tabComponents[tab.comp];
              return (
                Module && (
                  <Module key={tab.key} current={value} value={tab.key} height={height - 36} {...(tab.params ?? {})} />
                )
              );
            })}
          </div>
        </TabContext>
      ) : null}
    </div>
  );
}
