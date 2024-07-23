import { editor as monacoEditor, IScrollEvent, IRange, KeyMod, KeyCode } from 'monaco-editor/esm/vs/editor/editor.api';
import { MenuRegistry } from 'monaco-editor/esm/vs/platform/actions/common/actions';

import 'monaco-editor/esm/vs/editor/editor.all';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution';
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution';
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution';

import { MonacoEditorProps, Hotkey, Contextmenu, MouseEvent } from './common/types';
import { DEFAULT_OPTIONS, REMOVE_MENU_IDS } from './common/constants';
import { getTheme } from './common/util';
import EventBus, { EventCallback } from './common/eventBus';
import { sqlFormatter } from './sql/sqlFormatter';

import './common/registerTheme';

interface IDisposable {
  dispose(): void;
}

class MonacoEditor {
  private el: any;
  private props: Omit<MonacoEditorProps, 'el' | 'hotkeys' | 'contextmenus'>;
  private theme: string;
  private hotkeys: Hotkey[] | undefined;
  private contextmenus: Contextmenu[] | undefined;
  private editor: monacoEditor.IStandaloneCodeEditor | undefined;
  private initValue: string;
  private subscription: IDisposable[];
  private contentChangeTimer: any;
  private contentSelectTimer: any;
  private eventBus: EventBus;
  private observer: MutationObserver | null;
  private decoration: monacoEditor.IEditorDecorationsCollection | undefined;
  /**
   * 鼠标信息
   */
  private mouseEvent: MouseEvent;

  constructor({ el, language = 'json', theme = '', hotkeys, contextmenus, value = '', ...props }: MonacoEditorProps) {
    this.el = el;
    this.theme = theme;
    this.props = {
      ...DEFAULT_OPTIONS,
      ...props,
      theme: this.theme || getTheme(),
      value,
      language,
    };
    this.initValue = value;
    this.hotkeys = hotkeys;
    this.contextmenus = contextmenus;
    this.eventBus = new EventBus();
    this.mouseEvent = { mouseDown: null, mouseUp: null };
    this.subscription = [];
    this.observer = null;
  }

  /**
   * 创建editor实例
   */
  create() {
    this.el = typeof this.el === 'string' ? document.querySelector(this.el) : this.el;
    this.editor = monacoEditor.create(this.el, this.props);

    this.subscription = [
      this.editor.onDidChangeModelContent(this.didChangeModelContent.call(this)),
      this.editor.onDidChangeCursorSelection(this.didChangeCursorSelection.bind(this)),
      this.editor.onDidScrollChange(this.didScrollChange.bind(this)),
      this.editor.onMouseUp((browserEvent) => {
        this.mouseEvent.mouseUp = browserEvent.event;
      }),
      this.editor.onMouseDown((browserEvent) => {
        this.mouseEvent.mouseDown = browserEvent.event;
        this.createDecorations(browserEvent.target);
      }),
    ];

    // 自定义快捷键
    this.addHotkeys();
    // 自定义右键菜单
    this.addContextmenu();
    // 添加自定义右键菜单
    this.resetContextmenu();

    if (!this.theme) {
      // 自适应主题，如果外部传入自定义主题，则不自适应
      this.setTheme(getTheme());
      this.observer = new MutationObserver(() => {
        this.setTheme(getTheme());
      });
      this.observer.observe(document.body, { attributes: true });
    } else {
      this.setTheme(this.theme);
    }

    return this;
  }

  /**
   * 添加快捷键
   */
  addHotkeys(hotkeys?: Hotkey[]) {
    const keys = hotkeys ?? this.hotkeys;
    if (!keys?.length) {
      return;
    }
    keys.forEach((item) => {
      if (item.showMenu && item.title) {
        this.addContextmenu([
          {
            ...item,
            title: item.title,
            hotkey: item.key,
          },
        ]);
      } else {
        this.addAction({
          id: item.id,
          keybindings: [item.key],
          label: '',
          run: item.callback,
        });
      }
    });
  }

  /**
   * 添加自定义右键菜单
   */
  addContextmenu(contextmenus?: Contextmenu[]) {
    const menus = contextmenus ?? this.contextmenus;
    if (!menus?.length) {
      return;
    }
    menus.forEach((item) => {
      this.addAction({
        id: item.id,
        label: item.title,
        keybindings: item.hotkey ? [item.hotkey] : [],
        contextMenuGroupId: item.groupId ?? 'custom',
        contextMenuOrder: item.order ?? 1,
        precondition: !item.editorReadonly ? '!editorReadonly' : 'editorReadonly',
        run: item.callback,
      });
    });
  }

