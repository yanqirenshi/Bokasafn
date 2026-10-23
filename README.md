# Bókasafn

著作権の切れた古典を集めて読むための図書館アプリです。
（Bókasafn はアイスランド語で「図書館」）

- 本棚に並んだ背表紙から本を選ぶと、見開きの本が開いて目次と本文を読めます。
- 本文は横書きと縦書きを切り替えられます。
- Next.js (App Router) と SQLite (better-sqlite3) で作っています。

## 使い方

```bash
npm install
npm run import   # 本を取り込む（data/bokasafn.db に保存）
npm run dev      # http://localhost:3000
```

一冊だけ取り込み直すときは slug を指定します。

```bash
npm run import -- shanghan-lun
```

## 収録書と取り込み元

ctext.org の「醫家」(https://ctext.org/chinese-medicine/zhs) にある書目を、中文版ウィキソース（維基文庫）から取り込んでいます。
ctext.org はサイトのスクレイピングを利用規約で禁止しており、本文を取る公式 API も API キーが必要なためです。

| slug | 書名 |
| --- | --- |
| huangdi-neijing | 黃帝內經（素問・靈樞） |
| nanjing | 難經 |
| shennong-bencao-jing | 神農本草經 |
| shanghan-lun | 傷寒論 |
| jingui-yaolue | 金匱要略 |

書目は [scripts/import-wikisource.ts](scripts/import-wikisource.ts) の `BOOKS` に追加すれば増やせます。
取得した HTML は `data/cache/` に保存し、再実行時はそれを使います。

## 構成

- `src/lib/db.ts` — SQLite の接続とスキーマ（`books`, `sections`）
- `src/lib/books.ts` — 画面から使うデータ取得関数
- `src/app/page.tsx` — 本棚
- `src/app/books/[slug]/page.tsx` — 本の扉と目次
- `src/app/books/[slug]/[sectionId]/page.tsx` — 本文
