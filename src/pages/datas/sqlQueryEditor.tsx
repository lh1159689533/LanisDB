import { useState, useEffect, useRef } from 'react';
import { Box, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { BaseDirectory, writeTextFile, exists, createDir, readTextFile } from '@tauri-apps/api/fs';
import AppBar from '@src/components/appBar';
import { SqlEditor, EditorKeyCode, EditorKeyMod } from '@src/components/MonacoEditor';
import { IOperateItem } from '@src/types';
import useAppState from '@src/hooks/useAppState';
import useMessage from '@src/hooks/useMessage';
import DB from '@src/utils/db';
import store from '@src/utils/store';
import useTab from '@hooks/useTab';
import { convertColumnType } from '@src/utils/db/utils';
import { DIALECT, SQLITE_FUNCTIONS } from '@src/constant';
import { RunIcon, FormatIcon } from '@components/icons-lanis';
import BubbleSQL from '@components/BubbleSQL';
import Dialog from '@components/dialog';

interface ISqlQueryEditor {
  tabId: string;
  tabName: string;
}

export default function SqlQueryEditor({ tabId, tabName }: ISqlQueryEditor) {
  const [db] = useAppState<DB>('dbInstance');

  // sql编辑器内容
  const [sqlContent, setSqlContent] = useState('');
  // sql编辑器已选择内容
  const [sqlSelContent, setSqlSelContent] = useState('');
  const [visible, setVisible] = useState(false);
  const [sqlQueryName, setSqlQueryName] = useState(tabName);

  const tabRef = useRef(null);
  const sqlEditorRef = useRef(null);
  const updateHeightRef = useRef(null);

  const tab = useTab('sqlQueryResult');
  const tabSql = useTab('sqlQuery');
  const { type } = useParams<{ type: string }>();
  const message = useMessage();

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
              showTableData(item.columns, item.data, sqlSelContent || sqlContent);
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

  const showTableData = (columns, data, sqlContent) => {
    tab.add({
      id: `result${dayjs().millisecond()}`,
      title: '结果集',
      tooltip: (children, bubbleProps) => (
        <BubbleSQL key={data} sql={sqlContent} placement="bottomLeft" {...bubbleProps}>
          {children}
        </BubbleSQL>
      ),
      params: {
        tableType: 'virtial',
        columns: columns.map((item) => ({
          title: item.name,
          field: item.name,
          type: convertColumnType(item.type),
        })),
        data,
      },
      onClose(id: string) {
        tab.close(id);
      },
    });
  };

  const handleChange = (value: string, codeChanged: boolean) => {
    setSqlContent(value);
    tabSql.update(tabId, { saved: !codeChanged });
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

  const onFunctionCompletion = () => {
    if (type === DIALECT.sqlite) {
      return SQLITE_FUNCTIONS;
    }
    if (type === DIALECT.mysql) {
    }
  };

  const onClose = () => {
    setVisible(false);
    setSqlQueryName(tabName);
  };

  const onSave = async () => {
    try {
      const sqlQueryPath = `sqlite/main`;
      if (!(await exists(sqlQueryPath, { dir: BaseDirectory.AppData }))) {
        await createDir(sqlQueryPath, { dir: BaseDirectory.AppData, recursive: true });
      }
      await writeTextFile(`${sqlQueryPath}/${sqlQueryName}.sql`, sqlContent, { dir: BaseDirectory.AppData });
      store.addItem(db.url, { name: sqlQueryName, path: `${sqlQueryPath}/${sqlQueryName}.sql` });
      message.success('保存成功');
      onClose();
      tabSql.update(tabId, { saved: true });
    } catch (e) {
      console.log(e);
      message.error(`保存出错：${e?.message ?? e}`);
    }
  };

  const getContent = async () => {
    const sqlQueryPath = `sqlite/main`;
    const contents = await readTextFile(`${sqlQueryPath}/${tabName}.sql`, { dir: BaseDirectory.AppData });
    setSqlContent(contents);
  };

  useEffect(() => {
    if (tabId) {
      getContent();
    }
  }, [tabId]);

  return (
    <div ref={tabRef} role="tabpanel" className="h-full">
      <Box sx={{ p: 0, height: '100%' }}>
        <AppBar items={items} type="icon" />
        <SqlEditor
          ref={sqlEditorRef}
          onChange={handleChange}
          onSelection={handleSelection}
          style={{ width: '100%', height: 'calc(100% - 48px)' }}
          hotkeys={[
            {
              id: `save-${tabId}`,
              key: EditorKeyMod.CtrlCmd | EditorKeyCode.KeyS,
              async callback() {
                setVisible(true);
              },
            },
          ]}
          onTableCompletion={onTableCompletion}
          onColumnCompletion={onColumnCompletion}
          onFunctionCompletion={onFunctionCompletion}
        />
      </Box>
      <Dialog
        open={visible}
        title="保存查询"
        maxWidth="xs"
        actions={[
          {
            title: '保存',
            primary: true,
            handle: onSave,
          },
          {
            title: '取消',
            handle: onClose,
          },
        ]}
      >
        <TextField
          label="查询名称"
          value={sqlQueryName}
          size="small"
          margin="dense"
          fullWidth
          variant="standard"
          placeholder="查询名称"
          onChange={(e) => setSqlQueryName(e.target.value)}
        />
      </Dialog>
    </div>
  );
}
