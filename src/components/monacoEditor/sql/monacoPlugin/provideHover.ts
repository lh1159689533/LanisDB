import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { getColumnsByDbNameAndTableName, getTableListByDbName, getFunctions } from '../../common/util';
import { IParseResult } from '../../syntaxParser';
import { sqlParser, reader } from './completion';
import { ITableInfo, ICursorInfo } from './completion/types';

// hover
export const provideHover = async (model: monaco.editor.ITextModel, position: monaco.Position) => {
  const modelId = model.id;
  const word = model.getWordAtPosition(position);
  const tables = await getTableListByDbName(modelId);
  const table = tables.find((item) => item.name === word?.word);

  const parseResult: IParseResult = await sqlParser(model.getValue(), model.getOffsetAt(position));
  const cursorInfo = await reader.getCursorInfo(parseResult.ast, parseResult.cursorKeyPath);

  if (cursorInfo.type === 'tableField' || cursorInfo.type === 'tableFieldAfterGroup') {
    // 字段
    const cursorRootStatementFields = await reader.getFieldsFromStatement(
      parseResult.ast,
      parseResult.cursorKeyPath,
      async (tableInfo) => {
        const columns = await getColumnsByDbNameAndTableName(
          modelId,
          tableInfo?.namespace.value as string,
          tableInfo?.tableName.value as string
        );
        return columns.map((item) => ({
          label: item.name,
          tblName: item.tblName,
          type: item.type ?? '',
          description: item.description,
          primaryKey: item.primaryKey,
        }));
      }
    );

    const column =
      cursorInfo.type === 'tableField'
        ? cursorRootStatementFields.find((item) => item.label === word?.word)
        : cursorRootStatementFields.find(
            (item) =>
              item.label === word?.word &&
              item.groupPickerName === (cursorInfo as ICursorInfo<{ groupName: string }>).groupName
          );

    const table = tables.find((item) => item.name === column.tblName);

    return {
      contents: [
        {
          value: `<div data-ui="column-info">
            <div>
              <div data-ui="label">所属表</div>
              <div data-ui="value"><div data-ui="icon"></div>${column.tblName}</div>
            </div>
            ${
              table?.description
                ? `<div>
                    <div data-ui="label">表说明</div>
                    <div data-ui="value">${table.description}</div>
                  </div>`
                : '<span></span>'
            }
            <div>
              <div data-ui="label">字段名</div>
              <div data-ui="value">${column.label}
              ${column.primaryKey ? '<div data-ui="primarykey">主键</div>' : ''}</div>
            </div>
            <div>
              <div data-ui="label">字段类型</div>
              <div data-ui="value">${column.type}</div>
            </div>
            <div>
              <div data-ui="label">字段描述</div>
              <div data-ui="value">${column.description ?? '-'}</div>
            </div>
          </div>`,
          supportHtml: true,
        },
      ],
    };
  } else if (cursorInfo.type === 'tableName') {
    // 表
    const { tableInfo } = cursorInfo as ICursorInfo<{ tableInfo: ITableInfo }>;
    const columns = await getColumnsByDbNameAndTableName(
      modelId,
      tableInfo?.namespace?.value,
      tableInfo?.tableName?.value
    );

    return {
      contents: [
        {
          value: `<div data-ui="table">
            <div data-ui="header">
              <div data-ui="table-name"><div data-ui="icon"></div>${table.name}</div>
              <div data-ui="table-desc">${table.description ?? ''}</div>
            </div>
            <div data-ui="columns">
              ${columns
                .map(
                  (item) =>
                    `<div data-ui="column">
                      <div data-ui="column-name">
                        <div>${item.name}</div>
                        ${item.primaryKey ? '<div data-ui="primarykey">主键</div>' : '<span></span>'}
                      </div>
                      <div>${item.type}</div>
                      <div>${item.description ?? '-'}</div>
                    </div>`
                )
                .join('')}
            </div>
          </div>`,
          supportHtml: true,
        },
      ],
    };
  } else if (cursorInfo.type === 'functionName') {
    // 函数
    const functionName = cursorInfo.token.value;
    const functions = await getFunctions(modelId);
    const current = functions?.find((item) => item.name === functionName);
    if (!current) return null;

    return {
      contents: [
        {
          value: `<div data-ui="function">
            <div>
              <div data-ui="label">函数名</div>
              <div data-ui="value">${current.name}</div>
            </div>
            <div>
              <div data-ui="label">函数描述</div>
              <div data-ui="value">${current.description ?? '-'}</div>
            </div>
            <div>
              <div data-ui="label">函数用法</div>
              <div data-ui="value">${current.usage ?? '-'}</div>
            </div>
          </div>`,
          supportHtml: true,
        },
      ],
    };
  }

  return null;
};
