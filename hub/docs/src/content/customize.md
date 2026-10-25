# カスタマイズ

## ページを足して、サイドメニューに出す

例として、`/my-page` に「自分のページ」を足します。

### 1. ページの部品を作る

`src/components/pages/MyPage.js` を作ります。
`Frame` で囲むと、サイドメニューとドックが付きます。

```jsx
import React from 'react';
import Container from '@mui/material/Container';

import Frame from '../../ihub/components/assemblies/frames/Frame.js';

export default function MyPage () {
    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            自分のページです。
          </Container>
        </Frame>
    );
}
```

### 2. URL を決める

`src/Router.js` に、ルートを足します。

```jsx
import MyPage from './components/pages/MyPage.js';

// <Routes> の中に足す
<Route path='/my-page' element={<MyPage/>} />
```

### 3. サイドメニューに項目を足す

`src/config/ACCOUNT_MENUS.js` の項目の一覧 (`MAIN` など) に、項目を足します。

```js
const MAIN = [
    // (省略)
    { code: 'my-page', url: '/my-page', label: '自分のページ', icon: ICONS.data },
];
```

同じファイルの `ACCOUNT_MENU_PAGES` で、どのページ (iHub・Docs・Etc) に出すかを決めます。

```js
export const ACCOUNT_MENU_PAGES = [
    {
        label: 'iHub',
        items: [
            // (省略)
            { code: 'my-page', active: true },
        ],
    },
    // (省略)
];
```

- `code` は、ほかの項目と重ならないようにします。(重なると、起動したときにエラーになります)
- `active` は、表示するかどうかの既定値です。
- 先頭のページを、初めに開きます。
ページの名前 (`label`) は、アプリの名前などに変えてかまいません。

### 4. アイコンを足す (必要なとき)

`src/config/ICONS.js` に、SVG のパス (viewBox が `0 0 24 24` のもの) で、アイコンを足します。

```js
const ICONS = {
    // (省略)
    myPage: icon("M3 13h8V3H3zm0 8h8v-6H3z"),
};
```

## ドックのボタンを変える

ドックのボタンは、次の 3 つのファイルで決まります。

| ファイル | 内容 |
|---|---|
| `src/config/OPERATOR_ITEMS.js` | ボタンの一覧 (code・ラベル) |
| `src/operators/Operators.js` | ボタンの code ごとに、吹き出しの中身を選ぶ |
| `src/operators/labels.js` | ボタンのアイコン (Manipulater が持っていないもの) |

ボタンを足すときは、3 つを合わせて変えてください。

## 見た目を変える

### アプリの配色

`src/config/COLORS.js` に 4 つの色を書くと、アプリの配色をまとめて決められます。
色は、CSS の色 (`'#rrggbb'`) で書きます。
`null` のときは、それぞれの部品のこれまでの色になります。

| 名前 | 使うところ |
|---|---|
| `base` (地の色) | 画面の背景、CSS のクラス `theme-color1〜5` |
| `main` (主の色) | 文字、MUI の primary (タブ・スイッチなど)、ドックのボタンと吹き出しの枠、サイドメニューの背景、CSS のクラス `text-color1` |
| `sub` (補助の色) | 補助の文字 (MUI の text.secondary)、区切りの線、CSS のクラス `text-color2` |
| `accent` (差し色) | MUI の secondary、CSS のクラス `pair-color1〜5` |

iHub は、「梅紫と藤鼠」の配色にしています。

```js
const COLORS = {
    base: '#F4F1F6',   // 白藤
    main: '#574C57',   // 滅紫
    sub: '#A6A5C4',    // 藤鼠
    accent: '#9D5B8B', // 梅紫
};
```

- サイドメニューの背景は、`ACCOUNT_MENU_COLORS.js` の `background` を決めたときは、そちらを使います。
iHub は、サイドメニューを差し色の梅紫にするため、`background` に `{ r: 157, g: 91, b: 139 }` を書いています。
- ドックの選んでいないボタンの色 (灰色) は、変えられません。(@yanqirenshi/manipulater で決まっています)
- 部品のコードに直接書いてある色は、配色の設定では変わりません。

### サイドメニューの色

`src/config/ACCOUNT_MENU_COLORS.js` で、サイドメニューの背景の色と、文字の色を決めます。
iHub 本体の `Frame.js` を直す必要はありません。

| 項目 | 書き方 | 内容 |
|---|---|---|
| `background` | `{ r, g, b }` (0〜255) | 背景の色です。選択中の項目は白い背景になり、この色が文字の色になります。 |
| `text` | CSS の色 (`'#2b2b2b'` など) | 文字とアイコンの色です。背景が明るくて、白い文字が読みにくいときにだけ決めます。 |
| `avatar` | CSS の色 | メニューを開いているときの、アカウントの円 (アバターの周り) の色です。`null` のときは、配色の差し色 (`accent`) になります。(`accent` も `null` のときは、これまでの水色) |

`background` が `null` のときは、配色の主の色 (`COLORS.js` の `main`) を使います。
どちらも `null` のときは、iHub の既定の色 (紫の背景に、白い文字) になります。

背景を暗い色にするときは、`background` だけを決めます。
文字とアイコンは、白のままです。

```js
const ACCOUNT_MENU_COLORS = {
    background: { r: 3, g: 57, b: 115 },
    text: null,
};
```

背景を明るい色にするときは、`text` に暗い色を決めます。

```js
const ACCOUNT_MENU_COLORS = {
    background: { r: 255, g: 217, b: 0 },
    text: '#2b2b2b',
};
```

- `text` は、選択中の項目とページの一覧 (どちらも白い背景) の文字にも使います。
白い背景でも読める、暗い色にしてください。
- `text` を決めると、アイコンは白く反転せずに、SVG の色のまま表示されます。
SVG に色を付けていないときは、黒になります。

`text` を決めたときに、アイコンを文字と同じ暗い色にするには、`src/config/ICONS.js` の `<svg>` に `fill` を付けます。

```js
function icon (d, fillRule) {
    // (省略)
    return 'data:image/svg+xml,' + encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2b2b2b">${path}</svg>`
    );
}
```

### そのほかの見た目

`src/index.css` に、CSS を書きます。
`src/index.css` は `src/ihub/index.css` のあとに読み込むので、iHub の見た目を上書きできます。

## アプリの名前を出す

画面などに出る名前は、次のところで変えます。

| ファイル | 変えるところ | 出るところ |
|---|---|---|
| `src/config/ACCOUNT_MENUS.js` | 先頭のページの `label` | サイドメニューのページの名前 |
| `data/wbs/projects.json` | プロジェクトの `name` | WBS の最上位のノード |
| `public/index.html` | `<title>` | ブラウザのタブ |
| `package.json` | `name` | パッケージの名前 (`npm start` のログなど) |

iHub 本体のフォルダ (`src/ihub/`) の名前は、アプリの名前に変えないでください。
アプリのファイル (`src/Router.js`・`src/wbs/` など) は、`src/ihub/` の部品を読み込んでいます。
名前を変えると、iHub を取り込むたびに、フォルダの名前と読み込むパスを置き換え直すことになります。
