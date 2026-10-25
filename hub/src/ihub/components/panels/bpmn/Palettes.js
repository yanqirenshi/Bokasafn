import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Level1 from './Palettes/Level1.js';
import Level2 from './Palettes/Level2.js';

export default function Palettes () {
    return (
        <Box sx={{width:'100%', height:'100%', overflow: 'auto'}}>
          <Container maxWidth="xl" sx={{pt: 3, pb:22}}>
            <Level1/>
            <Level2/>
          </Container>
        </Box>
    );
}
