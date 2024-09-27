import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import Dialog from '@components/dialog';

import 'highlight.js/styles/github.css';

hljs.registerLanguage('sql', sql);

export default function ViewCreateSql({ open, createSql, onClose }) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog visible={open} title="创建语句" okText="" cancleText="关闭" onClose={handleClose}>
      <pre
        style={{ overflowX: 'auto', padding: '0.5em', color: '#383a42', background: '#fafafa', whiteSpace: 'pre-wrap' }}
      >
        <code className="sql">
          <p dangerouslySetInnerHTML={{ __html: hljs.highlight(createSql.trim(), { language: 'sql' }).value }}></p>
        </code>
      </pre>
    </Dialog>
  );
}
