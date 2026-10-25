import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';

import { store } from './redux/store.js';
import { BASE, CSS_VARIABLES, THEME } from './manegers/colors.js';
import './index.css';
import App from '../App';
import DataGate from './DataGate.js';
import * as serviceWorkerRegistration from './js/serviceWorkerRegistration';
import reportWebVitals from './js/reportWebVitals';

// src/config/COLORS.js の配色。
// CSS の変数を :root に置き、地の色を決めてあるときは画面の背景にする。
const global_styles = {
    ':root': CSS_VARIABLES,
    ...(BASE && { body: { backgroundColor: BASE } }),
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
      <ThemeProvider theme={THEME}>
        <GlobalStyles styles={global_styles}/>
        <Provider store={store}>
          <BrowserRouter>
            <DataGate>
              <App />
            </DataGate>
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
