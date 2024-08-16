import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useMemo, useRef } from 'react';
import { MonacoDiffEditorProps } from './common/types';
import { getTheme } from './common/util';

import './styles/index.less';

function processSize(size: number | string) {
  return !/^\d+$/.test(size as string) ? size : `${size}px`;
}

function noop() {}

function MonacoDiffEditor({
  width,
  height,
  value,
  defaultValue,
  language,
  theme,
  options,
  overrideServices,
  editorWillMount,
  editorDidMount,
  editorWillUnmount,
  onChange,
  className,
  original,
  originalUri,
  modifiedUri,
}: MonacoDiffEditorProps) {
  const containerElement = useRef<HTMLDivElement | null>(null);

  const editor = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

  const subscription = useRef<monaco.IDisposable | null>(null);

  const preventTriggerChangeEvent = useRef<boolean | null>(null);

  const fixedWidth = processSize(width!);

  const fixedHeight = processSize(height!);

  const style = useMemo(
    () => ({
      width: fixedWidth,
      height: fixedHeight,
    }),
    [fixedWidth, fixedHeight]
  );

  const handleEditorWillMount = () => {
    const finalOptions = editorWillMount?.(monaco);
    return finalOptions || {};
  };

  const handleEditorDidMount = () => {
    editorDidMount?.(editor.current!, monaco);

    const { modified } = editor.current!.getModel()!;
    subscription.current = modified.onDidChangeContent((event) => {
      if (!preventTriggerChangeEvent.current) {
        onChange?.(modified.getValue(), event);
      }
    });
  };

  const handleEditorWillUnmount = () => {
    editorWillUnmount?.(editor.current!, monaco);
  };

  const initModels = () => {
    const finalValue = value !== null ? value : defaultValue;
    const originalModelUri = originalUri?.(monaco);
    const modifiedModelUri = modifiedUri?.(monaco);
    let originalModel = originalModelUri && monaco.editor.getModel(originalModelUri);
    let modifiedModel = modifiedModelUri && monaco.editor.getModel(modifiedModelUri);

    // Cannot create two models with the same URI,
    // if model with the given URI is already created, just update it.
    if (originalModel) {
      originalModel.setValue(original!);
      monaco.editor.setModelLanguage(originalModel, language!);
    } else {
      originalModel = monaco.editor.createModel(finalValue!, language, originalModelUri);
    }
    if (modifiedModel) {
      originalModel.setValue(finalValue!);
      monaco.editor.setModelLanguage(modifiedModel, language!);
    } else {
      modifiedModel = monaco.editor.createModel(finalValue!, language, modifiedModelUri);
    }

    editor.current!.setModel({
      original: originalModel,
      modified: modifiedModel,
    });
  };

  useEffect(() => {
    if (containerElement.current) {
      // Before initializing monaco editor
      handleEditorWillMount();
      editor.current = monaco.editor.createDiffEditor(
        containerElement.current,
        {
          ...(className ? { extraEditorClassName: className } : {}),
          ...options,
          theme: theme ?? getTheme(),
        },
        overrideServices
      );
      // After initializing monaco editor
      initModels();
      handleEditorDidMount();
    }
  }, []);

  useEffect(() => {
    if (editor.current) {
      editor.current.updateOptions({
        ...(className ? { extraEditorClassName: className } : {}),
        ...options,
      });
    }
  }, [className, options]);

  useEffect(() => {
    if (editor.current) {
      editor.current.layout();
    }
  }, [width, height]);

  useEffect(() => {
    if (editor.current) {
      const { original: originalEditor, modified } = editor.current.getModel()!;
      monaco.editor.setModelLanguage(originalEditor, language!);
      monaco.editor.setModelLanguage(modified, language!);
    }
  }, [language]);

  useEffect(() => {
    if (editor.current) {
      const { modified } = editor.current.getModel()!;
      preventTriggerChangeEvent.current = true;
      // modifiedEditor is not in the public API for diff editors
      editor.current.getModifiedEditor().pushUndoStop();
      // pushEditOperations says it expects a cursorComputer, but doesn't seem to need one.
      // @ts-expect-error
      modified.pushEditOperations(
        [],
        [
          {
            range: modified.getFullModelRange(),
            text: value,
          },
        ]
      );
      // modifiedEditor is not in the public API for diff editors
      editor.current.getModifiedEditor().pushUndoStop();
      preventTriggerChangeEvent.current = false;
    }
  }, [value]);

  useEffect(() => {
    if (editor.current) {
      const { original: originalEditor } = editor.current.getModel()!;
      if (original !== originalEditor.getValue()) {
        originalEditor.setValue(original!);
      }
    }
  }, [original]);

  useEffect(
    () => () => {
      if (editor.current) {
        handleEditorWillUnmount();
        editor.current.dispose();
        const { original: originalEditor, modified } = editor.current.getModel()!;
        if (originalEditor) {
          originalEditor.dispose();
        }
        if (modified) {
          modified.dispose();
        }
      }
      if (subscription.current) {
        subscription.current.dispose();
      }
    },
    []
  );

  return <div ref={containerElement} style={style} className="monaco-diff-editor" />;
}

MonacoDiffEditor.defaultProps = {
  width: '100%',
  height: '100%',
  original: null,
  value: null,
  defaultValue: '',
  language: 'javascript',
  theme: null,
  options: {},
  overrideServices: {},
  editorWillMount: noop,
  editorDidMount: noop,
  editorWillUnmount: noop,
  onChange: noop,
  className: null,
};

MonacoDiffEditor.displayName = 'MonacoDiffEditor';

export default MonacoDiffEditor;
