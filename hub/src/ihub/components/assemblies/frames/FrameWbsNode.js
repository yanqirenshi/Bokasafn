import React from 'react';
import { useParams } from "react-router";

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Frame from '../../assemblies/frames/Frame.js';
import HeadWbsPage from '../../parts/HeadWbsPage.js';
import WBSTable from '../../assemblies/WBSTable.js';
import AddWbsNode from '../../assemblies/AddWbsNode.js';

import { useWbs } from '../../../manegers/wbs.js';

export default function FrameWbsNode (props) {
    const children = props.children;
    const maxWidth = props.maxWidth || "lg";

    const params = useParams();

    const wbs_node = useWbs().get(params.wbs_id);

    if (!wbs_node)
        return null;

    return (
        <Frame>
          <Box sx={{height:'100%', overflow:'auto'}}>
            <HeadWbsPage value={wbs_node}/>

            {children}

            <Container maxWidth={maxWidth} sx={{pt:11, mb:33}}>
              <AddWbsNode parent={wbs_node}/>

              <Box>
                <WBSTable start_id={wbs_node._id}/>
              </Box>
            </Container>
          </Box>
        </Frame>
    );
}
