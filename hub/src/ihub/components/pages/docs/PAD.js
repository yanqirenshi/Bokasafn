import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Frame from '../../assemblies/frames/Frame.js';

export default function PAD () {
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
    'https://ja.wikipedia.org/wiki/PAD_(%E3%82%BD%E3%83%95%E3%83%88%E3%82%A6%E3%82%A7%E3%82%A2%E8%A8%AD%E8%A8%88)',
    'https://lecture.ecc.u-tokyo.ac.jp/~hideo-t/references/pad/pad.html',
];
