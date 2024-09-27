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
import useTab from '@hooks/useTab';
import { convertColumnType } from '@src/utils/db/utils';
import { DIALECT, SQLITE_FUNCTIONS } from '@src/constant';
import { RunIcon, FormatIcon } from '@components/icons-lanis';
import BubbleSQL from '@components/BubbleSQL';
import Dialog from '@components/dialog';
import EventBus from '@src/utils/eventBus';

interface ISqlQueryEditor {
  tabId: string;
  tabName: string;
  temporary?: boolean;
}

export default function SqlQueryEditor({ tabId, tabName, temporary }: ISqlQueryEditor) {
  const [db] = useAppState<DB>('dbInstance');

  // sql编辑器内容
  const [initSqlContent, setInitSqlContent] = useState('');
  // sql编辑器已选择内容
  const [sqlSelContent, setSqlSelContent] = useState('');
  const [visible, setVisible] = useState(false);
  const [sqlQueryName, setSqlQueryName] = useState(tabName);

  const tabRef = useRef(null);
  const sqlEditorRef = useRef(null);
  const sqlContent = useRef('');

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
        const result = await db.execute(sqlSelContent || sqlContent.current);
        if (result?.[0]?.length) {
          const columns = result[0][0].map((item, index) => ({
            title: item.key,
            field: `${item.key}-${index}`,
            type: convertColumnType(item.type),
          }));
          const data = result[0].map((item) =>
            item.reduce((acc, current, index) => ({ ...acc, [`${current.key}-${index}`]: current.value }), {})
          );
          showTableData(columns, data, sqlSelContent || sqlContent.current);
        }
      },
    },
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
        columns,
        data,
      },
      onClose(id: string) {
        tab.close(id);
      },
    });
  };

  const handleChange = (value: string, codeChanged: boolean) => {
    sqlContent.current = value;
    tabSql.update(tabId, { saved: !codeChanged });
  };

  const handleSelection = (value: string) => {
    setSqlSelContent(value);
  };

  /**
   * 自动补全-表
   * @param dbName 库名
   */
  const onTableCompletion = async (dbName: string) => {
    const tables = await db.getTables();
    return tables.map((item) => ({ name: item.name, dbName }));
  };

  /**
   * 自动补全-表字段
   * @param dbName 库名
   * @param tblName 表名
   */
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

  /**
   * 自动补全-函数
   */
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

  /**
   * 查询脚本保存
   */
  const saveQuery = async () => {
    try {
      const sqlQueryPath = `sqlite/main`;
      if (!(await exists(sqlQueryPath, { dir: BaseDirectory.AppData }))) {
        await createDir(sqlQueryPath, { dir: BaseDirectory.AppData, recursive: true });
      }
      await writeTextFile(`${sqlQueryPath}/${sqlQueryName}.${tabId}.sql`, sqlContent.current, {
        dir: BaseDirectory.AppData,
      });
      onClose();
      tabSql.update(tabId, { saved: true, title: sqlQueryName });
      setInitSqlContent(sqlContent.current);
      // 刷新左侧树
      temporary && EventBus.emit('addQueryTree');
      message.success('保存成功');
    } catch (e) {
      console.log(e);
      message.error(`保存出错：${e?.message ?? e}`);
    }
  };

  /**
   * 查询保存事件
   */
  const onSave = () => {
    if (temporary) {
      // 临时查询弹窗输入查询名称
      setVisible(true);
    } else {
      saveQuery();
    }
  };

  /**
   * 获取查询脚本内容
   */
  const getContent = async () => {
    const sqlQueryPath = `sqlite/main`;
    const contents = await readTextFile(`${sqlQueryPath}/${tabName}.${tabId}.sql`, { dir: BaseDirectory.AppData });
    sqlContent.current = contents;
    setInitSqlContent(contents);
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
          value={initSqlContent}
          onChange={handleChange}
          onSelection={handleSelection}
          style={{ width: '100%', height: 'calc(100% - 48px)' }}
          hotkeys={[
            {
              id: `save-${tabId}`,
              key: EditorKeyMod.CtrlCmd | EditorKeyCode.KeyS,
              callback: async () => {
                onSave();
              },
            },
          ]}
          onTableCompletion={onTableCompletion}
          onColumnCompletion={onColumnCompletion}
          onFunctionCompletion={onFunctionCompletion}
        />
      </Box>
      <Dialog
        visible={visible}
        title="保存查询"
        maxWidth="xs"
        actions={[
          {
            title: '保存',
            primary: true,
            handle: saveQuery,
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
