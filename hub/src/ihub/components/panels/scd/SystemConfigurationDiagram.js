import React from 'react';

import Box from '@mui/material/Box';

import D3Deployment, { Rectum } from '@yanqirenshi/d3.deployment';

import DiagramBox from '../../assemblies/DiagramBox.js';
import { DEPLOYMENT_COLLECTIONS, buildDeploymentData } from '../../../manegers/deployment.js';

const style = {
    width: '100%',
    height: '100%',
};

// ドラッグで動かしたノードの位置は、deployment/nodes に保存する。(子のノードは、親の中での位置)
const POSITIONS = { selector: 'g.node, g.component', collection: 'deployment/nodes' };

export default function SystemConfigurationDiagram (props) {
    return (
        <DiagramBox names={DEPLOYMENT_COLLECTIONS}
                    build={buildDeploymentData}
                    positions={POSITIONS}
                    render={source=> <Diagram source={source}/>}/>
    );
}

function Diagram (props) {
    const graph_data = props.source;

    const [rectum] = React.useState(new Rectum({
        transform: {
            k: 0.3,
            x: 1800.0,
            y: 700.0,
        },
    }));

    React.useEffect(()=>{
        rectum.data(graph_data);
    }, [rectum, graph_data]);

    return (
        <Box style={style}>
          <D3Deployment rectum={rectum} />
        </Box>
    );
}
