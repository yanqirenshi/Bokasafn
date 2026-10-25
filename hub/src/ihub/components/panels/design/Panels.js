import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import WBSTable from '../../assemblies/WBSTable.js';

export default function Panels () {
    return (
        <Box sx={{height:'100%', overflow: 'auto'}}>
          <Container maxWidth="lg" sx={{pt:5, pb: 22}}>
            <Box>
              <WBSTable start_id="1007"/>
            </Box>
          </Container>
        </Box>
    );
}
