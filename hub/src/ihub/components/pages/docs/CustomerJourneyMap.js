import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';

import Frame from '../../assemblies/frames/Frame.js';
import Link from '../../assemblies/Link.js';

export default function CustomerJourneyMap () {
  return (
      <Frame>
        <Container>
          <Box>
            <S><Link href="https://webtan.impress.co.jp/e/2014/03/24/16722">カスタマージャーニーマップとは？ UX向上を達成する7つの事例と作成方法</Link></S>
            <S><Link href="https://satori.marketing/marketing-blog/how-to-make-customer-journey-map/">カスタマージャーニーマップとは？基本と正しい作り方（事例・テンプレート付き）</Link></S>
          </Box>
        </Container>
      </Frame>
  );
}
