import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AddCardOutlined, NoteAddOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import { appWindow } from '@tauri-apps/api/window';
import useAppState from '@src/hooks/useAppState';
import useTab from '@hooks/useTab';
import usePersistFn from '@hooks/usePersistFn';
import Resize from '@components/resize';
import { ITabData } from '@components/Tabs';
import { IOperateItem } from '@src/types';
import DB from '@src/utils/db';
import Header from './header';
import Sidebar from '../sidebar';
import SqlQueryTabs from './sqlQueryTabs';
import ResultTabs from './resultTabs';

import './index.less';

export default function Datas() {
  const [sqlTabs] = useAppState<ITabData[]>('sqlQuery');
  const [resultTabs] = useAppState<ITabData[]>('sqlQueryResult');

  const [db] = useAppState<DB>('dbInstance');

  const [height, setHeight] = useState(0);
  const [resultTabsHeight, setResultTabsHeight] = useState(0);

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
          id: `newquery${dayjs().millisecond()}`,
          title: '新建查询',
          onClose(id: string) {
            tab.close(id);
          },
          params: {
            temporary: true, // 临时查询
          },
          saved: false,
        });
      },
    },
  ];

  const resize = usePersistFn(() => {
    const sectionHeight = sectionRef.current?.getBoundingClientRect().height;
    let resultHeight = 0;
    if (resultTabs?.length) {
      resultHeight = sqlTabs?.length ? sectionHeight * 0.58 : sectionHeight;
    }
    setHeight(sectionHeight);
    setResultTabsHeight(resultHeight);
  });

  const onResize = (size: number) => {
    setResultTabsHeight(size);
  };

  useEffect(() => {
    return () => {
      tab.clear();
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const sectionHeight = sectionRef.current?.getBoundingClientRect().height;
    if (
      // 查询tabs从无到有
      (resultTabsHeight === sectionHeight && sqlTabs?.length > 0) ||
      // 结果tabs从无到有
      (resultTabsHeight === 0 && resultTabs?.length > 0) ||
      // 查询、结果tabs从有到无
      (resultTabsHeight > 0 && (resultTabs?.length === 0 || sqlTabs?.length === 0))
    ) {
      resize();
    }

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [sectionRef.current, resultTabs?.length, sqlTabs?.length, resultTabsHeight]);

  return (
    <div className="data-page">
      <Header items={itemList} className="header" />
      <main>
        <div className="sidebar">
          <Sidebar />
        </div>
        <section ref={sectionRef}>
          <div className="sql-tabs" style={{ height: `calc(100% - ${resultTabsHeight}px)` }}>
            <SqlQueryTabs tabs={sqlTabs} />
          </div>
          <div
            className="data-list"
            style={{ height: resultTabsHeight, top: `calc(100% - ${resultTabsHeight}px)`, width: '100%' }}
          >
            {sqlTabs?.length && resultTabs?.length ? (
              <Resize type="row" onResize={onResize} max={height * 0.9} min={45} />
            ) : null}
            {resultTabs?.length ? (
              <div style={{ height: resultTabsHeight - 3 }}>
                <ResultTabs tabs={resultTabs} height={resultTabsHeight - 3} />
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
