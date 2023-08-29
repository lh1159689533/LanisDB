import { editor, KeyMod, KeyCode, IScrollEvent } from 'monaco-editor/esm/vs/editor/editor.api';

import './sql';

interface IDisposable {
  dispose(): void;
}

class MonacoEditor {
  private _el: any;
  private props: any;
  private language: string;
  private theme: string;
  private _editor: editor.IStandaloneCodeEditor;
  private _handles: any;
  private _initValue: string;
  private _subscription: IDisposable;
  private _content_change_timer: any;
  private _content_select_timer: any;

  constructor({ el, language = 'json', theme = 'vs-light', ...props }) {
    this._el = el;
    this.props = {
      // language: 'json',
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: true,
      readOnly: false,
      // theme: 'vs-light',
      tabSize: 4,
      automaticLayout: false, // 编辑区域大小自适应
      // scrollBeyondLastColumn: 10,
      ...props,
    };
    this.language = language;
    this.theme = theme;
    this._initValue = props.value || '';
    this._handles = {};
  }

  /**
   * 创建editor实例
   */
  create() {
    this._el = typeof this._el === 'string' ? document.querySelector(this._el) : this._el;
    this._editor = editor.create(this._el, this.props);

    const model = this._editor.getModel();
    if (this.language) {
      editor.setModelLanguage(model, this.language);
    }

    if (this.theme) {
      editor.setTheme('logTheme');
    }

    this._subscription = this._editor.onDidChangeModelContent(this.didChangeModelContent.call(this));
    this._editor.onDidChangeCursorSelection(this.didChangeCursorSelection.bind(this));
    this._editor.onDidScrollChange(this.didScrollChange.bind(this));

    this._editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
      this.emit('cmds');
    });

    return this;
  }

  on(type, handle) {
    this._handles[type] = handle;
  }

  emit(type, ...args) {
    this._handles[type] && this._handles[type].apply(null, [...args]);
  }

  /**
   * 监听内容改变
   */
  didChangeModelContent() {
    let isDone = false;
    return () => {
      if (isDone) return;
      isDone = true;
      this._content_change_timer = setTimeout(() => {
        const value = this.getValue();
        this.emit('change', value, value !== this._initValue);
        isDone = false;
      }, 500);
    };
  }

  /**
   * 选中内容改变
   */
  didChangeCursorSelection({ selection }) {
    if (this._content_select_timer) {
      clearTimeout(this._content_select_timer);
      this._content_select_timer = null;
    }
    this._content_select_timer = setTimeout(() => {
      const value = this._editor.getModel()?.getValueInRange(selection);
      this.emit('selection', value, selection);
    }, 300);
  }

  /**
   * scroll: https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.ICodeEditor.html#onDidScrollChange
   */
  didScrollChange(scrollEvent: IScrollEvent) {
    this.emit('onscroll', scrollEvent);
  }

  toTop() {
    this._editor.setScrollPosition({
      scrollLeft: 0,
      scrollTop: 0,
    });
  }

  /**
   * 改变内容
   * @param value 新值
   */
  setValue(value) {
    this._initValue = value;
    this._editor.getModel()?.setValue(value);
    // this._editor.setValue(value);
  }

  /**
   * 获取内容
   * @returns 最新内容
   */
  getValue() {
    return this._editor.getModel()?.getValue();
    // return this._editor.getValue();
  }

  /**
   * 光标定位
   * @param type last 定位到最末行
   * @param isAutoScroll 是否自动滚动, 用户聚焦日志窗口停止滚动;
   */
  focus(type: 'top' | 'last', isAutoScroll = true) {
    if (type === 'last' && isAutoScroll) {
      this._editor.setScrollTop(this._editor.getScrollHeight());
    } else if (type === 'top') {
      this._editor.focus();
    }
  }

  /**
   * 格式化
   */
  format() {
    // const value = this._editor.getModel()?.getValue();
    // const formatValue = format(value, {
    //   tabWidth: 2,
    //   language: this.language ?? 'sql',
    //   denseOperators: true
    // });
    // // this._editor.getModel()?.setValue(formatValue);
    // const { startLineNumber, startColumn, endLineNumber, endColumn } = this._editor.getModel().getFullModelRange();
    // // 编辑器set值，有历史栈，可撤销
    // this._editor.executeEdits(value, [
    //   {
    //     range: {
    //       startLineNumber,
    //       startColumn,
    //       endColumn,
    //       endLineNumber
    //     },
    //     text: formatValue
    //   },
    // ]);
    // this.focus('top');
  }

  /**
   * 改变editor语言
   * @param language 语言
   */
  changeLanguage(language) {
    editor.setModelLanguage(this._editor.getModel(), language);
  }

  updateOptions(newOptions: editor.IEditorOptions & editor.IGlobalEditorOptions) {
    this._editor.updateOptions(Object.assign(this.props, newOptions));
  }

  dispose() {
    if (this._editor) {
      this._editor.dispose();
      const model = this._editor.getModel();
      if (model) {
        model.dispose();
      }
    }
    if (this._subscription) {
      this._subscription.dispose();
    }
    if (this._content_change_timer) {
      clearTimeout(this._content_change_timer);
      this._content_change_timer = null;
    }
  }
}

export default MonacoEditor;
