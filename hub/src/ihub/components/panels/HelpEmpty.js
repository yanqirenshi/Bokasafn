import React from 'react';

import Box from '@mui/material/Box';

export default function HelpEmpty (props) {
    return (
        <Box sx={{
            width:'100%',
            height:'100%',
            background: '#eee',
            color: '#ddd',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '166px'
        }}>
          Help (Empty)
        </Box>
    );
}
