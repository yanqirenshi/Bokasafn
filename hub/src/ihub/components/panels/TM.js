import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import D3Ter, {Rectum}  from '@yanqirenshi/d3.ter';

import DiagramBox from '../assemblies/DiagramBox.js';
import { TM_COLLECTIONS, buildTmData } from '../../manegers/tm.js';

// ドラッグで動かしたエンティティの位置は、tm/entities に保存する。
const POSITIONS = { selector: 'g.entity', collection: 'tm/entities' };

export default function TM () {
    return (
        <DiagramBox names={TM_COLLECTIONS}
                    build={buildTmData}
                    positions={POSITIONS}
                    render={source=> <Diagram source={source}/>}/>
    );
}

function Diagram (props) {
    const [rectum, setRectum] = useState(null);
    const graph_data = props.source;

    useEffect(()=> {
        if (rectum!==null) return;

        setRectum(new Rectum({
            transform: {
                k: 0.7,
                x: 400.0,
                y: 400.0,
            },
            svg: {
                style: {
                    background: '#fff',
                },
            },
            edge: { width: 6, color: '#333333' },
            callbacks: {
                entity: {
                    click: (node)=> {
                    }
                }
            }
        }));
    }, [rectum]);

    useEffect(()=> {
        if (rectum)
            rectum.data(graph_data);
    }, [rectum, graph_data]);

    if (!rectum)
        return null;

    return (
        <Box sx={{width:'100%', height:'100%'}}>
          <D3Ter rectum={rectum} />
        </Box>
    );
}
