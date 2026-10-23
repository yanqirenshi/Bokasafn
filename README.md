# Bókasafn

著作権の切れた古典を集めて読むための図書館アプリです。
（Bókasafn はアイスランド語で「図書館」）

- 図書館の SVG に本棚が並び、ズームすると背表紙の書名が読めます。
- 本を選ぶと右端のインスペクターに概要が出て、「読む」で本文を開けます。
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

ctext.org の「醫家」(https://ctext.org/chinese-medicine/zhs)・「道家」(https://ctext.org/daoism/zhs)・「儒家」(https://ctext.org/confucianism/zhs)・「法家」(https://ctext.org/legalism/zhs) にある書目を、中文版ウィキソース（維基文庫）から取り込んでいます。
ctext.org はサイトのスクレイピングを利用規約で禁止しており、本文を取る公式 API も API キーが必要なためです。

| 分類 | slug | 書名 |
| --- | --- | --- |
| 醫家 | huangdi-neijing | 黃帝內經（素問・靈樞） |
| 醫家 | nanjing | 難經 |
| 醫家 | shennong-bencao-jing | 神農本草經 |
| 醫家 | shanghan-lun | 傷寒論 |
| 醫家 | jingui-yaolue | 金匱要略 |
| 道家 | dao-de-jing | 道德經（王弼本） |
| 道家 | zhuangzi | 莊子 |
| 道家 | liezi | 列子 |
| 道家 | wenzi | 文子 |
| 道家 | heguanzi | 鶡冠子 |
| 道家 | guanyinzi | 關尹子 |
| 道家 | yinfujing | 陰符經 |
| 道家 | liexian-zhuan | 列仙傳 |
| 道家 | baopuzi | 抱朴子 |
| 儒家 | lunyu | 論語 |
| 儒家 | mengzi | 孟子 |
| 儒家 | liji | 禮記（大學・中庸を含む） |
| 儒家 | xunzi | 荀子 |
| 儒家 | xiaojing | 孝經 |
| 儒家 | da-dai-liji | 大戴禮記 |
| 儒家 | chunqiu-fanlu | 春秋繁露 |
| 儒家 | hanshi-waizhuan | 韓詩外傳 |
| 儒家 | xinyu | 新語 |
| 儒家 | shuoyuan | 說苑 |
| 儒家 | xinxu | 新序 |
| 儒家 | fayan | 法言 |
| 儒家 | qianfu-lun | 潛夫論 |
| 儒家 | zhonglun | 中論 |
| 儒家 | kongzi-jiayu | 孔子家語 |
| 法家 | hanfeizi | 韓非子 |
| 法家 | shangjunshu | 商君書 |
| 法家 | guanzi | 管子 |
| 法家 | shenzi | 慎子 |
| 法家 | shenzi-buhai | 申子 |

書目は [scripts/import-wikisource.ts](scripts/import-wikisource.ts) の `MEDICINE` / `DAOISM` / `CONFUCIANISM` / `LEGALISM` に追加すれば増やせます。
取得した HTML は `data/cache/` に保存し、再実行時はそれを使います。

## 構成

- `src/lib/db.ts` — SQLite の接続とスキーマ（`books`, `sections`）
- `src/lib/books.ts` — 画面から使うデータ取得関数
- `src/app/page.tsx` — 本棚（SVG。ズーム・パンでき、本を選ぶと右端のインスペクターに情報を出す）
- `src/components/library/` — SVG の本棚・ズーム処理・インスペクター
- `src/app/books/[slug]/page.tsx` — 本の扉と目次
- `src/app/books/[slug]/[sectionId]/page.tsx` — 本文
