import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { getColumnsByDbNameAndTableName, getTableListByDbName } from '../../common/util';

// hover
export const provideHover = async (model: monaco.editor.ITextModel, position: monaco.Position) => {
  const modelId = model.id;
  const word = model.getWordAtPosition(position);
  const tables = await getTableListByDbName(modelId);
  const table = tables.find((item) => item.name === word?.word);
  if (table) {
    // 根据库表名查询表字段
    const columns = await getColumnsByDbNameAndTableName(modelId, table.dbName, table.name);
    const columnsDetail = columns.reduce(
      (acc, item) => acc.concat(`|${item.name ?? '-'}|${item.type ?? '-'}|${item.description ?? '-'}|\n`),
      ''
    );

    return {
      contents: [
        {
          value: `**表:&nbsp;${table.name}**&nbsp;&nbsp;`,
        },
        {
          value: `|字段名&nbsp;|类型&nbsp;|描述|\n|:--|:--|:--|\n${columnsDetail}`,
        },
      ],
    };
  }

  return null;
};
