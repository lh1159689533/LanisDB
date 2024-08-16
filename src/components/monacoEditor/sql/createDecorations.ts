import { editor as monacoEditor } from 'monaco-editor/esm/vs/editor/editor.api';

/**
 * 渲染行号装饰（一条绿色竖线，用来标识一整句SQL）
 * @param target MouseTarget
 */
export const createDecorations = (target: monacoEditor.IMouseTarget, model: monacoEditor.ITextModel) => {
  if (!model || !target?.position) return [];

  // 注释正则
  const commentRegexes = [
    /^((?:#|--).*?(?:\n|$))/, // # --
    /^(\/\*[^]*?(?:\*\/|$))/, // /* */
  ];

  const lineCount = model.getLineCount();
  const { lineNumber: currentLine } = target.position;
  let currentStartLine = currentLine;
  let currentEndLine = currentLine;
  let currentSql = '';

  // 从当前光标行向前查找，遇到分号停止，计算当前语句的startLine
  for (let lineNumber = currentLine - 1; lineNumber > 0; lineNumber--) {
    const lineContent = model.getLineContent(lineNumber);
    if (lineContent.trim().endsWith(';')) {
      break;
    }
    currentSql = `${lineContent}\n${currentSql}`;
    if (lineContent.trim() === '' || commentRegexes.some((reg) => reg.test(lineContent))) {
      continue;
    }
    currentStartLine = lineNumber;
  }

  // 跳过空白或注释(非sql语句内注释)，从当前行向前查找，如果都是空白行或注释行则跳过
  if (
    (model.getLineContent(currentLine).trim() === '' ||
      commentRegexes.some((reg) => reg.test(model.getLineContent(currentLine)))) &&
    currentStartLine === currentLine
  ) {
    return [];
  }

  // 从当前光标行向后查找，遇到分号停止，计算当前语句的endLine
  for (let lineNumber = currentLine; lineNumber <= lineCount; lineNumber++) {
    const lineContent = model.getLineContent(lineNumber);
    currentSql = `${currentSql}${lineContent}\n`;
    if (lineContent.trim() === '' || commentRegexes.some((reg) => reg.test(lineContent))) {
      continue;
    }
    currentEndLine = lineNumber;
    if (lineContent?.trim().endsWith(';')) {
      break;
    }
  }

  // 跳过空白或注释(非sql语句内注释)，从当前行向后查找，如果都是空白行或注释行则跳过
  if (
    (model.getLineContent(currentLine).trim() === '' ||
      commentRegexes.some((reg) => reg.test(model.getLineContent(currentLine)))) &&
    currentEndLine === currentLine
  ) {
    return [];
  }

  const decoration = {
    range: { startLineNumber: currentStartLine, startColumn: 1, endLineNumber: currentEndLine, endColumn: 1 },
    options: {
      isWholeLine: false,
      linesDecorationsClassName: 'code-lens-decoration',
    },
  };
  return [decoration];
};
