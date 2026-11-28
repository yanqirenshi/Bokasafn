# 引き継ぎ：本のデータを作る流れ（Tyggja・Melta・Frasoga）

この文書は、Tyggja のセッション（「構造化 JSON 出力パイプライン」）で決まったことを、Bokasafn の作業に引き継ぐためのものです。
書いた日は 2026-11-25 です。
Bokasafn は、ここで説明するデータを使う側になります。

2026-11-27 に、Bokasafn の側で決めたことを 12 章に足し、古くなった記述（3 章・5 章・9 章）を直しました。
Bokasafn がこのデータをどう使うかは、12 章を見てください。

この文書に書いていないことは、決まっていません。
推測で補わず、各リポジトリの README とスキーマ、または人に確かめてください。

## 1. 全体の流れ

スキャンした本を、文の単位まで構造化した JSON にして、校正し、読める形にする流れです。
4 つのリポジトリに分かれています。

| 段階 | リポジトリ | すること | 状態 |
|---|---|---|---|
| 取り込み | kindle.sitter | Kindle からスキャン PDF を作る | 外部のツール |
| 構造化 | Tyggja | スキャン PDF を OCR し、原本の JSON を作る | 実装済み |
| 校正・編集 | Melta | 編集者（カスタムエージェント）が、原本を元に版を作る | 一通り実装済み（内部の検証が残っている） |
| 出版 | Frasoga | 版を web app で表示し、HTML と Markdown を出力する | 実装済み |

```
Kindle → kindle.sitter → スキャン PDF
  → Tyggja（ocr → build → structure）→ structure/original/
  → Melta（編集者 → melta コマンド）  → structure/<版>/
  → Frasoga（web app・export）        → publish/<版>/
```

図は、Bokasafn の hub の overview にあります（`C:\Users\yanqi\prj\Bokasafn\hub\data\overview\`。画面は Bokasafn の hub を起動して `/?tab=overview`）。
2026-11-25 に、Tyggja の hub から、内容を変えずに移しました。
Tyggja の hub の overview は、空にしています（移す前の内容は、Tyggja の git の履歴の 3b36747 にあります）。
hub は `npm --prefix hub run start` で起動します。
ポートは、既定では画面が 3000、API が 4000 です。
`.claude/launch.json` の `hub` の設定で起動すると、画面が 3200、API が 4200 になります。
Tyggja の hub も既定で同じポートを使うので、どちらの hub の画面を見ているかを確かめてください。
この図には、Bokasafn の枠も描かれています。
枠の中には、冊子の登録、ウィキソースからの取り込み、SQLite、web app での表示があります。
`structure/` と `figures/` から「web app で表示」への矢印は、Bokasafn が本のフォルダを読むことを表します（12 章）。
「取り込み」から `original/` への矢印は、ウィキソースの本の原本を Bokasafn が書くことを表します。

## 2. リポジトリの場所

| 名前 | 手元のフォルダ | GitHub | 公開 |
|---|---|---|---|
| Tyggja | `C:\Users\yanqi\prj\Tyggja` | https://github.com/yanqirenshi/Tyggja | 非公開 |
| Melta | `C:\Users\yanqi\prj\Melta` | https://github.com/yanqirenshi/Melta | 公開 |
| Frasoga | `C:\Users\yanqi\prj\Frasoga` | https://github.com/yanqirenshi/Frasoga | 非公開 |
| Bokasafn | `C:\Users\yanqi\prj\Bokasafn` | https://github.com/yanqirenshi/Bokasafn | — |
| kindle.sitter | — | https://github.com/Foolsgolds/kindle.sitter | — |
| YomiToku（Tyggja が使う OCR） | — | https://github.com/kotaro-kinoshita/yomitoku | — |

Melta は公開のリポジトリです。
issue や PR に、手元のフォルダのパスや本の題名を書かないよう、注意してください。

## 3. 本のフォルダの構成

本は、手元の PC の `~/GoogleDrive/BOOKS/` の下に、1 冊ごとのフォルダ（`{book-code}/`）で置きます。
このフォルダは、Google Drive と同期されます。
1 冊のフォルダは、`BOOKS/` の直下でなくてもかまいません（Bokasafn は、本のフォルダを相対パスで持ちます。12 章）。
1 冊のフォルダの中は、次のとおりです。

```
~/GoogleDrive/BOOKS/{book-code}/
  raw/               YomiToku の生の JSON（Tyggja の ocr）
  figures/           切り出した図・写真の画像（Tyggja の ocr）
  book.json          ページ単位の中間データ（Tyggja の build）。OCR の誤りは、ここを直す
  tyggja.json        Tyggja の切り出し設定
  _work/             Tyggja の作業ファイル
  source.json        取り込んだ元データ（Bokasafn がウィキソースから取り込んだ本）
  structure/         版を置くフォルダ
    original/        原本。取り込み元の道具（Tyggja、Bokasafn の取り込み）が作る。書き換えない
    <版>/            Melta が作る（例 01_ocr-fix）
  publish/           Frasoga が作る出力
    <版>/            index.html と book.md（原本なら publish/original/）
