import { useState, useEffect } from 'react';
import { Pagination, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PaginationProps, paginationClasses } from '@mui/material/Pagination';
import Table from '@src/components/tabulator';

const CusPagination = styled(({ ...props }: PaginationProps) => (
  <Pagination {...props} />
))(() => ({
  [`& .${paginationClasses.ul} > li > .Mui-selected.MuiPaginationItem-page`]: {
    backgroundColor: '#818cf8',
    color: '#fff',
  },
}));

interface IPagination {
  current?: number;
  pageSize?: number;
  total?: number;
  defaultCurrent?: number;
  defaultPageSize?: number;
  hideOnSinglePage?: boolean; // 只有一页时是否隐藏分页器
  pageSizeOptions?: number[];
  onChange?: (page, pageSize) => void;
}

interface ICusTable {
  columns: any[];
  data: any[];
  height?: number;
  pagination?: IPagination | boolean;
  onPageChange?: (page: IPage) => void;
}

interface IPage {
  current: number;
  size: number;
  total: number;
}

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
  hideOnSinglePage: false,
  pageSizeOptions: [10, 20, 30, 50, 100],
};

export default function CusTable({
  columns,
  data,
  height,
  pagination = DEFAULT_PAGINATION,
  onPageChange,
}: ICusTable) {
  const [page, setPage] = useState<IPage>({ current: 1, size: 10, total: 0 });
  const [_pagination, setPagination] = useState<IPagination>(null);
  const [showPage, setShowPage] = useState(true);

  const handlePageChange = (_, current: number) => {
    setPage({ ...page, current });
    onPageChange?.({ ...page, current });
  };

  const handlePagesizeChange = (event) => {
    const size = event.target.value;
    setPage({ ...page, size, current: 1 });
    onPageChange?.({ ...page, size, current: 1 });
  };

  useEffect(() => {
    if (typeof pagination === 'boolean') {
      setShowPage(pagination);
      if (pagination) {
        setPagination(DEFAULT_PAGINATION);
        setPage({
          current: DEFAULT_PAGINATION.current,
          size: DEFAULT_PAGINATION.pageSize,
          total: DEFAULT_PAGINATION.total,
        });
      }
    } else {
      const newPagination = { ...DEFAULT_PAGINATION, ...pagination };
      setPagination(newPagination);
      setPage({
        current: newPagination.current ?? newPagination.defaultCurrent,
        size: newPagination.pageSize ?? newPagination.defaultPageSize,
        total: newPagination.total,
      });
    }
  }, [pagination]);

  return (
    <>
      <Table
        columns={columns}
        data={data}
        height={height}
      />
      {showPage ? (
        <div className="p-2 flex justify-end items-center border-t">
          <span className='mr-4 text-base'>共 {page.total} 条</span>
          {_pagination?.pageSizeOptions && (
            <Select
              defaultValue={_pagination.pageSizeOptions[0]}
              variant="standard"
              onChange={handlePagesizeChange}
            >
              {_pagination?.pageSizeOptions.map((item) => (
                <MenuItem value={item} key={item}>
                  {item} 条/页
                </MenuItem>
              ))}
            </Select>
          )}
          <CusPagination
            count={Math.ceil(page.total / page.size)}
            page={page.current}
            onChange={handlePageChange}
          />
        </div>
      ) : null}
    </>
  );
}
