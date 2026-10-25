import React from 'react';

import Container from '@mui/material/Container';
import {Section, P} from 'tion';

import Frame from '../ihub/components/assemblies/frames/FrameWbsNode.js';

import TableOverview from './P1031/TableOverview.js';

// import wbs from '../manegers/wbs.js';

export default function P1031 (props) {
    let num = 1;

    return (
        <Frame>
          <Container maxWidth="lg" sx={{pt:5}}>
            <TableOverview/>
          </Container>
        </Frame>
    );
}
