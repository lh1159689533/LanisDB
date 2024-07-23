# 编辑器

## 引入

```js
import { SqlEditor, MonacoEditor, MonacoDiffEditor, MonacoLog, sqlParser, sqlFormatter } from '@tencent/4t-ui';
```

## 介绍

1. `MonacoEditor`: 最基础的编辑器组件，能实现所有功能；
2. `SqlEditor`: 针对 `sql` 语言定制的编辑器，内置了库表补全、语法检查、格式化等功能；
3. `MonacoLog`: 针对 `log` 语言（日志）定制的编辑器，内置了日志关键字INFO、DEBUG等高亮，是否换行等功能；
4. `MonacoDiffEditor`: 对比编辑器，用法同 `react-monaco-editor`（不同版本可能略有区别，此处为0.55.0）；
5. `sqlParser`: `sql` 语法错误检查，并标记到编辑器，也提供了移除标记的方法；`SqlEditor` 组件也对相应方法进行了抛出：
    - `validate`: 语法错误检查并标记到编辑器
    - `clearMarkers`: 清除标记
6. `sqlFormatter`: `sql` 格式化：
    - `format`: 格式化并返回格式花后内容
    - `formatAndInsert`: 支持格式化选中内容并写入编辑器对应位置

## 使用

### 通用编辑器

```jsx
<MonacoEditor value="select * from user;" language="sql" monacoOptions={{ fontSize: 14 }} />
```

#### 组件属性

BaseEditorProps

```js
interface BaseEditorProps {
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
  /** monaco-editor配置 */
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
  /** 组件挂载前回调 */
  editorWillMount?: (monaco: typeof monacoEditor) => void | EditorConstructionOptions;
  /** 组件挂载后回调 */
  editorDidMount?: (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => void;
  /** 组件卸载前回调 */
  editorWillUnmount?: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor
  ) => void | EditorConstructionOptions;
}
```

Hotkey

```js
interface Hotkey {
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
```

Contextmenu

```js
interface Contextmenu {
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
```

### SQL编辑器

```jsx
import { SqlEditor, EditorKeyMod, EditorKeyCode, Hotkey, Engine } from '@tencent/4t-ui';
// ...

// 组件内部

const editorRef = useRef(null);

/** 自定义快捷键配置 */
const hotkeys: Hotkey[] = [{
  id: 'id',
  key: EditorKeyMod.CtrlCmd | EditorKeyCode.KeyS,
  callback: () => {},
}];

/** 自定义右键菜单配置 */
const contextmenus: Contextmenu[] = [{
  id: 'id',
  hotkey: EditorKeyMod.CtrlCmd | EditorKeyCode.KeyD,
  title: '运行',
  groupId: 'custom',
  order: 8,
  callback: () => {},
}];

const onEditorChange = (content: string) => {
  if (!editorRef.current) return;
  const datasourceType = 'hive';
  if (['hive'].includes(datasourceType)) {
    // 对hive进行语法检查（会将错误标记到编辑器上）
    editorRef.current.validate?.(Engine.hive);
  } else {
    // 清除语法检查标记
    editorRef.current.clearMarkers();
  }
  // ...
};

/**
 * 自动补全-库回调
 */
const onDbCompletion = async () => {
  // 获取库并返回
  // ...
  return [];
}

/**
 * 自动补全-表回调
 * @param databaseName 数据库名称
 */
const onTableCompletion = async (databaseName: string) => {
  // 获取表并返回
  // ...
  return [];
}

/**
 * 自动补全-表字段回调
 * @param databaseName 数据库名称
 * @param tableName 表名称
 * @param tableType 表类型
 */
const onColumnCompletion = async (databaseName: string, tableName: string, tableType?: string) => {
  // 获取字段并返回
  // ...
  return [];
}

<SqlEditor
  ref={editorRef}
  value=''
  readOnly={false}
  hotkeys={hotkeys}
  contextmenus={contextmenus}
  onChange={onEditorChange}
  onSelection={(value: string, _, mouseEvent) => {
    console.log(value, mouseEvent);
  }}
  onDbCompletion={onDbCompletion}
  onTableCompletion={onTableCompletion}
  onColumnCompletion={onColumnCompletion}
/>
```

#### 组件属性

SqlEditorProps

