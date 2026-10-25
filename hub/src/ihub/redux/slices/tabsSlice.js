import { createSlice } from '@reduxjs/toolkit';

import { useDispatch, useSelector } from 'react-redux';

// Every entry here is normalized to the flat {selected, list} shape (the 15
// original recoil atoms that wrapped this in an extra `.tabs` level, plus the
// 2 that were already flat, all collapse to this one representation).
const TAB_DEFS = {
    PAGE_API: {
        selected: 'wbs',
        list: [
            { code: 'wbs',  label: 'WBS' },
            { code: 'help', label: 'Help' },
        ],
    },
    PAGE_BATCHS: {
        selected: 'wbs',
        list: [
            { code: 'wbs',  label: 'WBS' },
            { code: 'help', label: 'Help' },
        ],
    },
    PAGE_BPMN: {
        selected: 'palettes',
        list: [
            { code: 'palettes', label: 'Palettes' },
            { code: 'styles',   label: 'Styles' },
            { code: 'methods',  label: 'Methods' },
            { code: 'overview', label: 'Overview' },
        ],
    },
    PAGE_BUSINESS: {
        selected: 'tm',
        list: [
            { code: 'systemic-design', label: 'Systemic Design' },
            { code: 'tm',              label: 'TM' },
            { code: 'procedures',      label: '機能一覧' },
            { code: 'wbs',             label: 'WBS' },
            { code: 'help',            label: 'Help' },
        ],
    },
    PAGE_CLASSES: {
        selected: 'class-diagram',
        list: [
            { code: 'class-diagram', label: 'クラス図' },
            { code: 'wbs',           label: 'WBS' },
            { code: 'help',          label: 'Help' },
        ],
    },
    PAGE_DATA: {
        selected: 'er-diagram',
        list: [
            { code: 'er-diagram', label: 'ER図' },
            { code: 'wbs',        label: 'WBS' },
            { code: 'help',       label: 'Help' },
        ],
    },
    PAGE_DDD: {
        selected: 'layer-architecture',
        list: [
            { code: 'ubiquitous-language', label: 'ユビキタス言語' },
            { code: 'model-driven-design', label: 'モデル駆動設計' },
            { code: 'hands-on-modeler',    label: '実践的モデラー' },
            { code: 'declarative-design',  label: '宣言的な設計' },
            { code: 'layer-architecture',  label: 'レイヤーアーキテクチャ' },
            { code: 'overview',            label: 'Overview' },
        ],
    },
    PAGE_DESIGN: {
        selected: 'ui-parts',
        list: [
            { code: 'ui-panels',     label: 'パネル' },
            { code: 'ui-assemblies', label: '中間組立品' },
            { code: 'ui-parts',      label: '部品' },
            { code: 'ui-events',     label: 'UI イベント' },
            { code: 'wbs',           label: 'WBS' },
            { code: 'help',          label: 'Help' },
        ],
    },
    PAGE_DEVOPS: {
        selected: 'bpmn',
        list: [
            { code: 'bpmn', label: 'BPMN' },
            { code: 'wbs',  label: 'WBS' },
            { code: 'help', label: 'Help' },
        ],
    },
    PAGE_MARKETS: {
        selected: 'user-scenario',
        list: [
            { code: 'user-scenario',        label: 'ユーザーシナリオ' },
            { code: 'customer-journey-map', label: 'カスタマージャーニーマップ' },
            { code: 'use-case',             label: 'ユースケース' },
            { code: 'wbs',                  label: 'WBS' },
            { code: 'help',                 label: 'Help' },
        ],
    },
    PAGE_MESSAGES: {
        selected: 'wbs',
        list: [
            { code: 'model', label: 'Model' },
            { code: 'wbs',   label: 'WBS' },
            { code: 'help',  label: 'Help' },
        ],
    },
    PAGE_ORGANIZATIONS: {
        selected: 'wbs',
        list: [
            { code: 'wbs',  label: 'WBS' },
            { code: 'help', label: 'Help' },
        ],
    },
    PAGE_SCREENS: {
        selected: 'screen-transition-diagram',
        list: [
            { code: 'screen-transition-diagram', label: '画面遷移図' },
            { code: 'screens',                   label: '画面' },
            { code: 'wbs',                        label: 'WBS' },
            { code: 'help',                       label: 'Help' },
        ],
    },
    PAGE_SYSTEMS: {
        selected: 'system-configuration-diagram',
        list: [
            { code: 'system-configuration-diagram', label: 'システム構成図' },
            { code: 'wbs',                            label: 'WBS' },
            { code: 'help',                           label: 'Help' },
        ],
    },
    PAGE_ACCOUNT: {
        selected: 'menus',
        list: [
            { code: 'menus',     label: 'Menus' },
            { code: 'operators', label: 'Operators' },
            { code: 'pages',     label: 'Pages' },
        ],
    },
    PAGE_EXTERNAL_RESOURCES: {
        selected: 'wbs',
        list: [
            { code: 'wbs', label: 'Wbs' },
        ],
    },
    PAGE_SCRUM: {
        selected: 'projects',
        list: [
            { code: 'timeline',      label: 'Timeline' },
            { code: 'gantt-chart',   label: 'Gantt Chart' },
            { code: 'issues',        label: 'Issues' },
            { code: 'pull-requests', label: 'Pull Requests' },
            { code: 'repositories',  label: 'Repositories' },
            { code: 'projects',      label: 'Projects' },
            { code: 'account',       label: 'Account' },
            { code: 'help',          label: 'Help' },
        ],
    },
};

const tabsSlice = createSlice({
    name: 'tabs',
    initialState: { byPage: TAB_DEFS },
    reducers: {
        tabsChanged (state, action) {
            const { pageId, tabs } = action.payload;
            state.byPage[pageId] = tabs;
        },
    },
});

export const { tabsChanged } = tabsSlice.actions;
export default tabsSlice.reducer;

export function usePageTabs (pageId) {
    const dispatch = useDispatch();
    const tabs = useSelector(s=> s.tabs.byPage[pageId]);
    const changeTabs = (newTabs)=> dispatch(tabsChanged({ pageId, tabs: newTabs }));

    return [tabs, changeTabs];
}
