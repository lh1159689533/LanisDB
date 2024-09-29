import { useEffect, useState } from 'react';
import { TextField, MenuItem } from '@mui/material';
import { Form } from 'antd';
import Dialog from '@components/dialog';
import { IDialect } from '@src/utils/db/types';
import { DIALECT } from '@src/constant';
import MysqlForm from './mysqlForm';
import SqliteForm from './sqliteForm';

const dialectList: IDialect[] = Object.values(DIALECT) as IDialect[];

interface IConfirmValues {
  dialect: string;
  ip?: string;
  port?: string;
  username?: string;
  password?: string;
  file?: string;
}

interface INewConnectModal {
  visible: boolean;
  data?: any;
  onClose: () => void;
  onConfirm: (actionType: string, values?: IConfirmValues) => void;
}

const DEFAULT_DATA = {
  dialect: DIALECT.mysql,
  ip: '',
  port: '',
  username: '',
  password: '',
  file: '',
  name: '',
  description: '',
};

export default function NewConnectModal({ visible, data, onConfirm, onClose }: INewConnectModal) {
  const [form] = Form.useForm();

  const [dialect, setDialect] = useState<IDialect>(DIALECT.mysql);
  const [initialValues, setInitialValues] = useState(DEFAULT_DATA);

  const reset = () => {
    form.resetFields();
    setDialect(DIALECT.mysql);
    setInitialValues(DEFAULT_DATA);
  };

  const handleClose = () => {
    onClose?.();
    reset();
  };

  /**
   * 测试连接
   */
  const handleTestConnect = async () => {
    // const values = await form.validateFields();
    onConfirm('testConnect');
  };

  /**
   * 连接
   */
  // const handleConnect = async () => {
  //   const values = await form.validateFields();
  //   onConfirm('connect', values);
  // };

  /**
   * 连接并保存
   */
  const handleSaveAndConnect = async () => {
    const values = await form.validateFields();
    // saveDBConnect(values);
    // onConfirm(values);
    onConfirm('saveAndConnect', values);
  };

  /**
   * 保存
   */
  const handleSave = async () => {
    const values = await form.validateFields();
    onConfirm('save', values);
  };

  const handleDialectChange = (event) => {
    setDialect(event.target.value);
  };

  const actions = [
    {
      title: '测试连接',
      primary: true,
      handle: handleTestConnect,
      visible: dialect === DIALECT.mysql,
    },
    // {
    //   title: '连接',
    //   primary: true,
    //   handle: handleConnect,
    //   visible: true,
    // },
    {
      title: '保存',
      primary: true,
      handle: handleSave,
      visible: true,
    },
    {
      title: '保存并连接',
      handle: handleSaveAndConnect,
      visible: true,
    },
    {
      title: '关闭',
      handle: handleClose,
      visible: true,
    },
  ];

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  useEffect(() => {
    if (data) {
      setInitialValues(data);
      setDialect(data.dialect ?? DIALECT.mysql);
      form.setFieldsValue(data);
    }
  }, [data]);

  return (
    <Dialog visible={visible} title="新建连接" okText="新建" actions={actions.filter((item) => item.visible)}>
      <Form
        name="new"
        form={form}
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        style={{ maxWidth: 600 }}
        initialValues={initialValues}
        autoComplete="off"
        size="small"
      >
        <Form.Item name="name">
          <TextField label="名称" size="small" margin="dense" fullWidth variant="standard" placeholder="连接名称" />
        </Form.Item>
        <Form.Item name="description">
          <TextField
            label="描述"
            size="small"
            margin="dense"
            fullWidth
            variant="standard"
            placeholder="连接的描述信息"
          />
        </Form.Item>
        <Form.Item name="dialect">
          <TextField
            select
            label="类型"
            size="small"
            margin="dense"
            fullWidth
            variant="standard"
            placeholder="数据库类型"
            onChange={handleDialectChange}
          >
            {dialectList.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Form.Item>
        {dialect === DIALECT.mysql ? <MysqlForm /> : <SqliteForm />}
      </Form>
    </Dialog>
  );
}
