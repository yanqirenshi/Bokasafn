import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import WBSTable from '../../assemblies/WBSTable.js';

export default function Events () {
    return (
        <Box>
          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
              <WBSTable start_id="1010"/>
            </Box>
          </Container>
        </Box>
    );
}
