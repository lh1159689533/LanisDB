import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Tree, Select } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { LoadingButton } from '@mui/lab';
import { BaseDirectory, removeFile, readDir } from '@tauri-apps/api/fs';
import useMessage from '@src/hooks/useMessage';
import useTab from '@hooks/useTab';
import { IPage } from '@src/types';
import useAppState from '@src/hooks/useAppState';
import DB from '@src/utils/db';
import LanisMenu from '@src/components/Menu';
import { convertColumnType } from '@src/utils/db/utils';
import { TableIcon, ColumnIcon } from '@components/icons-lanis';
import Dialog from '@components/dialog';
import EventBus from '@src/utils/eventBus';
import { DIALECT, EVENT_KEY } from '@src/constant';
import { getQueryPath } from '@src/utils';
import ViewCreateSql from './components/viewCreateSql';

import './index.less';

// 树节点类型
enum TreeNodeType {
  /** 视图 */
  view = 'view',
  /** 表 */
  table = 'table',
  /** 字段 */
  column = 'column',
  /** 查询脚本 */
  query = 'query',
}

// 支持右键菜单的树节点类型
const ContextMenuTreeNode = [TreeNodeType.view, TreeNodeType.table, TreeNodeType.query];

interface ITreeData extends DataNode {
  type?: TreeNodeType;
  children?: ITreeData[];
}

/**
 * 更新树节点数据
 * @param list 树列表
 * @param key 节点的key
 * @param children 子节点列表
 * @param currentNode 当前节点需要更新的数据
 */
const updateTreeData = (list: ITreeData[], key: React.Key, children: ITreeData[], currentNode?): ITreeData[] =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        ...(currentNode ?? {}),
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });

interface IParam {
  type?: string;
}

