import { forwardRef } from 'react';
import { useConfirm, ConfirmOptions } from 'material-ui-confirm';
import { Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DEFAULT_OPTIONS = {
  confirmationText: '确定',
  cancellationText: '取消',
  allowClose: false,
  dialogProps: {
    maxWidth: 'xs',
    TransitionComponent: Transition
  },
  buttonOrder: ['confirm', 'cancel'],
  confirmationButtonProps: {
    variant: 'contained',
  },
};

type IConfirmOptions = ConfirmOptions & { onOk?: () => void; onCancel?: () => void };

export default function () {
  const muiConfirm = useConfirm();

  const confirm = (props: IConfirmOptions) => {
    muiConfirm({ ...DEFAULT_OPTIONS, ...(props ?? {}) } as ConfirmOptions)
      .then(() => {
        props.onOk?.();
      })
      .catch(() => {
        props.onCancel?.();
      });
  };

  return { confirm };
}
