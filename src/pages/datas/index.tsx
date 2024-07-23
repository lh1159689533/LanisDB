import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AddCardOutlined, NoteAddOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import { appWindow } from '@tauri-apps/api/window';
import Tabs from '@src/components/tabs';
import useAppState from '@src/hooks/useAppState';
import Header from './header';
import Sidebar from '../sidebar';
import useTab from '@hooks/useTab';
import Resize from '@components/resize';
import { IOperateItem, ITab } from '@src/types';
import DB from '@src/utils/db';

import './index.less';

export default function Datas() {
  const [sqlTabs = []] = useAppState<ITab[]>('sqlQuery');
  const [resultTabs = []] = useAppState<ITab[]>('sqlQueryResult');

  const [db] = useAppState<DB>('dbInstance');

  const [height, setHeight] = useState(0);
  const [resultTabsHeight, setResultTabsHeight] = useState(0);
  const [sqlTabsHeight, setSqlTabsHeight] = useState(0);

  const sectionRef = useRef(null);

  const history = useHistory();

  const tab = useTab('sqlQuery');

  const itemList: IOperateItem[] = [
    {
      key: 'newConnection',
      title: '新建连接',
      icon: <AddCardOutlined />,
      async handle() {
        db.close();
        history.push('/');

        await appWindow.setTitle('LanisDB');
      },
    },
    {
      key: 'newQuery',
      title: '新建查询',
      icon: <NoteAddOutlined />,
      handle() {
        tab.add({
          key: `newquery${dayjs().millisecond()}`,
          title: '新建查询',
          saved: true,
          comp: 'SqlQueryEditor',
          onClose(key: string) {
            tab.remove(key);
          },
        });
      },
    },
  ];

  const resize = () => {
    const sectionHeight = sectionRef.current?.getBoundingClientRect().height;
    let resultHeight = 0;
    if (resultTabs?.length) {
      resultHeight = sqlTabs?.length ? sectionHeight * 0.58 : sectionHeight;
    }
    setHeight(sectionHeight);
    setResultTabsHeight(resultHeight);
    setSqlTabsHeight(height - resultHeight);
  };

  const onResize = (size: number) => {
    setResultTabsHeight(size);
    setSqlTabsHeight(height - size);
  };

  useEffect(() => {
    return () => {
      tab.clear();
    };
  }, []);

  useEffect(() => {
    if (sectionRef.current) {
      resize();
    }
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [sectionRef.current, sqlTabs, resultTabs]);

  return (
    <div className="data-page">
      <Header items={itemList} className="header" />
      <main>
        <div className="sidebar">
          <Sidebar />
        </div>
        <section ref={sectionRef}>
          <div className="sql-tabs">
            {sqlTabs?.length ? <Tabs tabs={sqlTabs} tabKey="sqlQuery" height={sqlTabsHeight} /> : null}
          </div>
          <div className="data-list relative">
            {sqlTabs?.length ? <Resize type="row" onResize={onResize} max={height * 0.9} min={45} /> : null}
            {resultTabs?.length ? <Tabs tabs={resultTabs} tabKey="sqlQueryResult" height={resultTabsHeight} /> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
