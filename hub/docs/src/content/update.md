# iHub の更新

iHub が新しくなったときに、hub に取り込む手順です。
iHub 本体 (`@yanqirenshi/ihub.core`・`@yanqirenshi/ihub.srv`) は `node_modules/` に入っているので、パッケージを新しくするだけで済みます。

## 新しくする

`hub/` で、次のコマンドを実行します。

```
npm update @yanqirenshi/ihub.core @yanqirenshi/ihub.srv
```

- `package.json` の範囲 (例: `^0.2.1`) の中で、新しい版に上がります。
- 0.x の間は、`^0.2.1` は 0.2.x だけを指します。minor (0.3.0 など) に上げるときは、範囲を書き換えます。

```
npm install @yanqirenshi/ihub.core@^0.3.0 @yanqirenshi/ihub.srv@^0.3.0
```

- 2 つのパッケージは、同じ版にそろえてください。
- 新しい版があるかは、`npm outdated` で確かめられます。

## 版の付け方

iHub は、[semver](https://semver.org/lang/ja/) で版を付けます。
0.x の間は、次のように読みます。

| 上がるところ | 意味 | 取り込むときに |
|---|---|---|
| patch (0.2.1 → 0.2.2) | 不具合の修正。設定の形や公開している部品は変わりません | `npm update` だけで済みます |
| minor (0.2.1 → 0.3.0) | 設定の形・公開している部品・データのフォーマットが変わることがあります | 下の「minor が上がったとき」を見ます |

## minor が上がったとき

1. 変更の内容を、[iHub の CHANGELOG](https://github.com/yanqirenshi/iHub/blob/main/CHANGELOG.md) で確かめます。
iHub の PR や Issue には、「アプリで直すところ」を書いていることがあります。
2. 設定の形が変わったときは、`src/index.js` の設定 (`config`) を、CHANGELOG のとおりに直します。
(設定の項目は、[カスタマイズ](#/customize) の「設定の渡し方」と、`@yanqirenshi/ihub.core` の README にあります)
3. データのフォーマットが変わったときは、`npx ihub-srv check data` で、直すところを確かめます。
直したら、もう一度 `npx ihub-srv check data` で確かめます。
4. `npm start` で、動きを確かめます。

## iHub 本体を直したいとき

`node_modules/` の中は、直さないでください。(`npm install` で、消えます)
iHub 本体に直したいところが見つかったときは、次の順で進めます。

1. 設定 (`tabs`・`panels`・`help` など) で差し替えられないかを確かめます。([カスタマイズ](#/customize))
2. 差し替えられないときは、[iHub のリポジトリ](https://github.com/yanqirenshi/iHub/issues) に Issue を立てます。
それまでは、`src/components/` にパネルを書いて、`panels` で差し替えます。
