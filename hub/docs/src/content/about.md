# bokasafn とは

bokasafn の hub は、bokasafn (著作権の切れた古典を集めて読む図書館アプリ) の設計の情報をまとめて共有するための、ドキュメントサイトです。
WBS・ER 図・TM (T 字形 ER)・画面遷移図・システム構成図などを、1 つのサイトで見られるようにします。

## 使い方のイメージ

hub は、[iHub](https://github.com/yanqirenshi/iHub) の npm のパッケージを使って作っています。
iHub を、フォルダごとコピーして使っているのではありません。

| パッケージ | 役割 |
|---|---|
| `@yanqirenshi/ihub.core` | 画面の部品 (React)。図や表を描き、編集します。 |
| `@yanqirenshi/ihub.srv` | API サーバー (Node.js)。`data/` の JSON を、検証しながら読み書きします。 |

1. `hub/` の `data/` フォルダのデータ (JSON) を、bokasafn に合わせてメンテナンスします。
2. データを git で commit・push して、チームで共有します。

```
bokasafn/               # bokasafn のリポジトリ
├─ src/                 # 画面 (Next.js)
├─ data/                # 本のデータ (SQLite)
└─ hub/                 # ドキュメントサイト (この hub)
    ├─ data/            # bokasafn の設計データ
    ├─ src/             # 設定 (index.js)・ページの URL (Router.js)・WBS のページなど
    ├─ docs/            # このマニュアル
    ├─ public/          # 画像など
    └─ package.json     # @yanqirenshi/ihub.core と @yanqirenshi/ihub.srv に依存する
```

iHub 本体 (2 つのパッケージ) は `node_modules/` に入るので、`hub/` には、bokasafn のファイルだけがあります。
iHub を新しくするときは、`npm update` で済みます。([iHub の更新](#/update))

## できること

- 設計のデータを、図や表で見られます。(ER 図・TM・画面遷移図・システム構成図・Systemic Design・WBS)
- 図のノードをドラッグして、配置を変えられます。動かした位置は `data/` に保存されます。
- 図の要素を右クリックして、その要素の中身を、右端のインスペクタで見られます。
- WBS のノードを、画面から追加できます。
- エディタや git で `data/` を変えると、開いている画面にすぐ反映されます。
- GitHub の Issue や Projects を見たり、Issue を追加したりできます。

## 仕組み

hub は、画面 (React) と API サーバー (Node.js) でできています。

| 部分 | 役割 |
|---|---|
| 画面 | 起動したときに、API サーバーから全データを読み込んで表示します。 |
| API サーバー | `data/` の JSON を読み書きします。書き込む前に、フォーマットとルールを確かめます。 |
| `data/` | 設計のデータ (JSON) です。git で共有します。 |

`npm start` で、画面と API サーバーが一緒に起動します。
どちらも自分のパソコンの中だけで動き、ほかのパソコンからは使えません。

iHub の使い方 (設定・パッケージの更新など) は、[iHub のマニュアル](https://github.com/yanqirenshi/iHub/tree/main/docs/src/content) を見てください。
