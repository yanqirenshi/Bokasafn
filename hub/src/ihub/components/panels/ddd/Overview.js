import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';

export default function Overview () {
    return (
        <Container maxWidth="xl" sx={{pt: 3, pb:22}}>
          <Box>
            <Box>
              <S variant="h5">???</S>

              <img src="/ddd/overview_from_book_01.png"
                   alt="overview_from_book_01.png"/>
              {table(list1)}
            </Box>

            <Box sx={{mt: 5}}>
              <S variant="h5">???</S>
              <img src="/ddd/overview_from_book_02.png"
                   alt="/overview_from_book_02.png"/>
              {table(list2)}
            </Box>
          </Box>
        </Container>
    );
}

function table (list) {
    return (
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Item</th>
              <th>Page</th>
            </tr>
          </thead>

          <tbody>
            {list.map(row=> {
                return (
                    <tr key={row.c1}>
                      <td>{row.c3}</td>
                      <td>{row.c1}</td>
                      <td>{row.c2}</td>
                      <td>{row.description}</td>
                    </tr>
                );
            })}
          </tbody>
        </table>
    );
}

const list1 = [
    {c1:'ユビキタス言語',               c2:'p.24',  c3:'境界線上',              description: '' },
    {c1:'モデル駆動設計',               c2:'p.45',  c3:'境界線上',              description: '' },
    {c1:'レイヤ化アーキテクチャ',       c2:'p.66',  c3:'構成要素(p.61)',        description: '' },
    {c1:'エンティティ',                 c2:'p.87',  c3:'構成要素(p.61)',        description: '' },
    {c1:'値オブジェクト',               c2:'p.95',  c3:'構成要素(p.61)',        description: '' },
    {c1:'サービス',                     c2:'p.103', c3:'構成要素(p.61)',        description: '' },
    {c1:'モジュール',                   c2:'p.108', c3:'構成要素(p.61)',        description: '' },
    {c1:'集約',                         c2:'p.123', c3:'構成要素(p.61)',        description: '' },
    {c1:'ファクトリ',                   c2:'p.134', c3:'構成要素(p.61)',        description: '' },
    {c1:'意図の明白なインターフェース', c2:'p.251', c3:'しなやかな設計(p.247)', description: '' },
    {c1:'副作用のない関数',             c2:'p.255', c3:'しなやかな設計(p.247)', description: '' },
    {c1:'表明',                         c2:'p.261', c3:'しなやかな設計(p.247)', description: '' },
    {c1:'概念の輪郭',                   c2:'p.266', c3:'しなやかな設計(p.247)', description: '' },
    {c1:'独立したクラス',               c2:'p.271', c3:'しなやかな設計(p.247)', description: '' },
];

const list2=[
    {c1:'ユビキタス言語',               c2:'p.24',  c3:'境界線上',            description: '' },
    {c1:'モデル駆動設計',               c2:'p.45',  c3:'境界線上',            description: '' },
    {c1:'宣言的スタイル',               c2:'p.278', c3:'蒸留(p.405)',         description: '' },
    {c1:'コアドメイン',                 c2:'p.408', c3:'蒸留(p.405)',         description: '' },
    {c1:'ドメインビジョンセ声明文',     c2:'p.422', c3:'蒸留(p.405)',         description: '' },
    {c1:'汎用サブドメイン',             c2:'p.422', c3:'蒸留(p.405)',         description: '' },
    {c1:'隔離されたコア',               c2:'p.434', c3:'蒸留(p.405)',         description: '' },
    {c1:'境界づけられたコンンテキスト', c2:'p.343', c3:'コンテキスト(p.342)', description: '' },
    {c1:'継続的な統合',                 c2:'p.349', c3:'コンテキスト(p.342)', description: '' },
    {c1:'コンテキストマップ',           c2:'p.352', c3:'コンテキスト(p.342)', description: '' },
    {c1:'進化する秩序',                 c2:'p.450', c3:'大規模な構造(p.445)', description: '' },
];
