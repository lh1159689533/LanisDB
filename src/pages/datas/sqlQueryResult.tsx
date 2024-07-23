import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import Table from '@components/table';
import AppBar from '@src/components/appBar';
import { IPage } from '@src/types';
import { SaveIcon, DeleteIcon, PlusIcon, RefreshIcon } from '@components/icons-lanis';

interface IVirtualResultTable {
  current: string;
  value: string;
  columns: any[];
  data: any[];
  tableType?: 'virtial' | 'page'; // virtial 虚拟滚动, page 分页
  queryTableData?: (page) => Promise<{ columns: any[]; data: any[]; total: number }>;
  height?: number;
}

export default function VirtualResultTable({
  value,
  current,
  queryTableData,
  tableType = 'page',
  height,
  columns: columnList,
  data,
}: IVirtualResultTable) {
  const tableRef = useRef(null);
  const [tableScrollY, setTableScrollY] = useState(0);
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [page, setPage] = useState<IPage>({ current: 1, size: 10, total: 0 });

  const items = [
    {
      key: 'save',
      title: '保存',
      icon: <SaveIcon />,
      handle() {},
    },
    {
      key: 'new',
      title: '新增',
      icon: <PlusIcon />,
      handle() {
        tableRef.current.add();
      },
    },
    {
      key: 'del',
      title: '删除',
      icon: <DeleteIcon />,
      handle() {},
    },
    {
      key: 'refresh',
      title: '刷新',
      icon: <RefreshIcon />,
      async handle() {
        await loadData();
      },
    },
  ];

  const loadData = async () => {
    const resp = await queryTableData(page);
    if (resp) {
      setColumns(resp.columns);
      setDataSource(resp.data);
      setPage({ ...page, total: resp.total });
    }
  };

  const handlePageChange = async ({ current, size }) => {
    const resp = await queryTableData({ current, size });
    if (resp) {
      setDataSource(resp.data);
    } else {
      setDataSource(null);
    }
  };

  useEffect(() => {
    height &&
      setTableScrollY(
        height - 56 - 39 - (tableType === 'page' ? 48 : 0) // 56头部操作栏, 48分页, 39表头
      );
  }, [height]);

  useEffect(() => {
    if (tableType === 'page') {
      loadData();
    }
  }, [tableType]);

  useEffect(() => {
    if (tableType !== 'page') {
      setColumns(columnList);
      setDataSource(data);
    }
  }, [columnList, data]);

  return (
    <div role="tabpanel" hidden={value !== current}>
      <Box sx={{ p: 0, height: '100%' }}>
        <AppBar items={items} type="icon" />
        <div className="overflow-x-hidden">
          <Table
            ref={tableRef}
            columns={columns}
            data={dataSource}
            height={tableScrollY}
            pagination={tableType === 'page' ? page : false}
            onPageChange={handlePageChange}
          />
        </div>
      </Box>
    </div>
  );
}
