import { SparkSQL, HiveSQL } from 'dt-sql-parser';
import { editor, MarkerSeverity } from 'monaco-editor/esm/vs/editor/editor.api';
import { Engine } from '../common/constants';

const factory = {
  spark: SparkSQL,
  dlc: SparkSQL,
  hive: HiveSQL,
};

/**
 * 校验sql语法，并将错误信息展示在编辑器上
 * @param model monaco-editor 编辑器model
 * @param engine sql引擎类型，不同引擎语法不同，目前仅支持SparkSQL和HiveSQL
 */
const validate = ({ model, engine = Engine.spark }: { model: editor.ITextModel; engine: Engine }) => {
  if (!model) {
    return null;
  }

  const mysql = new factory[engine]();

  const errors = [];
  const lineCount = model.getLineCount();
  let currentSql = '';
  let currentStartline = 0;
  // 遍历每一行并获取其内容
  for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
    // 将wedata中的变量替换成占位符?
    const lineContent = model.getLineContent(lineNumber).replace(/\$\{.*?\}/g, '?');
    if (lineContent?.trim().endsWith(';') || lineNumber === lineCount) {
      currentSql += lineContent;
      const errorList = mysql.validate(currentSql);
      if (errorList?.length) {
        const idx = currentStartline;
        errors.push(
          ...errorList.map((error) => ({
            ...error,
            startLine: error.startLine + idx,
            endLine: error.endLine + idx,
          }))
        );
      }
      currentSql = '';
      currentStartline = lineNumber;
    } else {
      currentSql += `${lineContent}\n`;
    }
  }
  const markers = errors.map((error) => {
    let errorMsg = error.message;
    if (errorMsg?.startsWith('extraneous input')) {
      errorMsg = errorMsg.split('expecting')[0].concat(`expecting ${engine} keyword`);
    }
    return {
      startLineNumber: error.startLine,
      startColumn: error.startColumn,
      endLineNumber: error.endLine,
      endColumn: error.endColumn,
      message: errorMsg,
      severity: MarkerSeverity.Error,
    };
  });

  // 将错误信息标记到编辑器
  editor.setModelMarkers(model, 'sql', markers);
  return markers;
};

/**
 * 清除语法检查标记
 */
const clearMarkers = () => {
  editor.removeAllMarkers('sql');
};

export default { validate, clearMarkers };