export default function Sidebar() {
  // 树数据
  const [treeData, setTreeData] = useState<ITreeData[]>([]);
  // 当前选择的树节点
  const [currentNode, setCurrentNode] = useState<ITreeData>(null);
  // 建表语句
  const [createSql, setCreateSql] = useState('');
  // 库列表(mysql)
  const [databaseList, setDatabaseList] = useState([]);
  const [database, setDatabase] = useState('');
  const [loading, setLoading] = useState(false);
  const [delQueryVisible, setDelQueryVisible] = useState(false);

  const menuRef = useRef(null);

  const [db] = useAppState<DB>('dbInstance');

  const tab = useTab('sqlQueryResult');
  const tabSqlQuery = useTab('sqlQuery');
  const message = useMessage();

  const { type } = useParams<IParam>();

  // 视图类型节点右键菜单列表
  const rightMenuQuery = [
    {
      id: 'openQuery',
      label: '打开',
      callback() {
        tabSqlQuery.add({
          id: `${currentNode.key}`,
          title: `${currentNode.title}`,
          onClose: (id: string) => {
            tabSqlQuery.close(id);
          },
        });
      },
    },
    {
      id: 'deleteQuery',
      label: '删除',
      callback() {
        setDelQueryVisible(true);
      },
    },
  ];

  // 表类型节点右键菜单列表
  const rightMenuTable = [
    {
      id: 'openTable',
      label: '打开表',
      callback() {
        const tableName = currentNode.title as string;
        openTable(tableName);
      },
    },
    {
      id: 'editTable',
      label: '编辑表',
      callback() {
        console.log('编辑表');
      },
    },
    {
      id: 'viewCreateSql',
      label: '查看建表语句',
      callback() {
        const tableName = currentNode.title as string;
        const tableType = currentNode.type;
        viewCreateSql(tableName, tableType);
      },
    },
    {
      id: 'deleteTable',
      label: '删除表',
      callback() {
        console.log('删除表');
      },
    },
  ];

  // 视图类型节点右键菜单列表
  const rightMenuView = [
    {
      id: 'viewCreateSql',
      label: '查看创建语句',
      callback() {
        console.log('查看创建语句');
      },
    },
    {
      id: 'deleteView',
      label: '删除视图',
      callback() {
        console.log('删除视图');
      },
    },
  ];

  /**
   * 删除查询脚本
   */
  const onDelQuery = () => {
    tabSqlQuery.close(`${currentNode.key}`);
    removeFile(`${getQueryPath(db.dialect, db.id)}/${currentNode.title}.${currentNode.key}.sql`, {
      dir: BaseDirectory.AppData,
    });
    setDelQueryVisible(false);
    setTreeData((origin) => {
      const queries = origin.find((item) => item.key === 'query-list');
      const children = queries.children.filter((item) => item.key !== currentNode.key);
      return updateTreeData(origin, 'query-list', children, {
        title: `查询（${children?.length}）`,
      });
    });
    message.success('删除成功');
  };

  /**
   * 查询表数据
   * @param tableName 表名
   * @param page 分页参数
   */
  const queryTableData = async (tableName: string, page?: IPage) => {
    let sql = `select * from ${tableName}`;
    if (page) {
      sql += ` limit ${(page.current - 1) * page.size}, ${page.size}`;
    }
    const result = await db.selectAndCount(sql);

    if (result) {
      return {
        columns: result.columns.map((item) => ({
          title: item.name,
          field: item.name,
          type: convertColumnType(item.type),
        })),
        data: result.data,
        total: result.total,
      };
    }

    return null;
  };

  /**
   * 打开表
   * @param tableName 表名
   */
  const openTable = (tableName: string) => {
    tab.add({
      id: tableName ?? `result${dayjs().millisecond()}`,
      title: tableName ?? '结果集',
      params: {
        queryTableData: (page?: IPage) => queryTableData(tableName, page),
      },
      onClose(id: string) {
        tab.close(id);
      },
    });
  };

  /**
   * 查看建表语句
   * @param tableName 表名
   */
  const viewCreateSql = async (tableName: string, tableType?) => {
    try {
      const createSql = await db.getCreateSql(tableName, tableType);
      setCreateSql(createSql);
    } catch (e) {
      message.error(e);
    }
  };

  /**
   * 节点被选择
   */
  // const handleSelect = (_, e) => {
  //   if (e.node?.type === 'table') {
  //     openTable(e.node?.title);
  //   }
  // };

  /**
   * 右键点击事件
   */
  const handleRightClick = ({ event, node }) => {
    if (!ContextMenuTreeNode.includes(node.type)) {
      return;
    }
    event.preventDefault();
    setCurrentNode(node);
    menuRef.current?.show(event);
  };

  /**
   * 异步加载表字段
   */
  const onLoadData = ({ key, title, type, children }: any) => {
    return new Promise<void>((resolve) => {
      if (children) {
        resolve();
        return;
      }
      if (type === TreeNodeType.table) {
        db.selectTableColumns(title).then((resp) => {
          const data = resp ?? [];
          setTreeData((origin) =>
            updateTreeData(origin, key, [
              {
                key: `${title}-column-list`,
                title: `字段（${data.length}）`,
                icon: <ColumnIcon />,
                selectable: false,
                children: data.map((name) => ({
                  key: `${title}-column-${name}`,
                  title: name,
                  icon: <ColumnIcon />,
                  type: TreeNodeType.column,
                  children: null,
                  isLeaf: true,
                })),
              },
            ])
          );
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  /**
   * 获取已保存的查询脚本
   */
  const getQuerys = async () => {
    let querys = [];
    try {
      const sqlQueryPath = `${db.dialect}/${db.id}`;
      const files = await readDir(sqlQueryPath, { dir: BaseDirectory.AppData });
      querys = files.map((item) => {
        const [name, id] = item.name.split('.');
        return {
          id,
          name,
        };
      });
    } catch (e) {}

    return {
      key: 'query-list',
      title: `查询（${querys?.length}）`,
      icon: <TableIcon />,
      selectable: false,
      children: querys?.map((item) => ({
        key: item.id,
        title: item.name,
        icon: <TableIcon />,
        type: TreeNodeType.query,
        children: null,
        isLeaf: true,
      })),
    };
  };

  /**
   * 获取表列表
   */
  const getTables = async () => {
    let treeData = [];
    const datas = await db.getTables();

    if (type === DIALECT.mysql) {
      const tables = datas.filter((item) => item.type !== 'VIEW');
      const views = datas.filter((item) => item.type === 'VIEW');
      treeData = [
        {
          key: 'table-list',
          title: `表（${tables.length}）`,
          icon: <TableIcon />,
          selectable: false,
          children: tables.map((item) => ({
            key: `table-${item.name}`,
            title: item.name,
            icon: <TableIcon />,
            type: TreeNodeType.table,
          })),
        },
        {
          key: 'view-list',
          title: `视图（${views.length}）`,
          icon: <TableIcon />,
          selectable: false,
          children: views.map((item) => ({
            key: `view-${item.name}`,
            title: item.name,
            icon: <TableIcon />,
            type: TreeNodeType.view,
            isLeaf: true,
          })),
        },
      ];
    } else {
      treeData = [
        {
          key: 'table-list',
          title: `表（${datas.length}）`,
          icon: <TableIcon />,
          selectable: false,
          children: datas.map((item) => ({
            key: `table-${item.name}`,
            title: item.name,
            icon: <TableIcon />,
            type: TreeNodeType.table,
          })),
        },
      ];
    }

    treeData.push(await getQuerys());
    setTreeData(treeData);
  };

  /**
   * 获取库列表(mysql)
   */
  const getDatabases = async () => {
    setLoading(true);
    const result: any = await db.getDatabases();
    if (result?.length) {
      const databaseList = result.map((item) => ({
        value: item.Database,
        label: item.Database,
      }));
      setDatabaseList(databaseList);
      setDatabase(databaseList[0].value);
      handleDatabaseChange(databaseList[0].value);
    }
    setLoading(false);
  };

  /**
   * 查看建表语句modal关闭
   */
  const handleViewCreateSqlClose = () => {
    setCreateSql('');
  };

  /**
   * 库发生变化(mysql)
   * @param value 库名
   */
  const handleDatabaseChange = async (value: string) => {
    setLoading(true);
    setDatabase(value);
    if (await db.reload({ database: value })) {
      await getTables();
    }
    setLoading(false);
  };

  /**
   * 右键菜单
   */
  const getRightMenuList = () => {
    const nodeType = currentNode?.type;
    if (!ContextMenuTreeNode.includes(nodeType)) {
      return [];
    }
    if (nodeType === TreeNodeType.view) {
      return rightMenuView;
    }
    if (nodeType === TreeNodeType.query) {
      return rightMenuQuery;
    }
    return rightMenuTable;
  };

  useEffect(() => {
    if (type === DIALECT.mysql) {
      getDatabases();
    } else {
      getTables();
    }

    EventBus.on(EVENT_KEY.TREE_ADD_QUERY, async () => {
      const queries = await getQuerys();
      setTreeData((origin) => {
        const treeData = origin.filter((item) => item.key !== 'query-list');
        return [...treeData, queries];
      });
    });

    return () => {
      tab.clear();
    };
  }, []);

  return (
    <div className="sidebar border-r">
      {type === DIALECT.mysql && (
        <div className="px-2 mb-2">
          <Select
            showSearch
            value={database}
            options={databaseList}
            placeholder="请选择数据库"
            className="w-full text-sm"
            onChange={handleDatabaseChange}
          />
        </div>
      )}
      {loading ? (
        <LoadingButton loading sx={{ width: '100%', color: '#ffcc00' }} />
      ) : (
        <Tree.DirectoryTree
          treeData={treeData}
          blockNode
          expandAction="click"
          // onSelect={handleSelect}
          onRightClick={handleRightClick}
          loadData={onLoadData}
          className="db-sidebar-tree"
        />
      )}
      <LanisMenu id="db_siderbar_tree__rightmenu" ref={menuRef} menus={getRightMenuList()} />
      <ViewCreateSql open={Boolean(createSql)} createSql={createSql} onClose={handleViewCreateSqlClose} />
      <Dialog
        visible={delQueryVisible}
        title="删除查询"
        maxWidth="xs"
        actions={[
          {
            title: '确认',
            primary: true,
            handle: onDelQuery,
          },
          {
            title: '取消',
            handle: () => setDelQueryVisible(false),
          },
        ]}
      >
        确认删除 {currentNode?.title as string} 吗？
      </Dialog>
    </div>
  );
}
