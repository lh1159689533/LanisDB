import { useEffect, useRef, useState } from 'react';
import { Button, Skeleton, IconButton, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { Add, MoreHoriz } from '@mui/icons-material';
import { appWindow } from '@tauri-apps/api/window';
import store from '@utils/store';
import DB from '@src/utils/db';
import { IMysqlDBProps, ISqliteDBProps } from '@src/utils/db/types';
import useAppState from '@src/hooks/useAppState';
import LanisMenu from '@src/components/Menu';
import { ImportIcon, ExportIcon } from '@components/icons-lanis';
import { DB_CONNECT_STORE_KEY, DIALECT } from '@src/constant';
import useMessage from '@src/hooks/useMessage';
import useConfirm from '@src/hooks/useConfirm';
import NewModal from './newModal';

import './index.less';

function Loading() {
  return new Array(3).fill(1).map((_, index) => (
    <section className="card" key={index}>
      <div className="flex flex-col gap-2 h-16">
        <Skeleton width="50%" />
        <Skeleton />
      </div>
      <footer className="flex mt-4 gap-2 justify-end">
        <Skeleton width="15%" />
        <Skeleton width="15%" />
      </footer>
    </section>
  ));
}

// 更多
const actions = [
  { icon: <ImportIcon />, name: '导入' },
  { icon: <ExportIcon />, name: '导出' },
];

export default function Home() {
  // 连接列表
  const [dbConnectList, setDBConnectList] = useState([]);
  // 新建弹窗显隐
  const [modalType, setModalType] = useState<'new' | 'edit' | ''>('');
  // 当前编辑的连接
  const [editConnect, setEditConnect] = useState(null);
  // 加载连接
  const [loading, setLoading] = useState(false);
  // 当前点击...按钮的连接
  const [currentDBConnect, setCurrentDBConnect] = useState(null);

  const menuRef = useRef(null);

  const [, setDB] = useAppState<DB>('dbInstance');

  const history = useHistory();
  const message = useMessage();
  const { confirm } = useConfirm();

  const handleShowNewModal = () => {
    setModalType('new');
  };

  /**
   * 初始化DB实例
   */
  const loadDB = async (props: IMysqlDBProps | ISqliteDBProps) => {
    const db = await DB.load(props);
    setDB(db);
    (window as any).dbInstance = db;
  };

  /**
   * 建立连接
   */
  const handleConnect = async (values) => {
    if (values.dialect === DIALECT.mysql) {
      const { ip, port, username, password, dialect } = values;
      await loadDB({ host: ip, port, username, password, dialect });
    } else if (values.dialect === DIALECT.sqlite) {
      const { file, dialect } = values;
      await loadDB({ storage: file, dialect });
    }

    await appWindow.setTitle(`LanisDB - ${values.dialect}:${values.ip ?? values.file}`);

    history.push(`/datas/${values.dialect}`);
  };

  /**
   * 保存
   */
  const saveDBConnect = async (values) => {
    try {
      let default_name = '';
      if (values.dialect === DIALECT.mysql) {
        default_name = values.ip;
      } else if (values.dialect === DIALECT.sqlite) {
        default_name = values.file.split('/').reverse()[0];
      }
      const newValues = { ...values, name: values.name || default_name };
      if (modalType === 'edit') {
        newValues.id = editConnect.id;
      }
      await store.addItem(DB_CONNECT_STORE_KEY, newValues);
      message.success('保存成功');
      getDBConnectData();
      setModalType('');
    } catch {
      message.error('保存失败');
    }
  };

  const handleConfirm = (actionType: string, values?) => {
    if (actionType === 'connect') {
      handleConnect(values);
    } else if (actionType === 'saveAndConnect') {
      saveDBConnect(values);
      handleConnect(values);
    } else if (actionType === 'save') {
      saveDBConnect(values);
    } else if (actionType === 'testConnect') {
      // handleTestConnect(values);
    }
    // getDBConnectData();
    // setShowNewModal(false);
  };

  /**
   * 获取已保存的连接
   */
  const getDBConnectData = async () => {
    setLoading(true);
    const result: any[] = await store.getItem('db_connect');
    if (result?.length) {
      setDBConnectList(
        result.map((item) => {
          const aliasName = item.dialect === DIALECT.mysql ? item.ip : item.file?.split('/').reverse()[0];
          return {
            ...item,
            name: item.name ?? aliasName,
            summary: item.description,
          };
        })
      );
    } else {
      setDBConnectList([]);
    }
    setLoading(false);
  };

  /**
   * ...按钮项点击事件
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, dbConnect) => {
    setCurrentDBConnect(dbConnect);
    menuRef.current?.show(event);
  };

  /**
   * 菜单ID
   * @param id
   */
  const handleMoreClick = async (id: string) => {
    if (id === 'delete') {
      confirm({
        title: '删除连接',
        description: `确定删除连接${currentDBConnect.name}吗？`,
        async onOk() {
          try {
            await store.delItem(DB_CONNECT_STORE_KEY, currentDBConnect.id);
            getDBConnectData();
            message.success('删除成功');
          } catch {
            message.error('删除失败');
          }
        },
      });
    }
  };

  /**
   * 编辑
   * @param item 连接数据
   */
  const handleEdit = (item) => {
    setEditConnect(item);
    setModalType('edit');
  };

  useEffect(() => {
    getDBConnectData();
  }, []);

  return (
    <div className="home">
      {loading ? (
        <Loading />
      ) : (
        <>
          {dbConnectList.map((item, index) => (
            // <Zoom in timeout={300 * (index + 1)} key={`${item.name}-${index}`}>
            <section className="card" key={`${item.name}-${index}`}>
              <div className="flex flex-col gap-2 h-20">
                <span className="title text-xl cursor-pointer hover:text-blue-500">{item.name}</span>
                <span className="summary">{item.summary}</span>
              </div>
              <footer className="flex mt-1 justify-end">
                <Button size="small" onClick={() => handleConnect(item)}>
                  连接
                </Button>
                <Button size="small" onClick={() => handleEdit(item)}>
                  编辑
                </Button>
                <div className="more-menu">
                  <IconButton onClick={(event) => handleClick(event, item)}>
                    <MoreHoriz />
                  </IconButton>
                  <LanisMenu
                    id="db_connect_list__rightmenu"
                    ref={menuRef}
                    menus={[
                      { id: 'delete', label: '删除' },
                      { id: 'top', label: '置顶' },
                    ]}
                    onMenuClick={(key: string) => handleMoreClick(key)}
                  />
                </div>
              </footer>
            </section>
            // </Zoom>
          ))}
          <section className="card add" onClick={handleShowNewModal}>
            <Add />
            <span>新建连接</span>
          </section>
        </>
      )}
      <div className="h-screen absolute top-0 right-0">
        <SpeedDial ariaLabel="more" sx={{ position: 'absolute', bottom: 32, right: 32 }} icon={<SpeedDialIcon />}>
          {actions.map((action) => (
            <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} />
          ))}
        </SpeedDial>
      </div>
      {modalType === 'new' && <NewModal open={true} onClose={() => setModalType('')} onConfirm={handleConfirm} />}
      {modalType === 'edit' && (
        <NewModal data={editConnect} open={true} onClose={() => setModalType('')} onConfirm={handleConfirm} />
      )}
    </div>
  );
}
