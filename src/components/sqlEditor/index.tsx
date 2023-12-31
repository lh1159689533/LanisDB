import { CSSProperties } from 'react';
import MonacoEditor from '@components/monacoEditor';

import './index.less';

interface ISqlEditor {
  value?: string;
  height?: string | number;
  readOnly?: boolean;
  style?: CSSProperties;
  onChange?: (value: string) => void;
}

export default function SqlEditor({ value = '', height, readOnly = false, style, onChange }: ISqlEditor) {
  const handleChange = (value: string | undefined) => {
    onChange?.(value ?? '');
  };

  const handleSelection = () => {};

  return (
    <div className="sql-editor" style={{ ...(style ?? {}), height }}>
      <MonacoEditor
        value={value}
        language="sql"
        readOnly={readOnly}
        onChange={handleChange}
        onSelection={handleSelection}
      />
    </div>
  );
}
