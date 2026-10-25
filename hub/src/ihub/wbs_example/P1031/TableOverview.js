import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import {S} from 'tion';
import Link from '../../ihub/components/assemblies/Link.js';
import ItemWbsNode from '../../ihub/components/parts/ItemWbsNode.js';

import wbs from '../../ihub/manegers/wbs.js';

export default function TableOverview (props) {
    return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>デザインジャーニー</TableCell>
                <TableCell colSpan="2">システミックデザイン・ツールキット</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row, i) => {
                  const tools = [...row.tools];

                  return (<TableRows key={row.parent} row={row}/>);
              })}
            </TableBody>
          </Table>

        </TableContainer>
    );
}

function TableRows (pros) {
    const row = pros.row;

    const tools = [...row.tools];
    const first_wbs_id = tools.pop();
    const first_wbs_node = wbs.get(first_wbs_id);

    return (
        <>
          <TableRow key={row.parent}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell rowSpan={row.tools.length}>
              <ItemWbsNode wbs_id={row.parent}/>
            </TableCell>

            <TableCell>
              <ItemWbsNode wbs_id={first_wbs_node._id}/>
            </TableCell>

            <TableCell>
              {first_wbs_node.description}
            </TableCell>
          </TableRow>

          {tools.map((tool,i)=> {
              const wbs_node = wbs.get(tool);

              return (
                  <TableRow key={tool}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <ItemWbsNode wbs_id={wbs_node._id}/>
                    </TableCell>

                    <TableCell>
                      {wbs_node.description.map((l,i)=> {
                          return (
                              <S key={i}>{l}</S>
                          );
                      })}
                    </TableCell>
                  </TableRow>
              );
          })}
        </>
    );
}

const rows = [
    {
        parent: 1000134,
        tools: [ 1000141,1000142,1000144,1000145 ],
    },
    {
        parent: 1000135,
        tools: [ 1000146,1000147,1000148,1000149 ],
    },

    {
        parent: 1000136,
        tools: [ 1000150,1000151,1000152,1000153,1000154 ],
    },
    {
        parent: 1000137,
        tools: [ 1000155,1000156,1000157,1000158 ],
    },
    {
        parent: 1000138,
        tools: [ 1000159,1000160,1000161,1000162,1000163 ],
    },
    {
        parent: 1000139,
        tools: [1000164,1000165,1000166,1000167 ],
    },
    {
        parent: 1000140,
        tools: [ 1000168,1000169,1000170,1000171 ],
    },
];
