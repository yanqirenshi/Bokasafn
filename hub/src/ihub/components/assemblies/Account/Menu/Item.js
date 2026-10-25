import Box from '@mui/material/Box';

import Link from '../../../assemblies/Link.js';

export default function Item (props) {
    const item = props.data;

    return (
        <Box key={item.url} sx={{mt:0.8, mb: 0.8}}>
          <Link href={item.url}>
            {item.label}
          </Link>
        </Box>
    );
}
