import React from 'react';

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';

import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';

import ButtonVisible from './ButtonVisible.js';

const style = {
    root: {
        padding: 11,
        background: '#f3f3f3',
        borderRadius: '8px',
    },
};

function ChooserColumn (props) {
    const columns = props.columns || [];

    return (
        <div style={style.root}>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow style={{background:'rgba(252, 200, 0, 0.3)'}}>
                <TableCell rowSpan="2"></TableCell>
                <TableCell colSpan="3">基本</TableCell>
                <TableCell colSpan="3">文字</TableCell>
                <TableCell colSpan="1">背景</TableCell>
              </TableRow>
              <TableRow style={{background:'rgba(252, 200, 0, 0.3)'}}>
                <TableCell>Label</TableCell>
                <TableCell>Width</TableCell>
                <TableCell>Leveling</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Bold</TableCell>
                <TableCell>Color</TableCell>
              </TableRow>
            </TableHead>

        <TableBody>
          {columns.map((d,i) => {
              return (
                  <TableRow key={i}>
                    <TableCell style={{width: 66, textAlign: 'center'}}>
                      {d.required===true
                       && <p style={{color:'#ccc'}} >必須</p>}
                      {d.required!==true
                       && <ButtonVisible source={d}
                                                callbacks={props.callbacks}/>}
                    </TableCell>
                    <TableCell>
                      {d.label}
                    </TableCell>
                    <TableCell>--</TableCell>
                    <TableCell>
                      {d.leveling ? '○' : '×'}
                    </TableCell>
                    <TableCell>--</TableCell>
                    <TableCell>--</TableCell>
                    <TableCell>--</TableCell>
                    <TableCell>--</TableCell>
                  </TableRow>
              );
              })}
            </TableBody>
      </Table>
    </TableContainer>

        </div>
    );
}

export default ChooserColumn;
