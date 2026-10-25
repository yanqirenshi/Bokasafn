import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import WBSTable from '../../assemblies/WBSTable.js';

export default function Assemblies () {
    return (
        <Box>
          <Container maxWidth="lg" sx={{pt:5}}>
            <Box>
              <WBSTable start_id="1008"/>
            </Box>
          </Container>
        </Box>
    );
}
