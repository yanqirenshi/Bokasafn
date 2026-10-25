import React from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import S from '@mui/material/Typography';

import Models from './Models.js';

export default function Menus (props) {
    return (
        <Box sx={{
            width:'100%',
            height:'100%',
            overflow: 'auto',
        }}>
          <Container>
            <Box>
              Menus
            </Box>

            <Box>
              <Box sx={{mt:1}}>
                <S variant="h5">Structures</S>
              </Box>

              <Box sx={{mt:1}}>
                <S variant="h5">Actions</S>
              </Box>

              <Box sx={{mt:1}}>
                <S variant="h5">Events</S>
              </Box>
            </Box>

            <Box sx={{mt:6, pb: 11}}>
              <Models/>
            </Box>
          </Container>
        </Box>
    );
}
