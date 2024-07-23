import { editor, KeyMod, KeyCode } from 'monaco-editor/esm/vs/editor/editor.api';

/** 编辑器默认配置 */
export const DEFAULT_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  /** 行号左边距渲染 */
  glyphMargin: false,
  /** 行号右侧装饰宽度 */
  lineDecorationsWidth: 10,
  /** 行高 */
  lineHeight: 21,
  /** 字体大小 */
  fontSize: 14,
  /** 控制行号的宽度 */
  lineNumbersMinChars: 5,
  /** 设置tab空格符数量 */
  tabSize: 4,
  /** 设置空白符替换 */
  renderWhitespace: 'none',
  // revealHorizontalRightPadding: 2000,
  /** 自动补全列表中选择的默认项：first 选择列表中的第一个项，recentlyUsed 选择最近使用的项， recentlyUsedByPrefix 选择与当前输入的前缀匹配的最近使用的项 */
  suggestSelection: 'recentlyUsedByPrefix',
  /** 当继续输入时，保持当前选中的建议项不变 */
  stablePeek: true,
  /** 换行 */
  wordWrap: 'on',
  /** 当前行突出显示方式 "all" | "line" | "none" | "gutter" */
  renderLineHighlight: 'none',
  /** 使用圆形边框渲染编辑器选择的文本 */
  roundedSelection: false,
  /** 编辑器是否可以滚动到最后一行之外，默认true */
  scrollBeyondLastLine: true,
  /** 编辑区域大小自适应 */
  automaticLayout: true,
  /** 控制光标在右侧概览中是否可见，true 不可见，false 可见 */
  hideCursorInOverviewRuler: false,
  /** 滚动条设置 */
  scrollbar: {
    /** 是否在滚动条周围使用阴影，默认true */
    useShadows: true,
    /** 是否在垂直滚动条上显示箭头，默认false */
    verticalHasArrows: false,
    /** 是否在水平滚动条上显示箭头，默认false */
    horizontalHasArrows: false,
    /** 垂直滚动条的可见性：auto、visible、hidden，默认auto */
    vertical: 'auto',
    /** 垂直滚动条的可见性：auto、visible、hidden，默认auto */
    horizontal: 'auto',
    /** 垂直滚动条的宽度，默认10 */
    verticalScrollbarSize: 14,
    /** 水平滚动条的宽度，默认10 */
    horizontalScrollbarSize: 14,
    /** 滚动条箭头的大小（以像素为单位）。默认值为 11 */
    arrowSize: 14,
  },
  /** 缩略图设置 */
  minimap: {
    /** 缩略图是否可见，默认true */
    enabled: true,
    /** 缩略图的位置：left、right，默认right */
    side: 'right',
    /** 缩略图滑块的可见性：always、mouseover，默认mouseover */
    showSlider: 'mouseover',
    /** 是否在缩略图中渲染字符，默认true */
    renderCharacters: true,
    /** 缩略图的最大宽度，默认120 */
    maxColumn: 120,
    /** 缩略图的缩放比例，默认1 */
    scale: 1,
  },
  /** 控制编辑器中 Unicode 字符的高亮显示 */
  unicodeHighlight: {
    /** 是否高亮显示可能导致歧义的 Unicode 字符（设置为false，解决中文逗号等字符黄色高亮显示问题） */
    ambiguousCharacters: false,
  },
};

/** 编辑器主题 */
export const THEME = {
  /** 浅色 */
  light: 'wd-light',
  /** 深色 */
  dark: 'wd-dark',
};

export const EditorKeyMod = {
  /** Alt键 */
  Alt: KeyMod.Alt,
  /** Ctrl/Cmd键 */
  CtrlCmd: KeyMod.CtrlCmd,
  /** Shift键 */
  Shift: KeyMod.Shift,
  /** WinCtrl键 */
  WinCtrl: KeyMod.WinCtrl,
};

/** 键盘上字母、数字、符号等键值 */
export const EditorKeyCode = KeyCode;

/** 不显示的右键菜单ID */
export const REMOVE_MENU_IDS = ['editor.action.changeAll'];

// sql引擎类型，目前仅支持SparkSQL(dlc使用)和HiveSQL
export enum Engine {
  spark = 'spark',
  hive = 'hive',
  dlc = 'dlc',
}

/** 自定义关键字(支持客户关键词使用) */
export const CUSTOM_KEYWORDS = ['DATABASES'];