```

### 3.1 いま手元にあるデータ（2026-11-27 時点）

`~/GoogleDrive/BOOKS/` の下に、2 種類の本があります。

```
~/GoogleDrive/BOOKS/
  wikisource/                    Bokasafn がウィキソースから取り込んだ古典（34 冊）
    {slug}/                      例 lunyu/。source.json と structure/original/
  非機能要求グレード2018/          スキャンした本（3 冊）
    01_利用ガイド解説編/
    02_利用ガイド利用編/
    07_利用ガイド活用編/
```

スキャンした 3 冊は、2026-11-27 に `tyggja structure` を実行して、`structure/original/` を作りました。
3 冊とも、`tyggja structure --check` と `melta check` を通っています。

**スキャンした 3 冊には、古い配置のファイルが残っています。**

- `structure/` の直下の JSON（`001_s1.json` など）。
- 本のフォルダの直下の、古い Tyggja が作った `index.html` と `book.md`。

Tyggja は、これらを消さず、動かしません。
Bokasafn は `structure/original/` だけを読むので、残っていても支障はありません。
要らなければ、手で消します。

## 4. 原本の形式（`structure/original/`）

### 4.1 フォルダの中身

```
structure/original/
  index.json            全体の情報と目次
  001_front.json        最初の見出しより前の本文（あるときだけ）
  002_s1.json           セクション s1
  014_s10.1.1.json      セクション s10.1.1
