import { useEffect, useState } from 'react';
import Dialog from '@src/components/dialog';
import { EVENT_KEY } from '@src/constant';
import EventBus from '@src/utils/eventBus';
import { ITabData } from '@src/components/Tabs/types';

export default function UnSaveTip() {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<ITabData>(null);

  const onSave = () => {
    // 触发查询脚本保存
    EventBus.emit(`${EVENT_KEY.SAVE_AND_CLOSE_QUERY}-${tab.id}`);
    setVisible(false);
  };

  const onClose = () => {
    // 触发tab关闭
    EventBus.emit(`${EVENT_KEY.TAB_CLOSE}-${tab.id}`, tab.id);
    setVisible(false);
  };

  useEffect(() => {
    EventBus.on(EVENT_KEY.UNSAVE_TAB_CLOSE, (tab: ITabData) => {
      setVisible(true);
      setTab(tab);
    });

    return () => {
      EventBus.off(EVENT_KEY.UNSAVE_TAB_CLOSE);
    };
  }, []);

  return (
    tab && (
      <Dialog
        visible={visible}
        title={`是否要保存对 ${tab.title} 的更改?`}
        maxWidth="xs"
        actions={[
          {
            title: '保存',
            primary: true,
            handle: () => {
              onSave();
            },
          },
          {
            title: '不保存',
            primary: true,
            handle: () => {
              onClose();
            },
          },
          {
            title: '取消',
            handle: () => {
              setVisible(false);
            },
          },
        ]}
      >
        如果不保存，你的更改将丢失。
      </Dialog>
    )
  );
}
