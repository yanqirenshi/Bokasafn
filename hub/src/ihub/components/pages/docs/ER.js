import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Frame from '../../assemblies/frames/Frame.js';

export default function ER () {
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
    'https://segakuin.com/diagram/entity-relationship-diagram.html',
];
