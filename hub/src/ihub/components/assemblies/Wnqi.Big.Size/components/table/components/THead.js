import React from 'react';

import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

const colSpan = (leveling, max_level) => {
    if (!leveling)
        return 1;

    return max_level + 1;
};

function THead (props) {
    const max_level = props.max_level;

    const style = props.style || {}; //{background:'#fcc800'};

    return (
        <TableHead>
          <TableRow>
            {props.columns.map((d, i)=> {
                return (
                    <TableCell key={i}
                               colSpan={colSpan(d.leveling, max_level)}
                               style={style}>
                      {d.label}
                    </TableCell>
                );
            })}
          </TableRow>
        </TableHead>
    );
}

export default THead;
