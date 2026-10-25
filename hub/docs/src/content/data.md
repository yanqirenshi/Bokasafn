# データの管理

## データの置き場所

設計のデータは、`data/` に JSON で置きます。
ドメインのフォルダの下に、コレクションごとのファイルを置きます。

| ファイル | 内容 | 使う画面 |
|---|---|---|
| `wbs/projects.json` | WBS のプロジェクト | WBS |
| `wbs/wbs.json` | WBS のノード | WBS |
| `wbs/workpackages.json` | ワークパッケージ | WBS |
| `er/entities.json` | ER 図のテーブル | ER 図 |
| `er/columns.json` | テーブルをまたいで使うカラムの定義 | ER 図 |
| `er/column_instances.json` | テーブルの中のカラム | ER 図 |
| `er/ports.json` | 線の端点 | ER 図 |
| `er/relationships.json` | テーブル・カラム・ポートの結び付き | ER 図 |
| `tm/identifiers.json` | 識別子のマスタ | TM |
| `tm/attributes.json` | 属性のマスタ | TM |
| `tm/entities.json` | エンティティ | TM |
| `tm/relationships.json` | リレーションシップ | TM |
| `sitemap/nodes.json` | 画面のノード | 画面遷移図 |
| `sitemap/edges.json` | 画面の遷移 | 画面遷移図 |
| `deployment/nodes.json` | ノード (入れ子にでき、リンクを付けられる) | システム構成図 |
| `deployment/edges.json` | ノードの間の線 | システム構成図 |
| `systemic_design/sections.json` | 章とカード | Systemic Design |
| `local/account_menus.json` | サイドメニューの on/off (個人の設定) | サイドメニュー |

## フォーマット

フォーマットは、`server/schemas/{ドメイン}/{コレクション}.schema.json` の JSON Schema で決めています。
各項目の説明も、スキーマの `description` に書いてあります。

たとえば、`wbs/wbs.json` の 1 件は次のような形です。

```json
{
    "id": 1001,
    "parent": 1,
    "name": "デザイン"
}
```

## id と参照のきまり

- レコードには、それぞれ id があります。(ER 図のデータは `_id`)
- `parent` や `from.id` のように、ほかのレコードを指す項目は、指す先が存在している必要があります。
- WBS の id は、プロジェクト・WBS・ワークパッケージをまたいで一意にします。
WBS の id は、URL (`/wbs/{id}`) とページのファイル名 (`P{id}.js`) に使います。
- 画面から追加したレコードの id は、API サーバーが振ります。(そのコレクションの最大の id + 1)

## データを変える 3 つの方法

| 方法 | 内容 |
|---|---|
| 画面で編集する | 図のノードのドラッグ、WBS のノードの追加、サイドメニューの on/off。API サーバーが検証してから保存します。 |
| エディタで書き換える | `data/` の JSON を直接書き換えます。開いている画面に、すぐ反映されます。 |
| git で取り込む | pull や checkout で `data/` が変わったときも、開いている画面に、すぐ反映されます。 |

エディタや git で変えた内容がフォーマットやルールに合っていないときは、画面に反映せず、画面の上にお知らせを出します。
直すと、お知らせは消えます。

## フォーマットを確かめる

```
npm run test:data
```

- `data/` と `src/ihub/data_example/` が、スキーマとルールに合っているかを確かめます。
- 合っていないときは、場所と理由を日本語で表示します。

```
er/entities/0: 必要なプロパティsizeがなければいけない
sitemap/edges: to.id のノードが見つかりません。(id=2000001, to.id=123)
```

## 共有のしかた

- `data/` は、アプリのリポジトリに commit・push して共有します。
- JSON の書き方 (インデントなど) は API サーバーが固定するので、git の差分が読みやすくなります。
- 同じファイルを何人かで変えて衝突したときは、git のマージで直してから、`npm run test:data` で確かめてください。
- `data/local/` (個人の設定) は、git で共有しません。

## 雛形

`src/ihub/data_example/` は、`data/` の雛形です。
`data/` と同じフォーマットで、サンプルのデータが入っています。
新しくアプリのドキュメントを作るときは、ここから始めてください。
