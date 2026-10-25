import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';

import Asshole from '../../js/Asshole.js';
import Core from './maneger/Core.js';
import * as Comps from './Components.js';

const core = new Core();
const colon = new Asshole();

function WBSTable (props) {
    const [columns, setColumns] = useState(core.makeColumns(props.columns));
    const [records, setRecords] = useState([]);
    const [visible_wp, setVisibleWp] = useState(true);
    const [chooser_column, setChooserColumn] = useState(false);
    const [closed_wbs, setClosedWbs] = useState({});
    const [filter_wp, setFilterWp] = useState('');
    const [bilding, setBilding] = useState(false);

    const data = props.source;
    const options = props.options;
    const start_id = props.start_id;
    const download = props.download;
    const style = props.style || {};

    // filter が 変更された場合の処理
    useEffect(() => setBilding(true), [filter_wp, closed_wbs]);

    if (bilding) {
        setBilding(false);
        setRecords(colon.build({
            data:     data,
            options:  options,
            start_id: start_id,
            flatten:  true,
        }));
    }

    const max_lev = core.maxLev(records);
    const columns_filterd = columns.filter(d => d.visible);
    const records_filterd = core.applyFilter(filter_wp, closed_wbs, records);

    const callbacks = {
        chooser: { switch: () => setChooserColumn(!chooser_column), },
        wp: { visible: (v) => setVisibleWp(v), },
        body: {
            row: {
                visible: (number, v) => setColumns(core.changeColumnsVisible (number, v, columns)),
            },
            wbs: {
                switch: (action, _id) => setClosedWbs(core.contract(action, _id, closed_wbs)),
            },
        },
        filter: {
            change: (v) => setFilterWp(v),
        },
        download: () => { if (download) download(); },
    };

    const style_loading = {
        width: '100%',
        height: 333,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    return (
        <Box>
          <div style={{background:'#fff', padding: '8px 16px 8px 16px', borderRadius: '8px 8px 0px 0px' }}>
            <Comps.Controller open={chooser_column}
                              visible_wp={visible_wp}
                              filter_wp={filter_wp}
                              callbacks={callbacks}
                              csv={core.makeCSV()}/>

            {chooser_column &&
             <div style={{marginBottom: 11}}>
               <Comps.ChooserColumn columns={columns}
                                    callbacks={callbacks} />
             </div>}
          </div>

          {bilding &&
           <div style={style_loading}>
             <p style={{fontSize: 33, color: '#888'}}>
               Waiting for ........
             </p>
           </div>}

          {!bilding &&
           <TableContainer component={Paper}>
             <Table sx={{ minWidth: 650 }}
                    size="small"
                    aria-label="simple table">

               <Comps.THead columns={columns_filterd}
                            max_level={max_lev}
                            style={style.head}/>

               <Comps.TBody columns={columns_filterd}
                            max_level={max_lev}
                            records={records_filterd}
                            callbacks={callbacks}
                            visible_wp={visible_wp}
                            closed_wbs={closed_wbs}
                            filter_wp={filter_wp}
                            style={style.body} />
             </Table>
           </TableContainer>}
        </Box>
    );
}

export default WBSTable;
