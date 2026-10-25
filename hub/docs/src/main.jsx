import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import App from './App.jsx';
import './index.css';

// 静的なホスティング (GitHub Pages など) でもページを移れるように、URL は # の後ろで管理する。
createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HashRouter>
        <App/>
      </HashRouter>
    </React.StrictMode>
);
