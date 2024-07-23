import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import AppBar from '@src/components/appBar';
import { SqlEditor } from '@src/components/MonacoEditor';
import { IOperateItem } from '@src/types';
import useAppState from '@src/hooks/useAppState';
import DB from '@src/utils/db';
import useTab from '@hooks/useTab';
import { convertColumnType } from '@src/utils/db/utils';
import { SaveIcon, RunIcon, FormatIcon } from '@components/icons-lanis';

interface ISqlQueryEditor {
  current: string;
  value: string;
  height?: number;
}

export default function SqlQueryEditor({ value, current, height }: ISqlQueryEditor) {
  const [db] = useAppState<DB>('dbInstance');

  const [sqlEditorHeight, setSqlEditorHeight] = useState(0);
  // sql编辑器内容
  const [sqlContent, setSqlContent] = useState('');
  // sql编辑器已选择内容
  const [sqlSelContent, setSqlSelContent] = useState('');

  const tabRef = useRef(null);
  const sqlEditorRef = useRef(null);

  const tab = useTab('sqlQueryResult');

  const items: IOperateItem[] = [
    {
      key: 'run',
      title: sqlSelContent ? '执行选中' : '执行',
      icon: <RunIcon />,
      async handle() {
        const result = await db.execute(sqlSelContent || sqlContent);
        if (result?.length) {
          result.forEach((item) => {
            if (item?.columns) {
              showTableData(item.columns, item.data);
            }
          });
        }
      },
    },
    // {
    //   key: 'save',
    //   title: '保存',
    //   icon: <SaveIcon />,
    //   async handle() {
    //     console.log('saveing...');
    //     await new Promise((resolve) => {
    //       setTimeout(() => {
    //         console.log('saved');
    //         resolve(null);
    //       }, 6000);
    //     });
    //   },
    // },
    {
      key: 'format',
      title: '格式化',
      icon: <FormatIcon />,
      handle() {
        sqlEditorRef.current?.format();
      },
    },
  ];

  const showTableData = (columns, data) => {
    tab.add({
      key: `result${dayjs().millisecond()}`,
      title: '结果集',
      saved: true,
      comp: 'SqlQueryResult',
      params: {
        tableType: 'virtial',
        columns: columns.map((item) => ({
          title: item.name,
          field: item.name,
          type: convertColumnType(item.type),
        })),
        data,
      },
      onClose(key: string) {
        tab.remove(key);
      },
    });
  };

  const handleChange = (value: string) => {
    setSqlContent(value);
  };

  const handleSelection = (value: string) => {
    setSqlSelContent(value);
  };

  const onTableCompletion = async (dbName: string) => {
    const tables = await db.getTables();
    return tables.map((item) => ({ name: item.name, dbName }));
  };

  const onColumnCompletion = async (dbName: string, tblName: string) => {
    const columns = await db.tableColumnsDetail(tblName);
    return columns.map((item) => ({
      dbName,
      tblName,
      name: item.name,
      type: item.type,
      description: item.columnComment,
    }));
  };

  useEffect(() => {
    height && setSqlEditorHeight(height - 48);
  }, [height]);

  return (
    <div ref={tabRef} role="tabpanel" hidden={value !== current} className="h-full">
      <Box sx={{ p: 0, height: '100%' }}>
        <AppBar items={items} type="icon" />
        <SqlEditor
          ref={sqlEditorRef}
          onChange={handleChange}
          onSelection={handleSelection}
          style={{ height: sqlEditorHeight }}
          onTableCompletion={onTableCompletion}
          onColumnCompletion={onColumnCompletion}
        />
      </Box>
    </div>
  );
}
