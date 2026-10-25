# WBS

WBS (Work Breakdown Structure) で、アプリの作業や成果物を階層にまとめます。
WBS のノードごとに、ページを作れます。

## WBS のデータ

| 種類 | ファイル | 親 (`parent`) |
|---|---|---|
| プロジェクト | `data/wbs/projects.json` | なし (最上位) |
| WBS | `data/wbs/wbs.json` | プロジェクトか WBS |
| ワークパッケージ | `data/wbs/workpackages.json` | WBS |

- id は、3 つの種類をまたいで一意にします。
- `type` を書くと、ページのファイルを `src/wbs/{type}/` に置けます。(下の「ノードのページを作る」を見てください)

```json
{
    "id": 1000,
    "parent": 1,
    "name": "ビジネス",
    "description": "説明 (省略できます)"
}
```

## WBS のページ

| URL | 表示 |
|---|---|
| `/wbs` | WBS の一覧 (表) |
| `/wbs/{id}` | ノードのページ |

ノードのページは、次のように表示します。

| 状況 | 表示 |
|---|---|
| ページのファイル (`P{id}.js`) がある | そのファイルの内容 |
| データに id はあるが、ページのファイルが無い | ノードの見出しと「Not Found WBS Node Component.」、配下の WBS の表 |
| データに id が無い | 「Not Found WBS Node.」 |

## 画面からノードを追加する

ノードのページ (`/wbs/{id}`) の表の上に、子のノードを追加するフォームがあります。

1. 種類 (WBS・ワークパッケージ) を選びます。
2. 名前と説明を入力します。(説明は省略できます)
3. 「追加」を押します。

- プロジェクトの下には WBS を、WBS の下には WBS かワークパッケージを追加できます。
ワークパッケージの下には追加できません。
- id は、API サーバーが振ります。
- 追加すると、`data/wbs/` の JSON に保存され、表にもすぐ表示されます。

## ノードのページを作る

`src/wbs/P{id}.js` に、React の部品を書きます。
データに `type` があるノードは、`src/wbs/{type}/P{id}.js` に置きます。

```jsx
import React from 'react';
import Container from '@mui/material/Container';

import Frame from '../ihub/components/assemblies/frames/FrameWbsNode.js';

export default function P1000 (props) {
    const wbs_node = props.wbs_node;

    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            {wbs_node.name} のページです。
          </Container>
        </Frame>
    );
}
```

- `FrameWbsNode` で囲むと、ノードの見出しと、配下の WBS の表が付きます。
見出しや表が要らないときは、`Frame` (`../ihub/components/assemblies/frames/Frame.js`) で囲みます。
- `props.wbs_node` で、ノードのデータを受け取れます。
- ページのファイルを足したり消したりしたときは、画面を読み直してください。

## 雛形

`src/ihub/wbs_example/` に、ページのファイルの例があります。
`src/wbs/` に置いたときの import の書き方になっているので、そのまま `src/wbs/` にコピーして使えます。
