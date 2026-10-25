import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';

import Frame from '../ihub/components/assemblies/frames/Frame.js';

export default function NotFoundWbsNode (props) {
    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
              <S>Not Found WBS Node.</S>
            </Box>
          </Container>
        </Frame>
    );
}
