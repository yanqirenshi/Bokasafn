# 導入のしかた

アプリのリポジトリに iHub をコピーして、起動するまでの手順です。

## 必要なもの

- Node.js (22 以上。24 で動作を確かめています)
- git
- GitHub の個人用アクセストークン (GitHub と連携する画面を使うとき)

## 1. iHub をコピーする

アプリのリポジトリに、ドキュメントサイト用のフォルダ (例: `docs/`) を作り、iHub のファイルをコピーします。

**コピーするもの**

| ファイル・フォルダ | 内容 |
|---|---|
| `src/` | 画面 |
| `server/` | API サーバー |
| `public/` | 画像など |
| `data/` | 設計のデータ (下の「データを用意する」を見てください) |
| `package.json`・`package-lock.json` | パッケージの一覧 |
| `.gitignore`・`.env.local.template`・`jsconfig.json` | 設定 |

**コピーしないもの**

| ファイル・フォルダ | 理由 |
|---|---|
| `node_modules/` | `npm install` で作ります。 |
| `build/` | ビルドした結果です。 |
| `.git/` | iHub のリポジトリの履歴です。 |
| `docs/` | このマニュアルです。(アプリのドキュメントサイトには要りません) |
| `.env.local` | 個人のトークンです。 |
| `data/local/` | 個人の設定です。 |

コピーした `src/ihub/` の名前は、アプリの名前に変えないでください。
画面に出る名前の変え方は、[カスタマイズ](#/customize) の「アプリの名前を出す」を見てください。

## 2. データを用意する

`data/` は、アプリの設計のデータを入れるフォルダです。
最初は、雛形の `src/ihub/data_example/` の中身を `data/` にコピーして始めると、フォーマットに合ったサンプルから書き換えていけます。

```
src/ihub/data_example/   →   data/
```

データのフォーマットは、[データの管理](#/data) を見てください。

## 3. パッケージを入れる

コピーしたフォルダで、次のコマンドを実行します。

```
npm install
```

## 4. GitHub のトークンを設定する (GitHub と連携するとき)

コックピット・Scrum のページ・ドックの「Issue の追加」は、GitHub の情報を使います。
使うときは、`.env.local.template` をコピーして `.env.local` を作り、GitHub の個人用アクセストークンを書きます。

```
REACT_APP_GITHU_PARSONAL_TOKEN=ghp_xxxxxxxxxxxxxxxx
```

- トークンには、`repo`・`project`・`read:org` の権限を付けてください。
- `.env.local` は git で共有しません。(`.gitignore` の対象です)
- 変数の名前は綴りが少し変わっていますが (`GITHU`・`PARSONAL`)、このままの名前で書きます。

GitHub と連携しないときは、この手順は飛ばしてかまいません。

## 5. 起動する

```
npm start
```

- 画面 (React の開発サーバー) と API サーバーが、一緒に起動します。
- 画面は http://localhost:3000 で開きます。(ブラウザが自動で開きます)
- API サーバーは http://127.0.0.1:4000 で動きます。
- 止めるときは、`Ctrl + C` を押します。

## 6. git で共有する

`data/` を書き換えたら、アプリのリポジトリに commit・push して、チームで共有します。
ほかの人は、pull して `npm start` すれば、同じ内容を見られます。
