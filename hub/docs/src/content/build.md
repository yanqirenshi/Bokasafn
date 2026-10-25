# ビルドと配信

## ビルドする

```
npm run build
```

`build/` に、ビルドした画面ができます。

## ビルドした画面を開く

```
npm run serve
```

- API サーバーが、ビルドした画面とデータの両方を配信します。
- http://127.0.0.1:4000/ で開きます。
- データは `build/` には入っていません。
`build/` だけを静的に置いても、データは表示されないので、`npm run serve` で開いてください。
- API サーバーは、このパソコンの中からしか使えません。(127.0.0.1 で待ち受けます)

## ポートを変える

| 対象 | 既定 | 変え方 |
|---|---|---|
| 画面 (開発サーバー) | 3000 | `.env.local` に `PORT=3001` のように書きます。 |
| API サーバー | 4000 | 環境変数 `IHUB_API_PORT` を、`npm start` や `npm run serve` の前に設定します。 |

`IHUB_API_PORT` は、`.env.local` ではなく、コマンドを実行する前に設定してください。
(API サーバーと、開発サーバーの中継の両方で使うため)

```
# PowerShell
$env:IHUB_API_PORT = 4100
npm start
```

```
# macOS・Linux
IHUB_API_PORT=4100 npm start
```

## このマニュアルを開く

このマニュアルは、iHub の `docs/` にある React のサイトです。

```
cd docs
npm install
npm run dev
```

http://localhost:5173 で開きます。
`npm run build` で、`docs/dist/` にビルドできます。
