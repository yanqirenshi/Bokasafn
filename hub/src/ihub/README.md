## Directories


### Structures

|   |             |               |                                  |
|---|-------------|---------------|----------------------------------|
| d | assemblies  | Components    | intermediate assembly (中間品)   |
| d | pages       | Components    |                                  |
| d | panels      | Components    | Frame の Contents で表示する。   |
| d | parts       | Components    | 部品                             |
| d | wbs         | Components    |                                  |
| d | recoil      | State         |                                  |
| d | data        | Data (Static) |                                  |
| d | manegers    | js            | データモデルのマネージャ         |
| d | models      | js            | データモデル                     |
| d | js          | js            |                                  |
| d | libs        | js Libraries  | 外部ライブラリに切り出したいもの |
| - | index.css   |               |                                  |
| - | index.js    |               |                                  |
| - | Github.js   |               |                                  |

## Page の構成

Page の内容は以下の構成がある。

- Tabs + Contents
- Contents

上記の種類のコンポーネントを Frame とする。

Frameを基本とすることで、ユーザーが構成を自由に設定できるようにする。

Content のコンポーネントを Panel とする。
