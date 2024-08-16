import { useImperativeHandle, useEffect, forwardRef, useRef, ForwardedRef } from 'react';
import MonacoEditor from './monacoEditor';
import { SqlEditorProps } from './common/types';
import { Engine } from './common/constants';
import EventBus from './common/eventBus';
import { sqlFormatter } from './sql/sqlFormatter';
import parser from './sql/sqlParser';
import { createDecorations } from './sql/createDecorations';

import './sql';

import './styles/index.less';
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
    onTableCompletion,
    onColumnCompletion,
    onFunctionCompletion,
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
        func: onFunctionCompletion,
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

  console.log('sqlEditor:', style);

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
