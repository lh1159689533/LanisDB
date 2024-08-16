import React, { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverProps } from 'antd';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import Copy from '@src/components/Copy';

import './index.less';

interface IBubbleSQL {
  /** sql代码 */
  sql: string;
  placement?: PopoverProps['placement'];
  children: React.ReactNode;
}

/**
 * 将高亮后的sql代码以Bubble的方式展示
 */
export default function BubbleSQL({ sql, placement = 'rightTop', children }: IBubbleSQL) {
  /** 高亮后的sql html字符串 */
  const [hlSql, setHLSql] = useState('');

  /**
   * 使用monaco-editor高亮sql，保持和编辑器一样的高亮样式
   */
  const highlight = async (sql: string) => {
    const hlSql = await editor.colorize(sql, 'sql', { tabSize: 2 });
    setHLSql(hlSql);
  };

  const bubbleContent = useMemo(
    () => (
      <div className="bubble-content">
        <div className="copy">
          <Copy text={sql} />
        </div>
        <div className="sql-container">
          <div className="sql-line-numbers">
            {sql.split('\n')?.map((_, i) => (
              <div className="line-numbers">{i + 1}</div>
            ))}
          </div>
          <div className="sql-content" dangerouslySetInnerHTML={{ __html: hlSql }}></div>
        </div>
      </div>
    ),
    [hlSql, sql]
  );

  useEffect(() => {
    sql && highlight(sql);
  }, [sql]);

  return (
    <Popover
      content={bubbleContent}
      placement={placement}
      overlayClassName="bubble-sql wedata-design-mix scrollbar-small"
    >
      {children}
    </Popover>
  );
}