  /**
   * 获取当前选中内容
   */
  getSelectionContent() {
    const { startLineNumber, endLineNumber, startColumn, endColumn } = this.editor!.getSelection()!;
    if (startLineNumber === endLineNumber && startColumn === endColumn) {
      return '';
    }
    return this.editor!.getModel()!.getValueInRange({ startLineNumber, endLineNumber, startColumn, endColumn });
  }

  /**
   * 获取当前行内容
   */
  getCurrentLineContent() {
    const { lineNumber } = this.editor!.getPosition()!;
    return this.editor!.getModel()!.getLineContent(lineNumber).concat('\n');
  }

  /**
   * 添加事件监听
   * @param eventName 事件名
   * @param callback 回调
   */
  on(eventName: string, callback: EventCallback) {
    this.eventBus.on(eventName, callback);
  }

  /**
   * 触发事件
   * @param eventName 事件名
   * @param args 传参
   */
  emit(eventName: string, ...args: any[]) {
    this.eventBus.emit(eventName, ...args);
  }

  toTop() {
    this.editor!.setScrollPosition({
      scrollLeft: 0,
      scrollTop: 0,
    });
  }

  /**
   * set内容
   * @param value 新值
   */
  setValue(value: string) {
    const position = this.editor!.getPosition()!;
    const selection = this.editor!.getSelection()!;

    this.initValue = value;
    const model = this.editor!.getModel()!;
    model.pushEditOperations(
      [],
      [
        {
          range: this.editor!.getModel()!.getFullModelRange(),
          text: value,
        },
      ],
      null as unknown as monacoEditor.ICursorStateComputer
    );

    // 保持光标位置和选中内容
    this.editor!.setPosition(position);
    this.editor!.setSelection(selection);
  }

  /**
   * 获取内容
   * @returns 最新内容
   */
  getValue() {
    return this.editor!.getModel()!.getValue();
  }

  /**
   * 获取指定范围内容
   * @param range 范围
   */
  getValueInRange(range: IRange) {
    return this.editor!.getModel()!.getValueInRange(range);
  }

  /**
   * 编辑器指定位置插入内容(默认插入在最后一行的末尾)
   * @param value 插入的内容
   * @param pos 位置信息
   */
  insertValue(value: string, pos?: IRange) {
    let range = pos;
    if (!pos) {
      const { endLineNumber } = this.editor!.getModel()!.getFullModelRange();
      range = {
        startLineNumber: endLineNumber + 1,
        startColumn: 1,
        endColumn: 1,
        endLineNumber: endLineNumber + value.split('\n').length,
      };
    }
    // 编辑器set值，有历史栈，可撤销
    this.editor!.executeEdits('', [
      {
        range: range!,
        text: value,
      },
    ]);
  }

  /**
   * 光标定位
   * @param type last 定位到最末行
   * @param isAutoScroll 是否自动滚动, 用户聚焦日志窗口停止滚动;
   */
  focus(type: 'top' | 'last', isAutoScroll = true) {
    if (type === 'last' && isAutoScroll) {
      this.editor!.setScrollTop(this.editor!.getScrollHeight());
    } else if (type === 'top') {
      this.editor!.focus();
    }
  }

  /**
   * 改变editor语言
   * @param language 语言
   */
  changeLanguage(language: string) {
    monacoEditor.setModelLanguage(this.editor!.getModel()!, language);
  }

  /**
   * 更新编辑器配置
   * @param newOptions 新配置
   */
  updateOptions(newOptions: monacoEditor.IEditorOptions & monacoEditor.IGlobalEditorOptions) {
    this.editor!.updateOptions(newOptions);
  }

  /**
   * 显示搜索框
   */
  showFind() {
    this.editor!.trigger('', 'actions.find', null);
  }

  /**
   * 获取当前monaco编辑器实例
   */
  getMonacoEditor() {
    return this.editor;
  }

  /**
   * 获取当前编辑器模型
   */
  getModel() {
    return this.editor!.getModel();
  }

