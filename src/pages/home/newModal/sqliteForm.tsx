import { useState } from 'react';
import { Button, List, ListItem, IconButton, ListItemButton, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Form } from 'antd';
import { open } from '@tauri-apps/api/dialog';
// import DB from '@src/utils/db';

interface ISqliteFile {
  value?: string;
  onChange?: (value: string) => void;
}

function SqliteFile({ value, onChange }: ISqliteFile) {
  const [dbFile, setDBFile] = useState(value ?? '');

  const upload = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: '',
          extensions: ['db'],
        },
      ],
    });
    setDBFile(selected as string);
    onChange?.(selected as string);
    // const db = await DB.load({ dialect: 'sqlite', storage: selected as string });
    // const result = await db.select('select * from article');
    // console.log('result:', result)
  };

  return (
    <div className="rounded p-6">
      {dbFile ? (
        <List sx={{ width: '100%' }}>
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => setDBFile('')}>
                <DeleteIcon />
              </IconButton>
            }
            disablePadding
          >
            <ListItemButton>
              数据库文件：
              <ListItemText primary={dbFile} />
            </ListItemButton>
          </ListItem>
        </List>
      ) : (
        <div
          onClick={upload}
          className="upload-box border border-dashed rounded cursor-pointer flex flex-col items-center justify-around gap-4 py-10"
        >
          <i className="iconfont icon-upload text-6xl text-gray-400"></i>
          <span className="desc">拖拽数据库文件到此或点击上传</span>
          <Button>上传数据库文件</Button>
        </div>
      )}
    </div>
  );
}

export default function SqliteForm() {
  return (
    <Form.Item name="file" rules={[{ required: true, message: '请选择数据库文件' }]}>
      <SqliteFile />
    </Form.Item>
  );
}