```

- 本文は、セクション単位のファイルに分かれています。エージェントが 1 ファイルずつ読める大きさにするためです。
- 1 ファイルの上限は、JSON の文字数で 12,000 字（既定）です。超えるセクションは、子のセクションごとに分かれます。
- 子のセクションが無いセクションは、上限を超えても 1 ファイルです（大きな表など）。64 ページの本の例では、71 ファイルのうち 3 つが上限を超え、最大は 31,349 字・395 行でした。

### 4.2 `index.json`

| プロパティ | 内容 |
|---|---|
| `version` | 2 |
| `title` | 本のタイトル |
| `source` | 元の `book.json` の名前と、その sha256 |
| `split_chars` | 分けたときの上限 |
| `pages` | 元の本のページの一覧。`id`、`status`（`ok` / `ocr_failed`）、`decorations`（柱・ノンブル） |
| `files` | ファイルの一覧（読み順）。`file`、`id`、`chars`（本文の文字数）、`json_chars` |
| `toc` | すべてのセクションの木。`id`、`level`、`title`、`file`、`children` |

### 4.3 分けたファイル

```json
{
  "version": 2,
  "file": "015_s10.1.json",
  "id": "s10.1",
  "ancestors": [ { "id": "s10", "level": 1, "title": "2 …" } ],
  "body": [
    { "type": "section", "id": "s10.1", "level": 2, "title": "2.1 …", "source": ["p021_1#1"],
      "children": [
        { "type": "paragraph", "id": "p120", "source": ["p021_1#2"],
          "sentences": [ {"id": "p120.1", "text": "…。"}, {"id": "p120.2", "text": "…。"} ] },
        { "type": "section_ref", "id": "s10.1.1", "level": 3, "title": "2.1.1 …", "file": "016_s10.1.1.json" }
      ] }
  ]
}
```

| `type` | 内容 |
|---|---|
| `section` | セクション。`level`、`title`、`children`（入れ子） |
| `section_ref` | 別のファイルに分かれた子セクションへの参照。`file` |
| `paragraph` | パラグラフ。`sentences`（センテンスの配列） |
| `list` | 箇条書き。`items[]` が `sentences` を持つ |
| `figure` | 図。`src`（画像のパス）、`text`（図の中の文字） |
| `caption` | 図表の説明。`text` |
| `table` | 表。`n_row`、`n_col`、`cells[]`（`row`、`col`、`row_span`、`col_span`、`text`） |

### 4.4 読むときの決まり

1. `index.json` の `files` を、読み順に読む。
2. `section_ref` は、`file` が指すファイルの `body[0]`（同じ ID の `section`）に置き換える。これで、本の全体が 1 本の木になる。
3. `001_front.json` は、`id` が null で、`body` に本文の要素が直接並ぶ。
4. **センテンスが本文の正本**。パラグラフは本文を持たない。`sentences[].text` を、区切り文字なしで連結したものが、段落の本文になる。
5. どの要素にも ID がある（`s1.2`、`p12`、`p12.3`、`l1.2.3`、`f1`、`t1`、`c1`）。**ID は名前で、位置を表す番号ではない。** ID の形や順序に頼った処理をしない。並び順は、配列の順で決まる。
6. `source` は、元の本のどこから来たかを示す（`"ページID#ブロック番号"`）。
7. `figure` の `src`（`figures/p008_1_0.png`）は、**本のフォルダからの相対パス**。版のフォルダから見ると、`../../figures/` になる。
8. **知らないプロパティは無視する。** 後工程（Melta）が、要素に情報を足すため。
9. 見出しの `level` は、1 が一番上。HTML にするときは、本のタイトルを `h1`、`level` 1 を `h2` にしている。

### 4.5 JSON スキーマ

形式は、Tyggja のリポジトリの JSON Schema（draft 2020-12）で定めています。

- `C:\Users\yanqi\prj\Tyggja\schema\structure-index.schema.json`
- `C:\Users\yanqi\prj\Tyggja\schema\structure-part.schema.json`

2 つは互いを参照しないので、ファイルをコピーするだけで使えます（Melta は、コピーしてバイナリに埋め込んでいます）。
すべてのプロパティに、日本語の説明が付いています。
形式の説明は、`C:\Users\yanqi\prj\Tyggja\README.md` の「structure/ の形式」にあります。

スキーマでは確かめられない約束があります。

- ID が、版の全体で重複しない
- `section_ref` が指すファイルがある
- `index.json` の `files`・`toc` と、実際のファイルが合っている

これらは、次のコマンドで確かめられます。

```
tyggja structure <本のフォルダ> --check                      原本を確かめる
tyggja structure <本のフォルダ> --check --edition <版の名前>   ほかの版を確かめる
melta check …                                               Melta の約束（edition など）も確かめる
```

### 4.6 原本の性質

原本は OCR の結果なので、誤りを含みます。
読む側は、次のことを前提にしてください。

1. 文字の読み間違いがある（特にルビ、小さい文字、図の中の文字）。
2. 見出しの誤判定がある（目次の行や、行頭に記号の付いた行が、見出しになることがある）。
3. ページをまたぐ段落の、つなぎ間違いがある。
4. 閉じ括弧の読み落としで、センテンスの区切りが誤ることがある。
5. 半角の「.」では、センテンスを区切らない（英文の段落は 1 文になる）。全角の「。」「．」「！」「？」で区切る。
6. 原本を作り直す（`tyggja structure --force`）と、**ID が振り直される**。作り直す前の版との、ID による対応は取れなくなる。

## 5. 版（Melta）

### 5.1 取り決め

1. Tyggja は、`structure/original/` だけを読み書きする。ほかの版には、手を付けない。
   原本は、取り込み元の道具が作る。スキャンした本は Tyggja、ウィキソースの本は Bokasafn の取り込み（`npm run import`）が作る。
2. Melta は、`structure/original/` を書き換えない（`melta` コマンドが拒否する）。編集の結果は、必ず別の版に書く。
3. 版の形式は、原本と同じ。足す情報は、知らないプロパティとして持つ。そのため、原本を読める処理は、版もそのまま読める。
4. 版の名前は、`<2 桁の連番>_<編集者名>`（例 `01_ocr-fix`）。連番は、道具が決める。
5. 編集者は、順に重ねる（版を元に、次の版を作る）。
6. 編集するたびに、本の全体を新しい版に書く。
7. 構造を変える編集（見出しのレベル、セクションの分割・統合、段落の入れ替え）は、いまは行わない。

### 5.2 版に足される情報

`index.json` の `edition`（`original` には無い）:

```json
"edition": {
  "name": "01_ocr-fix",
  "base": "original",
  "editor": "ocr-fix",
  "created_at": "2026-11-24T15:00:00+09:00",
  "retired_ids": ["p12.3"],
  "retired_notes": { "p12.3": "消した理由" }
}
```

直した要素の `origin` と `note`:

```json
{ "id": "p120.2", "text": "直した文。",
  "origin": { "edition": "original", "ids": ["p120.2"], "text": "直す前の文。" },
  "note": "「曰」を「日」に修正" }
