import React, { useState, useImperativeHandle, useEffect, useLayoutEffect } from 'react';
import { IScrollEvent } from 'monaco-editor/esm/vs/editor/editor.api';
import MonacoEditor from './monacoEditor';

const DEFAULT_OPTIONS = {
  glyphMargin: false, // lineNumber宽度
  lineDecorationsWidth: 1, // lineNumber与内容区间隔宽度
  lineHeight: 21, // 行高
  lineNumbersMinChars: 3, // 控制line-number的宽度
  tabSize: 4, // 设置空格符数量
  renderIndentGuides: true, // 控制缩进参考线
  fontSize: 14,
  letterSpacing: 0.6,
  scrollbar: {
    useShadows: true,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    verticalScrollbarSize: 0,
    horizontalScrollbarSize: 10,
    arrowSize: 14,
  },
  minimap: {
    maxColumn: 60,
  },
};

interface LocalProps {
  value: string;
  onChange: Function;
  onSelection?: Function;
  onCmdS?: Function;
  language?: string;
  readOnly?: boolean;
  onScroll?: (scrollEvent: IScrollEvent) => void;
}

export default React.forwardRef(
  ({ value, onChange, onSelection, onCmdS, language = 'sql', readOnly = false, onScroll }: LocalProps, ref) => {
    const [monacoEditor, setMonacoEditor] = useState(null);
    const [containerElement, setContainerElement] = useState(null);
    const [, setVal] = useState(''); // 修复useImperativeHandle未更新内容问题

    /**
     * 内容变化
     * @param value 新值
     * @param codeChanged 与初始值对比是否改变
     */
    const handleChange = (value, codeChanged) => {
      onChange?.(value, codeChanged);
      setVal(value);
    };

    /**
     * 内容被选择
     * @param value 选择的内容
     */
    const handleSelection = (value, selection) => {
      onSelection?.(value, selection);
    };

    const handleScroll = (scrollEvent) => {
      onScroll?.(scrollEvent);
    };

    const handleFormat = () => {
      monacoEditor.format();
    };

    const assignRef = (component: HTMLDivElement) => {
      setContainerElement(component);
    };

    useEffect(() => {
      if (!containerElement) {
        return;
      }
      const monacoEditor = new MonacoEditor({
        el: containerElement,
        ...DEFAULT_OPTIONS,
        language,
        value: '',
        automaticLayout: true,
        readOnly,
      }).create();
      monacoEditor.on('change', handleChange);
      monacoEditor.on('selection', handleSelection);
      monacoEditor.on('onscroll', handleScroll);
      monacoEditor.on('cmds', () => {
        onCmdS?.(new Date().valueOf());
      });
      monacoEditor.setValue(value || '');
      setMonacoEditor(monacoEditor);
      return () => {
        monacoEditor.dispose();
      };
    }, [containerElement]);

    useLayoutEffect(() => {
      monacoEditor?.setValue?.(value);
    }, [value, monacoEditor]);

    useEffect(() => {
      monacoEditor?.changeLanguage(language);
    }, [language]);

    useEffect(() => {
      monacoEditor?.updateOptions({ readOnly });
    }, [readOnly]);

    useImperativeHandle(ref, () => ({
      format: handleFormat,
      value: monacoEditor?.getValue(),
    }));

    return <div ref={assignRef} style={{ width: '100%', height: '100%' }}></div>;
  }
);
