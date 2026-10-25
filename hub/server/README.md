## server/

data/ を管理する API サーバーを置く場所です。
画面 (src/) は、起動時に API サーバーから全データを読み込み、編集した内容を API サーバーへ保存します。

|   |            |                                                                     |
|---|------------|---------------------------------------------------------------------|
| - | index.mjs  | 起動 (127.0.0.1 で待ち受ける)                                        |
| - | app.mjs    | API のルート                                                         |
| - | guard.mjs  | ほかのサイトからの要求を断る (Host・Origin・Content-Type の確認)     |
| - | watcher.mjs | data/ の変更を見張る (エディタや git での変更を、画面へ知らせるため) |
| d | services   | 読み書きの手順 (検証・採番・競合の検出)                              |
| d | stores     | data/ の JSON ファイルの読み書き                                     |
| d | schemas    | コレクションごとの JSON Schema ({domain}/{collection}.schema.json)  |
| d | validation | スキーマと、コレクションをまたぐルール (id の重複・参照の整合性) による検証 |
| d | tools      | 古い形式のデータ (src/data/*.js) を、data/ の JSON に変換するスクリプト |
| d | test       | テスト                                                              |

### 起動

```
npm start
```

画面 (react-scripts start) と API サーバーを一緒に起動します。
画面からの /api への要求は、開発サーバー (src/setupProxy.js) が API サーバーへ中継します。
API サーバーのポートは 4000 です。(環境変数 IHUB_API_PORT で変えられます)

ビルドした画面を API サーバーから配信するときは、次のようにします。

```
npm run build
npm run serve
```

### API

| メソッド | パス | 内容 |
|---|---|---|
| GET    | /api/data                         | 全データと、コレクションごとの ETag |
| GET    | /api/events                       | 変更の通知 (Server-Sent Events) |
| GET    | /api/{domain}/{collection}        | コレクション |
| PUT    | /api/{domain}/{collection}        | コレクション全体を書き換える (If-Match が必要) |
| PATCH  | /api/{domain}/{collection}        | オブジェクトのコレクションを、JSON Merge Patch で書き換える |
| POST   | /api/{domain}/{collection}        | レコードを追加する (id が無ければ振る) |
| PATCH  | /api/{domain}/{collection}/{id}   | レコードを、JSON Merge Patch で書き換える |
| DELETE | /api/{domain}/{collection}/{id}   | レコードを削除する (参照されていれば 409) |

- 書き込む前に、ドメインのデータ全体をスキーマとルールで検証します。合わないときは 400 で理由を返します。
- If-Match に ETag を指定すると、読み込んだあとにほかで変更されていたときは 412 を返します。
- 書き込みは 1 つずつ順に行い、一時ファイルに書いてから置き換えます。
- 書き込むときに X-iHub-Client ヘッダーで画面 (タブ) の id を送ると、変更の通知にその id が付きます。

### 変更の通知

GET /api/events に接続すると、次の通知が届きます。

| 通知 | 内容 |
|---|---|
| ready   | 接続したときに送る。全コレクションの ETag |
| changed | コレクションが変わった。(name・etag・client) API での書き込みのほか、エディタや git でファイルを変えたときも送る |
| invalid | ファイルが変わったが、フォーマットやルールに合っていない。(name・errors) |

画面は、changed を受けたら、そのコレクションを読み直します。

### id の振り方

コレクションの最大の id + 1 から、ドメインの中で使われていない id まで進めます。
コレクションが空のときは、スキーマの x-id-start から振ります。(無ければ 1)

### 個人の設定

domain が local のコレクション (例: local/account_menus) は、個人の設定です。
data/local/ に保存し、git では共有しません。
ファイルが無いときは、スキーマの default を返します。

### データの検証

```
npm run test:data
```

data/ と src/ihub/data_example/ が、スキーマとルールに合っているかを確かめます。
API サーバーのテストも、このコマンドで動きます。

### コレクションを追加するとき

1. server/schemas/{domain}/{collection}.schema.json を作ります。
2. data/{domain}/{collection}.json と src/ihub/data_example/{domain}/{collection}.json を作ります。
3. コレクションをまたぐ検査が必要なときは、server/validation/rules.mjs に書きます。

### 古い形式のデータを変換するとき

データが src/data/*.js だったころの iHub をコピーしたアプリは、次のコマンドで data/ の JSON に変換できます。

```
node server/tools/convert-legacy-data.mjs src/data data
```

- 書き出し先に同じ名前のファイルがあるときは、何も書かずに止まります。(上書きするときは --force を付けます)
- src/data/ の ACCOUNT_MENUS.js・ICONS.js・OPERATOR_ITEMS.js は変換しません。src/config/ に移します。
- MODULE_TYPELESS_PACKAGE_JSON という警告が出ますが、問題はありません。
