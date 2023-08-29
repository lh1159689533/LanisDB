import { useEffect, useRef } from 'react';
import {
  Tabulator,
  ResizeRowsModule,
  ResizeColumnsModule,
  EditModule,
} from 'tabulator-tables';
import dayjs from 'dayjs';

import './index.less'

Tabulator.registerModule([ResizeRowsModule, ResizeColumnsModule, EditModule]);

type ICusTableEditor = string | ((cell: any, onRendered: any, success: any, cancel: any, editorParams: any) => HTMLElement);

interface ITabulatorProps {
  columns: any[];
  data: any[];
  height?: number;
}

export default function ({ columns, data, height }: ITabulatorProps) {
  var dateEditor = function (cell, onRendered, success) {
    var editor = document.createElement('input');

    editor.setAttribute('type', 'date');

    editor.style.padding = '3px';
    editor.style.width = '100%';
    editor.style.boxSizing = 'border-box';

    editor.value = dayjs(cell.getValue()).format('YYYY-MM-DD');

    onRendered(function () {
      editor.focus();
      editor.style.width = '100%';
    });

    function successFunc(e) {
      success(e.target.value);
    }

    editor.addEventListener('change', successFunc);
    editor.addEventListener('blur', successFunc);

    return editor;
  };

  // const columns = [
  //   {
  //     title: 'Name',
  //     field: 'name',
  //     width: 150,
  //     editor: true,
  //     resizable: true,
  //   },
  //   {
  //     title: 'Age',
  //     field: 'age',
  //     hozAlign: 'left',
  //     editor: true,
  //     resizable: true,
  //   },
  //   {
  //     title: 'Favourite Color',
  //     field: 'col',
  //     editor: true,
  //   },
  //   {
  //     title: 'Date Of Birth',
  //     field: 'dob',
  //     hozAlign: 'center',
  //     editor: dateEditor,
  //     // editor: 'date',
  //     // editorParams: {
  //     //   min: '2020-01-01', // the minimum allowed value for the date picker
  //     //   max: '2023-12-12', // the maximum allowed value for the date picker
  //     //   format: 'yyyy-MM-dd', // the format of the date value stored in the cell
  //     //   verticalNavigation: 'table', //navigate cursor around table without changing the value
  //     //   elementAttributes: {
  //     //     title: 'slide bar to choose option', // custom tooltip
  //     //   },
  //     // },
  //     resizable: true,
  //   },
  //   {
  //     title: 'Rating',
  //     field: 'rating',
  //     hozAlign: 'center',
  //     formatter: 'star',
  //     editor: true,
  //     resizable: true,
  //   },
  // ];

  // const data = [
  //   { id: 1, name: 'Oli Bob', age: '12', col: 'red', dob: '' },
  //   { id: 2, name: 'Mary May', age: '1', col: 'blue', dob: '2020-01-01' },
  //   {
  //     id: 3,
  //     name: 'Christine Lobowski',
  //     age: '42',
  //     col: 'green',
  //     dob: '2020-01-01',
  //   },
  //   {
  //     id: 4,
  //     name: 'Brendon Philips',
  //     age: '125',
  //     col: 'orange',
  //     dob: '2020-01-01',
  //   },
  //   {
  //     id: 5,
  //     name: 'Margret Marmajuke',
  //     age: '16',
  //     col: 'yellow',
  //     dob: '2020-01-01',
  //   },
  // ];

  const tableInstance = useRef(null);

  const tableRef = useRef(null);

  const getColumns = (columns: any[]) => {
    const minWidth =
      ((tableRef.current as HTMLElement).getBoundingClientRect()?.width - 20) /
      columns.length;
    return columns.map((col) => {
      let editor: ICusTableEditor = 'input';
      if (col.type === 'date') {
        editor = dateEditor;
      }
      return { ...col, minWidth: Math.max(minWidth, 100), editor };
    });
  };

  useEffect(() => {
    if (tableRef.current) {
      tableInstance.current = new Tabulator(tableRef.current, {
        maxHeight: height,
        layout: 'fitColumns',
        // resizableColumnFit: true,
        columns: getColumns(columns),
        data,
        // resizableRows: true,
      });
    }
  }, [tableRef.current, height, columns]);

  useEffect(() => {
    if (data && tableInstance.current?.initialized) {
      tableInstance.current.replaceData(data);
    }
  }, [data]);

  return <div ref={tableRef} className="cus-tabulator"></div>;
}
