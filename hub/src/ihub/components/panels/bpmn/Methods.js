import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';

export default function Methods () {
    return (
        <Box>
          <Container maxWidth="xl" sx={{pt: 3, pb:22}}>
            <Box>
              <S variant="h4">レベル1</S>
            </Box>

            <Box>
              <S variant="h4">レベル2</S>
            </Box>
          </Container>
        </Box>
    );
}
