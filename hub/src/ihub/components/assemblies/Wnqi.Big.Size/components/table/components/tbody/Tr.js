import React from 'react';

import TableRow from '@mui/material/TableRow';

import Cell from './Cell.js';

export default function Tr (props) {
    const row = props.source;
    const callbacks = props.callbacks;
    const max_level = props.max_level;
    const columns = props.columns;
    const closed_wbs = props.closed_wbs;

    const clickOpner = (e) => {
        const span = (element) => {
            if (element.tagName==='SPAN')
                return element;
            return span(element.parentNode);
        };

        const element = span(e.target);

        const action = element.getAttribute('action');
        const data_id = element.getAttribute('data_id') * 1;

        props.callbacks.body.wbs.switch(action, data_id);
    };

    return (
        <TableRow style={trStyle(props)}>
          {columns.map((column,i)=> {
              return (
                  <Cell key={i}
                        column={column}
                        row={row}
                        max_level={max_level}
                        callbacks={callbacks}
                        clickOpner={clickOpner}
                        closed_wbs={closed_wbs}/>
              );
          })}
        </TableRow>
    );
}

function trStyle (props) {
    const x = props.max_level + 1 - props.source._level;

    return {fontSize: 14 + x * 2};
}
