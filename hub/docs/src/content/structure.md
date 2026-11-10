# フォルダ構成

## hub のフォルダ

`hub/` には、bokasafn のファイルだけがあります。
iHub 本体 (`@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`) は、`node_modules/` に入ります。

| フォルダ・ファイル | 内容 |
|---|---|
| `data/` | 設計のデータ (JSON)。git で共有します。 |
| `data/local/` | 個人の設定。画面から変わります。git では共有しません。 |
| `src/index.js` | 入り口。bokasafn の設定 (サイドメニュー・配色・ドック・WBS のページ・Help など) を組み立てて、`<IHub config={config}>` に渡し、`Router` を描きます。 |
| `src/Router.js` | ページの URL |
| `src/config/` | サイドメニューの項目 (`ACCOUNT_MENUS.js`)・サイドメニューの色 (`ACCOUNT_MENU_COLORS.js`)・アプリの配色 (`COLORS.js`)・アイコン (`ICONS.js`)・ドックのボタン (`OPERATOR_ITEMS.js`) |
| `src/components/` | 自分で作る部品。(`help/` に、Help の 3 つのセクションがあります。ほかは `assemblies`・`pages`・`panels`・`parts`) |
| `src/wbs/` | WBS のノードのページ (`P{id}.js`)・ページが無いときの表示 |
| `src/operators/` | ドックの吹き出しの中身 |
| `src/index.css` | 見た目の上書き (iHub の CSS のあとに読み込みます) |
| `src/setupProxy.js` | 開発サーバーから API サーバーへの中継 |
| `src/js/` | service worker の登録と reportWebVitals (CRA のもの) |
| `public/` | 画像など |
| `docs/` | このマニュアル |
| `package.json` | 2 つのパッケージと、`scripts` |
| `.env.local` | 個人のトークンなど。git では共有しません。 |

## iHub 本体 (パッケージの中身)

| パッケージ | 内容 |
|---|---|
| `@yanqirenshi/ihub.core` | 画面の部品。`dist/` に、Babel で変換した ESM が入っています。 |
| `@yanqirenshi/ihub.core` の `examples/data/` | `data/` の雛形 (`ihub-srv init` がコピーします) |
| `@yanqirenshi/ihub.core` の `examples/wbs/` | WBS のノードのページの例 |
| `@yanqirenshi/ihub.srv` | API サーバー (データの読み書き・検証・変更の通知)。`ihub-srv` のコマンドも入っています。 |
| `@yanqirenshi/ihub.srv` の `src/schemas/` | データのフォーマット (JSON Schema) |

`node_modules/` の中は、直さないでください。
iHub 本体に直したいところが見つかったときは、[iHub のリポジトリ](https://github.com/yanqirenshi/iHub) で直します。([iHub の更新](#/update))

## 用意してある部品

`@yanqirenshi/ihub.core` の部品は、自分のページでも使えます。

```jsx
import { Frame, pages, panels } from '@yanqirenshi/ihub.core';
```

| 名前 | 内容 |
|---|---|
| `pages` | ページ (`pages.Data`・`pages.Cockpit` など) |
| `docPages` | ドキュメントのページ (`docPages.ER`・`docPages.TM` など) |
| `panels` | ページの中身 (ER 図・TM など) |
| `Frame`・`FrameTabs`・`FrameWbsNode`・`TabbedPage` など | 中間の部品 (枠・タブのあるページ) |
| `ItemWbsNode`・`LinkWBS`・`Tabs` など | 小さな部品 |

公開している名前の一覧は、`@yanqirenshi/ihub.core` の README にあります。
自分で作る部品は、`src/components/` に置きます。
