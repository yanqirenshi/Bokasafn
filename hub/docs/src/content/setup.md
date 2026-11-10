# 導入のしかた

`hub/` を、自分のパソコンで起動するまでの手順です。
(iHub を使って、新しくアプリのドキュメントサイトを作るときは、[iHub のマニュアル](https://github.com/yanqirenshi/iHub/blob/main/docs/src/content/setup.md) を見てください)

## 必要なもの

- Node.js (22 以上。24 で動作を確かめています)
- git
- GitHub の OAuth App、または個人用アクセストークン (GitHub と連携する画面を使うとき)

## 1. パッケージを入れる

bokasafn のリポジトリを clone して、`hub/` で、次のコマンドを実行します。

```
cd hub
npm install
```

iHub 本体 (`@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`) が、`node_modules/` に入ります。

## 2. GitHub に接続する (GitHub と連携するとき)

コックピット・Scrum のページ・ドックの「Issue の追加」は、GitHub の情報を使います。
`.env.local.template` をコピーして `.env.local` を作り、OAuth App か、個人用アクセストークンを書きます。

```
# OAuth App (API サーバーが読む。画面には入らない)
GITHUB_OAUTH_CLIENT_ID=Ov23xxxxxxxxxxxxxxxx
GITHUB_OAUTH_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 個人用アクセストークン
REACT_APP_GITHU_PARSONAL_TOKEN=ghp_xxxxxxxxxxxxxxxx
```

- OAuth App の Authorization callback URL は、`http://localhost:3100/api/github/oauth/callback` にします。(ポートは、画面を開く URL と同じにします。`PORT=3100` で起動するとき)
- トークンには、`repo`・`project`・`read:org` の権限を付けてください。
- `.env.local` は git で共有しません。(`.gitignore` の対象です)
- 変数の名前は綴りが少し変わっていますが (`GITHU`・`PARSONAL`)、このままの名前で書きます。
- 書いたあとは、`npm start` をやり直してください。

OAuth で認証する方法は、[GitHub との連携](#/github) を見てください。
GitHub と連携しないときは、この手順は飛ばしてかまいません。

## 3. 起動する

```
npm start
```

- 画面 (React の開発サーバー) と API サーバーが、一緒に起動します。
- 画面は http://localhost:3000 で開きます。(ブラウザが自動で開きます)
- API サーバーは http://127.0.0.1:4000 で動きます。
- bokasafn 本体 (Next.js) も 3000 番を使うので、一緒に動かすときは、`PORT=3100` を付けて起動します。(リポジトリの `.claude/launch.json` の `hub` が、この設定です。API サーバーは 4000 番のままです)
- 止めるときは、`Ctrl + C` を押します。

## 4. git で共有する

`data/` を書き換えたら、bokasafn のリポジトリに commit・push して、チームで共有します。
ほかの人は、pull して `npm start` すれば、同じ内容を見られます。
