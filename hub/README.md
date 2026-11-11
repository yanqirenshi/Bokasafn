# bokasafn の hub

bokasafn の hub は、bokasafn (著作権の切れた古典を集めて読む図書館アプリ) の設計の情報をまとめて共有するための、ドキュメントサイトです。
WBS・ER 図・TM (T 字形 ER)・画面遷移図・システム構成図などを、1 つのサイトで見られるようにします。

[iHub](https://github.com/yanqirenshi/iHub) の npm のパッケージ (`@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`) を使って作っています。
iHub を、フォルダごとコピーして使っているのではありません。

**iHub の使い方 (画面の見方・データ・API・カスタマイズ・パッケージの更新など) は、[iHub のマニュアル](https://github.com/yanqirenshi/iHub/tree/main/docs) を見てください。**
このファイルには、この hub に固有のことだけを書きます。

## フォルダの構成

```
Bokasafn/               # bokasafn のリポジトリ
├─ src/                 # 画面 (Next.js)
├─ data/                # 本のデータ (SQLite。git では共有しない)
└─ hub/                 # ドキュメントサイト (この hub)
    ├─ data/            # bokasafn の設計データ (JSON)。git で共有する
    ├─ src/             # 設定 (index.js)・ページの URL (Router.js)・WBS のページなど
    ├─ public/          # 画像など
    └─ package.json     # @yanqirenshi/ihub.core と @yanqirenshi/ihub.srv に依存する
```

iHub 本体 (2 つのパッケージ) は `node_modules/` に入るので、`hub/` には、bokasafn のファイルだけがあります。

| フォルダ・ファイル | 内容 |
|---|---|
| `data/` | 設計のデータ (JSON)。git で共有します。 |
| `data/local/` | 個人の設定 (サイドメニューの表示・非表示など)。画面から変わります。git では共有しません。 |
| `src/index.js` | 入り口。bokasafn の設定を組み立てて、iHub の `<IHub config={config}>` に渡します。 |
| `src/Router.js` | ページの URL |
| `src/config/` | サイドメニューの項目 (`ACCOUNT_MENUS.js`)・サイドメニューの色 (`ACCOUNT_MENU_COLORS.js`)・アプリの配色 (`COLORS.js`)・アイコン (`ICONS.js`)・ドックのボタン (`OPERATOR_ITEMS.js`) |
| `src/components/help/` | Help の 3 つのセクション |
| `src/wbs/` | WBS のノードのページ (`P{id}.js`)・ページが無いときの表示。(いまは、ページが無いときの表示だけです) |
| `src/operators/` | ドックの吹き出しの中身 |
| `src/index.css` | 見た目の上書き (iHub の CSS のあとに読み込みます) |
| `.env.local` | 個人のトークンなど。git では共有しません。 |

`node_modules/` の中は、直さないでください。(`npm install` で、消えます)
フォルダの構成の、くわしい説明は、iHub のマニュアルの [フォルダ構成](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/structure.md) を見てください。

## 起動のしかた

必要なもの: Node.js (22 以上。24 で動作を確かめています)・git。GitHub と連携する画面を使うときは、GitHub の個人用アクセストークン、または OAuth App。

### 1. パッケージを入れる

```
cd hub
npm install
```

### 2. GitHub に接続する (GitHub と連携するとき)

艦橋のページ・Scrum のページ・ドックの「Issue の追加」は、GitHub の情報を使います。
`hub/` に `.env.local` を作り、個人用アクセストークンか、OAuth App を書きます。(雛形のファイルはありません)

```
# 個人用アクセストークン
REACT_APP_GITHU_PARSONAL_TOKEN=ghp_xxxxxxxxxxxxxxxx

# OAuth App (API サーバーが読む。画面には入らない)
GITHUB_OAUTH_CLIENT_ID=Ov23xxxxxxxxxxxxxxxx
GITHUB_OAUTH_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- トークンには、`repo`・`project`・`read:org` の権限を付けてください。
- 変数の名前は綴りが少し変わっていますが (`GITHU`・`PARSONAL`)、このままの名前で書きます。
- `.env.local` は git で共有しません。(`.gitignore` の対象です)
- OAuth App の Authorization callback URL は、`http://localhost:3100/api/github/oauth/callback` にします。(ポートは、画面を開く URL と同じにします。ポートは、下の「3. 起動する」で決めます)
- 書いたあとは、`npm start` をやり直してください。
- OAuth で認証するときは、Scrum のページの Account タブ (`/scrum?tab=account`) で、「GitHub で認証する」を押します。
- トークンと OAuth の両方があるときは、OAuth で得たトークンを使います。(くわしくは、iHub のマニュアルの [GitHub との連携](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/github.md))
- GitHub と連携しないときは、この手順は飛ばしてかまいません。接続していないときは、艦橋の Cockpit タブ・Scrum の Repositories・Projects タブに、「GitHub に接続していません。」と出ます。

### 3. 起動する

```
npm start
```

画面 (React の開発サーバー) と API サーバーが、一緒に起動します。
止めるときは、`Ctrl + C` を押します。

| | 既定 | bokasafn 本体と一緒に動かすとき |
|---|---|---|
| 画面 | http://localhost:3000 | http://localhost:3100 |
| API サーバー | http://127.0.0.1:4000 | http://127.0.0.1:4000 (そのまま) |

bokasafn 本体 (Next.js。`npm run dev`) も 3000 番を使うので、一緒に動かすときは、環境変数 `PORT=3100` を付けて起動します。(API サーバーは、4000 番のままです)
(リポジトリの `.claude/launch.json` の `hub` が、この設定です)

### 4. git で共有する

`data/` を書き換えたら、bokasafn のリポジトリに commit・push して、チームで共有します。
ほかの人は、pull して `npm start` すれば、同じ内容を見られます。

## この hub の設定

### 配色

`src/config/COLORS.js` の 4 色です。

| 名前 | 色 |
|---|---|
| `base` (地の色) | `#FEF4F4` |
| `main` (主の色) | `#595857` |
| `sub` (補助の色) | `#7EBEA5` |
| `accent` (差し色) | `#F0908D` |

サイドメニューの背景は、`{ r: 126, g: 190, b: 165 }` (補助の色と同じ緑) です。(`src/config/ACCOUNT_MENU_COLORS.js`)
配色とサイドメニューの色の決め方は、iHub のマニュアルの [カスタマイズ](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/customize.md) を見てください。

### サイドメニュー

`src/config/ACCOUNT_MENUS.js` の `ACCOUNT_MENU_PAGES` で、項目を 3 つのページ (`main`・`Docs`・`Etc`) に分けています。
先頭のページ (`main`) を、初めに開きます。

艦橋 (`/`) の項目の `code` は、`cockpit` のままです。
`code` は、ドックで切り替えた表示・非表示を保存する個人の設定 (`data/local/account_menus.json`) の鍵なので、変えると、保存した設定が効かなくなります。(表示は「艦橋」です)

### 画面の名前

画面の名前は、`bokasafn` です。
書き込んだ画面の id を送るヘッダー (`X-bokasafn-Client`) にも使います。
変えるときは、`src/index.js` の `config.app.name` と、`package.json` の `start:api`・`serve` の `--app-name` を、同じ名前にしてください。

画面などに出る名前を変えるところは、iHub のマニュアルの [カスタマイズ](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/customize.md) の「アプリの名前を出す」を見てください。

### API サーバー

hub 固有のコレクション (ドメイン) やルートは、足していません。(`ihub-srv` をそのまま使っているので、`server/` はありません)
足したいときは、`ihub-srv` ではなく、`createApp` で起動します。
iHub のマニュアルの [API サーバー](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/api.md) の「アプリ固有のコレクションを足すとき」を見てください。

## iHub を新しくするとき

`hub/` で、次のコマンドを実行します。(いまは、2 つとも `^0.3.1`)

```
npm update @yanqirenshi/ihub.core @yanqirenshi/ihub.srv
```

- 2 つのパッケージは、同じ版にそろえてください。(`npm ls @yanqirenshi/ihub.core @yanqirenshi/ihub.srv` で確かめられます)
- 0.x の間は、`^0.3.1` は 0.3.x だけを指します。minor (0.4.0 など) に上げるときは、範囲を書き換えます。
- minor が上がったときは、[iHub の CHANGELOG](https://github.com/yanqirenshi/iHub/blob/main/CHANGELOG.md) で変更を確かめ、`src/index.js` などを直します。そのあと、`npx ihub-srv check data` と `npm start` で確かめます。
- iHub 本体に直したいところが見つかったときは、[iHub のリポジトリ](https://github.com/yanqirenshi/iHub/issues) に Issue を立てます。それまでは、`src/components/` にパネルを書いて、設定の `panels` で差し替えます。

手順のくわしい説明は、iHub のマニュアルの [iHub の更新](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/update.md) を見てください。