```js
interface SqlEditorProps extends Omit<BaseEditorProps, 'language'> {
  /**
   * sql自动补全-数据库回调
   */
  onDbCompletion?: () => Promise<string[]>;
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
```

#### 功能列表

- SQL语法高亮
- 代码提示
- select语句库表字段自动补全
- 语法错误检查
- 自定义快捷键
- 自定义右键菜单

### 对比编辑器

```jsx
<MonacoDiffEditor
  width="850"
  height="520"
  language="sql"
  value="123"
  original="234"
  options={{
    readOnly: true,
  }}
/>
```

### 日志组件

```jsx
const logs = `
[2024-06-05 14:42:57] INFO  [a393fbb3-b5de-4800-b015-18dc8f7701aa] - WeData JobId: 22f4841d-b269-471e-98db-38d4c0c08bf8, WeData JobExecutionId: 985b0666-d591-48e1-8118-e19c87302da2
[2024-06-05 14:42:57] INFO  [a393fbb3-b5de-4800-b015-18dc8f7701aa] - 准备提交以下sql到引擎执行: 
select * from 4dgt.test_hh;

[2024-06-05 14:42:58] INFO  [a393fbb3-b5de-4800-b015-18dc8f7701aa] - sql已提交至引擎执行
[2024-06-05 14:42:58] INFO  [a393fbb3-b5de-4800-b015-18dc8f7701aa] - 当前任务搜集预览数据量: 0行,最大预览量: 100MB
[2024-06-05 14:42:58] INFO  [a393fbb3-b5de-4800-b015-18dc8f7701aa] - 当前任务搜集预览数据量: 5行,最大预览量: 100MB
`;

<MonacoLog value={logs} height={500} />;
```

#### 组件属性

```js
interface IMonacoLog {
  /** 日志内容 */
  value: string;
  /** 高度 */
  height?: string;
  style?: React.CSSProperties;
  className?: string;
  /** 是否自动弹出搜索框 */
  autoShowFind?: boolean;
}
```

### 单实例模式

#### 引入OneInstanceProvider、EditorContext

```jsx
import { OneInstanceProvider, EditorContext, sqlParser, Engine } from '@tencent/4t-ui';
```

#### 初始编辑器实例挂载dom节点

```jsx
<div style={{ height: '100%' }}>
  <OneInstanceProvider domElement="#editor-test">
    <OneInstance />
  </OneInstanceProvider>
</div>
```

OneInstance(内部即可使用编辑器实例)

```jsx
function OneInstance() {
  const tabs = [
    {
      id: 'basic1',
      title: '编辑器1',
      params: {
        lang: 'python',
        code: 'print 123',
        monacoOptions: {
          theme: 'wd-light',
          fontSize: 14,
        },
      },
    },
    {
      id: 'basic2',
      title: '编辑器2',
      params: {
        lang: 'sql',
        code: 'select * from user;',
        monacoOptions: {
          theme: 'wd-light',
          fontSize: 14,
        },
      },
    },
    {
      id: 'basic3',
      title: '编辑器3',
      params: {
        lang: 'shell',
        code: 'echo "123"',
        monacoOptions: {
          theme: 'wd-light',
          fontSize: 14,
        },
      },
    },
  ];

  const [activeId, setActiveId] = useState('');

  const { instance, activeModel } = useContext(EditorContext);

  const onActive = (tabId) => {
    setActiveId(tabId);
    const tab = tabs.find((item) => item.id === tabId);
    // tab切换时，激活当前编辑器文本模型(通过tabId唯一确定一个文本模型)
    activeModel(tabId, tab.params.code, tab.params.lang, tab.params.monacoOptions ?? {});
  };

  const onChange = (value) => {
    // 内容变化时，校验sql语法
    sqlParser.validate({ model: instance.getModel(), engine: Engine.spark });
  };

  useEffect(() => {
    // 添加事件，监听编辑器内容变化
    instance?.on('change', onChange);
  }, [instance]);

  return (
    <>
      <Tabs
        activeId={activeId ?? tabs?.[0]?.id}
        tabs={tabs}
        onTabClick={onActive}
        boxClassName="wedata-design-mix"
        style={{ height: 40 }}
      ></Tabs>
      <div id="editor-test" className="sql-editor" style={{ width: '100%', height: '100%' }}></div>
    </>
  );
}
```
