import React from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

export default function Opener (props) {
    const row = props.row,
          column = props.column,
          closed_wbs = props.closed_wbs,
          callback = props.callback;

    if (row._class==="WORKPACKAGE" || !column.leveling)
        return '';

    const x = closed_wbs[row._id];

    return (
        <span style={{width: 22, display:'inline-block'}}
              onClick={callback}
              action={x ? "open" : "close"}
              data_id={row._id}>
          {x  && <FontAwesomeIcon style={{color: '#888084'}} icon={faCaretRight} />}
          {!x && <FontAwesomeIcon style={{color: '#dddcd6'}} icon={faCaretDown} />}
        </span>
    );
}
