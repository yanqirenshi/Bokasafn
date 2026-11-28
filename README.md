# Bókasafn

著作権の切れた古典を集めて読むための図書館アプリです。
（Bókasafn はアイスランド語で「図書館」）

- 図書館の SVG に本棚が並び、ズームすると背表紙の書名が読めます。
- 本を選ぶと右端のインスペクターに概要が出て、「読む」で本文を開けます。
- 本文は横書きと縦書きを切り替えられます。
- 本文は、段落のほかに、箇条書き・図・表を表示できます。
- Next.js (App Router) と SQLite (better-sqlite3) で作っています。本の内容は、本のフォルダの JSON で持ちます。

## 使い方

```bash
npm install
npm run import   # 本を取り込む（本の内容は data/books/ に、冊子は data/bokasafn.db に保存）
npm run dev      # http://localhost:3000
```

一冊だけ取り込み直すときは slug を指定します。

```bash
npm run import -- shanghan-lun
```

取り込み直すと、原本（`structure/original/`）の ID が振り直されます。
原本を元にした版（Melta が作る `structure/01_…/` など）があるときは、`--force` を付けないと作り直しません。

## 冊子（booklet）と本のフォルダ

棚に置く 1 冊を、冊子（`booklet`）と呼びます。
冊子は SQLite にあり、本の内容は持たず、どこにあるかだけを持ちます。
本の内容は、本のフォルダの JSON にあります。

```
<本の置き場>/<folder>/
  source.json          取り込んだ元データ
  figures/             図の画像（スキャンした本）
  structure/
    original/          原本。index.json と、セクション単位のファイル
    <版>/              校正・編集した版（Melta が作る）
```

- `booklet.folder` — 本のフォルダ。本の置き場からの相対パスです。
- `booklet.edition` — 読む版（`structure/<版>/` の名前）。空なら、最新の版（連番の最も大きい版。無ければ `original`）を読みます。
- 本の置き場は、環境変数 `BOKASAFN_BOOKS_DIR` で指定します（既定は `data/books`）。`.env.local` に書くと、アプリとスクリプトの両方が読みます。
- 一つのフォルダを、複数の冊子から指せます（原本の冊子と、校正した版の冊子など）。
- 本のフォルダや版が見つからない冊子は、本棚には出ますが、読めません（案内を出します）。
- ウィキソースから取り込む本は、新しく取り込むと `<本の置き場>/<slug>/` に書きます。取り込み直すときは、冊子が指しているフォルダに書きます。

### 冊子を登録する

Tyggja・Melta が作った本のフォルダは、コマンドで冊子として登録します。

```bash
npm run booklet -- list
# 冊子の一覧と、まだ冊子になっていない本のフォルダを出す

npm run booklet -- add "<本のフォルダ>" --slug <名前> --category <分類> --name "<冊子の名前>"
# 本のフォルダ（本の置き場からの相対パス）を、冊子として登録する

npm run booklet -- set <slug> --edition <版>
# 読む版を変える（latest で、最新の版に戻す）。--folder と --name も変えられる
```

- `--slug` は URL に使う名前で、英小文字・数字・ハイフンで書きます。
- `--category` は分類で、置く本棚を決めます（その分類の本棚が無ければ作ります）。
- 省くと、名前は `index.json` の `title`、背表紙の色は決まった色の中から選びます。
- 著者（`--author`）・時代（`--era`）・説明（`--description`）・出典（`--source-name`、`--source-url`）・ライセンス（`--license`）も指定できます。出典が空の本は、画面に底本を出しません。
- 古い配置の本のフォルダ（`structure/original/` が無い）は、先に `tyggja structure "<本のフォルダ>"` で原本を作ります。

### 本の内容の形式

- 形式は、Tyggja の `structure/`（`index.json` とセクション単位のファイル）と同じです。形式の正本は、[Hefti](https://github.com/yanqirenshi/Hefti)（`@yanqirenshi/hefti`）の JSON Schema です。
- 本文の 1 ページは、分けたファイル 1 つです。URL は `/books/{slug}/{ファイルの先頭のセクションの ID}`（例 `/books/lunyu/s3`）で、小さい子のセクションは、同じページの中に見出し付きで並びます。
- センテンスが本文の正本です。画面では、段落としてつなげて見せます。

ウィキソースから取り込む本は、次の決まりで原本にします（`scripts/lib/write-structure.ts`）。

- 取り込んだ 1 つのセクション（篇）を、形式上の 1 ページとして扱います。
- 改行と空行は、どちらも段落の区切りとして扱います。行の前後の空白は落とします。
- センテンスは、全角の「。」「！」「？」と、その直後の閉じ括弧で区切ります。

### 以前の DB からの移行

以前の DB は、本を `books` テーブルに、本文を `sections` テーブルに持っていました。

1. 起動したときに、`books` を `booklet` に改名して引き継ぎます。本のフォルダは、slug と同じ名前になります。
2. 本文を、本のフォルダに書き出します。

   ```bash
   npm run export                    # すべての本を、本の置き場に書き出す
   npm run export -- xiaojing lunyu  # slug を指定
   npm run export -- --force         # 既にある structure/original/ を作り直す
   ```

3. すべての冊子の本のフォルダが読めるようになると、次に起動したときに `sections` を消します。読めない冊子があるうちは、消さずに残します。

経緯は [migration/tyggja-pipeline-handoff.md](migration/tyggja-pipeline-handoff.md) にあります。

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

- `src/lib/db.ts` — SQLite の接続とスキーマ（`booklet`, `user` など）
- `src/lib/structure.ts` — 本のフォルダ（`structure/<版>/`）を読む関数
- `src/lib/books.ts` — 画面から使うデータ取得関数（冊子は SQLite、目次と本文は本のフォルダから読む）
- `src/components/StructureBody.tsx` — 本文の要素（段落・箇条書き・図・表）を描く部品
- `src/app/page.tsx` — 本棚（SVG。ズーム・パンでき、本を選ぶと右端のインスペクターに情報を出す）
- `src/components/library/` — SVG の本棚・ズーム処理・インスペクター
- `src/app/books/[slug]/page.tsx` — 本の扉と目次
- `src/app/books/[slug]/[sectionId]/page.tsx` — 本文
