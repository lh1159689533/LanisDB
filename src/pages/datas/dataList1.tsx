import { useEffect, useRef, useState } from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Button from '@mui/material/Button';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
}

export default function DataList() {
  const tableRef = useRef(null);
  const [tableScrollY, setTableScrollY] = useState(0);

  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button size="small">删除</Button>,
    },
  ];

  const data: DataType[] = new Array(1000).fill(1).map((_, idx) => ({
    key: `${idx}`,
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  }));

  const resize = () => {
    if (tableRef.current?.parentElement) {
      setTableScrollY(tableRef.current.parentElement.getBoundingClientRect().height - 56 - 39);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    resize();
  }, [tableRef.current]);

  return (
    <Table
      ref={tableRef}
      columns={columns}
      dataSource={data}
      size="small"
      scroll={{ y: tableScrollY }}
      pagination={{
        defaultPageSize: 100,
        defaultCurrent: 1,
        showTotal: (total) => `总共 ${total} 条`
      }}
    />
  );
}
