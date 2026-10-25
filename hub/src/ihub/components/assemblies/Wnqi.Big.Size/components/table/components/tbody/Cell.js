import React from 'react';

import TableCell from '@mui/material/TableCell';

import Opener from './cell/Opener.js';
import Indent from './cell/Indent.js';

const style = {
    cell_last: {
        borderLeft: 'none',
    },
};

export default function Cell (props) {
    const column = props.column;
    const row = props.row;
    const max_level = props.max_level;
    const callbacks = props.callbacks;
    const clickOpner = props.clickOpner;
    const closed_wbs = props.closed_wbs;

    // レベル表示するカラムかどうか
    const leveling = column.leveling;

    // WBS 階層
    const level = leveling ? row._level : 0;

    return (
        <>
          <Indent row={row} level={level} leveling={leveling}/>

          <TableCell style={cellStyle(row, level, style)}
                     colSpan={colSpan(column.leveling, level, max_level)}
                     callbacks={callbacks}
                     nowrap={column.nowrap ? 'true' : null}>

            <Opener row={row}
                    column={column}
                    closed_wbs={closed_wbs}
                    callback={clickOpner}/>

            {column.contents(column, row)}
          </TableCell>
        </>
    );
}

function cellStyle (row, level, style) {
    const out = {};

    // if (row._class==="WORKPACKAGE")
    //     out.fontWeight = 'bold';

    if (level===0)
        return out;

    out.borderLeft = 'none';

    return out;
}

function colSpan (leveling, level, max_lev) {
    if (!leveling)
        return 1;

    return (max_lev + 1) - level;
};
