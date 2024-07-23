import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Uri, editor as monacoEditor } from 'monaco-editor/esm/vs/editor/editor.api';
import { EditorContext } from './common/context';
import MonacoEditor from './monacoEditor';
import { BaseEditorProps } from './common/types';

interface ProviderProps extends BaseEditorProps {
  domElement: HTMLElement | string;
  children?: ReactElement;
}

export const Provider = ({
  domElement,
  children,
  monacoOptions,
  hotkeys,
  theme,
  contextmenus,
  monacoClassName,
}: ProviderProps) => {
  const [instance, setInstance] = useState<MonacoEditor>();
  const editor = useRef<MonacoEditor>();

  useEffect(() => {
    const editor = new MonacoEditor({
      el: domElement,
      ...monacoOptions,
      hotkeys,
      theme,
      contextmenus,
      extraEditorClassName: monacoClassName,
    });

    setInstance(editor);
  }, []);

  /**
   * 挂载文本模型到编辑器实例，如果文本模型不存在则创建
   * @param modelId 文本模型key，必须全局唯一
   * @param value 内容
   * @param language 语言
   * @param monacoOptions monaco-editor配置
   */
  const activeModel = (modelId: string, value = '', language = 'sql', monacoOptions = {}) => {
    if (!editor.current) {
      editor.current = instance!.create()!;
    }
    const modelUri = Uri.parse(modelId);
    let model = modelUri && monacoEditor.getModel(modelUri);
    if (model) {
      monacoEditor.setModelLanguage(model, language);
    } else {
      model = monacoEditor.createModel(value, language, modelUri);
    }
    const editorInstance = editor.current.getMonacoEditor()!;
    editorInstance.updateOptions(monacoOptions);
    editorInstance.setModel(model);
  };

  return (
    <EditorContext.Provider
      value={{
        instance,
        activeModel,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
