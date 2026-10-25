import { SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

import Box from '@mui/material/Box';

export default function Slide (props) {
    const size = props.size;
    const children = props.children;

    const sx = {
        width:'100vw',
        height:'100vh',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
    };

    return (
        <SplideSlide>

          <Box sx={sx}>

            <Box sx={{width:size.w, height:size.h, background:'#f6f6f6'}}>
              {children}
            </Box>

          </Box>

        </SplideSlide>
    );
}
