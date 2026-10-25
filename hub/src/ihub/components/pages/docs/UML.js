import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Frame from '../../assemblies/frames/Frame.js';

export default function UML () {
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
    'https://ja.wikipedia.org/wiki/%E7%B5%B1%E4%B8%80%E3%83%A2%E3%83%87%E3%83%AA%E3%83%B3%E3%82%B0%E8%A8%80%E8%AA%9E',
    'https://en.wikipedia.org/wiki/Unified_Modeling_Language ',
    '',
    '1. Structure diagrams',
    '   1. Activity diagram',
    '   2. State Machine diagram',
    '   3. Use case diagram',
    '   4. Interaction diagram',
    '      1. Communication diagram',
    '      2. Interaction overview diagram',
    '      3. Sequence diagram',
    '      4. Timing diagram',
    '',
    '2. Behavior diagrams',
    '   1. Composite structure diagram',
    '   2. Class diagram',
    '   3. Deployment diagram',
    '   4. Component diagram',
    '   5. Package diagram',
    '   6. Object diagram',
    '   7. Profile diagram',
];
