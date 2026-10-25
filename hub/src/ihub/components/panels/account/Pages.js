import React from 'react';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import S from '@mui/material/Typography';

import Models from './Models.js';

export default function Pages (props) {
    return (
        <Box sx={{
            width:'100%',
            height:'100%',
            overflow: 'auto',
        }}>
          <Container>
            <Box>
              <Box sx={{mt:1}}>
                <S variant="h5">Structures</S>
                <S>View Page List</S>
                <S>View Panel List</S>
                <S>View Page Contents</S>
              </Box>

              <Box sx={{mt:1}}>
                <S variant="h5">Actions</S>
                <S>Add Page</S>
                <S>Edit Page</S>
                <S>Delete Page</S>
                <S>Add Panel to Page</S>
                <S>Remove Panel from Page</S>
              </Box>

              <Box sx={{mt:1}}>
                <S variant="h5">Events</S>
                <S>なし</S>
              </Box>
            </Box>

            <Box sx={{mt:6, pb: 11}}>
              <Models/>
            </Box>
          </Container>
        </Box>
    );
}
