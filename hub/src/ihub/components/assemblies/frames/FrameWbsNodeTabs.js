import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Frame from '../../assemblies/frames/Frame.js';
import HeadWbsPage from '../../parts/HeadWbsPage.js';
import WBSTable from '../../assemblies/WBSTable.js';
import TabsSearchParam from '../../assemblies/TabsSearchParam.js';

export default function FrameWbsNodeTabs (props) {
    const tabs = props.tabs;
    const tab  = props.tab;
    const onChangeTab = props.onChangeTab;

    const wbs_node = props.wbs_node;

    const children = props.children;
    const maxWidth = props.maxWidth || "lg";

    if (!wbs_node) return null;

    return (
        <Frame>
          <Box sx={{height:'100%', overflow:'auto'}}>
            <HeadWbsPage value={wbs_node}/>

            <Container maxWidth={maxWidth}>
              <TabsSearchParam tabs={tabs} value={tab} onChange={onChangeTab}/>
            </Container>

            {children}

            <Container maxWidth={maxWidth} sx={{pt:11, mb:33}}>
              <Box>
                <WBSTable start_id={wbs_node._id}/>
              </Box>
            </Container>
          </Box>
        </Frame>
    );
}
