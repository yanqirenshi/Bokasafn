import * as React from 'react';
import Measure from 'react-measure';
import Box from '@mui/material/Box';

import Frame from './Frame.js';
import Tabs from '../../parts/Tabs.js';

export default function FrameTabs (props) {
    const children = props.children;
    const tabs = props.tabs;
    const onChangeTabs = props.onChangeTabs;

    const [bounds, setBounds] = React.useState({height:0});

    return (
        <Frame>
          <Measure
            bounds
            onResize={rect => setBounds(rect.bounds)}>
            {({ measureRef }) => (
                <Box ref={measureRef}>
                  <Tabs data={tabs}
                        onChange={(new_tabs)=>onChangeTabs(new_tabs)}/>
                </Box>
            )}
          </Measure>

          <Box sx={{height: `calc(100% - ${bounds.height}px)`}}>
            {children}
          </Box>
        </Frame>
    );
}
