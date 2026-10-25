import Box from '@mui/material/Box';
import S from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Level2Table from './Level2Table.js';

export default function Level2 () {
    return (
        <Box sx={{mt:5, width: 999}}>
          <S variant="h4">パレット レベル2</S>

          <Card>
            <CardContent>
              <Level2Table/>
            </CardContent>
          </Card>
        </Box>
    );
}
