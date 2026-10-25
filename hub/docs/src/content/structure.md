# フォルダ構成

iHub のフォルダは、「アプリごとに書き換えるもの」と「iHub 本体 (書き換えないもの)」に分かれています。
iHub 本体を書き換えずにおくと、iHub が新しくなったときに、そのまま取り込めます。([iHub の更新](#/update))

## アプリごとに書き換えるもの

| フォルダ・ファイル | 内容 |
|---|---|
| `data/` | 設計のデータ (JSON)。git で共有します。 |
| `data/local/` | 個人の設定。画面から変わります。git では共有しません。 |
| `src/config/` | サイドメニューの項目 (`ACCOUNT_MENUS.js`)・サイドメニューの色 (`ACCOUNT_MENU_COLORS.js`)・アプリの配色 (`COLORS.js`)・アイコン (`ICONS.js`)・ドックのボタン (`OPERATOR_ITEMS.js`) |
| `src/components/` | 自分で作る部品 (`assemblies`・`pages`・`panels`・`parts`) |
| `src/wbs/` | WBS のノードのページ (`P{id}.js`) |
| `src/operators/` | ドックの吹き出しの中身 |
| `src/Router.js` | ページの URL |
| `src/App.js` | 画面全体 |
| `src/index.css` | 見た目の上書き (`src/ihub/index.css` のあとに読み込みます) |
| `public/` | 画像など |

## iHub 本体 (書き換えないもの)

| フォルダ・ファイル | 内容 |
|---|---|
| `src/ihub/` | 用意してある部品 (`components`)・Redux (`redux`)・データの扱い (`manegers`) など |
| `src/ihub/data_example/` | `data/` の雛形 |
| `src/ihub/wbs_example/` | `src/wbs/` の雛形 |
| `src/setupProxy.js` | 開発サーバーから API サーバーへの中継 |
| `server/` | API サーバー (データの読み書き・検証・変更の通知) |
| `server/schemas/` | データのフォーマット (JSON Schema) |
| `server/tools/` | 古い形式のデータ (`src/data/*.js`) を、`data/` の JSON に変換するスクリプト |

iHub 本体に直したいところが見つかったときは、iHub のリポジトリで直してから、アプリへ取り込んでください。
アプリの側で直したときは、iHub のリポジトリにも反映してください。

## 用意してある部品

`src/ihub/components/` の部品は、自分のページでも使えます。

| フォルダ | 内容 |
|---|---|
| `pages/` | ページ |
| `panels/` | ページの中身 (ER 図・TM など) |
| `assemblies/` | 中間の部品 (枠の `frames/Frame.js`・`frames/FrameWbsNode.js` など) |
| `parts/` | 小さな部品 |

自分で作る部品は、`src/components/` の同じ名前のフォルダに置きます。
