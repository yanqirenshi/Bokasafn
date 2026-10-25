import { configureStore } from '@reduxjs/toolkit';

import windowReducer from './slices/windowSlice.js';
import operatorsReducer from './slices/operatorsSlice.js';
import githubAuthReducer from './slices/githubAuthSlice.js';
import accountMenuReducer from './slices/accountMenuSlice.js';
import tabsReducer from './slices/tabsSlice.js';
import cockpitReducer from './slices/cockpitSlice.js';
import scrumReducer from './slices/scrumSlice.js';
import scrumProjectReducer from './slices/scrumProjectSlice.js';
import scrumProjectItemReducer from './slices/scrumProjectItemSlice.js';
import { dataApi } from './api/dataApi.js';

export const store = configureStore({
    reducer: {
        window: windowReducer,
        operators: operatorsReducer,
        githubAuth: githubAuthReducer,
        accountMenu: accountMenuReducer,
        tabs: tabsReducer,
        cockpit: cockpitReducer,
        scrum: scrumReducer,
        scrumProject: scrumProjectReducer,
        scrumProjectItem: scrumProjectItemReducer,
        [dataApi.reducerPath]: dataApi.reducer,
    },
    middleware: (getDefaultMiddleware)=> getDefaultMiddleware().concat(dataApi.middleware),
});
