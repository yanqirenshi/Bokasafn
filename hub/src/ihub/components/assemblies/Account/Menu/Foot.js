import Box from '@mui/material/Box';

export default function Foot (props) {
    return (
        <Box sx={{
            borderTop: '1px solid #eee',
            pt: 1,
            pb: 1,
            paddingLeft: '22px',
            paddingRight: '22px',
        }}>
          <p>Sign Out</p>
        </Box>
    );
}
