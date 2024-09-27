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

  if (cursorInfo.type === 'tableField') {
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
          sortText: item.tblName,
          detail: item.type ?? '',
          documentation: item.description,
        }));
      }
    );
    const column = cursorRootStatementFields.find((item) => item.label === word?.word);

    return {
      contents: [
        {
          value: `<div data-ui="column">
            <div>
              <div data-ui="label">所属表</div>
              <div data-ui="value"><div data-ui="icon"></div>${column.sortText}</div>
            </div>
            <div>
              <div data-ui="label">字段名</div>
              <div data-ui="value">${column.label}</div>
            </div>
            <div>
              <div data-ui="label">字段类型</div>
              <div data-ui="value">${column.detail}</div>
            </div>
            <div>
              <div data-ui="label">字段描述</div>
              <div data-ui="value">${column.documentation ?? '-'}</div>
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
              <span data-ui="table-name"><div data-ui="icon"></div>${table.name}</span>
              <div data-ui="table-desc">${table.desc ?? ''}</div>
            </div>
            <div data-ui="columns">
              ${columns
                .map(
                  (item) =>
                    `<div data-ui="column"><span data-ui="column-name">${item.name}</span><span>${
                      item.type
                    }</span><span>${item.description ?? '-'}</span></div>`
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
              <div data-ui="value">${current.desc ?? '-'}</div>
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
