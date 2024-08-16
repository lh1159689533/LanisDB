import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, ForwardedRef } from 'react';
import { editor as monacoEditor, IScrollEvent } from 'monaco-editor/esm/vs/editor/editor.api';
import MonacoEditor from './monacoEditor';
import { Contextmenu } from './common/types';

import './log/log.contribution';
import './styles/index.less';

interface IMonacoLog {
  /** 日志内容 */
  value: string;
  /** 高度 */
  height?: string;
  style?: React.CSSProperties;
  className?: string;
  /** 是否自动弹出搜索框 */
  autoShowFind?: boolean;
  /** 编辑器主题 */
  theme?: string;
  /**
   * 滚动回调
   * @param scrollEvent 滚动事件
   */
  onScroll?: (scrollEvent: IScrollEvent) => void;
  /** 是否自动滚动 */
  autoScroll?: boolean;
  monacoOptions?: Omit<monacoEditor.IStandaloneEditorConstructionOptions, 'value' | 'readOnly' | 'theme' | 'language'>;
}

/**
 * 日志
 */
const MonacoLog = (
  {
    value,
    height = '100%',
    style = {},
    className = '',
    autoShowFind = false,
    autoScroll = true,
    theme,
    monacoOptions = {},
    onScroll,
  }: IMonacoLog,
  ref: ForwardedRef<any>
) => {
  /** 默认编辑器随内容滚动，始终滚动到最后一行 */
  const [isAutoScroll, setAutoScroll] = useState(autoScroll);

  const monacoLog = useRef<MonacoEditor>();
  const monacoLogRef = useRef(null);

  /**
   * 滚动事件
   */
  const handleScroll = (scrollEvent: IScrollEvent) => {
    if (onScroll) {
      onScroll(scrollEvent);
    } else {
      // 当滚动触底时，编辑器随内容自动滚动，否则不滚动方便查看日志
      const { scrollTop, scrollHeight } = scrollEvent;
      const editorHeight = monacoLog.current!.getMonacoEditor()?.getLayoutInfo()?.height ?? 0;
      setAutoScroll(scrollTop + editorHeight === scrollHeight);
    }
  };

  useEffect(() => {
    if (!monacoLogRef?.current) {
      return;
    }
    const customContextmenus: Contextmenu[] = [
      {
        id: 'editor.action.wordWrap',
        title: '开启 / 关闭换行',
        groupId: '9_cutcopypaste',
        order: 3,
        editorReadonly: true,
        callback: (editor) => {
          const wordWrap = editor.getOption(monacoEditor.EditorOption.wordWrap) === 'on' ? 'off' : 'on';
          editor.updateOptions({ wordWrap });
        },
      },
    ];
    monacoLog.current = new MonacoEditor({
      el: monacoLogRef.current,
      language: 'log',
      readOnly: true,
      theme,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      lineNumbersMinChars: 0,
      lineDecorationsWidth: 0,
      scrollbar: {
        useShadows: false,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        arrowSize: 14,
      },
      domReadOnly: true,
      contextmenus: customContextmenus,
      ...monacoOptions,
    }).create();

    autoShowFind && monacoLog.current.showFind();
    monacoLog.current.on('onscroll', handleScroll);

    return () => {
      monacoLog.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (monacoLog.current) {
      monacoLog.current.setValue(value || '');
      if (isAutoScroll) {
        // 自动滚动到最底部
        const editor = monacoLog.current.getMonacoEditor()!;
        editor.setScrollTop(editor.getScrollHeight());
      }
    }
  }, [value, monacoLog.current, isAutoScroll]);

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => monacoLog.current,
      getMonacoEditor: () => monacoLog.current?.getMonacoEditor(),
    }),
    []
  );

  return (
    <div ref={monacoLogRef} className={`monaco-log ${className}`} style={{ width: '100%', height, ...style }}></div>
  );
};

MonacoLog.DisplayName = 'LogEditor';

export default forwardRef(MonacoLog);
