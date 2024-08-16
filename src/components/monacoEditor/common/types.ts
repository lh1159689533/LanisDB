import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { CSSProperties } from 'react';

export interface MouseEvent {
  mouseDown: monacoEditor.IMouseEvent | null;
  mouseUp: monacoEditor.IMouseEvent | null;
}

/** 快捷键项 */
export interface Hotkey {
  id: string;
  /** 快捷键 */
  key: number;
  /** 是否显示为菜单，默认false不显示 */
  showMenu?: boolean;
  /** showMenu为true时的菜单项文案 */
  title?: string;
  /** showMenu为true时的菜单项分组 */
  groupId?: string;
  callback: (editor: monacoEditor.editor.ICodeEditor, ...args: any[]) => void;
}

/** 右键菜单项 */
export interface Contextmenu {
  id: string;
  /** 快捷键 */
  hotkey?: number;
  /** 菜单项名称 */
  title: string;
  /** 菜单项分组 */
  groupId?: string;
  /** 菜单项排序 */
  order?: number;
  /** 只读模式下是否显示: false 不显示、true 显示，默认不显示 */
  editorReadonly?: boolean;
  callback: (editor: monacoEditor.editor.ICodeEditor, ...args: any[]) => void;
}

export interface CompletionColumn {
  /** 库名 */
  dbName: string;
  /** 表名 */
  tblName: string;
  /** 字段名 */
  name: string;
  /** 字段类型 */
  type: string;
  /** 字段描述 */
  description: string;
}

export interface CompletionTable {
  /** 库名 */
  dbName: string;
  /** 表名 */
  name: string;
}

export interface CompletionFunc {
  /** 表名 */
  name: string;
  /** 快捷语法 */
  snippet?: string;
  /** 用法 */
  usage?: string;
  /** 说明 */
  desc?: string;
}

export interface MonacoEditorProps extends monacoEditor.editor.IStandaloneEditorConstructionOptions {
  /** 编辑器挂载容器 */
  el?: string | Element;
  /** 自定义快捷键 */
  hotkeys?: Hotkey[];
  /** 自定义右键菜单 */
  contextmenus?: Contextmenu[];
  /** 渲染行装饰，只需要返回一个数组，具体渲染在内部进行 */
  createDecorations?: (
    target: monacoEditor.editor.IMouseTarget,
    model: monacoEditor.editor.ITextModel
  ) => monacoEditor.editor.IModelDeltaDecoration[];
}

export type EditorConstructionOptions = NonNullable<Parameters<typeof monacoEditor.editor.create>[1]>;

