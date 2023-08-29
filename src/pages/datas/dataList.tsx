import { useEffect, useRef, useState } from 'react';
import VirtualTable from '@src/components/virtualTable';

export default function DataList() {
  const tableRef = useRef(null);
  const [tableScrollY, setTableScrollY] = useState(0);

  // Usage
  const columns = [
    { title: 'A', dataIndex: 'key' },
    { title: 'B', dataIndex: 'key' },
    { title: 'C', dataIndex: 'key' },
    { title: 'D', dataIndex: 'key' },
    { title: 'E', dataIndex: 'key' },
    { title: 'F', dataIndex: 'key' },
  ];

  const data = Array.from({ length: 100000 }, (_, key) => ({ key }));

  const resize = () => {
    if (tableRef.current?.parentElement) {
      setTableScrollY(
        tableRef.current.parentElement.getBoundingClientRect().height - 56 - 39
      );
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
    <div ref={tableRef} className="overflow-x-hidden mt-2">
      <VirtualTable
        columns={columns}
        dataSource={data}
        scroll={{ y: tableScrollY }}
        rowHeight={42}
      />
    </div>
  );
}
