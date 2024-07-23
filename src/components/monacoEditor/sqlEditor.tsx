import React, { useImperativeHandle, useEffect, forwardRef, useRef, ForwardedRef } from 'react';
import { editor as monacoEditor } from 'monaco-editor/esm/vs/editor/editor.api';
import MonacoEditor from './monacoEditor';
import { SqlEditorProps } from './common/types';
import { Engine } from './common/constants';
import EventBus from './common/eventBus';
import { sqlFormatter } from './sql/sqlFormatter';
import parser from './sql/sqlParser';

import './sql';

import './styles/sqlEditor.less';

/**
 * SQL编辑器
 */
function SqlEditor(
  {
    value = '',
    readOnly = false,
    hotkeys = [],
    contextmenus = [],
    theme,
    style = {},
    className = '',
    monacoClassName = '',
    monacoOptions = {},
    onScroll,
    onChange,
    onSelection,
    onDbCompletion,
    onTableCompletion,
    onColumnCompletion,
  }: SqlEditorProps,
  ref: ForwardedRef<any>
) {
  const sqlEditor = useRef<MonacoEditor>();
  const editorRef = useRef<HTMLDivElement>(null);

  /**
   * sql语法检查
   * @param engine sql引擎，目前仅支持hive、dlc
   */
  const validate = (engine: Engine) => {
    parser.validate({ model: sqlEditor.current!.getModel()!, engine });
  };

  /**
   * 清除语法检查标记
   */
  const clearMarkers = () => {
    parser.clearMarkers();
  };

  /**
   * sql格式化，如果有选中只格式化选中部分
   */
  const format = () => {
    if (!sqlEditor.current) return;

    sqlFormatter.formatAndInsert(sqlEditor.current);
  };

  /**
   * 渲染行号装饰（一条绿色竖线，用来标识一整句SQL）
   * @param target MouseTarget
   */
  const createDecorations = (target: monacoEditor.IMouseTarget) => {
    const model = sqlEditor.current?.getModel();
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

    // 跳过空白或注释(非sql语句内注释)
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

    const decoration = {
      range: { startLineNumber: currentStartLine, startColumn: 1, endLineNumber: currentEndLine, endColumn: 1 },
      options: {
        isWholeLine: false,
        linesDecorationsClassName: 'code-lens-decoration',
      },
    };
    return [decoration];
  };

  const initEditor = () => {
    const editor = new MonacoEditor({
      el: editorRef.current!,
      ...monacoOptions,
      language: 'sql',
      value,
      readOnly,
      hotkeys,
      theme,
      contextmenus,
      extraEditorClassName: monacoClassName,
      createDecorations,
    }).create();

    onChange && editor.on('change', onChange);
    onSelection && editor.on('selection', onSelection);
    onScroll && editor.on('onscroll', onScroll);

    sqlEditor.current = editor;
  };

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    initEditor();

    return () => {
      sqlEditor.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (sqlEditor.current) {
      sqlEditor.current.setValue(value);
    }
  }, [value, sqlEditor.current]);

  useEffect(() => {
    sqlEditor.current?.updateOptions({ readOnly });
  }, [readOnly]);

  useEffect(() => {
    if (theme && sqlEditor.current) {
      sqlEditor.current.setTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    const modelId = sqlEditor.current?.getModel()?.id;
    if (modelId) {
      EventBus.set(modelId, {
        // db: onDbCompletion,
        table: onTableCompletion,
        column: onColumnCompletion,
      });
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => sqlEditor.current,
      getMonacoEditor: () => sqlEditor.current?.getMonacoEditor(),
      getValue: () => sqlEditor.current?.getModel()?.getValue(),
      format,
      validate,
      clearMarkers,
    }),
    []
  );

  return (
    <div
      ref={editorRef}
      className={`sql-monaco-editor ${className}`}
      style={{ width: '100%', height: '100%', ...style }}
    ></div>
  );
}

SqlEditor.displayName = 'SqlEditor';

export default forwardRef(SqlEditor);
