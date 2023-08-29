import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import AppBar from '@src/components/appBar';
import SqlEditor from '@src/components/sqlEditor';
import { IOperateItem } from '@src/types';

interface ISqlQueryEditor {
  current: string;
  value: string;
  height?: number;
}

export default function SqlQueryEditor({ value, current, height }: ISqlQueryEditor) {
  const [sqlEditorHeight, setSqlEditorHeight] = useState(0);

  const tabRef = useRef(null);

  const items: IOperateItem[] = [
    {
      key: 'run',
      title: '执行',
      icon: null,
      handle() {},
    },
    {
      key: 'save',
      title: '保存',
      icon: null,
      handle() {},
    },
    {
      key: 'format',
      title: '格式化',
      icon: null,
      handle() {},
    },
  ];

  useEffect(() => {
    height && setSqlEditorHeight(height - 48);
  }, [height]);

  return (
    <div
      ref={tabRef}
      role="tabpanel"
      hidden={value !== current}
      className="h-full"
    >
      <Box sx={{ p: 0, height: '100%' }}>
        <AppBar items={items} />
        <SqlEditor height={sqlEditorHeight} />
      </Box>
    </div>
  );
}
