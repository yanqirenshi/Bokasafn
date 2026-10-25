## docs/

iHub の使い方のマニュアルサイトです。(React + Vite)
iHub をアプリのリポジトリにコピーするときは、このフォルダはコピーしなくてかまいません。

### 開く

```
cd docs
npm install
npm run dev
```

http://localhost:5173 で開きます。

### ビルドする

```
npm run build
```

`docs/dist/` にできます。
パスを相対にしているので、どのフォルダに置いても開けます。(`npm run preview` で確かめられます)

### ページを書く

|   |                |                                                   |
|---|----------------|---------------------------------------------------|
| - | src/pages.js   | ページの一覧 (サイドメニューの並び順)             |
| d | src/content    | ページの本文 (Markdown)                           |
| d | src/components | 部品 (Markdown の表示など)                        |

- 本文は Markdown で書き、1 文ごとに改行します。(改行は、そのまま改行として表示します)
- マニュアルの中のリンクは、`[導入のしかた](#/setup)` のように `#/` から書きます。
- ページを足すときは、`src/content/` に Markdown を作り、`src/pages.js` に足します。
