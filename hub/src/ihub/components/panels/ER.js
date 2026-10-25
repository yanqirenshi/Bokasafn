import React, { useState, useEffect } from 'react';

import D3Er, { Rectum } from '@yanqirenshi/d3.er';

import Box from '@mui/material/Box';

import DiagramBox from '../assemblies/DiagramBox.js';
import { ER_COLLECTIONS, buildErData } from '../../manegers/er.js';

// ドラッグで動かしたテーブルの位置は、er/entities に保存する。
const POSITIONS = { selector: 'g.table', collection: 'er/entities', key: '_id' };

export default function ER (props) {
    return (
        <DiagramBox names={ER_COLLECTIONS}
                    build={buildErData}
                    positions={POSITIONS}
                    render={source=> <Diagram source={source} callbacks={props.callbacks}/>}/>
    );
}

function Diagram (props) {
    const source = props.source;

    const [rectum] = useState(new Rectum({
        callbacks: props.callbacks,
        transform: {
            k: 0.7,
            x: 1000.0,
            y: 100.0,
        },
    }));
    const [graph_data, setGraphData] = React.useState(false);

    useEffect(()=> setGraphData(source), [source]);

    if (graph_data && !rectum.data())
        return rectum.data(graph_data);

    if (!graph_data || !rectum.data()) return null;

    return (
        <Box sx={{width:'100%', height:'100%'}}>
          <D3Er rectum={rectum}/>
        </Box>
    );
}
