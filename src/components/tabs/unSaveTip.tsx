import Dialog from '@src/components/dialog';

export default function UnSaveTip({ visible, onSave, onClose }) {
  return (
    <Dialog
      visible={visible}
      title="是否要保存对 test.js 的更改?"
      maxWidth="xs"
      actions={[
        {
          title: '保存',
          primary: true,
          handle: () => {
            onClose(true);
          },
        },
        {
          title: '不保存',
          primary: true,
          handle: () => {
            onSave();
            onClose();
          },
        },
        {
          title: '取消',
          handle: onClose,
        },
      ]}
    >
      如果不保存，你的更改将丢失。
    </Dialog>
  );
}
