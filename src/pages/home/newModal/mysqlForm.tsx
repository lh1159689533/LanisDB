import { useState } from 'react';
import { TextField, InputLabel, Input, InputAdornment, IconButton, FormControl } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Form } from 'antd';

export default function MysqlForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Form.Item
        name="ip"
        // initialValue={initialValues.ip}
        rules={[{ required: true, message: '数据库IP地址不能为空' }]}
      >
        <TextField
          label="IP"
          size="small"
          margin="dense"
          fullWidth
          variant="standard"
          required
          placeholder="数据库IP地址"
        />
      </Form.Item>
      <Form.Item
        name="port"
        // initialValue={initialValues.port}
        rules={[
          {
            validator(_, value) {
              if (!value) {
                return Promise.reject(new Error('端口不能为空'));
              } else if (!/\d+/.test(value)) {
                return Promise.reject(new Error('端口必须是数字'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <TextField
          label="端口"
          // type="number"
          size="small"
          margin="dense"
          fullWidth
          variant="standard"
          required
          placeholder="端口"
        />
      </Form.Item>
      <Form.Item
        name="username"
        // initialValue={initialValues.username}
        rules={[{ required: true, message: '用户名不能为空' }]}
      >
        <TextField
          label="用户名"
          size="small"
          margin="dense"
          fullWidth
          variant="standard"
          required
          placeholder="用户名"
        />
      </Form.Item>
      <Form.Item
        name="password"
        // initialValue={initialValues.password}
        rules={[{ required: true, message: '密码不能为空' }]}
      >
        <FormControl variant="standard" fullWidth required>
          <InputLabel htmlFor="new-connect-password">密码</InputLabel>
          <Input
            id="new-connect-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="密码"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword((show) => !show)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </Form.Item>
    </>
  );
}
