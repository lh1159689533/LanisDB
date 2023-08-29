import { enqueueSnackbar, closeSnackbar, OptionsWithExtraProps } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const DEFAULT_OPTIONS = {
  autoHideDuration: 3000, // 自动关闭时间
  preventDuplicate: true, // 防止重复, 根据message判断
  anchorOrigin: { horizontal: 'right', vertical: 'bottom' }, // 显示位置
};

/**
 * 全局消息提示
 */
export default function () {
  /**
   * autoHideDuration为0且没有自定义action，则显示关闭按钮
   * @param id 消息的唯一ID
   * @param props
   */
  const isShowClose = (id, props) => {
    if (props.autoHideDuration === 0 && !props.action) {
      props.autoHideDuration = null;
      props.action = (
        <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={() => closeSnackbar(id)}>
          <CloseIcon />
        </IconButton>
      );
    }
  };

  const success = (message: string, props?: OptionsWithExtraProps<'success'>) => {
    let id;
    const successProps = { ...DEFAULT_OPTIONS, ...(props ?? {}) } as OptionsWithExtraProps<'success'>;
    isShowClose(id, successProps);
    id = enqueueSnackbar(message, { variant: 'success', ...successProps });
  };

  const error = (message: string, props?: OptionsWithExtraProps<'error'>) => {
    let id;
    const successProps = { ...DEFAULT_OPTIONS, ...(props ?? {}) } as OptionsWithExtraProps<'error'>;
    isShowClose(id, successProps);
    id = enqueueSnackbar(message, { variant: 'error', ...successProps });
  };

  const warning = (message: string, props?: OptionsWithExtraProps<'warning'>) => {
    let id;
    const successProps = { ...DEFAULT_OPTIONS, ...(props ?? {}) } as OptionsWithExtraProps<'warning'>;
    isShowClose(id, successProps);
    id = enqueueSnackbar(message, { variant: 'warning', ...successProps });
  };

  const info = (message: string, props?: OptionsWithExtraProps<'info'>) => {
    let id;
    const successProps = { ...DEFAULT_OPTIONS, ...(props ?? {}) } as OptionsWithExtraProps<'info'>;
    isShowClose(id, successProps);
    id = enqueueSnackbar(message, { variant: 'info', ...successProps });
  };

  return { success, error, warning, info };
}
