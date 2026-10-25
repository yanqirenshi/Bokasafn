import { createSlice } from '@reduxjs/toolkit';

import { PAGES } from '../../../config/ACCOUNT_MENUS.js';

function pagePath () {
    const root_path = window.location.pathname.split('/')[1] || null;

    return root_path ? '/'+root_path : '/';
}

function selectedItem (pages) {
    const page_path = pagePath();

    for (const page of pages) {
        const item = page.items.find(i=>i.url===page_path);

        if (item)
            return item.code;
    }

    return 'cockpit';
}

// NOTE: selectedItem(PAGES) reads window.location.pathname eagerly, at the
// moment this module is first evaluated (same timing as the original recoil
// atom's default value) — this only reflects the correct initial route
// because it runs once, at app startup, before any navigation happens.
const accountMenuSlice = createSlice({
    name: 'accountMenu',
    initialState: {
        menu: {
            avater: { enterd: false, clicked: true },
            menu: { enterd: false },
            // 初めに開くページは、src/config/ACCOUNT_MENUS.js の先頭のページにする。
            // (アプリに合わせて、ページの名前 (label) を設定だけで変えられるようにするため)
            current_page: PAGES[0]?.label,
            pages: PAGES,
        },
        selectedItem: selectedItem(PAGES),
        isOpend: false,
    },
    reducers: {
        menuChanged (state, action) {
            state.menu = action.payload;
        },
        menuOpened (state) {
            state.isOpend = true;
        },
        menuClosed (state) {
            state.isOpend = false;
        },
        menuItemSelected (state, action) {
            state.selectedItem = action.payload;
        },
        // 個人の設定 (on/off) を反映したページに差し替える。
        menuPagesChanged (state, action) {
            state.menu.pages = action.payload;
        },
    },
});

export const { menuChanged, menuOpened, menuClosed, menuItemSelected, menuPagesChanged } = accountMenuSlice.actions;
export default accountMenuSlice.reducer;
