# GitHub との連携

iHub は、GitHub の Issue や Projects を表示したり、Issue を追加したりできます。
使うには、GitHub の個人用アクセストークンを設定します。

## トークンを設定する

`.env.local` に、トークンを書きます。

```
REACT_APP_GITHU_PARSONAL_TOKEN=ghp_xxxxxxxxxxxxxxxx
```

- トークンには、`repo`・`project`・`read:org` の権限を付けてください。
- 書いたあとは、`npm start` をやり直してください。(起動したときに読み込むため)
- トークンを設定すると、サイドメニューに GitHub のアカウントの画像が表示されます。

## コックピット (`/`)

自分が担当している (assignee が自分の) GitHub の Issue を、カードで並べます。

## Scrum (`/scrum`)

GitHub の Projects やリポジトリの情報を見るページです。

| URL | 内容 |
|---|---|
| `/scrum` | 自分の Projects など |
| `/scrum/users/{login}/projects/{number}` | Project |
| `/scrum/users/{login}/projects/{number}/items/{id}` | Project のアイテム |
| `/scrum/users/{login}/repositories/{repository}` | リポジトリ |
| `/scrum/users/{login}/repositories/{repository}/issues/{number}` | Issue |

## Issue を作って Project に追加する

ドックの GitHub のボタンを押すと、「Project にイシューを追加」の吹き出しが開きます。

1. Project を選びます。
2. タイトルと本文 (Markdown) を書きます。
3. ボタンを押すと、Project に結び付いたリポジトリに Issue を作り、Project に追加します。

## 注意

トークンは、ビルドした画面の JavaScript の中に入ります。
自分のパソコンだけで使い、ほかの人が見られる場所に画面を置かないでください。
