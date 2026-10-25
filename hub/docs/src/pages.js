// マニュアルのページ。
// 並び順が、サイドメニューと「前へ・次へ」の順になる。
// 本文は src/content/ の Markdown に書く。
import about           from './content/about.md?raw';
import setup           from './content/setup.md?raw';
import screens         from './content/screens.md?raw';
import data            from './content/data.md?raw';
import diagrams        from './content/diagrams.md?raw';
import wbs             from './content/wbs.md?raw';
import github          from './content/github.md?raw';
import structure       from './content/structure.md?raw';
import customize       from './content/customize.md?raw';
import build           from './content/build.md?raw';
import update          from './content/update.md?raw';
import api             from './content/api.md?raw';
import troubleshooting from './content/troubleshooting.md?raw';

export const SECTIONS = [
    {
        label: 'はじめに',
        pages: [
            { path: '/',      title: 'iHub とは',    content: about },
            { path: '/setup', title: '導入のしかた', content: setup },
        ],
    },
    {
        label: '使い方',
        pages: [
            { path: '/screens',  title: '画面の見方',      content: screens },
            { path: '/data',     title: 'データの管理',    content: data },
            { path: '/diagrams', title: '図の編集',        content: diagrams },
            { path: '/wbs',      title: 'WBS',             content: wbs },
            { path: '/github',   title: 'GitHub との連携', content: github },
        ],
    },
    {
        label: '開発者向け',
        pages: [
            { path: '/structure', title: 'フォルダ構成',   content: structure },
            { path: '/customize', title: 'カスタマイズ',   content: customize },
            { path: '/build',     title: 'ビルドと配信',   content: build },
            { path: '/update',    title: 'iHub の更新',    content: update },
            { path: '/api',       title: 'API サーバー',   content: api },
        ],
    },
    {
        label: 'そのほか',
        pages: [
            { path: '/troubleshooting', title: '困ったとき', content: troubleshooting },
        ],
    },
];

export const PAGES = SECTIONS.flatMap(section=> section.pages);