```

- `origin` は、1 つ前の版との対応だけを持つ。それより前は、`edition.base` を辿る。
- 表のセルは、セルに `origin` と `note` を持つ。
- 図は、要素に `origin`（直す前の文字の一覧）と、`notes`（キーが index、値が理由）を持つ。
- 消した ID は `retired_ids` に入り、版を重ねても使い回されない。

### 5.3 `melta` コマンド

Rust の CLI です。
編集者は、JSON を直接書き換えず、必ずこの道具を通します。

| 分類 | コマンド |
|---|---|
| 読む | `list`（版の一覧と系譜）、`toc`、`show`（ID で要素を出す）、`outline`（要素と大きさの一覧） |
| 版を作る | `new` |
| 編集する | `set-text`、`insert`、`split`、`delete` |
| 確かめる | `check`、`diff`（版どうしの差分を Markdown で出す） |

編集者の定義は、`C:\Users\yanqi\prj\Melta\src\parmaflora\` にあります（試作の `test-editor-copy` と `test-editor-ocr-fix`、スキル `test-melta`）。
経緯と決めたことは、https://github.com/yanqirenshi/Melta/issues/1 と、そのコメントにあります。

## 6. 出版（Frasoga）

- web app: 版のフォルダを読んで、一文ずつ読み進められる形で表示します。表示する版は、`.env.local` の `FRASOGA_STRUCTURE_DIR` に、版のフォルダを指定します（既定は `structure/original/`）。
- 画像は、本のフォルダの直下の `figures/` から読みます。
- 書き出し: `npm run export -- "<版のフォルダ>"`（HTML）、`--format md`（Markdown）。出力先は、本のフォルダの `publish/<版の名前>/` です。
- 古い配置（`structure/` の直下）も、案内を出して読めます。

使い方は、`C:\Users\yanqi\prj\Frasoga\README.md` にあります。
Tyggja には、以前 HTML と Markdown を出す render 段階がありましたが、Frasoga に移して削除しました。

## 7. Tyggja のコマンド

```
tyggja inspect  PDF                    PDF の種類を調べる
tyggja preview  PDF                    切り落とし・分割の確認用の画像を作る
tyggja ocr      PDF -o <本のフォルダ>    PDF → raw/
tyggja build    <本のフォルダ>           raw/ → book.json
tyggja structure <本のフォルダ>          book.json → structure/original/
tyggja convert  PDF -o <本のフォルダ>    ocr → build → structure を続けて実行
```

- `book.json` と `structure/original/` は、既にあれば上書きしません（`--force`、convert は `--rebuild`）。
- 原本の誤りを正すときは、`book.json` を直して、`structure --force` で作り直します。
- Python から読むときは、`tyggja.structure.load_structure(本のフォルダ, edition="original")` が、`section_ref` を戻した 1 つの木を返します。
- テストは、`uv run pytest tests -q`（696 件）です。

## 8. 設計で決めたことと、その理由

Bokasafn で同じ問いが出たときのために、理由を残します。

1. **構造化の単位を、セクション・パラグラフ・センテンスにした。**
   文章チェックのエージェント（writing-checker。篠田義明『コミュニケーション技術』の作文技法で、目的・構成・パラグラフ・文・語句の順に確かめる）が、ID で指して指摘できるようにするため。
2. **センテンスを、本文の唯一の正本にした。**
   パラグラフにも本文を持たせると、二重管理になり、直したときに食い違うため。
3. **JSON を、セクション単位のファイルに分けた。**
   1 つのファイル（64 ページの本で 425 KB・13,669 行）では、エージェントが読めないため。
4. **上限を、本文の文字数ではなく、JSON の文字数で数えた。**
   本文は短くても、表や ID で JSON が大きくなるため。
5. **版を、`structure/` の下のフォルダで管理した。**
   編集者が複数いて、版を元に次の版を作ることもあるため。原本は書き換えず、いつでも元に戻って比べられる。
6. **知らないプロパティを許すスキーマにした。**
   後工程が、形式を変えずに情報を足せるようにするため。Melta の `edition`・`origin`・`note` は、これで足せた。
7. **図のパスを、版のフォルダではなく、本のフォルダからの相対パスにした。**
   版が増えても、画像は 1 か所で済むため。
8. **出版（HTML・Markdown）を、Tyggja から Frasoga に移した。**
   Tyggja の役割を、原本を作るところまでに絞るため。

## 9. まだ決まっていないこと

1 から 3 は、2026-11-27 に Bokasafn の側で決めました（12 章）。
項目の番号は、書いた時点のまま残しています。

1. **Bokasafn が、このデータをどう使うか。** → 決定。
   冊子（booklet）を SQLite に持ち、本の内容は本のフォルダを直接読みます。
   overview の図の、`structure/` と `figures/` から Bokasafn の「web app で表示」への矢印は、「読む」ことを表します。
2. **`{book-code}` の付け方。** → 急いで決めなくてよくなりました。
   Bokasafn が本のフォルダを相対パスで持つので、フォルダの名前は自由です。
   ウィキソースの本は、`wikisource/{slug}/` に置いています。
3. **どの版を「読む版」とするか。** → 決定。
   冊子ごとに版を指定でき、指定が無ければ、連番の最も大きい版（無ければ `original`）を読みます。
4. **縦書きの本。**
   Tyggja には、縦書き用のオプション（`--rtl`）がありますが、実際の本で試していません。構造化した JSON には、文字の方向を持たせていません。
5. **全角ピリオドで書かれた本。**
   センテンスの分割は対応済みですが、手で作った例文でしか試していません。
6. **OCR から通した実行（`tyggja convert`）。**
   段階ごとの実行は確かめていますが、通しの実行は、最近の変更の後に確かめていません。
7. **Melta の残り。**
   編集者が直した内容の、人による確認。編集者の定義の配り方。構造を変える編集。

## 10. 進め方について（このセッションで分かったこと）

1. **コミットの前に、中身を比べる。**
   hub の図のデータは、人が画面で動かすと、ファイルが書き換わります。
   「変更されたファイルの名前」だけを見てコミットすると、頼んでいない変更が入ります。
   コミット済みの内容と、ノード・矢印ごとに比べてから、コミットしてください。比較とコミットは、別の操作に分けます。
2. **hub の図で、文字の指定に大きさだけを書くと、文字が白になる。**
   `label.font` に `size` だけを書くと、色の既定が白になり、画面で見えなくなります。`color`（ほかと同じ `#333333`）も書いてください。
   画面の確認では、文字の要素があることだけでなく、塗りの色が白でないことも見てください。
