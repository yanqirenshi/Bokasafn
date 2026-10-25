import Box from '@mui/material/Box';

import Container from '@mui/material/Container';

import WBSTable from '../assemblies/WBSTable.js';

export default function Wbs (props) {
    const start_id = props.start_id;

    return (
        <Box sx={{height:'100%', overflow: 'auto'}}>
          <Container maxWidth="lg" sx={{pt:5, pb: 22}}>
            <Box>
              <WBSTable start_id={start_id}/>
            </Box>
          </Container>
        </Box>
    );
}
