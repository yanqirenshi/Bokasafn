# API サーバー

API サーバー (`server/`) は、`data/` の JSON を読み書きします。
画面は、この API を通してデータを読み書きします。
詳しくは、`server/README.md` も見てください。

## API

| メソッド | パス | 内容 |
|---|---|---|
| GET | `/api/data` | 全データと、コレクションごとの ETag |
| GET | `/api/events` | 変更の通知 (Server-Sent Events) |
| GET | `/api/{domain}/{collection}` | コレクション |
| PUT | `/api/{domain}/{collection}` | コレクション全体を書き換える (If-Match が必要) |
| PATCH | `/api/{domain}/{collection}` | オブジェクトのコレクションを、JSON Merge Patch で書き換える |
| POST | `/api/{domain}/{collection}` | レコードを追加する (id が無ければ振る) |
| PATCH | `/api/{domain}/{collection}/{id}` | レコードを、JSON Merge Patch で書き換える |
| DELETE | `/api/{domain}/{collection}/{id}` | レコードを削除する |

例: `GET /api/er/entities` は、`data/er/entities.json` を返します。

## 書き込むときのきまり

- 書き込む前に、ドメインのデータ全体を、スキーマとルール (id の重複・参照の整合性) で確かめます。
合わないときは 400 を返し、理由を日本語で返します。
- ほかのデータから参照されているレコードは、削除できません。(409)
- `If-Match` に ETag を指定すると、読み込んだあとにほかで変更されていたときは、412 を返します。
- 書き込みは 1 つずつ順に行い、一時ファイルに書いてから置き換えます。

## id の振り方

コレクションの最大の id + 1 から、ドメインの中で使われていない id まで進めます。
コレクションが空のときは、スキーマの `x-id-start` から振ります。

## 変更の通知

`GET /api/events` に接続すると、次の通知が届きます。

| 通知 | 内容 |
|---|---|
| `ready` | 接続したときに送ります。全コレクションの ETag です。 |
| `changed` | コレクションが変わりました。API での書き込みのほか、エディタや git での変更も知らせます。 |
| `invalid` | ファイルが変わりましたが、フォーマットやルールに合っていません。 |

書き込むときに `X-iHub-Client` ヘッダーで画面 (タブ) の id を送ると、`changed` にその id が付きます。
画面は、自分の書き込みの通知を見分けるために使います。

## 安全のための制限

- 127.0.0.1 で待ち受けるので、ほかのパソコンからは使えません。
- `Host` と `Origin` が、このパソコン (localhost など) のものでない要求は、断ります。
- 本文のある要求は、`Content-Type: application/json` のものだけを受け付けます。

## コレクションを足すとき

1. `server/schemas/{domain}/{collection}.schema.json` を作ります。
2. `data/{domain}/{collection}.json` と `src/ihub/data_example/{domain}/{collection}.json` を作ります。
3. コレクションをまたぐ検査が必要なときは、`server/validation/rules.mjs` に書きます。
