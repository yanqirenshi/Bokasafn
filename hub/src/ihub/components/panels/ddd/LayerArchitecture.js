import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import S from '@mui/material/Typography';

import MuiTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function LayerArchitecture () {
    return (
        <Container maxWidth="xl" sx={{pt: 3, pb:22}}>
          <Box>
            <Box sx={{width:555}}>
              <Table/>
            </Box>
          </Box>
        </Container>
    );
}

function Table (props) {
    return (
        <TableContainer component={Paper}>
          <MuiTable aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Layer</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Implementaion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {DATA.map((row) => (
                  <TableRow key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>

                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>

                    <TableCell>
                      {row.models.map(d=> {
                          return <S key={d}>{d}</S>;
                      })}
                    </TableCell>

                    <TableCell>
                      {row.implementation.map(d=> {
                          return <S key={d}>{d}</S>;
                      })}
                    </TableCell>

                  </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
    );
}

const DATA = [
    {
        name: 'UX',
        models: [
            'ユーザーシナリオ',
            'カスタマージャーニーマップ',
            'ユースケース',
            'Systemic Design',
            'BPMN',
        ],
        implementation: ['マーケット'],
    },
    {
        name: 'UI',
        models: [
            'Screens',
            'Components',
            '画面遷移図',
            'バッチ"処理',
            'Action',
        ],
        implementation: [],
    },
    {
        name: 'Application',
        models: [
            'Class図',
            '機能一覧',
        ],
        implementation: [],
    },
    {
        name: 'Model',
        models: ['TM'],
        implementation: ['Model'],
    },
    {
        name: 'Infrastructure',
        models: ['ER'],
        implementation: [
            'Database',
            'ORマッパー',
        ],
    },
];