  /**
   * 设置主题
   * @param theme 主题
   */
  setTheme(theme: string) {
    const globalStyleElement = (this.editor as any)?._themeService?._globalStyleElement;
    if (globalStyleElement) {
      // 适配类似开发/探索这种模式，如果主题不一致且切换时页面没有整体刷新，monaco会生成两个style，导致主题样式冲突
      globalStyleElement.className = 'monaco-colors';
      globalStyleElement.classList.add(theme);

      const monacoColors = document.querySelectorAll('style.monaco-colors');
      monacoColors.forEach((item) => {
        if (item === globalStyleElement) {
          (item as any).type = 'text/css';
        } else {
          (item as any).type = 'text/none';
        }
      });
    }
    monacoEditor.setTheme(theme);
  }

  dispose() {
    this.observer?.disconnect();
    this.eventBus.clear();
    if (this.editor) {
      this.editor.dispose();
      const model = this.editor.getModel();
      if (model) {
        model.dispose();
      }
    }
    if (this.subscription?.length) {
      this.subscription.forEach((sub) => sub.dispose());
    }
    if (this.contentChangeTimer) {
      clearTimeout(this.contentChangeTimer);
      this.contentChangeTimer = null;
    }
  }

  private addAction(action: monacoEditor.IActionDescriptor) {
    this.editor!.addAction(action);
  }

  /**
   * 渲染行号装饰
   * @param target MouseTarget
   */
  createDecorations(target: monacoEditor.IMouseTarget) {
    if (this.props.createDecorations) {
      this.decoration?.clear();
      this.decoration = this.editor!.createDecorationsCollection(this.props.createDecorations(target));
    }
  }

  /**
   * 修改编辑器右键菜单：
   * 1.移除不需要的菜单项
   * 2.增加显示复制、剪切、粘贴的快捷键
   */
  private resetContextmenu() {
    // 移除不需要的右键菜单
    this.removeContextmenuById();

    // 复制、粘贴、剪切菜单增加显示快捷键
    monacoEditor.addKeybindingRules(
      [
        { key: 'editor.action.clipboardCutAction', hotkey: KeyMod.CtrlCmd | KeyCode.KeyX, when: '!editorReadonly' },
        { key: 'editor.action.clipboardCopyAction', hotkey: KeyMod.CtrlCmd | KeyCode.KeyC, when: 'editorReadonly' },
        { key: 'editor.action.clipboardPasteAction', hotkey: KeyMod.CtrlCmd | KeyCode.KeyV, when: '!editorReadonly' },
      ].map((item) => ({
        keybinding: item.hotkey,
        command: item.key,
        when: item.when,
      }))
    );

    // sql语法添加格式化右键菜单
    this.addAction({
      id: 'editor.action.sqlFormat',
      label: '格式化',
      keybindings: [KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyF],
      contextMenuGroupId: '9_cutcopypaste',
      contextMenuOrder: 5,
      precondition: 'editorLangId === sql && !editorReadonly',
      run: () => sqlFormatter.formatAndInsert(this),
    });
  }

  /**
   * 移除右键菜单项
   */
  private removeContextmenuById = () => {
    const contextMenuEntry = [...MenuRegistry._menuItems].find((entry) => entry[0].id === 'EditorContext');
    if (!contextMenuEntry?.length) return;

    const list = contextMenuEntry[1];
    let node = list._first;

    do {
      const shouldRemove =
        REMOVE_MENU_IDS.includes(node.element?.command?.id) || REMOVE_MENU_IDS.includes(node.element?.title);
      if (shouldRemove) {
        list._remove(node);
      }
    } while ((node = node.next));
  };

  /**
   * 选中内容改变
   */
  private didChangeCursorSelection({ selection }: monacoEditor.ICursorSelectionChangedEvent) {
    if (this.contentSelectTimer) {
      clearTimeout(this.contentSelectTimer);
      this.contentSelectTimer = null;
    }
    this.contentSelectTimer = setTimeout(() => {
      const value = this.editor!.getModel()?.getValueInRange(selection);
      this.emit('selection', value, selection, this.mouseEvent);
    }, 300);
  }

  /**
   * scroll: https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.ICodeEditor.html#onDidScrollChange
   */
  private didScrollChange(scrollEvent: IScrollEvent) {
    this.emit('onscroll', scrollEvent);
  }

  /**
   * 监听内容改变
   */
  private didChangeModelContent() {
    let isDone = false;
    return () => {
      if (isDone) return;
      isDone = true;
      this.contentChangeTimer = setTimeout(() => {
        const value = this.getValue();
        this.emit('change', value, value !== this.initValue);
        isDone = false;
      }, 500);
    };
  }
}

export default MonacoEditor;
