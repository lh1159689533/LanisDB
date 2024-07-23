import React, { useImperativeHandle, useEffect, forwardRef, useRef, ForwardedRef } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import MonacoEditor from './monacoEditor';
import { BaseEditorProps } from './common/types';

function Editor(
  {
    value = '',
    language = 'javascript',
    readOnly = false,
    hotkeys = [],
    theme,
    style = {},
    className = '',
    monacoClassName = '',
    monacoOptions = {},
    onScroll,
    onChange,
    onSelection,
    editorDidMount,
    editorWillMount,
    editorWillUnmount,
  }: BaseEditorProps,
  ref: ForwardedRef<any>
) {
  const monacoEditor = useRef<MonacoEditor>();
  const editorRef = useRef(null);

  const handleEditorWillMount = () => {
    const finalOptions = editorWillMount?.(monaco);
    return finalOptions || {};
  };

  useEffect(() => {
    if (!editorRef?.current) {
      return;
    }

    const finalOptions = { ...monacoOptions, ...handleEditorWillMount() };

    const editor = new MonacoEditor({
      el: editorRef.current,
      ...finalOptions,
      language,
      value,
      readOnly,
      hotkeys,
      theme,
      extraEditorClassName: monacoClassName,
    }).create();

    onChange && editor.on('change', onChange);
    onSelection && editor.on('selection', onSelection);
    onScroll && editor.on('onscroll', onScroll);

    monacoEditor.current = editor;

    editorDidMount?.(editor.getMonacoEditor()!, monaco);

    return () => {
      editorWillUnmount?.(monacoEditor.current?.getMonacoEditor()!, monaco);
      editor.dispose();
    };
  }, []);

  useEffect(() => {
    if (monacoEditor.current) {
      monacoEditor.current.setValue(value);
    }
  }, [value, monacoEditor.current]);

  useEffect(() => {
    if (language && monacoEditor.current) {
      monacoEditor.current.changeLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    monacoEditor.current?.updateOptions({ readOnly });
  }, [readOnly]);

  useEffect(() => {
    if (theme && monacoEditor.current) {
      monacoEditor.current.setTheme(theme);
    }
  }, [theme]);

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => monacoEditor.current,
      getMonacoEditor: () => monacoEditor.current?.getMonacoEditor(),
      getValue: () => monacoEditor.current?.getModel()?.getValue(),
    }),
    []
  );

  return (
    <div
      ref={editorRef}
      className={`monaco-editor ${className}`}
      style={{ width: '100%', height: '100%', ...style }}
    ></div>
  );
}

export default forwardRef(Editor);
