import React, { useMemo, useState } from 'react';
import { Popover } from 'antd';
import copy from 'copy-to-clipboard';

export interface ICopy {
  /** 复制内容 */
  text: string;
  /** 默认Bubble提示信息 */
  tips?: string;
  /** 成功时Bubble提示信息 */
  successTips?: string;
  /** 失败时Bubble提示信息 */
  errorTips?: string;
  /** 子节点，默认为复制按钮 */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** 复制回调事件 */
  onCopy?: (success: boolean) => void;
}

/**
 * 自定义Copy组件：可自定义失败、成功的提示信息；支持深浅主题
 */
export default function Copy({
  text,
  tips = '复制',
  successTips = '复制成功',
  errorTips = '复制失败',
  children,
  className,
  style,
  onCopy: onCopyCb,
}: ICopy) {
  const [status, setStatus] = useState<'success' | 'failed' | ''>('');

  const message = useMemo(() => {
    if (status === 'success') {
      return successTips;
    }
    if (status === 'failed') {
      return errorTips;
    }
    return tips;
  }, [status]);

  const onCopy = () => {
    const isSuccess = copy(text);
    setStatus(isSuccess ? 'success' : 'failed');
    onCopyCb?.(isSuccess);
  };

  const onMouseOut = () => {
    setTimeout(() => setStatus(''), 300);
  };

  return (
    <span
      onClick={onCopy}
      onMouseOut={onMouseOut}
      className={className}
      style={{ display: 'inline-flex', ...(style ?? {}) }}
    >
      <Popover content={message} className="wedata-design-mix" placement="top">
        {children ? (
          children
        ) : (
          <svg width="1em" height="1em" viewBox="0 0 16 16" style={{ cursor: 'pointer' }}>
            <g fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11 1H2.5C1.67157 1 1 1.67157 1 2.5V11H2L2 2.5C2 2.22386 2.22386 2 2.5 2L11 2V1ZM4 4H13V13H4L4 4ZM3 4C3 3.44772 3.44772 3 4 3H13C13.5523 3 14 3.44772 14 4V13C14 13.5523 13.5523 14 13 14H4C3.44772 14 3 13.5523 3 13V4Z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        )}
      </Popover>
    </span>
  );
}