3. **hub の図で、子の無い枠は、そのままでは箱として描かれる。**
   枠として描くには、`"_class": "BRANCH"` を指定します。
4. **hub の図で、枠の入れ子の位置。**
   子の座標は、親からの相対位置です。枠を足すときは、子を負の位置にずらさず、親の位置を動かして、画面上の位置を保ってください。
5. **別のセッションに頼んだ作業は、報告を信じずに確かめる。**
   テストの再実行、実データでの実行、画面での確認を、自分で行ってから伝えてください。

## 11. 参考にする場所

| 知りたいこと | 場所 |
|---|---|
| 原本の形式の説明 | `C:\Users\yanqi\prj\Tyggja\README.md` の「structure/ の形式」 |
| 原本の形式の定義 | `C:\Users\yanqi\prj\Tyggja\schema\` |
| 構造化の決まり（見出しのレベル、ページまたぎ、センテンスの分割） | `C:\Users\yanqi\prj\Tyggja\README.md` の「structure が決めていること」 |
| 構造化の実装 | `C:\Users\yanqi\prj\Tyggja\src\tyggja\structure.py` |
| 構造化のテスト（形式の例として読める） | `C:\Users\yanqi\prj\Tyggja\tests\` |
| Tyggja の使い方（エージェント向け） | `C:\Users\yanqi\prj\Tyggja\skills\tyggja\SKILL.md` |
| Melta の要件と、決めたこと | https://github.com/yanqirenshi/Melta/issues/1 |
| Frasoga の使い方 | `C:\Users\yanqi\prj\Frasoga\README.md` |
| JSON を読んで表示する実装の例 | `C:\Users\yanqi\prj\Frasoga\src\documents\StructureBook.tsx` |
| 全体の図 | `C:\Users\yanqi\prj\Bokasafn\hub\data\overview\` |
| Bokasafn の使い方と、冊子の登録 | `C:\Users\yanqi\prj\Bokasafn\README.md` |
| 本のフォルダを読む実装（Bokasafn） | `C:\Users\yanqi\prj\Bokasafn\src\lib\structure.ts` |
| 原本を書く実装（Bokasafn、ウィキソースの本） | `C:\Users\yanqi\prj\Bokasafn\scripts\lib\write-structure.ts` |

## 12. Bokasafn で決めたこと（2026-11-27）

Bokasafn の設計のセッションで決めたことです。
実装と使い方は、Bokasafn の README にあります。

### 12.1 役割の分け方

1. **冊子（booklet）は Bokasafn の SQLite に、本の内容は本のフォルダに持つ。**
   冊子は「本のフォルダの、ある版を、1 冊として棚に置いたもの」です。
   本の内容は持たず、どこにあるか（本のフォルダと版）だけを持ちます。
   正本を 1 か所にして、Melta が版を足しても取り込み直さずに済むようにするためです。
2. **冊子の ID は、Bokasafn が採番する。**
   本のフォルダの名前とは、切り離しています。
   Tyggja は、Bokasafn が本を知る前にフォルダを作るためです。
3. **本の内容の形式は、Tyggja の JSON スキーマをそのまま使う。**
   Bokasafn は、形式を変えていません。
   ウィキソースから取り込んだ古典 34 冊も、同じ形式の原本にしました。
4. **本文は、Frasoga の表示コンポーネントで描く（2026-11-28 に決定。組み込みはこれから）。**
   Frasoga は、表示コンポーネントを npm のパッケージ（`@yanqirenshi/frasoga`）として公開しています。
   Bokasafn の本文は、その `StructurePart` に置き換えます。同じ JSON を描く部品を、2 か所に持たないためです。
   組み込むのは、Frasoga の 0.2.0（縦書き、見出しの id、リンク、上部バーを消す指定）が出てからです。
   それまでは、Bokasafn の部品（`StructureBody`）で、センテンスを段落としてつなげて見せます。
   目次・URL・レイアウト・縦横の切り替えの保存は、置き換えた後も Bokasafn が持ちます。
5. **ユーザー（user）を持つ。**
   将来、複数の人での利用と、ネットへの公開を想定しています。
   いまは既定のユーザーが 1 人だけで、ログインはありません。

### 12.2 冊子と本のフォルダの紐付け

| 項目 | 決めたこと |
|---|---|
| 本の置き場 | 環境変数 `BOKASAFN_BOOKS_DIR` で指定する。いまは `~/GoogleDrive/BOOKS` |
| 本のフォルダ | 冊子が、本の置き場からの相対パスで持つ（`booklet.folder`） |
| 読む版 | 冊子が持つ（`booklet.edition`）。空なら、連番の最も大きい版。無ければ `original` |
| 1 つのフォルダと冊子 | 複数の冊子から指してよい（原本の冊子と、校正した版の冊子など） |
| 冊子の登録 | `npm run booklet -- add`（Bokasafn の README） |
| 本文の 1 ページ | 分けたファイル 1 つ。URL は `/books/{slug}/{ファイルの先頭のセクションの ID}` |

### 12.3 ウィキソースの本を、原本の形式にするときの決まり

形式は、スキャンした本を前提にしています。
ウィキソースの本には、スキーマを変えずに、次の値を入れています。

1. 取り込んだ 1 つのセクション（篇）を、形式上の 1 ページとして扱う（`p001_1` など）。
2. 要素の `source` は、見出しをブロック 0、段落を 1 から数える（`p001_1#1` など）。
   スキーマでは、`source` は 1 件以上で、`ページID#ブロック番号` の形でなければなりません（空の配列は `melta check` で落ちます）。
