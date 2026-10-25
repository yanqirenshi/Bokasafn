import * as React from 'react';
import Box from '@mui/material/Box';

export default function Loading (props) {
    return (
        <Box sx={{
            width:'100vw',
            height:'100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
          <p style={{
              fontSize:166,
              color: '#eee',
          }}>
            Loading ...
          </p>
        </Box>
    );
}