export interface BaseEditorProps {
  /** 内容 */
  value?: string;
  /** 语言 */
  language?: string;
  /** 是否只读 */
  readOnly?: boolean;
  /** 自定义快捷键(可以通过showMenu显示到右键菜单) */
  hotkeys?: Hotkey[];
  /** 自定义右键菜单 */
  contextmenus?: Contextmenu[];
  /** 编辑器主题 */
  theme?: string;
  className?: string;
  style?: CSSProperties;
  /** 编辑器类名 */
  monacoClassName?: string;
  /** https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneEditorConstructionOptions.html */
  monacoOptions?: Omit<
    monacoEditor.editor.IStandaloneEditorConstructionOptions,
    'value' | 'readOnly' | 'theme' | 'language'
  >;
  /**
   * 内容变化回调
   * @param value 当前内容
   * @param codeChanged 内容是否变化
   */
  onChange?: (value: string, codeChanged: boolean) => void;
  /**
   * 选中内容回调
   * @param value 当前选中的内容
   * @param selection 选中的坐标信息
   * @param mouseEvent 鼠标位置信息
   */
  onSelection?: (
    value: string,
    selection: monacoEditor.editor.ICursorSelectionChangedEvent['selection'],
    mouseEvent?: MouseEvent
  ) => void;
  /**
   * 滚动回调
   * @param scrollEvent 滚动事件
   */
  onScroll?: (scrollEvent: monacoEditor.IScrollEvent) => void;
  editorWillMount?: (monaco: typeof monacoEditor) => void | EditorConstructionOptions;
  editorDidMount?: (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => void;
  editorWillUnmount?: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => void | EditorConstructionOptions;
}

export interface SqlEditorProps extends Omit<BaseEditorProps, 'language'> {
  /**
   * sql自动补全-函数回调
   */
  onFunctionCompletion?: () => Promise<CompletionFunc[]> | CompletionFunc[];
  /**
   * sql自动补全-表回调
   * @param databaseName 库名
   */
  onTableCompletion?: (databaseName: string) => Promise<CompletionTable[]>;
  /**
   * sql自动补全-表字段回调
   * @param databaseName 库名
   * @param tableName 表名
   * @param tableType 表类型
   */
  onColumnCompletion?: (databaseName: string, tableName: string, tableType: string) => Promise<CompletionColumn[]>;
}

export type DiffEditorWillMount = (
  monaco: typeof monacoEditor
) => void | monacoEditor.editor.IStandaloneEditorConstructionOptions;

export type DiffEditorDidMount = (
  editor: monacoEditor.editor.IStandaloneDiffEditor,
  monaco: typeof monacoEditor
) => void;

export type DiffEditorWillUnmount = (
  editor: monacoEditor.editor.IStandaloneDiffEditor,
  monaco: typeof monacoEditor
) => void;

export type ChangeHandler = (value: string, event: monacoEditor.editor.IModelContentChangedEvent) => void;

export type DiffChangeHandler = ChangeHandler;

export interface MonacoEditorBaseProps {
  /**
   * Width of editor. Defaults to 100%.
   */
  width?: string | number;

  /**
   * Height of editor. Defaults to 100%.
   */
  height?: string | number;

  /**
   * The initial value of the auto created model in the editor.
   */
  defaultValue?: string;

  /**
   * The initial language of the auto created model in the editor. Defaults to 'javascript'.
   */
  language?: string;

  /**
   * Theme to be used for rendering.
   * The current out-of-the-box available themes are: 'vs' (default), 'vs-dark', 'hc-black'.
   * You can create custom themes via `monaco.editor.defineTheme`.
   */
  theme?: string | null;

  /**
   * Optional string classname to append to the editor.
   */
  className?: string | null;
}

export interface MonacoDiffEditorProps extends MonacoEditorBaseProps {
  /**
   * The original value to compare against.
   */
  original?: string;

  /**
   * Value of the auto created model in the editor.
   * If you specify value property, the component behaves in controlled mode. Otherwise, it behaves in uncontrolled mode.
   */
  value?: string;

  /**
   * Refer to Monaco interface {monaco.editor.IDiffEditorConstructionOptions}.
   */
  options?: monacoEditor.editor.IDiffEditorConstructionOptions;

  /**
   * Refer to Monaco interface {monaco.editor.IEditorOverrideServices}.
   */
  overrideServices?: monacoEditor.editor.IEditorOverrideServices;

  /**
   * An event emitted before the editor mounted (similar to componentWillMount of React).
   */
  editorWillMount?: DiffEditorWillMount;

  /**
   * An event emitted when the editor has been mounted (similar to componentDidMount of React).
   */
  editorDidMount?: DiffEditorDidMount;

  /**
   * An event emitted before the editor unmount (similar to componentWillUnmount of React).
   */
  editorWillUnmount?: DiffEditorWillUnmount;

  /**
   * An event emitted when the content of the current model has changed.
   */
  onChange?: DiffChangeHandler;

  /**
   * Let the language be inferred from the uri
   */
  originalUri?: (monaco: typeof monacoEditor) => monacoEditor.Uri;

  /**
   * Let the language be inferred from the uri
   */
  modifiedUri?: (monaco: typeof monacoEditor) => monacoEditor.Uri;
}
