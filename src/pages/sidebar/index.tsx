import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Tree, Select } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { LoadingButton } from '@mui/lab';
import useTab from '@hooks/useTab';
import { IPage } from '@src/types';
import useAppState from '@src/hooks/useAppState';
import DB from '@src/utils/db';
import LanisMenu from '@src/components/menu';
import { convertColumnType } from '@src/utils/db/utils';
import ViewCreateSql from './components/viewCreateSql';
import { TableIcon, ColumnIcon } from '@components/icons-lanis';

import './index.less';

// 表类型节点右键菜单列表
const rightMenuTable = [
  {
    key: 'openTable',
    title: '打开表',
  },
  {
    key: 'editTable',
    title: '编辑表',
  },
  {
    key: 'viewCreateSql',
    title: '查看建表语句',
  },
  {
    key: 'delTable',
    title: '删除表',
  },
];

// 视图类型节点右键菜单列表
const rightMenuView = [
  {
    key: 'viewCreateSql',
    title: '查看创建语句',
  },
  {
    key: 'delView',
    title: '删除视图',
  },
];

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
  // 右键菜单挂在点
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // 当前选择的树节点
  const [currentNode, setCurrentNode] = useState<ITreeData>(null);
  // 建表语句
  const [createSql, setCreateSql] = useState('');
  // 库列表(mysql)
  const [databaseList, setDatabaseList] = useState([]);
  const [database, setDatabase] = useState('');

  const [rightMenu, setRightMenu] = useState(rightMenuTable);
  const [loading, setLoading] = useState(false);

  const [db] = useAppState<DB>('dbInstance');

  const tab = useTab('sqlQueryResult');

  const { type } = useParams<IParam>();

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
          type: convertColumnType(item.type)
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
      key: tableName ?? `result${dayjs().millisecond()}`,
      title: tableName ?? '结果集',
      saved: true,
      comp: 'SqlQueryResult',
      params: {
        queryTableData: (page?: IPage) => queryTableData(tableName, page),
      },
      onClose(key: string) {
        tab.remove(key);
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
    if (node?.type === 'table' || node?.type === 'view') {
      setAnchorEl(event.target);
      setCurrentNode(node);
      setRightMenu(node.type === 'table' ? rightMenuTable : rightMenuView);
    }
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

    if (type === 'mysql') {
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
    setAnchorEl(null);
    setCurrentNode(null);
  };

  /**
   * 菜单点击事件
   */
  const handleMenuClick = (key: string) => {
    const tableName = currentNode.title as string;
    const tableType = currentNode.type;
    if (key === 'openTable') {
      openTable(tableName);
    } else if (key === 'editTable') {
    } else if (key === 'viewCreateSql') {
      viewCreateSql(tableName, tableType);
    } else if (key === 'delTable') {
    }
    handleMenuClose();
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

  useEffect(() => {
    if (type === 'mysql') {
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
      {type === 'mysql' && (
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
          expandAction={false}
          onSelect={handleSelect}
          onRightClick={handleRightClick}
          loadData={onLoadData}
          className="db-sidebar-tree"
        />
      )}
      <LanisMenu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        menus={rightMenu}
        onClose={handleMenuClose}
        onMenuClick={handleMenuClick}
      />
      <ViewCreateSql open={Boolean(createSql)} createSql={createSql} onClose={handleViewCreateSqlClose} />
    </div>
  );
}
