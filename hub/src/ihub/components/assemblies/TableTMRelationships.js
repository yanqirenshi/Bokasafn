import S from '@mui/material/Typography';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function TableTMRelationships () {
    return (
        <TableContainer component={Paper}
                        sx={{ maxWidth: 333 }}>
          <Table sx={{ maxWidth: 333 }}
                 aria-label="simple table"
                 size="small">
            <TableHead>
              <TableRow>
                <TableCell>関係</TableCell>
                <TableCell>Patterns</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relationships.map((row) => {
                  return (
                      <TableRow key={row.code}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row">
                          {row.code}
                        </TableCell>
                        <TableCell>
                          {row.patterns.map((p,i)=> {
                              return <S key={i}>{p}</S>;
                          })}
                        </TableCell>
                      </TableRow>
                  );
              })}
            </TableBody>
          </Table>
        </TableContainer>
    );
}

const relationships = [
    {
        code: 'E-R',
        patterns: ['E ← R'],
    },
    {
        code: 'E-E',
        patterns: ['E +→ E', 'E >-対応表- E'],
    },
    {
        code: 'R-R',
        patterns: ['R -対照表- R'],
    },
    {
        code: '再帰',
        patterns: ['再帰'],
    },
    {
        code: 'セット(集合)',
        patterns: ['サブセット'],
    },
    {
        code: '多値',
        patterns: ['MO', 'HDR-DTL'],
    },
];
