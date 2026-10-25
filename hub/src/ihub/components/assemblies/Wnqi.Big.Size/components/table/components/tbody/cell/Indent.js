import React from 'react';

import TableCell from '@mui/material/TableCell';

export default function Indent (props) {
    const level = props.level;
    // const leveling = props.leveling;

    const style = {
        padding: 0,
        width: 22,
    };

    return makeLevelingSpace(level).map((s,i)=> {
        return (
            <TableCell key={s} style={style}/>
        );
    });
}

function makeLevelingSpace (level) {
    const out = [];

    if (level>0)
        for (let i=0 ; i<level ; i++)
            out.push(i);

    return out;
};
