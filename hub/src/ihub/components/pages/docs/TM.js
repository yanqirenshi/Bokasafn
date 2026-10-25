import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Frame from '../../assemblies/frames/Frame.js';

export default function TM () {
  return (
      <Frame>
        <Container maxWidth="md">
          <Box>
            <pre>{note.join('\n')}</pre>
          </Box>
        </Container>
      </Frame>
  );
}

const note = [
    'http://www.sdi-net.co.jp/tm3-1.pdf',
    'https://www.amazon.co.jp/%E4%BA%8B%E6%A5%AD%E5%88%86%E6%9E%90%E3%83%BB%E3%83%87%E3%83%BC%E3%82%BF%E8%A8%AD%E8%A8%88%E3%81%AE%E3%81%9F%E3%82%81%E3%81%AE%E3%83%A2%E3%83%87%E3%83%AB%E4%BD%9C%E6%88%90%E6%8A%80%E8%A1%93%E5%85%A5%E9%96%80-%E4%BD%90%E8%97%A4-%E6%AD%A3%E7%BE%8E/dp/4297129469',
];
