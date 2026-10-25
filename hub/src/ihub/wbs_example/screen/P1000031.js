import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';

import Frame from '../../ihub/components/assemblies/frames/Frame.js';

export default function P1000031 (props) {
    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
              <S>1000031</S>
            </Box>
          </Container>
        </Frame>
    );
}
