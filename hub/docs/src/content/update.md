# iHub の更新

iHub のリポジトリで直したところを、iHub をコピーしたアプリへ取り込む手順です。

## 置き換えるもの (iHub 本体)

| フォルダ・ファイル | 取り込み方 |
|---|---|
| `src/ihub/` | 新しいものに置き換えます。 |
| `server/` | 新しいものに置き換えます。 |
| `src/setupProxy.js` | 新しいものに置き換えます。アプリで処理を足していたときは、その処理を移します。`/api` の下は API サーバーへ中継されるので、足す処理のパスは `/api` の外にします。 |
| `package.json` | 依存するパッケージ (`dependencies`)・`overrides`・`scripts` の差分を見て、合わせます。`overrides` を合わせないと、`npm install` が `ERESOLVE` で失敗することがあります。 |

## 置き換えないもの (アプリのもの)

`data/`・`src/config/`・`src/components/`・`src/wbs/`・`src/operators/`・`src/Router.js`・`src/App.js`・`src/index.css`・`.env.local`

## 手順

1. iHub のリポジトリで、何が変わったかを確かめます。
iHub の PR や Issue には、「別プロジェクトへの反映手順」を書いていることがあります。
(例: [サイドメニューの on/off を加えたとき](https://github.com/yanqirenshi/iHub/issues/17))
2. iHub 本体のフォルダとファイルを、新しいものに置き換えます。
3. アプリのファイル (`src/config/` など) の書き方が変わったときは、反映手順のとおりに直します。
iHub の `src/config/` にファイルが増えたときは、そのファイルをアプリの `src/config/` にコピーします。
(コピーしないと、起動やビルドで `Module not found` のエラーになります)
4. データのフォーマットが変わったときは、`server/schemas/` と `src/ihub/data_example/` を見て、自分の `data/` を直します。
直したら、`npm run test:data` で確かめます。
5. `npm install` を実行してから、`npm start` で動きを確かめます。

## 古い形式 (`src/data/*.js`) から移すとき

データが `src/data/*.js` だったころ ([#21](https://github.com/yanqirenshi/iHub/pull/21) より前) の iHub をコピーしたアプリは、データを `data/` の JSON に移します。

1. 上の「手順」のとおりに iHub 本体を新しいものにして、`npm install` を実行します。
2. 次のコマンドで、`src/data/` のデータを `data/` の JSON に変換します。
   ```
   node server/tools/convert-legacy-data.mjs src/data data
   ```
   `MODULE_TYPELESS_PACKAGE_JSON` という警告が出ますが、問題はありません。
3. iHub の `src/config/` をコピーします。
アプリで `src/data/` の `ACCOUNT_MENUS.js`・`ICONS.js`・`OPERATOR_ITEMS.js` を変えていたときは、その変更を `src/config/` のファイルに入れ直します。
4. `npm run test:data` で、データがフォーマットに合っているかを確かめます。
5. `src/data/` に、移していないファイルが残っていないことを確かめてから、`src/data/` を消します。
アプリで足したファイル (iHub の `src/data/` に無いもの) は、使っている部品のそばなどに移します。

## アプリで iHub 本体を直したとき

アプリの側で iHub 本体 (`src/ihub/` など) を直したときは、iHub のリポジトリにも同じ変更を入れてください。
そうしないと、次に iHub を取り込んだときに、直したところが消えてしまいます。
(例: [アプリで直した部品を iHub に取り込んだとき](https://github.com/yanqirenshi/iHub/issues/19))
