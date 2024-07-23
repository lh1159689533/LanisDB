import React from 'react';
import ReactDOM from 'react-dom/client';
import AppEntry from '@components/appEntry';
import App from './App';

import 'virtual:windi.css';
import './style/index.less';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.Fragment>
    <AppEntry>
      <App />
    </AppEntry>
  </React.Fragment>
);
