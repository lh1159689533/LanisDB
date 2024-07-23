import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Pagination, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PaginationProps, paginationClasses } from '@mui/material/Pagination';
import {
  Tabulator,
  ResizeRowsModule,
  ResizeColumnsModule,
  EditModule,
  SelectRowModule,
  FormatModule,
} from 'tabulator-tables';

import './index.less';

Tabulator.registerModule([ResizeRowsModule, ResizeColumnsModule, EditModule, SelectRowModule, FormatModule]);

type ICusTableEditor =
  | string
  | ((cell: any, onRendered: any, success: any, cancel: any, editorParams: any) => HTMLElement);

const CusPagination = styled(({ ...props }: PaginationProps) => <Pagination {...props} />)(() => ({
  [`& .${paginationClasses.ul} > li > .Mui-selected.MuiPaginationItem-page`]: {
    backgroundColor: 'var(--lanis-db-primary-color)',
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

export default forwardRef<any, ICusTable>(
  ({ columns, data, height, pagination = DEFAULT_PAGINATION, onPageChange }: ICusTable, ref) => {
    const [page, setPage] = useState<IPage>({ current: 1, size: 10, total: 0 });
    const [_pagination, setPagination] = useState<IPagination>(null);
    const [showPage, setShowPage] = useState(true);

    const tableInstance = useRef(null);
    const tableRef = useRef(null);

    useImperativeHandle(ref, () => ({
      add() {
        tableInstance.current.addRow({});
      },
      del() {},
      getRows() {},
      getSelRows() {},
    }));

    const handlePageChange = (_, current: number) => {
      setPage({ ...page, current });
      onPageChange?.({ ...page, current });
    };

    const handlePagesizeChange = (event) => {
      const size = event.target.value;
      setPage({ ...page, size, current: 1 });
      onPageChange?.({ ...page, size, current: 1 });
    };

    // 第一列的选择框
    const selectable = {
      formatter: 'rowSelection',
      hozAlign: 'center',
    };

    const getColumns = (columns: any[]) => {
      const minWidth = ((tableRef.current as HTMLElement).getBoundingClientRect()?.width - 20) / columns.length;
      return columns.map((col) => {
        let editor: ICusTableEditor = 'input';
        // if (col.type === 'date') {
        //   editor = dateEditor;
        // }
        delete col.type;
        return {
          ...col,
          minWidth: Math.max(minWidth, 100),
          editor,
        };
      });
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

    useEffect(() => {
      if (tableRef.current) {
        tableInstance.current = new Tabulator(tableRef.current, {
          // maxHeight: height,
          layout: 'fitColumns',
          // resizableColumnFit: true,
          columns: [selectable, ...getColumns(columns)],
          data,
          // resizableRows: true,
          addRowPos: 'top',
          selectable: 'highlight',
        });
      }
    }, [tableRef.current, columns]);

    useEffect(() => {
      if (data && tableInstance.current?.initialized) {
        tableInstance.current.replaceData(data);
      }
    }, [data]);

    useEffect(() => {
      if (tableInstance.current?.initialized) {
        tableInstance.current.setHeight(height);
      }
    }, [height]);

    return (
      <>
        <div ref={tableRef} className="cus-tabulator"></div>
        {showPage ? (
          <div className="p-2 flex justify-end items-center border-t">
            <span className="mr-4 text-base">共 {page.total} 条</span>
            {_pagination?.pageSizeOptions && (
              <Select defaultValue={_pagination.pageSizeOptions[0]} variant="standard" onChange={handlePagesizeChange}>
                {_pagination?.pageSizeOptions.map((item) => (
                  <MenuItem value={item} key={item}>
                    {item} 条/页
                  </MenuItem>
                ))}
              </Select>
            )}
            <CusPagination count={Math.ceil(page.total / page.size)} page={page.current} onChange={handlePageChange} />
          </div>
        ) : null}
      </>
    );
  }
);
