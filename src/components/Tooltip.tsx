import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

// 显示时有抖动，select也有这个问题
const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: '#4b5563',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));


type ITooltip = TooltipProps & {
  theme?: 'dark' | 'light';
  children: React.ReactNode;
};

export default function ({ theme = 'dark', children, ...props }: ITooltip) {
  return theme === 'light' ? (
    <LightTooltip {...props}>{children}</LightTooltip>
  ) : (
    <Tooltip {...props}>{children}</Tooltip>
  );
}