3. `index.json` の `source` には、取り込んだ元データ（本のフォルダの `source.json`）の名前と SHA-256 を入れる。
4. 改行と空行は、どちらも段落の区切りとして扱う。行の前後の空白は落とす。
5. センテンスは、全角の「。」「！」「？」と、その直後の閉じ括弧で区切る。

34 冊とも、`tyggja structure --check` と `melta check` を通っています。

### 12.4 分かっている課題

1. **上限（12,000 字）を超えるファイルが多い。**
   古典は、子のセクションが無い長い篇が多く、形式の決まりでは分けられません。
   34 冊のうち 26 冊に上限を超えるファイルがあり、最大は 191,106 字です。
   画面で読むぶんには支障ありませんが、Melta の編集者（エージェント）は読めない大きさです。
2. **原本を作り直すと、Bokasafn の本文の URL が変わる。**
   URL にセクションの ID を使っているためです（4.6 の 6）。
   しおりや履歴を作るときは、対策が要ります。
3. **Melta が足す情報（`origin`・`note`）は、Bokasafn の画面に出していない。**
   版はそのまま読めますが、直す前の文や、直した理由は見えません。
4. **スキャンした本は、著作権のある本である。**
   ネットに公開するときは、冊子ごとに「誰に見せるか」を持つ必要があります。
   いまは、その仕組みがありません。
5. **スキャンした本の冊子には、著者と出典を入れていない。**
