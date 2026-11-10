import { Splide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

import S from '@mui/material/Typography';

import { HelpSlide as Slide } from '@yanqirenshi/ihub.core';

export default function Section03 (props) {
    const size = props.size;

    return (
        <Splide options={ { rewind: true } } aria-label="React Splide Example">

          <Slide size={size}>
            <S variant="h5">???</S>
            <pre>{graph1.join('\n')}</pre>
          </Slide>

          <Slide size={size}>
            <S variant="h5">???</S>
            <pre>{text1.join('\n')}</pre>
          </Slide>

          <Slide size={size}>
            <S variant="h5">???</S>
            <pre>{graph2.join('\n')}</pre>
          </Slide>

        </Splide>
    );
}

const graph1 = [
    '   document ≒ wbs',
    '',
    '    - 100% roule',
    '    - MECE',
    '',
    '   document',
    '      |',
    '   +---------+---------+',
    '   |         |         |',
    ' request  requirement  |',
    '                       |',
    '                   +---+---+-----+',
    '                   |       |     |',
    '                 model    spec   |',
    '                                 |',
    '                             +---+---+--------+',
    '                             |       |        |',
    '                           code     test   release',
];

const text1 = [
    'メニューのパーソナライズ',
    'オペレータのパーソナライズ',
    '',
    'bokasafn は箱である。',
    '汎用的な箱である。',
];

const graph2 = [
    '    +----------+    +----------------+    +----------+',
    '    | bokasafn |<---| Plug in        |<-->| External |',
    '    |          |    |                |    |          |',
    '    |          |    | +------------+ |    | API      |',
    '    |          |    | | components | |    |          |',
    '    |          |    | +------------+ |    |          |',
    '    |          |    | +------------+ |    |          |',
    '    |          |    | | procedures | |    |          |',
    '    |          |    | +------------+ |    |          |',
    '    +----------+    +----------------+    +----------+',
    '',
    '                      bokasafn の Frame を利用する必要がある。',
    '                      Plug IN のリンク先をコントロール出来るようにする必要がある。',
];
