import { CSSProperties } from 'react';
import Editor from '@monaco-editor/react';

import '@components/monacoEditor/sql';


import { loader } from '@monaco-editor/react';

import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

loader.config({ monaco });

import './index.less';

const DEFAULT_OPTIONS = {
  glyphMargin: false, // lineNumber宽度
  lineDecorationsWidth: 1, // lineNumber与内容区间隔宽度
  lineHeight: 21, // 行高
  lineNumbersMinChars: 3, // 控制line-number的宽度
  tabSize: 4, // 设置空格符数量
  renderIndentGuides: true, // 控制缩进参考线
  fontSize: 14,
  letterSpacing: .6,
  scrollbar: {
    useShadows: true,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    verticalScrollbarSize: 0,
    horizontalScrollbarSize: 10,
    arrowSize: 14,
  },
  minimap: {
    maxColumn: 60
  }
};

interface ISqlEditor {
  value?: string;
  height?: string | number;
  readOnly?: boolean;
  style?: CSSProperties;
  onChange?: (value: string) => void;
}

export default function SqlEditor({
  value,
  height,
  readOnly = false,
  style,
  onChange,
}: ISqlEditor) {
  const handleChange = (value: string | undefined) => {
    onChange?.(value ?? '');
  };

  const onMount = (editor) => {
    console.log(editor);
  };

  return (
    <div
      className="sql-editor"
      style={{ ...(style ?? {}) }}
    >
      <Editor
        height={height ?? '100%'}
        width="100%"
        language="sql"
        defaultValue={value}
        options={{
          ...DEFAULT_OPTIONS,
          readOnly,
        }}
        onChange={handleChange}
        onMount={onMount}
      />
    </div>
  );
}
