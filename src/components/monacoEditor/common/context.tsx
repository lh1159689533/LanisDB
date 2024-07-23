import { createContext } from 'react';
import { BaseEditorProps } from './types';
import type MonacoEditor from '../monacoEditor';

export interface IContextStore {
  /** MonacoEditor实例（我们封装的，并不是monaco-editor实例） */
  instance?: MonacoEditor;
  /** 激活文本模型并挂载到编辑器实例 */
  activeModel: (
    modelId: string,
    language?: string,
    value?: string,
    monacoOptions?: BaseEditorProps['monacoOptions']
  ) => void;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const EditorContext = createContext<IContextStore>({} as IContextStore);
