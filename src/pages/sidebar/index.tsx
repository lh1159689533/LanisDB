import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Tree, Select } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { LoadingButton } from '@mui/lab';
import { BaseDirectory, removeFile } from '@tauri-apps/api/fs';
import store from '@src/utils/store';
import useTab from '@hooks/useTab';
import { IPage } from '@src/types';
import useAppState from '@src/hooks/useAppState';
import DB from '@src/utils/db';
import LanisMenu from '@src/components/Menu';
import { convertColumnType } from '@src/utils/db/utils';
import { TableIcon, ColumnIcon } from '@components/icons-lanis';
import { DIALECT } from '@src/constant';
import ViewCreateSql from './components/viewCreateSql';

import './index.less';

/**
 * 更新树节点数据
 * @param list 树列表
 * @param key 节点的key
 * @param children 子节点列表
 */
const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
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

interface ITreeData extends DataNode {
  type?: string;
  children?: ITreeData[];
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

  const menuRef = useRef(null);

  const [db] = useAppState<DB>('dbInstance');

  const tab = useTab('sqlQueryResult');
  const tabSqlQuery = useTab('sqlQuery');

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
        tabSqlQuery.close(`${currentNode.key}`);
        store.delItem(db.url, Number(currentNode.key));
        removeFile(`sqlite/main/${currentNode.title}`, { dir: BaseDirectory.AppData });
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
    const createSql = await db.getCreateSql(tableName, tableType);
    setCreateSql(createSql);
  };

  /**
   * 节点被选择
   */
  const handleSelect = (_, e) => {
    if (e.node?.type === 'table') {
      openTable(e.node?.title);
    }
  };

  /**
   * 右键点击事件
   */
  const handleRightClick = ({ event, node }) => {
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
      if (type === 'table') {
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
                  key: `column-${name}`,
                  title: name,
                  icon: <ColumnIcon />,
                  type: 'column',
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
            type: 'table',
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
            type: 'view',
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
            type: 'table',
          })),
        },
      ];
    }

    const querys = await store.getItem<{ id: string; name: string; path: string }[]>(db.url);
    treeData.push({
      key: 'query-list',
      title: `查询（${querys?.length}）`,
      icon: <TableIcon />,
      selectable: false,
      children: querys?.map((item) => ({
        key: item.id,
        title: item.name,
        icon: <TableIcon />,
        type: 'query',
        children: null,
        isLeaf: true,
      })),
    });
    setTreeData(treeData);
  };

  /**
   * 获取库列表(mysql)
   */
  const getDatabases = async () => {
    setLoading(true);
    const result: any = await db.select(`show databases`, false);
    if (result) {
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
   * 右键菜单关闭回调
   */
  const handleMenuClose = () => {
    setCurrentNode(null);
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

  const getRightMenuList = () => {
    const nodeType = currentNode?.type;
    if (!['view', 'table', 'query'].includes(nodeType)) {
      return [];
    }
    if (nodeType === 'view') {
      return rightMenuView;
    }
    if (nodeType === 'query') {
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
    </div>
  );
}
