import React from 'react';
import { Popover, PopoverProps } from 'antd';
import { ITabData } from './types';

interface TooltipProps {
  children?: React.ReactNode;
  content: ITabData['tooltip'];
  bubbleProps: PopoverProps;
}

export default function Tooltip({ children, content, bubbleProps }: TooltipProps) {
  if (!content) {
    return <>{children}</>;
  }
  if (typeof content === 'function') {
    return <>{content(children, bubbleProps)}</>;
  }
  return (
    <Popover content={content} className="wedata-design-mix" {...bubbleProps}>
      {children}
    </Popover>
  );
}
