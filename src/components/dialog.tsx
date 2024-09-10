import { forwardRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Slide, Button, DialogProps } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ITransitionDialog {
  visible: boolean;
  title: string | React.ReactNode;
  children: React.ReactNode;
  okText?: string;
  cancleText?: string;
  actions?: { title: string; primary?: boolean; handle?: () => void }[];
  maxWidth?: DialogProps['maxWidth'];
  onClose?: () => void;
  onConfirm?: () => void;
}

export default function TransitionDialog({
  visible,
  title,
  children,
  okText = '确定',
  cancleText = '取消',
  actions,
  maxWidth,
  onClose,
  onConfirm,
}: ITransitionDialog) {
  const handleClose = () => {
    // if (reason === 'backdropClick') return;
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <Dialog
      open={visible}
      TransitionComponent={Transition}
      fullWidth
      // onClose={handleClose}
      aria-describedby="new-database-dialog"
      disableEscapeKeyDown
      maxWidth={maxWidth}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        {actions ? (
          actions.map((item) => (
            <Button key={item.title} color={item.primary ? 'primary' : 'inherit'} onClick={() => item.handle?.()}>
              {item.title}
            </Button>
          ))
        ) : (
          <>
            {okText && <Button onClick={handleConfirm}>{okText}</Button>}
            {cancleText && (
              <Button color="inherit" onClick={handleClose}>
                {cancleText}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
